import crypto from "crypto";

type CaptchaPayload = {
	answer: string;
	expiresAt: number;
	nonce: string;
};

const getSecret = () => process.env.NEXTAUTH_SECRET || process.env.ENCRYPTION_KEY || "development-captcha-secret";

function base64url(input: string | Buffer) {
	return Buffer.from(input).toString("base64url");
}

function sign(payload: string) {
	return crypto.createHmac("sha256", getSecret()).update(payload).digest("base64url");
}

export function createCaptchaToken(answer: number) {
	const payload: CaptchaPayload = {
		answer: String(answer),
		expiresAt: Date.now() + 10 * 60 * 1000,
		nonce: crypto.randomBytes(16).toString("hex"),
	};
	const encodedPayload = base64url(JSON.stringify(payload));
	return `${encodedPayload}.${sign(encodedPayload)}`;
}

export function verifyCaptcha(captcha?: { text?: string; hash?: string }) {
	if (!captcha?.text || !captcha?.hash) return false;

	const [encodedPayload, providedSignature] = captcha.hash.split(".");
	if (!encodedPayload || !providedSignature) return false;

	const expectedSignature = sign(encodedPayload);
	const expectedBuffer = Buffer.from(expectedSignature);
	const providedBuffer = Buffer.from(providedSignature);
	if (expectedBuffer.length !== providedBuffer.length || !crypto.timingSafeEqual(expectedBuffer, providedBuffer)) {
		return false;
	}

	try {
		const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as CaptchaPayload;
		return Date.now() <= payload.expiresAt && captcha.text.trim() === payload.answer;
	} catch {
		return false;
	}
}
