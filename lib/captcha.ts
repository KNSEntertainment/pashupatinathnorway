import crypto from "crypto";

type CaptchaPayload = {
	answer: string;
	expiresAt: number;
	nonce: string;
};


function base64url(input: string | Buffer) {
	return Buffer.from(input)
		.toString("base64")
		.replace(/\+/g, "-")
		.replace(/\//g, "_")
		.replace(/=/g, "");
}

function base64urlDecode(input: string) {
	// Add padding back
	const padded = input + '='.repeat((4 - input.length % 4) % 4);
	return Buffer.from(padded.replace(/-/g, '+').replace(/_/g, '/'), 'base64');
}

// Removed signature function for simpler client-side verification

export function createCaptchaToken(answer: number) {
	const payload: CaptchaPayload = {
		answer: String(answer),
		expiresAt: Date.now() + 5 * 60 * 1000, // Reduced to 5 minutes
		nonce: crypto.randomBytes(16).toString("hex"),
	};
	const encodedPayload = base64url(JSON.stringify(payload));
	
	// Add simple obfuscation - not secure but better than plain text
	const obfuscated = Buffer.from(encodedPayload).toString('hex');
	return obfuscated;
}

export function verifyCaptcha(captcha?: { text?: string; hash?: string }) {
	if (!captcha?.text || !captcha?.hash) {
		return false;
	}

	try {
		// Deobfuscate the token
		const encodedPayload = Buffer.from(captcha.hash, 'hex').toString();
		const payload = JSON.parse(base64urlDecode(encodedPayload).toString("utf8")) as CaptchaPayload;
		
		const currentTime = Date.now();
		const notExpired = currentTime <= payload.expiresAt;
		const answerMatch = captcha.text.trim() === payload.answer;
		
		return notExpired && answerMatch;
	} catch {
		return false;
	}
}
