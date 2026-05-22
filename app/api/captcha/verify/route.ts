import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(
	process.env.NEXTAUTH_SECRET || process.env.ENCRYPTION_KEY || "fallback-captcha-secret"
);

interface CaptchaPayload {
	answer: string;
	question: string;
	exp: number;
	iat: number;
	[key: string]: unknown;
}

export async function POST(request: NextRequest) {
  try {
    const { token, answer } = await request.json();

    if (!token || !answer) {
      return NextResponse.json(
        { error: "Token and answer are required" },
        { status: 400 }
      );
    }

    // Verify JWT token and extract captcha data
    const { payload } = await jwtVerify(token, JWT_SECRET);
    const captchaData = payload as CaptchaPayload;
    
    // Check if the answer matches
    const isValid = answer.trim() === captchaData.answer;

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error("Captcha verification error:", error);
    return NextResponse.json(
      { error: "Invalid or expired captcha" },
      { status: 400 }
    );
  }
}
