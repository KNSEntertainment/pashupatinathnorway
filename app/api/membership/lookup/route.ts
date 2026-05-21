import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";

export async function POST(request: Request) {
  try {
    const { email, personalNumber } = await request.json();

    // Validate input
    if (!email || !personalNumber) {
      return NextResponse.json(
        { error: "Email and personal number are required" },
        { status: 400 }
      );
    }

    // Clean and validate email format
    const cleanEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Clean personal number
    const cleanPersonalNumber = personalNumber.trim();

    await connectDB();

    // Find membership by email and personal number
    const membership = await Membership.findOne({
      email: cleanEmail,
      personalNumber: cleanPersonalNumber,
    });

    if (!membership) {
      return NextResponse.json(
        { error: "No membership found with the provided email and personal number" },
        { status: 404 }
      );
    }

    // Return membership data (exclude sensitive fields if needed)
    const membershipData = {
      firstName: membership.firstName,
      middleName: membership.middleName,
      lastName: membership.lastName,
      email: membership.email,
      phone: membership.phone,
      address: membership.address,
      membershipId: membership.membershipId,
      membershipType: membership.membershipType,
      membershipStatus: membership.membershipStatus,
      createdAt: membership.createdAt,
      updatedAt: membership.updatedAt,
    };

    return NextResponse.json(
      { 
        success: true,
        membership: membershipData 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in membership lookup:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "Method not allowed" },
    { status: 405 }
  );
}
