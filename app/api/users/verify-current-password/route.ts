import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import Membership from '@/models/Membership.Model';

export async function POST(request: NextRequest) {
	try {
		const { email, password } = await request.json();

		if (!email || !password) {
			return NextResponse.json(
				{ error: 'Email and password are required' },
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
				{ error: 'Member not found', isValid: false },
				{ status: 404 }
			);
		}

		// Verify the password
		const isPasswordValid = await bcrypt.compare(password, member.password || '');

		return NextResponse.json({
			isValid: isPasswordValid,
			message: isPasswordValid ? 'Password verified' : 'Password is incorrect'
		});

	} catch (error) {
		console.error('Password verification error:', error);
		return NextResponse.json(
			{ error: 'Failed to verify password', isValid: false },
			{ status: 500 }
		);
	}
}
