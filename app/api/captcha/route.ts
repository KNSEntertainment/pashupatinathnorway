import { NextResponse } from "next/server";
import crypto from "crypto";
import { captchaStore } from "@/lib/captcha-store";

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
	const token = captchaStore.generateToken();
	
	// Store the captcha data server-side
	captchaStore.storeCaptcha(token, question, String(answer));

	return NextResponse.json({
		question: `${question} = ?`,
		token,
	});
}
