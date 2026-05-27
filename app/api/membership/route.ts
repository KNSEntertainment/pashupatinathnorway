import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import Subscriber from "@/models/Subscriber.Model";
import { sendGeneralMemberWelcomeEmailNepali, sendWelcomeEmail } from "@/lib/email";
import generateMembershipId from "@/lib/membershipIdGenerator";
import crypto from "crypto";

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

interface MemberDocument {
	_id: string;
	firstName: string;
	middleName?: string;
	lastName: string;
	email: string;
	membershipId: string;
	membershipType: string;
}

// Helper function to send appropriate email based on member type
async function sendMemberWelcomeEmail(member: MemberDocument, familyMembers: string[] = []) {
	try {
		const memberName = [member.firstName, member.middleName, member.lastName].filter(Boolean).join(" ");

		// Check if member type should receive password setup email
		const passwordSetupTypes = ["Active", "Executive", "Advisor"];
		const needsPasswordSetup = passwordSetupTypes.includes(member.membershipType);

		if (needsPasswordSetup) {
			// Generate password setup token (valid for 24 hours)
			const setupToken = crypto.randomBytes(32).toString("hex");
			const tokenExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

			// Update member with token and set status to approved
			await Membership.findByIdAndUpdate(member._id, {
				passwordSetupToken: setupToken,
				passwordSetupTokenExpiry: tokenExpiry,
				membershipStatus: "approved",
			});

			// Send password setup email
			await sendWelcomeEmail({
				name: memberName,
				email: member.email,
				setupToken,
				familyMembers,
			});

			console.log(`Password setup email sent to ${member.membershipType} member: ${member.email}`);
		} else {
			// Send general welcome email
			await sendGeneralMemberWelcomeEmailNepali({
				name: memberName,
				email: member.email,
				membershipId: member.membershipId,
				familyMembers,
			});

			console.log(`General welcome email sent to ${member.membershipType} member: ${member.email}`);
		}
	} catch (error) {
		console.error(`Error sending welcome email to ${member.email}:`, error);
		// Don't fail the membership creation if email fails
	}
}

export async function GET(req: NextRequest) {
	await connectDB();
	const { searchParams } = new URL(req.url);
	const email = searchParams.get("email");
	const personalNumber = searchParams.get("personalNumber");
	const type = searchParams.get("type");

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

	const query: { membershipType?: { $in: string[] } } = {};
	if (type) {
		// Support comma-separated types (e.g., "Executive,Advisor")
		const types = type.split(",").map((t) => t.trim());
		query.membershipType = { $in: types };
	}

	// Return filtered memberships if type filter provided, otherwise all memberships
	// For executive members, sort by displayOrder first
	let sortOptions: Record<string, 1 | -1> = { createdAt: -1 };
	if (type && (type.includes("Executive") || type.includes("Advisor"))) {
		sortOptions = {
			membershipType: 1, // Executive first, then Advisor
			displayOrder: 1, // Then by display order
			lastName: 1, // Then by last name
			firstName: 1, // Then by first name
		};
	}

	const memberships = await Membership.find(query).sort(sortOptions);
	return NextResponse.json(memberships);
}

export async function POST(req: NextRequest) {
	await connectDB();
	const data = await req.json();

	try {
		// Note: Captcha is already verified on frontend via CustomCaptcha component
		// which calls /api/captcha/verify. No need to verify again here.

		// Extract family members from the main application data
		const { familyMembers, ...mainApplicantData } = data;

		// Validate main applicant phone number (8 digits)
		if (!mainApplicantData.phone) {
			throw new Error("Phone number is required");
		}

		if (!/^\d{8}$/.test(mainApplicantData.phone.replace(/\D/g, ""))) {
			throw new Error("Phone number must be exactly 8 digits");
		}

		// Generate membership ID for main applicant
		const mainMembershipId = await generateMembershipId();

		// Create membership for main applicant with generalMemberSince
		const mainMembershipData = {
			...mainApplicantData,
			membershipId: mainMembershipId,
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
				if (familyMember.phone && !/^\d{8}$/.test(familyMember.phone.replace(/\D/g, ""))) {
					throw new Error(`Family member ${familyMember.firstName} ${familyMember.lastName} phone number must be exactly 8 digits: ${familyMember.phone}`);
				}

				// Generate membership ID for family member
				const familyMembershipId = await generateMembershipId();

				// Create family member record with same address, permissions, and other shared data
				const familyMemberData = {
					...mainApplicantData,
					membershipId: familyMembershipId,
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

		// Send welcome emails to all new members based on their member type
		try {
			// Send to main applicant
			const mainFamilyMemberNames = familyMembers.map((fm: FamilyMember) => [fm.firstName, fm.middleName, fm.lastName].filter(Boolean).join(" "));
			await sendMemberWelcomeEmail(mainMembership, mainFamilyMemberNames);

			// Send to family members
			for (const familyMembership of familyMemberships) {
				await sendMemberWelcomeEmail(familyMembership, []);
			}

			console.log(`Welcome emails sent to ${1 + familyMemberships.length} members based on their member types`);
		} catch (emailError) {
			console.error("Error sending welcome emails:", emailError);
			// Don't fail the membership creation if email fails
		}

		return NextResponse.json(
			{
				mainMembership,
				familyMemberships,
				totalMembers: 1 + familyMemberships.length,
			},
			{ status: 201 },
		);
	} catch (error) {
		console.error("Membership creation error:", error);
		const errorMessage = error instanceof Error ? error.message : "Failed to create membership";
		return NextResponse.json({ error: errorMessage }, { status: 400 });
	}
}
