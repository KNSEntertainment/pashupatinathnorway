import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import crypto from "crypto";
import { sendActiveMemberApprovalEmail } from "@/lib/email";

const calculateAgeFromPersonalNumber = (personalNumber: string): number | null => {
	if (!personalNumber || personalNumber.length !== 11 || !/^\d{11}$/.test(personalNumber)) {
		return null;
	}

	const day = parseInt(personalNumber.substring(0, 2));
	const month = parseInt(personalNumber.substring(2, 4)) - 1;
	const yearShort = parseInt(personalNumber.substring(4, 6));
	const individualNumber = parseInt(personalNumber.substring(6, 9));
	const currentYear = new Date().getFullYear();

	let fullYear: number;

	// Individual number 750–999 with year 00–39 → born 2000–2039
	if (individualNumber >= 750 && individualNumber <= 999 && yearShort <= 39) {
		fullYear = 2000 + yearShort;
	} else {
		// Everyone else in 0-99 age range → born 1900–1999
		fullYear = 1900 + yearShort;
	}

	// Safety check: if resolved year is somehow in the future, step back
	if (fullYear > currentYear) {
		fullYear -= 100;
	}

	// Calculate exact age
	const birthDate = new Date(fullYear, month, day);
	const today = new Date();

	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}

	// Reject if outside supported range
	if (age < 0 || age > 99) {
		return null;
	}

	return age;
};

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params;

	await connectDB();

	const membership = await Membership.findById(id);

	if (!membership) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	return NextResponse.json(membership);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params;
	await connectDB();
	const data = await req.json();

	// Find the membership before update to check status change
	const existingMembership = await Membership.findById(id);
	if (!existingMembership) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	// Handle membership approval logic
	const updateData = { ...data };

	// If membership is being approved, check age and set membership type
	if (data.membershipStatus === "approved" && existingMembership.membershipStatus !== "approved") {
		const age = calculateAgeFromPersonalNumber(existingMembership.personalNumber);
		
		if (age !== null && age < 15) {
			return NextResponse.json(
				{ error: "Cannot approve membership for members under 15 years old. They must wait until they turn 15 to become an Active member." },
				{ status: 400 }
			);
		}
		
		// Set membership type to Active for approved members 15+
		updateData.membershipType = "Active";
	}

	const membership = await Membership.findByIdAndUpdate(id, updateData, { new: true });

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
			const fullName = [membership.firstName, membership.middleName, membership.lastName]
				.filter(Boolean)
				.join(' ');
			await sendActiveMemberApprovalEmail({
				name: fullName,
				email: membership.email,
				setupToken: setupToken,
			});

			console.log("Welcome email sent for approved member:", membership.email);
		} catch (error: unknown) {
			console.error("Error sending welcome email:", error);
			// Don't fail the membership approval if email fails
		}
	}

	return NextResponse.json(membership);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params;
	await connectDB();
	const membership = await Membership.findByIdAndDelete(id);
	if (!membership) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json({ message: "Deleted successfully" });
}
