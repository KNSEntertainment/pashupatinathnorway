import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import Subscriber from "@/models/Subscriber.Model";
import { sendGeneralMemberWelcomeEmail } from "@/lib/email";

interface FamilyMember {
	firstName: string;
	middleName?: string;
	lastName: string;
	personalNumber: string;
	email: string;
	phone?: string;
}

// Helper function to add subscriber if not already exists
async function addSubscriberIfNotExists(email: string) {
	try {
		const existingSubscriber = await Subscriber.findOne({ subscriber: email });
		if (!existingSubscriber) {
			await Subscriber.create({ subscriber: email });
			console.log(`New subscriber added: ${email}`);
		}
	} catch (error) {
		console.error(`Error adding subscriber ${email}:`, error);
		// Don't fail the membership creation if subscriber creation fails
	}
}

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
		// Check if personal number exists and return full membership data
		const membership = await Membership.findOne({ personalNumber });
		if (membership) {
			return NextResponse.json({ membership });
		} else {
			return NextResponse.json({ membership: null });
		}
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
		
		// Create membership for main applicant with generalMemberSince
		const mainMembershipData = {
			...mainApplicantData,
			generalMemberSince: new Date().toISOString(),
		};
		const mainMembership = await Membership.create(mainMembershipData);
		
		// Add main applicant as subscriber
		await addSubscriberIfNotExists(mainApplicantData.email);
		
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
					generalMemberSince: new Date().toISOString(),
				};
				
				const familyMembership = await Membership.create(familyMemberData);
				familyMemberships.push(familyMembership);
				
				// Add family member as subscriber
				await addSubscriberIfNotExists(familyMember.email);
			}
		}

		// Send General Member welcome emails to all new members
		try {
			// Send to main applicant
			const mainMemberName = [mainMembership.firstName, mainMembership.middleName, mainMembership.lastName]
				.filter(Boolean)
				.join(' ');
			await sendGeneralMemberWelcomeEmail({
				name: mainMemberName,
				email: mainMembership.email,
				familyMembers: familyMembers.map((fm: FamilyMember) => [fm.firstName, fm.middleName, fm.lastName].filter(Boolean).join(' ')),
			});

			// Send to family members
			for (const familyMembership of familyMemberships) {
				const familyMemberName = [familyMembership.firstName, familyMembership.middleName, familyMembership.lastName]
					.filter(Boolean)
					.join(' ');
				await sendGeneralMemberWelcomeEmail({
					name: familyMemberName,
					email: familyMembership.email,
					familyMembers: [], // Family members don't have additional family members
				});
			}

			console.log(`General Member welcome emails sent to ${1 + familyMemberships.length} members`);
		} catch (emailError) {
			console.error("Error sending General Member welcome emails:", emailError);
			// Don't fail the membership creation if email fails
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
