import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Membership from '@/models/Membership.Model';
import User from '@/models/User.Model';
import { requireAdmin } from '@/lib/apiAuth';
import {
	generateToken,
	generateTokenExpiry,
	setToken,
	sendPasswordResetEmailNotification,
	TokenType,
} from '@/lib/passwordManager';

export async function POST(request: NextRequest) {
	try {
		await connectDB();
		
		const { email, targetEmail, isAdmin } = await request.json();
		
		// Determine if this is an admin request or user request
		const isAdminRequest = isAdmin === true;
		const targetEmailToUse = isAdminRequest ? targetEmail : email;
		
		if (!targetEmailToUse) {
			return NextResponse.json(
				{ success: false, error: 'Email is required' },
				{ status: 400 }
			);
		}
		
		// If admin request, verify admin auth
		if (isAdminRequest) {
			const auth = await requireAdmin();
			if (auth.response) return auth.response;
		}
		
		// Find the user/member
		const normalizedEmail = targetEmailToUse.toLowerCase();
		
		// Check both Membership and User models
		let user = null;
		let member = null;
		let userType: 'member' | 'user' = 'member';
		
		// For member self-request, only allow approved members
		if (!isAdminRequest) {
			// First try to find in Membership model
			member = await Membership.findOne({ 
				email: normalizedEmail,
				membershipStatus: 'approved'
			});
			
			// If not found in Membership, try User model (for admins)
			if (!member) {
				user = await User.findOne({ email: normalizedEmail });
				if (user) {
					userType = 'user';
				}
			}
			
			if (!member && !user) {
				return NextResponse.json(
					{ success: false, error: 'No account found with this email address' },
					{ status: 404 }
				);
			}
		} else {
			// Admin request - find in either model
			member = await Membership.findOne({ email: normalizedEmail });
			if (!member) {
				user = await User.findOne({ email: normalizedEmail });
				if (user) {
					userType = 'user';
				}
			}
			
			if (!member && !user) {
				return NextResponse.json(
					{ success: false, error: 'User not found' },
					{ status: 404 }
				);
			}
		}
		
		// Generate token
		const token = generateToken();
		const expiry = generateTokenExpiry(1); // 1 hour
		
		// Set token on user/member
		const tokenResult = await setToken(normalizedEmail, TokenType.PASSWORD_RESET, token, expiry);
		if (!tokenResult.success) {
			return NextResponse.json(
				{ success: false, error: tokenResult.error },
				{ status: 400 }
			);
		}
		
		// Generate reset URL
		const resetUrl = `${process.env.NEXTAUTH_URL || "http://localhost:3000"}/en/reset-password?token=${token}`;
		
		// Get user/member details for email
		let fullName = '';
		if (member) {
			fullName = [member.firstName, member.middleName, member.lastName]
				.filter(Boolean)
				.join(' ');
		} else if (user) {
			fullName = user.fullName || user.name || '';
		}
		
		// Send email
		const emailResult = await sendPasswordResetEmailNotification(
			normalizedEmail,
			fullName,
			resetUrl,
			userType
		);
		
		if (!emailResult.success) {
			return NextResponse.json(
				{ success: false, error: emailResult.error },
				{ status: 500 }
			);
		}
		
		return NextResponse.json({
			success: true,
			message: 'Password reset link sent successfully'
		});
		
	} catch (error) {
		console.error('Password request reset error:', error);
		return NextResponse.json(
			{ success: false, error: error instanceof Error ? error.message : 'Failed to request password reset' },
			{ status: 500 }
		);
	}
}
