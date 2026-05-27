import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import VerificationCode from "@/models/VerificationCode.Model";

export async function POST(request: Request) {
  try {
    const { email, personalNumber, code } = await request.json();

    // Validate input
    if (!email || !personalNumber || !code) {
      return NextResponse.json(
        { error: "Email, personal number, and verification code are required" },
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

    // Clean personal number and code
    const cleanPersonalNumber = personalNumber.trim();
    const cleanCode = code.trim();

    if (cleanCode.length !== 6) {
      return NextResponse.json(
        { error: "Verification code must be 6 digits" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the verification code
    const verificationCode = await VerificationCode.findOne({
      email: cleanEmail,
      personalNumber: cleanPersonalNumber,
      code: cleanCode,
      purpose: 'membership-lookup',
      isUsed: false
    });

    if (!verificationCode) {
      return NextResponse.json(
        { error: "Invalid verification code" },
        { status: 400 }
      );
    }

    // Check if code is expired
    if (Date.now() > verificationCode.expiresAt.getTime()) {
      return NextResponse.json(
        { error: "Verification code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check if attempts exceeded
    if (verificationCode.attempts >= 5) {
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new verification code." },
        { status: 400 }
      );
    }

    // Increment attempts
    verificationCode.attempts += 1;
    await verificationCode.save();

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

    // Mark verification code as used
    verificationCode.isUsed = true;
    await verificationCode.save();

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
    console.error("Error in verify code:", error);
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
