import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ExecutiveMember from "@/models/ExecutiveMember.Model";
import Membership from "@/models/Membership.Model";
import { saveUploadedFile } from "@/lib/saveUploadedFile";
import { sendWelcomeEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(req) {
	try {
		await connectDB();

		const formData = await req.formData();
		const name = formData.get("name");
		const position = formData.get("position");
		const department = formData.get("department");
		const subdepartment = formData.get("subdepartment");
		const phone = formData.get("phone");
		const email = formData.get("email");
		const order = formData.get("order") || 0;
		const isActive = formData.get("isActive") === "true";
		const imageFile = formData.get("image");

		if (!name || !phone || !email) {
			return NextResponse.json({ error: "Name, phone, and email are required." }, { status: 400 });
		}

		let imageUrl = "";
		if (imageFile && imageFile.size > 0) {
			const fileResult = await saveUploadedFile(imageFile, "executive-members");
			imageUrl = fileResult.url;
		}

		const newMember = await ExecutiveMember.create({
			name,
			position,
			department,
			subdepartment,
			phone,
			email,
			order: parseInt(order),
			isActive,
			imageUrl,
		});

		// Create corresponding membership record for user creation flow
		const setupToken = crypto.randomBytes(32).toString('hex');
		const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

		const membershipData = {
			fullName: name,
			email,
			phone,
			address: "",
			city: "",
			postalCode: "",
			dateOfBirth: "",
			gender: "prefer-not-to-say",
			profession: position || "Executive Member",
			membershipType: "executive",
			membershipStatus: "approved",
			skills: "",
			volunteerInterest: [],
			agreeTerms: true,
			profilePhoto: imageUrl,
			passwordSetupToken: setupToken,
			passwordSetupTokenExpiry: tokenExpiry,
		};

		const membership = await Membership.create(membershipData);

		// Send welcome email with password setup link
		try {
			await sendWelcomeEmail({ 
				name, 
				email, 
				setupToken 
			});
		} catch (emailError) {
			console.error("Failed to send welcome email:", emailError);
			// Continue even if email fails
		}

		return NextResponse.json({ 
			success: true, 
			member: newMember,
			membershipId: membership._id
		}, { status: 201 });
	} catch (error) {
		console.error("Error creating executive member:", error);
		return NextResponse.json({ error: "Failed to create executive member." }, { status: 500 });
	}
}
