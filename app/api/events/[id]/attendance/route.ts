import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import Event from '@/models/Event.Model';

export async function PUT(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const { enableAttendance, attendanceStatus, maxAttendees } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    // Find event
    const event = await Event.findById(id);
    
    if (!event) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    // Update attendance settings
    if (enableAttendance !== undefined) {
      event.enableAttendance = enableAttendance;
    }
    
    if (attendanceStatus) {
      if (!['not_started', 'active', 'closed'].includes(attendanceStatus)) {
        return NextResponse.json(
          { error: 'Invalid attendance status' },
          { status: 400 }
        );
      }
      event.attendanceStatus = attendanceStatus;
    }
    
    if (maxAttendees !== undefined) {
      event.maxAttendees = maxAttendees;
    }

    // Handle missing createdBy field for backward compatibility
    if (!event.createdBy) {
      event.createdBy = 'system'; // Default value for existing events
    }

    event.updatedAt = new Date();
    
    try {
      await event.save();
    } catch (validationError: unknown) {
      // Handle validation errors for missing required fields
      if (validationError instanceof Error && validationError.message.includes('createdBy')) {
        event.createdBy = 'system';
        await event.save();
      } else {
        throw validationError;
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Event attendance settings updated successfully',
      event: {
        id: event._id,
        name: event.eventname,
        enableAttendance: event.enableAttendance,
        attendanceStatus: event.attendanceStatus,
        maxAttendees: event.maxAttendees
      }
    });

  } catch (error) {
    console.error('Update event attendance error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error occurred'
      },
      { status: 500 }
    );
  }
}
