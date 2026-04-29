import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import { sendWelcomeEmail } from "@/lib/email";
import crypto from "crypto";

interface FamilyMember {
	firstName: string;
	middleName?: string;
	lastName: string;
	personalNumber: string;
	email: string;
	phone?: string;
}

export async function POST(request: Request) {
	try {
		await connectDB();
		
		const { membershipId } = await request.json();
		
		if (!membershipId) {
			return NextResponse.json({ 
				success: false, 
				error: "Membership ID is required" 
			}, { status: 400 });
		}

		// Find the membership
		const membership = await Membership.findById(membershipId);
		
		if (!membership) {
			return NextResponse.json({ 
				success: false, 
				error: "Membership not found" 
			}, { status: 404 });
		}

		// Check if membership is approved
		if (membership.membershipStatus !== "approved") {
			return NextResponse.json({ 
				success: false, 
				error: "Membership is not approved" 
			}, { status: 400 });
		}

		// Check if email exists
		if (!membership.email) {
			return NextResponse.json({ 
				success: false, 
				error: "Member email not found" 
			}, { status: 400 });
		}

		// Generate a setup token (valid for 24 hours)
		const setupToken = crypto.randomBytes(32).toString('hex');
		const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

		// Save the token to the membership record
		await Membership.findByIdAndUpdate(membershipId, {
			passwordSetupToken: setupToken,
			passwordSetupTokenExpiry: tokenExpiry,
		});

		// Extract family member names if they exist
		const familyMemberNames = membership.familyMembers && membership.familyMembers.length > 0
			? membership.familyMembers.map((member: FamilyMember) => `${member.firstName} ${member.lastName}`)
			: [];

		// Send welcome email
		await sendWelcomeEmail({ 
			name: `${membership.firstName} ${membership.lastName}`, 
			email: membership.email, 
			setupToken,
			familyMembers: familyMemberNames
		});

		return NextResponse.json({ 
			success: true, 
			message: "Welcome email sent successfully" 
		});

	} catch (error) {
		console.error("Send welcome email error:", error);
		return NextResponse.json({ 
			success: false, 
			error: error instanceof Error ? error.message : "Failed to send welcome email"
		}, { status: 500 });
	}
}
