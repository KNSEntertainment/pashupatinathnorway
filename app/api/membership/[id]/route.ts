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

	// Determine if member is being activated / approved:
	// 1. Status is changing to approved/active (from non-approved)
	// 2. OR Type is being upgraded to Active/Executive/Advisor (from General or non-active)
	// Note: We don't activate if the status is explicitly being set to blocked
	const isStatusApproved = data.membershipStatus === "approved" || data.membershipStatus === "active";
	const wasStatusApproved = existingMembership.membershipStatus === "approved";
	const isTypeActive = ["Active", "Executive", "Advisor"].includes(data.membershipType);
	const wasTypeActive = ["Active", "Executive", "Advisor"].includes(existingMembership.membershipType);

	const isStatusBeingApproved = isStatusApproved && !wasStatusApproved;
	const isTypeBeingUpgradedToActive = isTypeActive && !wasTypeActive;

	const isActivatingMember = (isStatusBeingApproved || isTypeBeingUpgradedToActive) && data.membershipStatus !== "blocked";

	if (isActivatingMember) {
		const age = calculateAgeFromPersonalNumber(existingMembership.personalNumber);

		if (age !== null && age < 15) {
			return NextResponse.json({ error: "Cannot approve membership for members under 15 years old. They must wait until they turn 15 to become an Active member." }, { status: 400 });
		}

		// Ensure membershipStatus is set to approved
		updateData.membershipStatus = "approved";

		// Set membership type to Active for approved members 15+ if not already set to Executive/Advisor
		if (!["Executive", "Advisor"].includes(updateData.membershipType)) {
			updateData.membershipType = "Active";
		}

		// Set activeMemberSince when activating a member
		if (!existingMembership.activeMemberSince) {
			updateData.activeMemberSince = new Date().toISOString();
		}

		// Generate setup token for membership password setup (valid for 24 hours)
		const setupToken = crypto.randomBytes(32).toString("hex");
		const setupTokenExpiry = new Date(Date.now() + 1000 * 60 * 60 * 24); // 24 hours
		updateData.passwordSetupToken = setupToken;
		updateData.passwordSetupTokenExpiry = setupTokenExpiry;
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
				membershipStatus: membership.membershipStatus,
			},
			null,
			2,
		),
	);

	let emailSent = false;
	let emailError: string | null = null;

	// If membership is being approved or upgraded to Active
	if (isActivatingMember && updateData.passwordSetupToken) {
		try {
			// Send Active Member approval email with password setup link
			const fullName = [membership.firstName, membership.middleName, membership.lastName].filter(Boolean).join(" ");

			// Detect locale from URL path and referer for more accurate language detection
			const referer = req.headers.get("referer") || "";
			const url = req.url || "";
			const isEnglishLocale = referer.includes("/en/") || url.includes("/en/") || (!referer.includes("/ne/") && !url.includes("/ne/"));

			// Extract family member names if they exist
			const familyMemberNames = existingMembership.familyMembers && existingMembership.familyMembers.length > 0 ? existingMembership.familyMembers.map((fm: { firstName?: string; lastName?: string }) => [fm.firstName, fm.lastName].filter(Boolean).join(" ")) : [];

			// Use appropriate email function based on locale
			if (isEnglishLocale) {
				await sendActiveMemberApprovalEmailEnglish({
					name: fullName,
					email: membership.email,
					setupToken: updateData.passwordSetupToken as string,
					familyMembers: familyMemberNames,
				});
			} else {
				await sendActiveMemberApprovalEmail({
					name: fullName,
					email: membership.email,
					setupToken: updateData.passwordSetupToken as string,
					familyMembers: familyMemberNames,
				});
			}

			emailSent = true;
			console.log(`Welcome approval email successfully sent to ${membership.email}`);
		} catch (error: unknown) {
			console.error("Error sending welcome email:", error);
			emailSent = false;
			emailError = error instanceof Error ? error.message : "Failed to send welcome email";
		}
	}

	return NextResponse.json({
		...membership.toObject(),
		emailSent,
		emailError,
	});
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
