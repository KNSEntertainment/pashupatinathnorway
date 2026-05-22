import { NextRequest, NextResponse } from "next/server";
import { captchaStore } from "@/lib/captcha-store";

export async function POST(request: NextRequest) {
  try {
    const { token, answer } = await request.json();

    if (!token || !answer) {
      return NextResponse.json(
        { error: "Token and answer are required" },
        { status: 400 }
      );
    }

    const isValid = captchaStore.verifyCaptcha(token, answer);

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error("Captcha verification error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
