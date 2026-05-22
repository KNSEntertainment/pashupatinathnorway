import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User.Model";
import crypto from "crypto";
import { sendEmail } from "@/lib/email";

export async function POST(request, { params }) {
	const { id } = params;
	try {
		await connectDB();
		const user = await User.findById(id);
		if (!user) {
			return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
		}
		// Generate a random password reset token
		const resetToken = crypto.randomBytes(32).toString("hex");
		// Set token and expiry on user (for demo, not persisted)
		user.resetToken = resetToken;
		user.resetTokenExpiry = Date.now() + 1000 * 60 * 60; // 1 hour
		await user.save();
		const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/en/reset-password?token=${resetToken}`;
		await sendEmail({
			to: user.email,
			subject: "Password Reset Request",
			html: `<p>Hello ${user.fullName},</p><p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 1 hour.</p>`,
		});
		return NextResponse.json({ success: true, message: "Password reset email sent." }, { status: 200 });
	} catch (error) {
		console.error("Error sending reset password email:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
