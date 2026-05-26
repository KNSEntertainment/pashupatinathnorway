import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/models/Event.Model";
import EventRegistration from "@/models/EventRegistration.Model";
import Membership from "@/models/Membership.Model";
import mongoose from "mongoose";

// Define interfaces for better type safety
interface PopulatedEventRegistration {
  _id: mongoose.Types.ObjectId;
  eventId: {
    _id: mongoose.Types.ObjectId;
    eventname: string;
    eventdate: Date;
    eventtime: string;
    eventvenue: string;
    eventdescription?: string;
    eventposterUrl?: string;
    memberPrice?: number;
    guestPrice?: number;
    maxAttendees?: number;
    registrationDeadline?: Date;
  };
  registrationType: string;
  registrationStatus: string;
  paymentStatus: string;
  attendeeCount: number;
  registrationId: string;
  createdAt: Date;
  membershipRef?: {
    firstName: string;
    lastName: string;
    email: string;
    membershipId: string;
  };
}

interface PopulatedEvent {
  _id: mongoose.Types.ObjectId;
  eventname: string;
  eventdate: Date;
  eventtime: string;
  eventvenue: string;
  eventdescription?: string;
  eventposterUrl?: string;
  memberPrice?: number;
  guestPrice?: number;
  maxAttendees?: number;
  registrationDeadline?: Date;
}

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email');
    
    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    // Check if user has an active membership
    const membership = await Membership.findOne({ 
      email: email,
      membershipStatus: "approved"
    });

    if (!membership) {
      return NextResponse.json({ 
        success: false, 
        error: "No active membership found. Please complete your membership registration first." 
      }, { status: 403 });
    }

    // Fetch all events sorted by date
    const allEvents = await Event.find({}).sort({ eventdate: 1 });

    // Fetch user's registrations
    const userRegistrations = await EventRegistration.find({
      $or: [
        { "membershipRef.email": email },
        { email: email }
      ]
    })
    .populate('eventId', 'eventname eventdate eventtime eventvenue eventdescription eventposterUrl memberPrice guestPrice maxAttendees registrationDeadline')
    .populate('membershipRef', 'firstName lastName email membershipId')
    .sort({ createdAt: -1 });

    // Categorize events
    const now = new Date();
    const activeEvents: PopulatedEventRegistration[] = [];
    const pastEvents: PopulatedEventRegistration[] = [];
    const upcomingEvents: PopulatedEvent[] = [];

    // Create a set of registered event IDs for quick lookup
    const registeredEventIds = new Set(
      userRegistrations
        .filter(reg => reg.eventId && reg.registrationStatus === "registered")
        .map(reg => reg.eventId._id.toString())
    );

    // Process registered events
    const registrations = userRegistrations as PopulatedEventRegistration[];
    registrations.forEach(registration => {
      if (registration.eventId && registration.eventId.eventdate) {
        const eventDate = new Date(registration.eventId.eventdate);
        if (eventDate >= now && registration.registrationStatus === "registered") {
          activeEvents.push(registration);
        } else if (eventDate < now) {
          pastEvents.push(registration);
        }
      }
    });

    // Process upcoming events (not registered yet)
    const events = allEvents as unknown as PopulatedEvent[];
    events.forEach(event => {
      const eventDate = new Date(event.eventdate);
      if (eventDate >= now && !registeredEventIds.has(event._id.toString())) {
        upcomingEvents.push(event);
      }
    });

    // Sort events by date
    activeEvents.sort((a, b) => new Date(a.eventId.eventdate).getTime() - new Date(b.eventId.eventdate).getTime());
    pastEvents.sort((a, b) => new Date(b.eventId.eventdate).getTime() - new Date(a.eventId.eventdate).getTime());
    upcomingEvents.sort((a, b) => new Date(a.eventdate).getTime() - new Date(b.eventdate).getTime());

    return NextResponse.json({
      success: true,
      data: {
        activeEvents,
        pastEvents,
        upcomingEvents
      }
    });

  } catch (error) {
    console.error("Error fetching member events:", error);
    return NextResponse.json({ 
      success: false, 
      error: "Failed to fetch member events" 
    }, { status: 500 });
  }
}
