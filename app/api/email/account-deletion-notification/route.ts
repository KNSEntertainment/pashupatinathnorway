import { NextRequest, NextResponse } from 'next/server';
import nodemailer from "nodemailer";

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

		// Send notification email using nodemailer
		const mailOptions = {
			from: `"PNSB-Norway" <${process.env.EMAIL_USER}>`,
			to: email,
			subject: 'Account Deletion Confirmation',
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
					<h2 style="color: #333;">Account Deletion Confirmation</h2>
					<p>Dear ${name},</p>
					<p>We're sorry to see you go. Your account has been <strong>permanently deleted</strong> from our system.</p>
					
					<h3 style="color: #666; margin-top: 20px;">What was deleted:</h3>
					<ul style="color: #666;">
						<li>Profile information</li>
						<li>Membership details</li>
						<li>Activity history</li>
						<li>Uploaded photos</li>
					</ul>
					
					<p style="margin-top: 20px;">If this was a mistake or you have any questions, please contact our support team.</p>
					
					<p style="margin-top: 30px;">Thank you for being part of our community. We wish you all the best in your future endeavors.</p>
					
					<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
					<p style="color: #999; font-size: 14px;">Best regards,<br>The PNSB-Norway Team</p>
				</div>
			`,
		};

		await transporter.sendMail(mailOptions);

		return NextResponse.json(
			{ message: 'Email notification sent successfully' },
			{ status: 200 }
		);
	} catch (error) {
		console.error('Email notification error:', error);
		return NextResponse.json(
			{ error: 'Failed to send email notification' },
			{ status: 500 }
		);
	}
}
