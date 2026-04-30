import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";

export async function GET(req: NextRequest) {
	await connectDB();
	const { searchParams } = new URL(req.url);
	const email = searchParams.get("email");
	const personalNumber = searchParams.get("personalNumber");

	if (email) {
		// Check if email exists
		const membership = await Membership.findOne({ email });
		return NextResponse.json(membership ? [membership] : []);
	}

	if (personalNumber) {
		// Check if personal number exists
		const membership = await Membership.findOne({ personalNumber });
		return NextResponse.json({ exists: !!membership });
	}

	// Return all memberships if no filter
	const memberships = await Membership.find().sort({ createdAt: -1 });
	return NextResponse.json(memberships);
}

export async function POST(req: NextRequest) {
	await connectDB();
	const data = await req.json();
	
	try {
		// Extract family members from the main application data
		const { familyMembers, ...mainApplicantData } = data;
		
		// Validate main applicant phone number (8 digits)
		if (!mainApplicantData.phone) {
			throw new Error('Phone number is required');
		}
		
		if (!/^\d{8}$/.test(mainApplicantData.phone.replace(/\D/g, ''))) {
			throw new Error('Phone number must be exactly 8 digits');
		}
		
		// Create membership for main applicant
		const mainMembership = await Membership.create(mainApplicantData);
		
		// Create separate membership records for each family member
		const familyMemberships = [];
		
		if (familyMembers && Array.isArray(familyMembers) && familyMembers.length > 0) {
			for (const familyMember of familyMembers) {
				// Validate family member required fields
				if (!familyMember.firstName || !familyMember.lastName || !familyMember.personalNumber || !familyMember.email) {
					throw new Error(`Family member missing required fields: ${JSON.stringify(familyMember)}`);
				}
				
				// Validate personal number format
				if (!/^\d{11}$/.test(familyMember.personalNumber)) {
					throw new Error(`Family member personal number must be exactly 11 digits: ${familyMember.personalNumber}`);
				}
				
				// Validate email format
				const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
				if (!emailRegex.test(familyMember.email)) {
					throw new Error(`Family member email address is not valid: ${familyMember.email}`);
				}
				
				// Validate family member phone number (optional but if provided must be 8 digits)
				if (familyMember.phone && !/^\d{8}$/.test(familyMember.phone.replace(/\D/g, ''))) {
					throw new Error(`Family member ${familyMember.firstName} ${familyMember.lastName} phone number must be exactly 8 digits: ${familyMember.phone}`);
				}
				
				// Create family member record with same address, permissions, and other shared data
				const familyMemberData = {
					...mainApplicantData,
					firstName: familyMember.firstName,
					middleName: familyMember.middleName || "",
					lastName: familyMember.lastName,
					personalNumber: familyMember.personalNumber,
					email: familyMember.email,
					phone: familyMember.phone || mainApplicantData.phone,
					familyMembers: [], // Don't include nested family members
				};
				
				const familyMembership = await Membership.create(familyMemberData);
				familyMemberships.push(familyMembership);
			}
		}
		
		return NextResponse.json({
			mainMembership,
			familyMemberships,
			totalMembers: 1 + familyMemberships.length
		}, { status: 201 });
		
	} catch (error) {
		console.error('Membership creation error:', error);
		const errorMessage = error instanceof Error ? error.message : 'Failed to create membership';
		return NextResponse.json(
			{ error: errorMessage },
			{ status: 400 }
		);
	}
}
