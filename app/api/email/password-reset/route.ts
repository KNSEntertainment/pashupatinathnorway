import { NextRequest, NextResponse } from 'next/server';
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import Membership from "@/models/Membership.Model";

// Create nodemailer transporter using existing configuration
const transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user: process.env.EMAIL_USER,
		pass: process.env.EMAIL_APP_PASS,
	},
});

export async function POST(request: NextRequest) {
	try {
		const { email, name } = await request.json();

		if (!email || !name) {
			return NextResponse.json(
				{ error: 'Email and name are required' },
				{ status: 400 }
			);
		}

		// Connect to database
		if (mongoose.connection.readyState !== 1) {
			await mongoose.connect(process.env.MONGODB_URI!);
		}

		// Find the member by email
		const member = await Membership.findOne({ email: email.toLowerCase() });
		if (!member) {
			return NextResponse.json(
				{ error: 'Member not found with this email' },
				{ status: 404 }
			);
		}

		// Generate random 6-character password with letters and numbers
		const generateRandomPassword = () => {
			const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
			let password = '';
			for (let i = 0; i < 6; i++) {
				password += chars.charAt(Math.floor(Math.random() * chars.length));
			}
			return password;
		};

		const newPassword = generateRandomPassword();

		// Hash the new password
		const hashedPassword = await bcrypt.hash(newPassword, 10);

		// Update the member's password in the database
		await Membership.findByIdAndUpdate(member._id, { 
			password: hashedPassword,
			passwordResetToken: null,
			passwordResetTokenExpiry: null
		});

		// Send password reset email
		const mailOptions = {
			from: `"Pashupatinath Norway Temple" <${process.env.EMAIL_USER}>`,
			to: email,
			subject: 'Password Reset - Pashupatinath Norway Temple Membership',
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9f9; border-radius: 8px;">
					<h2 style="color: #333; margin-bottom: 20px;">Password Reset</h2>
					<p>Dear ${name},</p>
					<p>An administrator has reset your password for your Pashupatinath Norway Temple membership account.</p>
					
					<div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
						<h3 style="color: #666; margin-bottom: 10px;">Your New Password:</h3>
						<p style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 5px;">${newPassword}</p>
						<p style="color: #666; font-size: 14px;">This password is temporary and was generated randomly.</p>
						<p style="color: #666; font-size: 14px;">Please <strong>change your password</strong> after logging in.</p>
					</div>
					
					<div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0;">
						<h3 style="color: #721c24; margin-bottom: 10px;">Login Instructions:</h3>
						<ol style="color: #721c24; font-size: 14px; line-height: 1.6;">
							<li>Go to: <a href="https://http://pashupatinathnorway.vercel.app//en/login" style="color: #2563eb; text-decoration: none;">https://http://pashupatinathnorway.vercel.app//en/login</a></li>
							<li>Enter your email: <strong>${email}</strong></li>
							<li>Use the temporary password: <strong>${newPassword}</strong></li>
							<li>After logging in, click on "Profile" → "Change Password"</li>
							<li>Create your new permanent password</li>
						</ol>
					</div>
					
					<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
					<p style="color: #999; font-size: 12px; text-align: center;">
						This is an automated message. If you did not request this password reset, please contact our support team immediately.
					</p>
					
					<p style="color: #999; font-size: 12px; text-align: center;">
						Best regards,<br>The Pashupatinath Norway Temple Team
					</p>
				</div>
			`,
		};

		await transporter.sendMail(mailOptions);

		return NextResponse.json(
			{ 
				message: 'Password reset email sent successfully',
				tempPassword: newPassword 
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error('Password reset email error:', error);
		return NextResponse.json(
			{ error: 'Failed to send password reset email' },
			{ status: 500 }
		);
	}
}
