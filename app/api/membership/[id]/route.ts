import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import crypto from "crypto";
import { sendActiveMemberApprovalEmail, sendActiveMemberApprovalEmailEnglish } from "@/lib/email";
import { requireAdmin } from "@/lib/apiAuth";

const calculateAgeFromPersonalNumber = (personalNumber: string): number | null => {
	if (!personalNumber || personalNumber.length !== 11 || !/^\d{11}$/.test(personalNumber)) {
		return null;
	}

	const rawDay = parseInt(personalNumber.substring(0, 2), 10);
	const day = rawDay > 40 && rawDay <= 71 ? rawDay - 40 : rawDay;
	const month = parseInt(personalNumber.substring(2, 4), 10) - 1;
	const yearShort = parseInt(personalNumber.substring(4, 6), 10);
	const individualNumber = parseInt(personalNumber.substring(6, 9), 10);
	const today = new Date();
	const currentYear = today.getFullYear();
	const currentYearShort = currentYear % 100;

	let fullYear: number;
	if (individualNumber >= 500 && individualNumber <= 999 && yearShort <= 39) {
		fullYear = 2000 + yearShort;
	} else if (yearShort <= currentYearShort && currentYear - (1900 + yearShort) > 100) {
		fullYear = 2000 + yearShort;
	} else {
		fullYear = 1900 + yearShort;
	}

	if (fullYear > currentYear) {
		fullYear -= 100;
	}

	const birthDate = new Date(fullYear, month, day);
	if (isNaN(birthDate.getTime())) return null;

	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}

	if (age < 0 || age > 115) {
		return null;
	}

	return age;
};

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const auth = await requireAdmin();
	if (auth.response) return auth.response;

	const { id } = await context.params;

	await connectDB();

	const membership = await Membership.findById(id);

	if (!membership) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	return NextResponse.json(membership);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const auth = await requireAdmin();
	if (auth.response) return auth.response;

	const { id } = await context.params;
	await connectDB();
	const data = await req.json();

	// Debug logging
	console.log("PUT /api/membership/[id] - Received data:", JSON.stringify(data, null, 2));
	console.log("Position field in request:", data.position);

	// Find the membership before update to check status change
	const existingMembership = await Membership.findById(id);
	if (!existingMembership) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	// Handle membership approval logic
	const updateData = { ...data };

	// If personal number contains asterisks (masked), remove it from update data
	// Personal number should not be changed during edit
	if (updateData.personalNumber && updateData.personalNumber.includes("*")) {
		delete updateData.personalNumber;
	}

	// Handle createdAt / joined date update if supplied
	if (updateData.createdAt !== undefined) {
		if (updateData.createdAt) {
			const parsedCreatedAt = new Date(updateData.createdAt);
			if (isNaN(parsedCreatedAt.getTime())) {
				return NextResponse.json({ error: "Invalid joined date format" }, { status: 400 });
			}
			// Allow up to 24 hours in the future to account for time zones
			if (parsedCreatedAt.getTime() > Date.now() + 24 * 60 * 60 * 1000) {
				return NextResponse.json({ error: "Joined date cannot be in the future" }, { status: 400 });
			}
			updateData.createdAt = parsedCreatedAt;
		} else {
			delete updateData.createdAt;
		}
	}

	console.log("Update data being sent to MongoDB:", JSON.stringify(updateData, null, 2));

	// When a member is assigned to the board, record when their term started (unless already set)
	if (["Executive", "Advisor"].includes(updateData.membershipType) && !existingMembership.boardTermStart) {
		updateData.boardTermStart = new Date().toISOString();
	}

	// If membership is being approved, check age and set membership type
	if (data.membershipStatus === "approved" && existingMembership.membershipStatus !== "approved") {
		const age = calculateAgeFromPersonalNumber(existingMembership.personalNumber);

		if (age !== null && age < 15) {
			return NextResponse.json({ error: "Cannot approve membership for members under 15 years old. They must wait until they turn 15 to become an Active member." }, { status: 400 });
		}

		// Set membership type to Active for approved members 15+
		updateData.membershipType = "Active";
		// Set activeMemberSince when approving a member
		updateData.activeMemberSince = new Date().toISOString();
	}

	const membership = await Membership.findByIdAndUpdate(id, updateData, { new: true });

	// Debug logging after update
	console.log(
		"Updated membership data:",
		JSON.stringify(
			{
				_id: membership._id,
				name: `${membership.firstName} ${membership.lastName}`,
				position: membership.position,
				membershipType: membership.membershipType,
			},
			null,
			2,
		),
	);

	// If membership is being approved for the first time
	if (data.membershipStatus === "approved" && existingMembership.membershipStatus !== "approved") {
		try {
			// Generate setup token for membership password setup
			const setupToken = crypto.randomBytes(32).toString("hex");
			const setupTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours

			// Update membership with setup token
			await Membership.findByIdAndUpdate(id, {
				passwordSetupToken: setupToken,
				passwordSetupTokenExpiry: setupTokenExpiry,
			});

			// Send Active Member approval email with password setup link
			const fullName = [membership.firstName, membership.middleName, membership.lastName].filter(Boolean).join(" ");

			// Detect locale from URL path and referer for more accurate language detection
			const referer = req.headers.get("referer") || "";
			const url = req.url || "";
			const isEnglishLocale = referer.includes("/en/") || url.includes("/en/") || (!referer.includes("/ne/") && !url.includes("/ne/"));

			// Use appropriate email function based on locale
			if (isEnglishLocale) {
				await sendActiveMemberApprovalEmailEnglish({
					name: fullName,
					email: membership.email,
					setupToken: setupToken,
				});
			} else {
				await sendActiveMemberApprovalEmail({
					name: fullName,
					email: membership.email,
					setupToken: setupToken,
				});
			}
		} catch (error: unknown) {
			console.error("Error sending welcome email:", error);
			// Don't fail the membership approval if email fails
		}
	}

	return NextResponse.json(membership);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const auth = await requireAdmin();
	if (auth.response) return auth.response;

	const { id } = await context.params;
	await connectDB();
	const membership = await Membership.findByIdAndDelete(id);
	if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json({ message: "Deleted successfully" });
}
