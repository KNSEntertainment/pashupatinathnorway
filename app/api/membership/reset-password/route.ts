import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function POST(request: NextRequest) {
	try {
		const { memberId, newPassword } = await request.json();

		if (!memberId || !newPassword) {
			return NextResponse.json(
				{ error: 'Member ID and new password are required' },
				{ status: 400 }
			);
		}

		await connectDB();
		
		const db = mongoose.connection.db;
		if (!db) {
			throw new Error('Database connection failed');
		}
		
		// Update member password in database
		await db.collection('memberships').updateOne(
			{ _id: memberId },
			{ $set: { password: newPassword } }
		);

		// Also update in users collection if needed
		await db.collection('users').updateOne(
			{ email: memberId }, // Assuming memberId is email, adjust if needed
			{ $set: { password: newPassword } }
		);

		return NextResponse.json(
			{ message: 'Password reset successfully' },
			{ status: 200 }
		);
	} catch (error) {
		console.error('Password reset error:', error);
		return NextResponse.json(
			{ error: 'Failed to reset password' },
			{ status: 500 }
		);
	}
}
