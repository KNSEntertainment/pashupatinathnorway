import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Membership from '@/models/Membership.Model';
import Event from '@/models/Event.Model';
import Attendance from '@/models/Attendance.Model';

export async function POST(request: NextRequest) {
  try {
    const { personalNumber, eventId, markedBy, notes, scannerName, scannerRole } = await request.json();

    if (!personalNumber || !eventId || !markedBy) {
      return NextResponse.json(
        { error: 'Personal number, event ID, and marked by are required' },
        { status: 400 }
      );
    }

    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Find member by personal number
    const member = await Membership.findOne({ personalNumber });
    
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
          checkInTime: existingAttendance.checkInTime
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
      memberPersonalNumber: personalNumber,
      memberName: `${member.firstName} ${member.middleName || ''} ${member.lastName}`.trim(),
      memberEmail: member.email,
      markedBy: markedBy,
      scannerName: scannerName,
      scannerRole: scannerRole,
      notes: notes || ''
    });

    await attendance.save();

    return NextResponse.json({
      success: true,
      message: 'Attendance marked successfully',
      attendance: {
        id: attendance._id,
        memberName: attendance.memberName,
        checkInTime: attendance.checkInTime,
        eventName: event.eventname
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('eventId');

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Get attendance records for the event
    const attendanceRecords = await Attendance.find({ eventId })
      .populate('memberId', 'firstName lastName email phone')
      .sort({ checkInTime: 1 });

    // Get event details
    const event = await Event.findById(eventId);

    return NextResponse.json({
      success: true,
      event: event,
      attendance: attendanceRecords,
      totalAttendees: attendanceRecords.length
    });

  } catch (error) {
    console.error('Get attendance error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
