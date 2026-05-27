import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import VerificationCode from "@/models/VerificationCode.Model";
import { sendMembershipLookupVerificationEmail } from "@/lib/email";

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

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

    // Check if membership exists
    const membership = await Membership.findOne({
      email: cleanEmail,
      personalNumber: cleanPersonalNumber,
    });

    if (!membership) {
      return NextResponse.json(
        { error: "Please double check your email and/or personal number." },
        { status: 404 }
      );
    }

    // Clean up any existing verification codes for this email/personal number
    await VerificationCode.deleteMany({
      email: cleanEmail,
      personalNumber: cleanPersonalNumber,
      purpose: 'membership-lookup'
    });

    // Generate new verification code
    const verificationCode = generateVerificationCode();
    const expiresAt = new Date(Date.now() + 2 * 60 * 1000); // 2 minutes from now

    // Save verification code to database
    const newVerificationCode = new VerificationCode({
      email: cleanEmail,
      personalNumber: cleanPersonalNumber,
      code: verificationCode,
      purpose: 'membership-lookup',
      expiresAt
    });

    await newVerificationCode.save();

    // Send verification email
    try {
      await sendMembershipLookupVerificationEmail({
        name: membership.firstName,
        email: cleanEmail,
        verificationCode
      });
    } catch (emailError) {
      console.error("Failed to send verification email:", emailError);
      // Delete the verification code if email fails
      await VerificationCode.deleteOne({ _id: newVerificationCode._id });
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { 
        success: true,
        message: "Verification code sent to your email. Please check your inbox."
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Error in send verification code:", error);
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
