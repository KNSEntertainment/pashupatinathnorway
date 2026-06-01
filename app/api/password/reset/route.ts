import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import { validateToken, updatePassword, TokenType } from '@/lib/passwordManager';

export async function POST(request: NextRequest) {
	try {
		await connectDB();
		
		const { token, password } = await request.json();
		
		if (!token || !password) {
			return NextResponse.json(
				{ success: false, error: 'Token and password are required' },
				{ status: 400 }
			);
		}
		
		if (password.length < 6) {
			return NextResponse.json(
				{ success: false, error: 'Password must be at least 6 characters long' },
				{ status: 400 }
			);
		}
		
		// Try to validate token with PASSWORD_RESET type first
		let validationResult = await validateToken(token, TokenType.PASSWORD_RESET);
		
		// If not found, try PASSWORD_SETUP type
		if (!validationResult.valid) {
			validationResult = await validateToken(token, TokenType.PASSWORD_SETUP);
		}
		
		if (!validationResult.valid) {
			return NextResponse.json(
				{ success: false, error: validationResult.error || 'Invalid or expired token' },
				{ status: 400 }
			);
		}
		
		// Get email from the validated user/member
		const email = validationResult.member?.email || validationResult.user?.email;
		if (!email) {
			return NextResponse.json(
				{ success: false, error: 'User email not found' },
				{ status: 400 }
			);
		}
		
		// Update password
		const updateResult = await updatePassword(email, password);
		if (!updateResult.success) {
			return NextResponse.json(
				{ success: false, error: updateResult.error },
				{ status: 500 }
			);
		}
		
		return NextResponse.json({
			success: true,
			message: 'Password reset successfully'
		});
		
	} catch (error) {
		console.error('Password reset error:', error);
		return NextResponse.json(
			{ success: false, error: error instanceof Error ? error.message : 'Failed to reset password' },
			{ status: 500 }
		);
	}
}
