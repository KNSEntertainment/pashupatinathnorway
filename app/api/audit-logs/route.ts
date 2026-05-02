import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/mongodb";
import AuditLog from "@/models/AuditLog.Model";

export async function GET(request: Request) {
  try {
    await connectDB();

    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    // Parse query parameters for filtering and pagination
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const action = searchParams.get('action');
    const status = searchParams.get('status');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    // Build filter query
    const filter: any = {};
    
    if (action) {
      filter.action = action;
    }
    
    if (status) {
      filter.status = status;
    }
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) {
        filter.timestamp.$gte = new Date(startDate);
      }
      if (endDate) {
        filter.timestamp.$lte = new Date(endDate);
      }
    }

    // Calculate skip for pagination
    const skip = (page - 1) * limit;

    // Fetch audit logs with pagination
    const [auditLogs, totalCount] = await Promise.all([
      AuditLog.find(filter)
        .sort({ timestamp: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      AuditLog.countDocuments(filter)
    ]);

    // Format the response
    const formattedLogs = auditLogs.map(log => ({
      id: log._id,
      action: log.action,
      user: log.user,
      details: log.details,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      timestamp: log.timestamp,
      status: log.status,
      errorMessage: log.errorMessage,
      createdAt: log.createdAt,
      updatedAt: log.updatedAt
    }));

    return NextResponse.json({
      success: true,
      data: formattedLogs,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error("Error fetching audit logs:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to fetch audit logs",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();

    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { action, details } = await request.json();

    if (!action) {
      return NextResponse.json(
        { success: false, error: "Action is required" },
        { status: 400 }
      );
    }

    // Get client information
    const userAgent = request.headers.get('user-agent') || 'Unknown';
    const ipAddress = request.headers.get('x-forwarded-for') || 
                     request.headers.get('x-real-ip') || 
                     'Unknown';

    // Create audit log entry
    const auditLog = new AuditLog({
      action,
      user: {
        id: session.user.id,
        name: session.user.fullName || session.user.name,
        email: session.user.email,
        role: session.user.role
      },
      details: details || {},
      ipAddress,
      userAgent,
      status: 'initiated'
    });

    await auditLog.save();

    return NextResponse.json({
      success: true,
      data: auditLog
    });

  } catch (error) {
    console.error("Error creating audit log:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to create audit log",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();

    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: "Unauthorized. Admin access required." },
        { status: 401 }
      );
    }

    const { action, status, errorMessage, details } = await request.json();

    if (!action || !status) {
      return NextResponse.json(
        { success: false, error: "Action and status are required" },
        { status: 400 }
      );
    }

    // Find the most recent audit log for this action by this user
    const auditLog = await AuditLog.findOne({
      action,
      'user.id': session.user.id
    }).sort({ timestamp: -1 });

    if (!auditLog) {
      return NextResponse.json(
        { success: false, error: "No audit log found for this action" },
        { status: 404 }
      );
    }

    // Update the audit log
    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (errorMessage) {
      updateData.errorMessage = errorMessage;
    }

    if (details) {
      updateData.details = { ...auditLog.details, ...details };
    }

    await AuditLog.findByIdAndUpdate(auditLog._id, updateData);

    return NextResponse.json({
      success: true,
      message: "Audit log updated successfully"
    });

  } catch (error) {
    console.error("Error updating audit log:", error);
    return NextResponse.json(
      { 
        success: false, 
        error: "Failed to update audit log",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}
