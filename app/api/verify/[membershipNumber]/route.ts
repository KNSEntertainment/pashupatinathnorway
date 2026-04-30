import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Membership from '@/models/Membership.Model';
import Event from '@/models/Event.Model';
import Attendance from '@/models/Attendance.Model';

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ membershipNumber: string }> }
) {
  try {
    const { membershipNumber } = await context.params;

    if (!membershipNumber) {
      return NextResponse.json(
        { error: 'Personal number is required' },
        { status: 400 }
      );
    }

    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Find member by personal number
    let member = null;
    
    try {
      // Search by personal number directly
      member = await Membership.findOne({ personalNumber: membershipNumber });
      
      console.log(`Searching for personal number: ${membershipNumber}`);
      console.log(`Member found: ${member ? 'Yes' : 'No'}`);
      
      if (member) {
        console.log(`Member details:`, {
          _id: member._id,
          personalNumber: member.personalNumber,
          name: `${member.firstName} ${member.lastName}`,
          email: member.email
        });
      }
      
    } catch (dbError) {
      console.error("Database query failed:", dbError);
      throw dbError;
    }

    if (!member) {
      return NextResponse.json(
        { 
          valid: false,
          error: 'Member not found',
          timestamp: new Date().toISOString()
        },
        { status: 404 }
      );
    }

    // Check if membership is active
    const isActive = member.membershipStatus === 'approved';
    
    // Calculate expiry date (1 year from creation)
    const issuedDate = new Date(member.createdAt);
    const expiryDate = new Date(issuedDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);
    const isExpired = new Date() > expiryDate;

    // Generate verification response
    const verificationData = {
      valid: isActive && !isExpired,
      member: {
        memberId: member._id,
        membershipNumber: member._id.toString().slice(-6).toUpperCase(),
        personalNumber: member.personalNumber,
        fullName: `${member.firstName} ${member.middleName || ''} ${member.lastName}`.trim(),
        email: member.email,
        phone: member.phone,
        city: member.city,
        membershipStatus: member.membershipStatus,
        issuedDate: issuedDate.toISOString().split('T')[0],
        expiryDate: expiryDate.toISOString().split('T')[0],
        photoUrl: member.profilePhoto || null
      },
      organization: {
        name: "Pashupatinath Norway Temple",
        location: "Oslo, Norway",
        contact: "nepalihindusamfunn@gmail.com"
      },
      timestamp: new Date().toISOString(),
      checks: {
        isActive,
        isExpired,
        status: member.membershipStatus
      }
    };

    return NextResponse.json(verificationData);

  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { 
        valid: false,
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ membershipNumber: string }> }
) {
  try {
    const { membershipNumber } = await context.params;
    const { eventId, markedBy, notes } = await request.json();

    if (!membershipNumber) {
      return NextResponse.json(
        { error: 'Personal number is required' },
        { status: 400 }
      );
    }

    if (!eventId || !markedBy) {
      return NextResponse.json(
        { error: 'Event ID and marked by are required for attendance' },
        { status: 400 }
      );
    }

    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Find member by personal number
    const member = await Membership.findOne({ personalNumber: membershipNumber });
    
    if (!member) {
      return NextResponse.json(
        { error: 'Member not found' },
        { status: 404 }
      );
    }

    // Check if membership is active
    const isActive = member.membershipStatus === 'approved';
    
    if (!isActive) {
      return NextResponse.json(
        { error: 'Membership is not active' },
        { status: 403 }
      );
    }

    // Find event
    const event = await Event.findById(eventId);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Check if attendance is enabled for this event
    if (!event.enableAttendance) {
      return NextResponse.json(
        { error: 'Attendance tracking is not enabled for this event' },
        { status: 400 }
      );
    }

    // Check if attendance is active
    if (event.attendanceStatus !== 'active') {
      return NextResponse.json(
        { error: 'Attendance is not currently active for this event' },
        { status: 400 }
      );
    }

    // Check if member already marked attendance
    const existingAttendance = await Attendance.findOne({
      eventId: eventId,
      memberId: member._id
    });

    if (existingAttendance) {
      return NextResponse.json(
        { 
          error: 'Attendance already marked',
          alreadyMarked: true,
          checkInTime: existingAttendance.checkInTime,
          member: {
            fullName: member.fullName || `${member.firstName} ${member.lastName}`,
            email: member.email,
            personalNumber: member.personalNumber
          }
        },
        { status: 409 }
      );
    }

    // Check max attendees limit
    if (event.maxAttendees) {
      const currentAttendanceCount = await Attendance.countDocuments({ eventId });
      if (currentAttendanceCount >= event.maxAttendees) {
        return NextResponse.json(
          { error: 'Event has reached maximum capacity' },
          { status: 400 }
        );
      }
    }

    // Create attendance record
    const attendance = new Attendance({
      eventId: eventId,
      memberId: member._id,
      memberPersonalNumber: membershipNumber,
      memberName: `${member.firstName} ${member.middleName || ''} ${member.lastName}`.trim(),
      memberEmail: member.email,
      markedBy: markedBy,
      notes: notes || ''
    });

    await attendance.save();

    // Return member verification data along with attendance confirmation
    const issuedDate = new Date(member.createdAt);
    const expiryDate = new Date(issuedDate);
    expiryDate.setFullYear(expiryDate.getFullYear() + 1);

    return NextResponse.json({
      success: true,
      message: 'Attendance marked successfully',
      attendance: {
        id: attendance._id,
        memberName: attendance.memberName,
        checkInTime: attendance.checkInTime,
        eventName: event.eventname
      },
      member: {
        memberId: member._id,
        membershipNumber: member._id.toString().slice(-6).toUpperCase(),
        personalNumber: member.personalNumber,
        fullName: `${member.firstName} ${member.middleName || ''} ${member.lastName}`.trim(),
        email: member.email,
        phone: member.phone,
        city: member.city,
        membershipStatus: member.membershipStatus,
        issuedDate: issuedDate.toISOString().split('T')[0],
        expiryDate: expiryDate.toISOString().split('T')[0],
        photoUrl: member.profilePhoto || null
      },
      event: {
        id: event._id,
        name: event.eventname,
        date: event.eventdate,
        venue: event.eventvenue
      }
    });

  } catch (error) {
    console.error('Attendance marking error:', error);
    
    // Handle duplicate key error (already marked attendance)
    if (error instanceof Error && error.message.includes('duplicate key')) {
      return NextResponse.json(
        { error: 'Attendance already marked for this member' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
