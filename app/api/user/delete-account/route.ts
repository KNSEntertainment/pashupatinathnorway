import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function DELETE(request: NextRequest) {
	try {
		const { email } = await request.json();

		if (!email) {
			return NextResponse.json(
				{ error: 'Email is required' },
				{ status: 400 }
			);
		}

		await connectDB();
		
		const db = mongoose.connection.db;
		if (!db) {
			throw new Error('Database connection failed');
		}
		
		// Delete user from users collection
		await db.collection('users').deleteOne({ email });
		
		// Delete user's membership data
		await db.collection('memberships').deleteOne({ email });
		
		// Delete user's sessions/tokens
		await db.collection('accounts').deleteMany({ userId: email });
		
		// Delete user's profile photos if any
		await db.collection('profilephotos').deleteMany({ email });

		return NextResponse.json(
			{ message: 'Account deleted successfully' },
			{ status: 200 }
		);
	} catch (error) {
		console.error('Delete account error:', error);
		return NextResponse.json(
			{ error: 'Failed to delete account' },
			{ status: 500 }
		);
	}
}
