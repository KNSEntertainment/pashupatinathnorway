import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import EventRegistration from "@/models/EventRegistration.Model";
import Event from "@/models/Event.Model";
import Membership from "@/models/Membership.Model";
import Donation from "@/models/Donation.Model";
import Income from "@/models/Income.Model";
import mongoose from "mongoose";

export async function GET(request: Request) {
	try {
		await connectDB();
		const { searchParams } = new URL(request.url);
		const eventId = searchParams.get('eventId');
		const registrationType = searchParams.get('registrationType');
		
		const query: Record<string, unknown> = {};
		
		if (eventId) {
			query.eventId = new mongoose.Types.ObjectId(eventId);
		}
		
		if (registrationType) {
			query.registrationType = registrationType;
		}
		
		const registrations = await EventRegistration.find(query)
			.populate('eventId', 'eventname eventdate memberPrice guestPrice')
			.populate('membershipRef', 'firstName lastName email membershipId')
			.sort({ createdAt: -1 });
			
		return NextResponse.json(registrations, { status: 200 });
	} catch (error) {
		console.error("Error fetching registrations:", error);
		return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		await connectDB();
		const body = await request.json();
		
		const {
			eventId,
			registrationType,
			userId,
			membershipId,
			attendeeCount = 1,
			selectedFamilyMembers = [],
			name,
			email,
			phone,
			address,
			donationAmount = 0,
		} = body;
		
		if (!eventId || !registrationType || !email) {
			return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
		}
		
		// Convert event ID to ObjectId
		const eventObjectId = new mongoose.Types.ObjectId(eventId);
		
		// Check if event exists and get pricing
		const event = await Event.findById(eventObjectId);
		if (!event) {
			return NextResponse.json({ error: "Event not found" }, { status: 404 });
		}
		
		// Check registration deadline
		if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
			return NextResponse.json({ error: "Registration deadline has passed" }, { status: 400 });
		}
		
		// Check max attendees limit
		if (event.maxAttendees) {
			const currentRegistrations = await EventRegistration.countDocuments({
				eventId: eventObjectId,
				registrationStatus: "registered"
			});
			
			console.log(`Event capacity check: ${currentRegistrations} + ${attendeeCount} > ${event.maxAttendees}`);
			
			if (currentRegistrations + attendeeCount > event.maxAttendees) {
				return NextResponse.json({ 
					error: `Event is full. Current: ${currentRegistrations}, Requested: ${attendeeCount}, Max: ${event.maxAttendees}` 
				}, { status: 400 });
			}
		}
		
		// Check for duplicate registrations
		if (registrationType === "member" && membershipId) {
			// For members, check by membershipId
			const existingMemberRegistration = await EventRegistration.findOne({
				eventId: eventObjectId,
				membershipId: membershipId,
				registrationStatus: "registered"
			});
			if (existingMemberRegistration) {
				return NextResponse.json({ error: "You have already registered for this event" }, { status: 400 });
			}
		} else {
			// For guests, check by email
			const existingGuestRegistration = await EventRegistration.findOne({
				eventId: eventObjectId,
				email: email,
				registrationStatus: "registered"
			});
			if (existingGuestRegistration) {
				return NextResponse.json({ error: "You have already registered for this event" }, { status: 400 });
			}
		}
		
		// Calculate pricing
		let basePrice = 0;
		if (registrationType === "member") {
			basePrice = event.memberPrice || 0;
		} else {
			basePrice = event.guestPrice || 0;
		}
		
		const paymentAmount = basePrice * attendeeCount;
		const totalPayment = paymentAmount + donationAmount;
		
		// Validate membership for member registrations
		let membershipRef = null;
		if (registrationType === "member") {
			if (!membershipId) {
				return NextResponse.json({ error: "Membership ID is required for member registration" }, { status: 400 });
			}
			
			const membership = await Membership.findOne({ membershipId });
			if (!membership) {
				return NextResponse.json({ error: "Membership not found" }, { status: 404 });
			}
			
			if (membership.membershipStatus !== "approved") {
				return NextResponse.json({ error: "Membership is not active" }, { status: 400 });
			}
			
			membershipRef = membership._id;
		}
		
		// Create registration
		const registrationData: Record<string, unknown> = {
			eventId: eventObjectId,
			registrationType,
			userId: userId ? new mongoose.Types.ObjectId(userId) : null,
			membershipRef,
			attendeeCount,
			selectedFamilyMembers,
			name,
			email,
			phone,
			address,
			donationAmount,
			paymentAmount,
			paymentStatus: totalPayment > 0 ? "pending" : "free",
			// Add unique registration ID to avoid MongoDB duplicate key conflicts
			registrationId: `REG_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
		};
		
		// Only set membershipId for members, not for guests
		if (registrationType === "member" && membershipId) {
			registrationData.membershipId = membershipId;
		} else {
			// For guests, add a unique identifier to avoid MongoDB duplicate key conflicts
			registrationData.membershipId = `GUEST_${Date.now()}_${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
		}
		
		const registration = await EventRegistration.create(registrationData);
		
		// Create donation and income records if donation amount > 0
		if (donationAmount > 0) {
			// Create donation record
			const donationData = {
				donorName: name,
				donorEmail: email,
				amount: donationAmount,
				donationPurpose: "event",
				eventId: eventObjectId,
				linkedRegistrationId: registration._id,
				paymentStatus: "pending",
			};
			
			const donation = await Donation.create(donationData);
			
			// Create income record
			const incomeData = {
				eventId: eventObjectId,
				title: `Event Donation - ${event.eventname}`,
				amount: donationAmount,
				sourceType: "donation",
				description: `Donation from ${name} for event registration`,
				referenceId: donation._id.toString(),
			};
			
			await Income.create(incomeData);
		}
		
		// Create income record for registration fee if paymentAmount > 0
		if (paymentAmount > 0) {
			const incomeData = {
				eventId: eventObjectId,
				title: `Event Registration - ${event.eventname}`,
				amount: paymentAmount,
				sourceType: "registration",
				description: `Registration fee from ${name} (${registrationType})`,
				referenceId: registration._id.toString(),
			};
			
			await Income.create(incomeData);
		}
		
		const populatedRegistration = await EventRegistration.findById(registration._id)
			.populate('eventId', 'eventname eventdate memberPrice guestPrice')
			.populate('membershipRef', 'firstName lastName email membershipId');
		
		return NextResponse.json(populatedRegistration, { status: 201 });
	} catch (error) {
		console.error("Error creating registration:", error);
		return NextResponse.json({ error: "Failed to create registration" }, { status: 500 });
	}
}

export async function PUT(request: Request) {
	try {
		await connectDB();
		const body = await request.json();
		const { id, ...updateData } = body;
		
		if (!id) {
			return NextResponse.json({ error: "Registration ID is required" }, { status: 400 });
		}
		
		// Convert eventId to ObjectId if present
		if (updateData.eventId && typeof updateData.eventId === 'string') {
			updateData.eventId = new mongoose.Types.ObjectId(updateData.eventId);
		}
		
		// Convert userId to ObjectId if present
		if (updateData.userId && typeof updateData.userId === 'string') {
			updateData.userId = new mongoose.Types.ObjectId(updateData.userId);
		}
		
		const registration = await EventRegistration.findByIdAndUpdate(
			id,
			updateData,
			{ new: true, runValidators: true }
		).populate('eventId', 'eventname eventdate memberPrice guestPrice')
		 .populate('membershipRef', 'firstName lastName email membershipId');
		
		if (!registration) {
			return NextResponse.json({ error: "Registration not found" }, { status: 404 });
		}
		
		return NextResponse.json(registration, { status: 200 });
	} catch (error) {
		console.error("Error updating registration:", error);
		return NextResponse.json({ error: "Failed to update registration" }, { status: 500 });
	}
}

export async function DELETE(request: Request) {
	try {
		await connectDB();
		const { searchParams } = new URL(request.url);
		const id = searchParams.get('id');
		
		if (!id) {
			return NextResponse.json({ error: "Registration ID is required" }, { status: 400 });
		}
		
		const registration = await EventRegistration.findByIdAndDelete(id);
		
		if (!registration) {
			return NextResponse.json({ error: "Registration not found" }, { status: 404 });
		}
		
		return NextResponse.json({ message: "Registration deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error deleting registration:", error);
		return NextResponse.json({ error: "Failed to delete registration" }, { status: 500 });
	}
}
