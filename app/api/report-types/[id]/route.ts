import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import User from "@/models/User.Model";
import ReportType from "@/models/ReportType.Model";
import Publication from "@/models/Publication.Model";

// Connect to MongoDB
connectDB();

// GET single report type
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const reportType = await ReportType.findById(id);
    
    if (!reportType) {
      return NextResponse.json(
        { error: "Report type not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({ reportType });
  } catch (error) {
    console.error("Error fetching report type:", error);
    return NextResponse.json(
      { error: "Failed to fetch report type" },
      { status: 500 }
    );
  }
}

// PUT - Update report type
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
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
    
    const reportType = await ReportType.findById(id);
    
    if (!reportType) {
      return NextResponse.json(
        { error: "Report type not found" },
        { status: 404 }
      );
    }
    
    const body = await request.json();
    const { 
      label, 
      color, 
      isActive
    } = body;
    
    // Auto-generate name from label if label is provided
    let generatedName = reportType.name;
    if (label) {
      generatedName = label.toLowerCase().trim().replace(/[^a-z0-9]/g, '_');
      // Check if new name already exists (excluding current record)
      if (generatedName !== reportType.name) {
        const existingType = await ReportType.findOne({ 
          name: generatedName, 
          _id: { $ne: id } 
        });
        if (existingType) {
          return NextResponse.json(
            { error: "Report type with this name already exists" },
            { status: 409 }
          );
        }
      }
    }
    
    // Update report type
    const updatedReportType = await ReportType.findByIdAndUpdate(
      id,
      {
        name: generatedName,
        label: label || reportType.label,
        description: "", // Keep empty description
        color: color || reportType.color,
        isActive: isActive !== undefined ? isActive : reportType.isActive,
        sortOrder: reportType.sortOrder // Keep existing sort order
      },
      { new: true }
    ).populate('createdBy', 'name email');
    
    return NextResponse.json({
      message: "Report type updated successfully",
      reportType: updatedReportType
    });
    
  } catch (error) {
    console.error("Error updating report type:", error);
    return NextResponse.json(
      { error: "Failed to update report type" },
      { status: 500 }
    );
  }
}

// DELETE - Delete report type
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
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
    
    const reportType = await ReportType.findById(id);
    
    if (!reportType) {
      return NextResponse.json(
        { error: "Report type not found" },
        { status: 404 }
      );
    }
    
    // Check if there are any publications using this report type
    const publicationsCount = await Publication.countDocuments({ type: reportType.name });
    
    if (publicationsCount > 0) {
      return NextResponse.json(
        { 
          error: "Cannot delete report type that is being used by publications",
          publicationsCount 
        },
        { status: 400 }
      );
    }
    
    await ReportType.findByIdAndDelete(id);
    
    return NextResponse.json({
      message: "Report type deleted successfully",
      reportType: reportType
    });
    
  } catch (error) {
    console.error("Error deleting report type:", error);
    return NextResponse.json(
      { error: "Failed to delete report type" },
      { status: 500 }
    );
  }
}
