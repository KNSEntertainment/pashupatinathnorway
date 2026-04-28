import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import { sendPasswordResetEmail } from "@/lib/email";
import crypto from "crypto";

export async function POST(request: Request) {
	try {
		await connectDB();
		
		const { email } = await request.json();
		
		if (!email) {
			return NextResponse.json({ 
				success: false, 
				error: "Email is required" 
			}, { status: 400 });
		}

		// Find approved member
		const member = await Membership.findOne({ 
			email,
			membershipStatus: "approved" // Only approved members can reset password
		});
		
		if (!member) {
			return NextResponse.json({ 
				success: false, 
				error: "No approved member found with this email" 
			}, { status: 404 });
		}

		// Generate reset token for member
		const resetToken = crypto.randomBytes(32).toString('hex');
		const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour from now

		console.log("Generated reset token for member:", { 
			memberId: member._id, 
			memberEmail: member.email,
			resetToken: resetToken.substring(0, 10) + "...",
			tokenExpiry: tokenExpiry.toISOString()
		});

		// Clear any existing reset tokens first
		await Membership.findByIdAndUpdate(member._id, {
			passwordResetToken: undefined,
			passwordResetTokenExpiry: undefined,
		});

		// Save the new token to the membership record
		await Membership.findByIdAndUpdate(member._id, {
			passwordResetToken: resetToken,
			passwordResetTokenExpiry: tokenExpiry,
		});

		const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/en/reset-password?token=${resetToken}`;

		// Send password reset email
		await sendPasswordResetEmail({ 
			name: member.fullName, 
			email, 
			resetUrl,
			userType: "member"
		});

		return NextResponse.json({ 
			success: true, 
			message: "Password reset link sent successfully" 
		});

	} catch (error) {
		console.error("Forgot password error:", error);
		return NextResponse.json({ 
			success: false, 
			error: error instanceof Error ? error.message : "Failed to send password reset email"
		}, { status: 500 });
	}
}
