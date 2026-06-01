/* eslint-disable @typescript-eslint/no-explicit-any */
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import Membership from '@/models/Membership.Model';
import User from '@/models/User.Model';
import { sendPasswordResetEmail, sendEmail } from '@/lib/email';
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

export interface PasswordResetResult {
	success: boolean;
	error?: string;
	message?: string;
}

export interface TokenValidationResult {
	valid: boolean;
	user?: any;
	member?: any;
	model?: 'User' | 'Membership';
	error?: string;
}

// Token types
export enum TokenType {
	PASSWORD_RESET = 'passwordReset',
	PASSWORD_SETUP = 'passwordSetup',
}

// Generate a secure random token
export function generateToken(): string {
	return crypto.randomBytes(32).toString('hex');
}

// Generate token expiry (default 1 hour)
export function generateTokenExpiry(hours: number = 1): Date {
	return new Date(Date.now() + hours * 60 * 60 * 1000);
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
	return await bcrypt.hash(password, 10);
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
	return await bcrypt.compare(password, hashedPassword);
}

// Find user or member by email
export async function findUserOrMember(email: string): Promise<{ user?: any; member?: any; model: 'User' | 'Membership' | null }> {
	const normalizedEmail = email.toLowerCase();
	
	// Try Membership first
	const member = await Membership.findOne({ email: normalizedEmail });
	if (member) {
		return { member, model: 'Membership' };
	}
	
	// Try User
	const user = await User.findOne({ email: normalizedEmail });
	if (user) {
		return { user, model: 'User' };
	}
	
	return { model: null };
}

// Set token on user or member
export async function setToken(
	email: string,
	tokenType: TokenType,
	token: string,
	expiry: Date
): Promise<PasswordResetResult> {
	const { user, member, model } = await findUserOrMember(email);
	
	if (!user && !member) {
		return { success: false, error: 'User not found' };
	}
	
	// User model uses different field names than Membership model
	const tokenField = model === 'User' 
		? (tokenType === TokenType.PASSWORD_RESET ? 'resetToken' : 'setupToken')
		: (tokenType === TokenType.PASSWORD_RESET ? 'passwordResetToken' : 'passwordSetupToken');
	
	const expiryField = model === 'User'
		? (tokenType === TokenType.PASSWORD_RESET ? 'resetTokenExpiry' : 'setupTokenExpiry')
		: (tokenType === TokenType.PASSWORD_RESET ? 'passwordResetTokenExpiry' : 'passwordSetupTokenExpiry');
	
	try {
		if (model === 'Membership' && member) {
			await Membership.findByIdAndUpdate(member._id, {
				[tokenField]: token,
				[expiryField]: expiry,
			});
		} else if (model === 'User' && user) {
			await User.findByIdAndUpdate(user._id, {
				[tokenField]: token,
				[expiryField]: expiry,
			});
		}
		
		return { success: true };
	} catch (error) {
		console.error('Error setting token:', error);
		return { success: false, error: 'Failed to set token' };
	}
}

// Validate token
export async function validateToken(
	token: string,
	tokenType: TokenType
): Promise<TokenValidationResult> {
	// Membership model field names
	const membershipTokenField = tokenType === TokenType.PASSWORD_RESET ? 'passwordResetToken' : 'passwordSetupToken';
	const membershipExpiryField = tokenType === TokenType.PASSWORD_RESET ? 'passwordResetTokenExpiry' : 'passwordSetupTokenExpiry';
	
	// User model field names
	const userTokenField = tokenType === TokenType.PASSWORD_RESET ? 'resetToken' : 'setupToken';
	const userExpiryField = tokenType === TokenType.PASSWORD_RESET ? 'resetTokenExpiry' : 'setupTokenExpiry';
	
	// Try Membership first
	const member = await Membership.findOne({
		[membershipTokenField]: token,
		[membershipExpiryField]: { $gt: Date.now() },
	});
	
	if (member) {
		return { valid: true, member, model: 'Membership' };
	}
	
	// Try User with its field names
	const user = await User.findOne({
		[userTokenField]: token,
		[userExpiryField]: { $gt: Date.now() },
	});
	
	if (user) {
		return { valid: true, user, model: 'User' };
	}
	
	return { valid: false, error: 'Invalid or expired token' };
}

// Clear tokens from user or member
export async function clearTokens(email: string): Promise<void> {
	const { user, member, model } = await findUserOrMember(email);
	
	if (model === 'Membership' && member) {
		await Membership.findByIdAndUpdate(member._id, {
			passwordResetToken: undefined,
			passwordResetTokenExpiry: undefined,
			passwordSetupToken: undefined,
			passwordSetupTokenExpiry: undefined,
		});
	} else if (model === 'User' && user) {
		await User.findByIdAndUpdate(user._id, {
			resetToken: undefined,
			resetTokenExpiry: undefined,
			setupToken: undefined,
			setupTokenExpiry: undefined,
		});
	}
}

// Update password
export async function updatePassword(
	email: string,
	newPassword: string
): Promise<PasswordResetResult> {
	const { user, member, model } = await findUserOrMember(email);
	
	if (!user && !member) {
		return { success: false, error: 'User not found' };
	}
	
	try {
		const hashedPassword = await hashPassword(newPassword);
		
		if (model === 'Membership' && member) {
			await Membership.findByIdAndUpdate(member._id, {
				password: hashedPassword,
				passwordResetToken: undefined,
				passwordResetTokenExpiry: undefined,
				passwordSetupToken: undefined,
				passwordSetupTokenExpiry: undefined,
			});
		} else if (model === 'User' && user) {
			await User.findByIdAndUpdate(user._id, {
				password: hashedPassword,
				resetToken: undefined,
				resetTokenExpiry: undefined,
				setupToken: undefined,
				setupTokenExpiry: undefined,
			});
		}
		
		return { success: true, message: 'Password updated successfully' };
	} catch (error) {
		console.error('Error updating password:', error);
		return { success: false, error: 'Failed to update password' };
	}
}

// Send password reset email
export async function sendPasswordResetEmailNotification(
	email: string,
	name: string,
	resetUrl: string,
	userType: 'member' | 'user' = 'member'
): Promise<PasswordResetResult> {
	try {
		if (userType === 'member') {
			await sendPasswordResetEmail({ name, email, resetUrl, userType });
		} else {
			await sendEmail({
				to: email,
				subject: 'Password Reset Request',
				html: `<p>Hello ${name},</p><p>Click <a href="${resetUrl}">here</a> to reset your password. This link is valid for 1 hour.</p>`,
			});
		}
		
		return { success: true, message: 'Password reset email sent successfully' };
	} catch (error) {
		console.error('Error sending password reset email:', error);
		return { success: false, error: 'Failed to send password reset email' };
	}
}

// Send password change notification
export async function sendPasswordChangeNotification(
	email: string,
	name: string
): Promise<PasswordResetResult> {
	const loginUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/en/login`;
	
	try {
		await sendEmail({
			to: email,
			subject: 'Password Changed - Pashupatinath Norway Temple Membership',
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9f9; border-radius: 8px;">
					<h2 style="color: #333; margin-bottom: 20px;">Password Changed Successfully</h2>
					<p>Dear ${name},</p>
					<p>Your password for your Pashupatinath Norway Temple membership account has been successfully changed.</p>
					
					<div style="background: #d4edda; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #28a745;">
						<h3 style="color: #155724; margin-bottom: 10px;">Security Information:</h3>
						<ul style="color: #155724; font-size: 14px; line-height: 1.6;">
							<li>Password changed on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</li>
							<li>If you did not make this change, please contact us immediately</li>
							<li>Ensure your new password is strong and unique</li>
						</ul>
					</div>
					
					<div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
						<h3 style="color: #666; margin-bottom: 10px;">Login Information:</h3>
						<p style="color: #666; font-size: 14px;">
							You can login with your email: <strong>${email}</strong> and your new password at:<br>
							<a href="${loginUrl}" style="color: #2563eb; text-decoration: none;">${loginUrl}</a>
						</p>
					</div>
					
					<hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
					<p style="color: #999; font-size: 12px; text-align: center;">
						This is an automated security notification. If you did not change your password, 
						please contact our support team immediately at support@rspnorway.org
					</p>
					
					<p style="color: #999; font-size: 12px; text-align: center;">
						Best regards,<br>The Pashupatinath Norway Temple Team
					</p>
				</div>
			`,
		});
		
		return { success: true, message: 'Password change notification sent' };
	} catch (error) {
		console.error('Error sending password change notification:', error);
		return { success: false, error: 'Failed to send notification' };
	}
}

// Admin: Generate random password and email it
export async function adminGenerateAndEmailPassword(
	email: string,
	name: string
): Promise<PasswordResetResult> {
	const { member } = await findUserOrMember(email);
	
	if (!member) {
		return { success: false, error: 'Member not found' };
	}
	
	try {
		// Generate random 6-character password
		const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
		let password = '';
		for (let i = 0; i < 6; i++) {
			password += chars.charAt(crypto.randomInt(chars.length));
		}
		
		// Hash and update
		const hashedPassword = await hashPassword(password);
		await Membership.findByIdAndUpdate(member._id, {
			password: hashedPassword,
			passwordResetToken: undefined,
			passwordResetTokenExpiry: undefined,
		});
		
		// Send email
		const mailOptions = {
			from: `"Pashupatinath Norway Temple" <${process.env.EMAIL_USER!}>`,
			to: [email],
			subject: 'Password Reset - Pashupatinath Norway Temple Membership',
			html: `
				<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background: #f8f9f9; border-radius: 8px;">
					<h2 style="color: #333; margin-bottom: 20px;">Password Reset</h2>
					<p>Dear ${name},</p>
					<p>An administrator has reset your password for your Pashupatinath Norway Temple membership account.</p>
					
					<div style="background: white; padding: 15px; border-radius: 6px; margin: 20px 0;">
						<h3 style="color: #666; margin-bottom: 10px;">Your New Password:</h3>
						<p style="font-size: 18px; font-weight: bold; color: #333; margin-bottom: 5px;">${password}</p>
						<p style="color: #666; font-size: 14px;">This password is temporary and was generated randomly.</p>
						<p style="color: #666; font-size: 14px;">Please <strong>change your password</strong> after logging in.</p>
					</div>
					
					<div style="background: #fff3cd; padding: 15px; border-radius: 6px; margin: 20px 0;">
						<h3 style="color: #721c24; margin-bottom: 10px;">Login Instructions:</h3>
						<ol style="color: #721c24; font-size: 14px; line-height: 1.6;">
							<li>Go to: <a href="https://pashupatinathnorway.vercel.app/en/login" style="color: #2563eb; text-decoration: none;">https://pashupatinathnorway.vercel.app/en/login</a></li>
							<li>Enter your email: <strong>${email}</strong></li>
							<li>Use the temporary password: <strong>${password}</strong></li>
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
		
		const { error } = await resend.emails.send(mailOptions);
		
		if (error) {
			console.error('Resend email error:', error);
			return { success: false, error: 'Failed to send password reset email' };
		}
		
		return { success: true, message: 'Password reset email sent successfully' };
	} catch (error) {
		console.error('Admin password reset error:', error);
		return { success: false, error: 'Failed to reset password' };
	}
}
