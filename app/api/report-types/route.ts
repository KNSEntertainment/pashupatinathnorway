import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import User from "@/models/User.Model";
import ReportType from "@/models/ReportType.Model";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

// GET all report types
export async function GET() {
  try {
    await connectDB();
    
    // Fetch report types from database
    const reportTypes = await ReportType.find({ isActive: true })
      .populate('createdBy', 'name email')
      .sort({ sortOrder: 1, name: 1 })
      .lean();
    
    // Transform the data to match the expected format
    const formattedReportTypes = reportTypes.map((type) => ({
      id: (type._id as mongoose.Types.ObjectId).toString(),
      name: type.name,
      label: type.label,
      description: type.description,
      color: type.color,
      isActive: type.isActive,
      sortOrder: type.sortOrder,
      createdAt: type.createdAt,
      updatedAt: type.updatedAt
    }));
    
    return NextResponse.json({ reportTypes: formattedReportTypes });
  } catch (error) {
    console.error("Error fetching report types:", error);
    return NextResponse.json(
      { error: "Failed to fetch report types" },
      { status: 500 }
    );
  }
}

// POST - Create new report type
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session || !session.user?.role || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: "Unauthorized - Admin access required" },
        { status: 401 }
      );
    }
    
    // Find user by email to get their actual ObjectId
    const user = await User.findOne({ email: session.user.email });
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const { 
      name, 
      label, 
      description, 
      color,
      sortOrder 
    } = body;
    
    // Validate required fields
    if (!name || !label) {
      return NextResponse.json(
        { error: "Missing required fields: name, label" },
        { status: 400 }
      );
    }
    
    // Check if report type with same name already exists
    const existingType = await ReportType.findOne({ name: name.toLowerCase().trim() });
    if (existingType) {
      return NextResponse.json(
        { error: "Report type with this name already exists" },
        { status: 409 }
      );
    }
    
    // Create new report type
    const newReportType = new ReportType({
      name: name.toLowerCase().trim(),
      label: label.trim(),
      description: description?.trim() || "",
      color: color || "gray",
      sortOrder: sortOrder || 0,
      createdBy: user._id
    });
    
    await newReportType.save();
    
    // Populate createdBy field for response
    await newReportType.populate('createdBy', 'name email');
    
    // Format response to match expected format
    const formattedReportType = {
      id: newReportType._id.toString(),
      name: newReportType.name,
      label: newReportType.label,
      description: newReportType.description,
      color: newReportType.color,
      isActive: newReportType.isActive,
      sortOrder: newReportType.sortOrder,
      createdAt: newReportType.createdAt,
      updatedAt: newReportType.updatedAt
    };
    
    return NextResponse.json({
      message: "Report type created successfully",
      reportType: formattedReportType
    }, { status: 201 });
    
  } catch (error) {
    console.error("Error creating report type:", error);
    return NextResponse.json(
      { error: "Failed to create report type" },
      { status: 500 }
    );
  }
}
