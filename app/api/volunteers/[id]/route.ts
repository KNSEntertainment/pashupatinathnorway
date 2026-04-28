import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Volunteer from "@/models/Volunteer.Model";

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { id } = await params;
    const body = await request.json();
    const { status, notes } = body;

    // Validate status if provided
    if (status && !["pending", "contacted", "active", "inactive"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Must be one of: pending, contacted, active, inactive" },
        { status: 400 }
      );
    }

    // Find and update volunteer
    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return NextResponse.json(
        { error: "Volunteer not found" },
        { status: 404 }
      );
    }

    // Update fields
    if (status) volunteer.status = status;
    if (notes !== undefined) volunteer.notes = notes;

    await volunteer.save();

    return NextResponse.json({
      message: "Volunteer updated successfully",
      volunteer: {
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        status: volunteer.status,
        notes: volunteer.notes,
        updatedAt: volunteer.updatedAt,
      },
    });

  } catch (error) {
    console.error("Error updating volunteer:", error);
    return NextResponse.json(
      { error: "Failed to update volunteer" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { id } = await params;

    // Find and delete volunteer
    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return NextResponse.json(
        { error: "Volunteer not found" },
        { status: 404 }
      );
    }

    await Volunteer.findByIdAndDelete(id);

    return NextResponse.json({
      message: "Volunteer deleted successfully",
    });

  } catch (error) {
    console.error("Error deleting volunteer:", error);
    return NextResponse.json(
      { error: "Failed to delete volunteer" },
      { status: 500 }
    );
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { id } = await params;

    // Find volunteer
    const volunteer = await Volunteer.findById(id);
    if (!volunteer) {
      return NextResponse.json(
        { error: "Volunteer not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      volunteer: {
        id: volunteer._id,
        name: volunteer.name,
        email: volunteer.email,
        phone: volunteer.phone,
        interests: volunteer.interests,
        status: volunteer.status,
        notes: volunteer.notes,
        submittedAt: volunteer.submittedAt,
        updatedAt: volunteer.updatedAt,
      },
    });

  } catch (error) {
    console.error("Error fetching volunteer:", error);
    return NextResponse.json(
      { error: "Failed to fetch volunteer" },
      { status: 500 }
    );
  }
}
