import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Membership from '@/models/Membership.Model';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function GET() {
	try {
		const session = await getServerSession(authOptions);
		
		if (!session?.user?.email) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		if (mongoose.connection.readyState !== 1) {
			await mongoose.connect(process.env.MONGODB_URI!);
		}

		const member = await Membership.findOne({ email: session.user.email.toLowerCase() });
		if (!member) {
			return NextResponse.json(
				{ error: 'Member not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			permissionPhotos: member.permissionPhotos || false,
			permissionPhone: member.permissionPhone || false,
			permissionEmail: member.permissionEmail || false,
		});
	} catch (error) {
		console.error('Error fetching privacy settings:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		
		if (!session?.user?.email) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const { permissionPhotos, permissionPhone, permissionEmail } = await request.json();

		if (typeof permissionPhotos !== 'boolean' || 
			typeof permissionPhone !== 'boolean' || 
			typeof permissionEmail !== 'boolean') {
			return NextResponse.json(
				{ error: 'Invalid input. All fields must be boolean values.' },
				{ status: 400 }
			);
		}

		if (mongoose.connection.readyState !== 1) {
			await mongoose.connect(process.env.MONGODB_URI!);
		}

		const member = await Membership.findOneAndUpdate(
			{ email: session.user.email.toLowerCase() },
			{
				permissionPhotos,
				permissionPhone,
				permissionEmail,
			},
			{ new: true }
		);

		if (!member) {
			return NextResponse.json(
				{ error: 'Member not found' },
				{ status: 404 }
			);
		}

		return NextResponse.json({
			message: 'Privacy settings updated successfully',
			permissionPhotos: member.permissionPhotos,
			permissionPhone: member.permissionPhone,
			permissionEmail: member.permissionEmail,
		});
	} catch (error) {
		console.error('Error updating privacy settings:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
