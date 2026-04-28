import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Membership from '@/models/Membership.Model';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';

export async function PATCH(request: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		
		if (!session?.user?.email) {
			return NextResponse.json(
				{ error: 'Unauthorized' },
				{ status: 401 }
			);
		}

		const updateData = await request.json();
		
		// Define which fields are allowed to be updated
		const allowedFields = [
			'phone',
			'address', 
			'city',
			'postalCode',
			'province',
			'district',
			'profession',
			'skills',
			'volunteerInterest'
		];

		// Filter the update data to only include allowed fields
		const filteredData: Record<string, unknown> = {};
		for (const field of allowedFields) {
			if (updateData[field] !== undefined) {
				filteredData[field] = updateData[field];
			}
		}

		if (Object.keys(filteredData).length === 0) {
			return NextResponse.json(
				{ error: 'No valid fields to update' },
				{ status: 400 }
			);
		}

		if (mongoose.connection.readyState !== 1) {
			await mongoose.connect(process.env.MONGODB_URI!);
		}

		const member = await Membership.findOneAndUpdate(
			{ email: session.user.email.toLowerCase() },
			filteredData,
			{ new: true }
		);

		if (!member) {
			return NextResponse.json(
				{ error: 'Member not found' },
				{ status: 404 }
			);
		}

		// Return the updated member data (excluding sensitive fields)
		const updatedMember = {
			fullName: member.fullName,
			email: member.email,
			phone: member.phone,
			address: member.address,
			city: member.city,
			postalCode: member.postalCode,
			province: member.province,
			district: member.district,
			profession: member.profession,
			skills: member.skills,
			volunteerInterest: member.volunteerInterest,
			membershipType: member.membershipType,
			membershipStatus: member.membershipStatus,
		};

		return NextResponse.json({
			message: 'Profile updated successfully',
			member: updatedMember
		});
	} catch (error) {
		console.error('Error updating profile:', error);
		return NextResponse.json(
			{ error: 'Internal server error' },
			{ status: 500 }
		);
	}
}
