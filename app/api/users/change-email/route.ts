import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { sendEmailVerificationEmail } from "@/lib/email";
import { requireAuthenticatedMember } from "@/lib/apiAuth";

export async function POST(req: NextRequest) {
  const auth = await requireAuthenticatedMember();
  if (auth.response) return auth.response;

  await connectDB();

  try {
    const { currentEmail, newEmail, password } = await req.json();

    if (!currentEmail || !newEmail || !password) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    if (auth.session?.user?.email?.toLowerCase() !== currentEmail.toLowerCase()) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 403 }
      );
    }

    // Find member by current email
    const member = await Membership.findOne({ email: currentEmail });
    if (!member) {
      return NextResponse.json(
        { error: "Member not found" },
        { status: 404 }
      );
    }

    const isPasswordValid = await bcrypt.compare(password, member.password || "");
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: "Current password is incorrect" },
        { status: 400 }
      );
    }

    // Check if new email already exists
    const existingMember = await Membership.findOne({ email: newEmail });
    if (existingMember) {
      return NextResponse.json(
        { error: "Email address already in use" },
        { status: 409 }
      );
    }

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString("hex");
    const verificationTokenExpiry = new Date(Date.now() + 1000 * 60 * 60); // 1 hour

    // Store email change request
    await Membership.findByIdAndUpdate(member._id, {
      pendingEmail: newEmail,
      emailVerificationToken: verificationToken,
      emailVerificationTokenExpiry: verificationTokenExpiry,
    });

    // Send verification email to new email address
    const fullName = [member.firstName, member.middleName, member.lastName]
      .filter(Boolean)
      .join(" ");
    
    console.log("=== SENDING EMAIL VERIFICATION ===");
    console.log("To:", newEmail);
    console.log("Name:", fullName);
    console.log("EMAIL_USER configured:", !!process.env.EMAIL_USER);
    console.log("RESEND_API_KEY configured:", !!process.env.RESEND_API_KEY);
    
    try {
      await sendEmailVerificationEmail({
        name: fullName,
        email: newEmail,
        verificationToken: verificationToken,
      });
      console.log("Email verification email sent successfully");
    } catch (emailError) {
      console.error("Failed to send email verification email:", emailError);
      const errorMessage = emailError instanceof Error ? emailError.message : "Unknown error";
      throw new Error("Failed to send verification email: " + errorMessage);
    }

    return NextResponse.json(
      { 
        message: "Verification email sent to new email address",
        requiresVerification: true
      },
      { status: 200 }
    );

  } catch (error) {
    console.error("Email change error:", error);
    return NextResponse.json(
      { error: "Failed to change email" },
      { status: 500 }
    );
  }
}
