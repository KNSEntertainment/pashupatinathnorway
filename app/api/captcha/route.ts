import { NextResponse } from "next/server";
import crypto from "crypto";
import { SignJWT } from "jose";

const JWT_SECRET = new TextEncoder().encode(
	process.env.NEXTAUTH_SECRET || process.env.ENCRYPTION_KEY || "fallback-captcha-secret"
);

interface CaptchaPayload {
	answer: string;
	question: string;
	exp: number;
	iat: number;
	[key: string]: unknown; // Make it compatible with JWTPayload
}

export async function GET() {
	const operation = ["+", "-", "*"][crypto.randomInt(3)];
	let num1 = crypto.randomInt(1, 11);
	let num2 = crypto.randomInt(1, 11);
	let answer = 0;

	if (operation === "+") {
		answer = num1 + num2;
	} else if (operation === "-") {
		if (num1 < num2) [num1, num2] = [num2, num1];
		answer = num1 - num2;
	} else {
		num1 = crypto.randomInt(1, 6);
		num2 = crypto.randomInt(1, 6);
		answer = num1 * num2;
	}

	const question = `${num1} ${operation === "*" ? "x" : operation} ${num2}`;
	
	// Create JWT token with captcha data (valid for 5 minutes)
	const now = Math.floor(Date.now() / 1000);
	const payload: CaptchaPayload = {
		answer: String(answer),
		question,
		iat: now,
		exp: now + 300, // 5 minutes
	};

	const token = await new SignJWT(payload)
		.setProtectedHeader({ alg: 'HS256' })
		.setIssuedAt(now)
		.setExpirationTime('5m')
		.sign(JWT_SECRET);

	return NextResponse.json({
		question: `${question} = ?`,
		token,
	});
}
