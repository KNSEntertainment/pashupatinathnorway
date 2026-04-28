import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import Volunteer from "@/models/Volunteer.Model";

export async function POST(request: NextRequest) {
  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const body = await request.json();
    const { name, email, phone, interests } = body;

    // Validate required fields
    if (!name || !email || !interests || interests.length === 0) {
      return NextResponse.json(
        { error: "Missing required fields: name, email, and at least one interest" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Check if volunteer with this email already exists
    const existingVolunteer = await Volunteer.findOne({ email });
    if (existingVolunteer) {
      return NextResponse.json(
        { error: "A volunteer with this email has already applied" },
        { status: 409 }
      );
    }

    // Create new volunteer
    const volunteer = new Volunteer({
      name,
      email,
      phone: phone || "",
      interests,
    });

    await volunteer.save();

    return NextResponse.json(
      { 
        message: "Volunteer application submitted successfully",
        volunteer: {
          id: volunteer._id,
          name: volunteer.name,
          email: volunteer.email,
          interests: volunteer.interests,
          status: volunteer.status,
          submittedAt: volunteer.submittedAt,
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error("Error submitting volunteer application:", error);
    return NextResponse.json(
      { error: "Failed to submit volunteer application" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    // Connect to database
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGODB_URI!);
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    // Build query
    const query: { status?: string } = {};
    if (status) {
      query.status = status;
    }

    // Get volunteers with pagination
    const skip = (page - 1) * limit;
    const volunteers = await Volunteer.find(query)
      .sort({ submittedAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Volunteer.countDocuments(query);

    return NextResponse.json({
      volunteers,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });

  } catch (error) {
    console.error("Error fetching volunteers:", error);
    return NextResponse.json(
      { error: "Failed to fetch volunteers" },
      { status: 500 }
    );
  }
}
