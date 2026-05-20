import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/mongodb";
import Attendance from "@/models/Attendance.Model";
import AuditLog from "@/models/AuditLog.Model";

// DELETE - Clear all attendance records for an event
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }

    await connectDB();

    // Check if event has attendance records
    const attendanceCount = await Attendance.countDocuments({ eventId: id });
    
    if (attendanceCount === 0) {
      return NextResponse.json(
        { error: "No attendance records found for this event" },
        { status: 404 }
      );
    }

    // Get event details for audit log
    const attendanceRecords = await Attendance.find({ eventId: id }).limit(1);
    const eventName = attendanceRecords.length > 0 ? attendanceRecords[0].eventName : 'Unknown Event';

    // Delete all attendance records for the event
    const deleteResult = await Attendance.deleteMany({ eventId: id });

    // Create audit log
    try {
      await AuditLog.create({
        action: 'DELETE',
        targetId: id,
        targetType: 'attendance_records',
        performedBy: session.user.id,
        performedByEmail: session.user.email,
        details: `Cleared all attendance records for event: ${eventName}. Deleted ${deleteResult.deletedCount} records.`,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      });
    } catch (auditError) {
      console.error('Failed to create audit log:', auditError);
      // Continue even if audit log fails
    }

    const responseData = {
      message: "Successfully cleared all attendance records",
      deletedCount: deleteResult.deletedCount,
      eventName
    };
    
    return NextResponse.json(responseData);

  } catch (error) {
    console.error("Error clearing attendance records:", error);
    return NextResponse.json(
      { error: "Failed to clear attendance records" },
      { status: 500 }
    );
  }
}
