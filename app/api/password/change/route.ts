import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Membership from '@/models/Membership.Model';
import { requireAdmin, requireAuthenticatedMember } from '@/lib/apiAuth';
import {
	verifyPassword,
	updatePassword,
	sendPasswordChangeNotification,
	adminGenerateAndEmailPassword,
} from '@/lib/passwordManager';

export async function POST(request: NextRequest) {
	try {
		await connectDB();
		
		const body = await request.json();
		const { 
			currentPassword, 
			newPassword, 
			targetEmail, 
			action,
			name 
		} = body;
		
		// Determine the action type
		// 'verify' - verify current password
		// 'change' - authenticated user changing own password
		// 'admin-reset' - admin directly setting new password for user
		// 'admin-generate' - admin generating random password and emailing it
		
		if (action === 'verify') {
			// Verify current password
			const auth = await requireAuthenticatedMember();
			if (auth.response) return auth.response;
			
			const userEmail = auth.session?.user?.email;
			if (!userEmail) {
				return NextResponse.json(
					{ success: false, error: 'Unauthorized', isValid: false },
					{ status: 403 }
				);
			}
			
			if (!currentPassword) {
				return NextResponse.json(
					{ success: false, error: 'Password is required', isValid: false },
					{ status: 400 }
				);
			}
			
			// Find member
			const member = await Membership.findOne({ email: userEmail.toLowerCase() });
			if (!member) {
				return NextResponse.json(
					{ success: false, error: 'Member not found', isValid: false },
					{ status: 404 }
				);
			}
			
			// Verify password
			const isPasswordValid = await verifyPassword(currentPassword, member.password || '');
			
			return NextResponse.json({
				isValid: isPasswordValid,
				message: isPasswordValid ? 'Password verified' : 'Password is incorrect'
			});
		}
		
		if (action === 'admin-generate') {
			// Admin generates random password and emails it
			const auth = await requireAdmin();
			if (auth.response) return auth.response;
			
			if (!targetEmail || !name) {
				return NextResponse.json(
					{ success: false, error: 'Target email and name are required' },
					{ status: 400 }
				);
			}
			
			const result = await adminGenerateAndEmailPassword(targetEmail, name);
			if (!result.success) {
				return NextResponse.json(
					{ success: false, error: result.error },
					{ status: 500 }
				);
			}
			
			return NextResponse.json({
				success: true,
				message: result.message
			});
		}
		
		if (action === 'admin-reset') {
			// Admin directly sets new password for user
			const auth = await requireAdmin();
			if (auth.response) return auth.response;
			
			if (!targetEmail || !newPassword) {
				return NextResponse.json(
					{ success: false, error: 'Target email and new password are required' },
					{ status: 400 }
				);
			}
			
			if (newPassword.length < 8) {
				return NextResponse.json(
					{ success: false, error: 'New password must be at least 8 characters long' },
					{ status: 400 }
				);
			}
			
			const result = await updatePassword(targetEmail, newPassword);
			if (!result.success) {
				return NextResponse.json(
					{ success: false, error: result.error },
					{ status: 500 }
				);
			}
			
			return NextResponse.json({
				success: true,
				message: 'Password reset successfully'
			});
		}
		
		// Default action: authenticated user changing own password
		const auth = await requireAuthenticatedMember();
		if (auth.response) return auth.response;
		
		const userEmail = auth.session?.user?.email;
		if (!userEmail) {
			return NextResponse.json(
				{ success: false, error: 'Unauthorized' },
				{ status: 403 }
			);
		}
		
		if (!currentPassword || !newPassword) {
			return NextResponse.json(
				{ success: false, error: 'Current password and new password are required' },
				{ status: 400 }
			);
		}
		
		if (newPassword.length < 8) {
			return NextResponse.json(
				{ success: false, error: 'New password must be at least 8 characters long' },
				{ status: 400 }
			);
		}
		
		// Find member
		const member = await Membership.findOne({ email: userEmail.toLowerCase() });
		if (!member) {
			return NextResponse.json(
				{ success: false, error: 'Member not found' },
				{ status: 404 }
			);
		}
		
		// Verify current password
		const isCurrentPasswordValid = await verifyPassword(currentPassword, member.password || '');
		if (!isCurrentPasswordValid) {
			return NextResponse.json(
				{ success: false, error: 'Current password is incorrect' },
				{ status: 400 }
			);
		}
		
		// Update password
		const updateResult = await updatePassword(userEmail, newPassword);
		if (!updateResult.success) {
			return NextResponse.json(
				{ success: false, error: updateResult.error },
				{ status: 500 }
			);
		}
		
		// Send notification email
		const fullName = [member.firstName, member.middleName, member.lastName]
			.filter(Boolean)
			.join(' ');
		
		let notificationSent = true;
		try {
			await sendPasswordChangeNotification(userEmail, fullName);
		} catch (emailError) {
			notificationSent = false;
			console.error('Password changed, but failed to send notification email:', emailError);
		}
		
		return NextResponse.json({
			success: true,
			message: notificationSent
				? 'Password changed successfully and notification email sent'
				: 'Password changed successfully, but notification email could not be sent',
			notificationSent
		});
		
	} catch (error) {
		console.error('Password change error:', error);
		return NextResponse.json(
			{ success: false, error: error instanceof Error ? error.message : 'Failed to change password' },
			{ status: 500 }
		);
	}
}
