import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";

export async function POST(req: NextRequest) {
  await connectDB();

  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { error: "Verification token is required" },
        { status: 400 }
      );
    }

    // Find member with this verification token
    const member = await Membership.findOne({ 
      emailVerificationToken: token,
      emailVerificationTokenExpiry: { $gt: new Date() }
    });

    if (!member) {
      return NextResponse.json(
        { error: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Update member: set new email as primary, clear verification fields
    await Membership.findByIdAndUpdate(member._id, {
      email: member.pendingEmail, // Set new email as primary
      pendingEmail: undefined, // Clear pending email
      emailVerificationToken: undefined, // Clear verification token
      emailVerificationTokenExpiry: undefined, // Clear token expiry
    });

    return NextResponse.json(
      { 
        message: "Email verified successfully",
        email: member.pendingEmail
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      { error: "Failed to verify email" },
      { status: 500 }
    );
  }
}
