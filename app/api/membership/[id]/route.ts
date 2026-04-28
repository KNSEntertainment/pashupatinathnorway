import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import crypto from "crypto";
import { sendWelcomeEmail } from "@/lib/email";

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

	const membership = await Membership.findByIdAndUpdate(id, data, { new: true });

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

			// Send welcome email with password setup link
			await sendWelcomeEmail({
				name: membership.fullName,
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
