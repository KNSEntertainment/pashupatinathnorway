import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, createVippsPayment, generateVippsReference, normaliseMSISDN } from "@/lib/vipps";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		console.log("[Vipps] Incoming body:", JSON.stringify(body));

		const { amount, donorName, donorEmail, donorPhone, personalNumber, address, message, isAnonymous, causeId, donationType } = body;

		// ── Basic validation ───────────────────────────────────────
		if (!amount || typeof amount !== "number" || amount < 50) {
			return NextResponse.json({ error: "Minimum donation amount is 50 NOK" }, { status: 400 });
		}

		if (!donorPhone) {
			return NextResponse.json({ error: "Phone number is required for Vipps payment" }, { status: 400 });
		}

		// ── Build payment reference & URLs ─────────────────────────
		const reference = generateVippsReference("don");
		const appUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";

		// IMPORTANT: returnUrl must be publicly reachable (use ngrok for local dev).
		const returnUrl = `${appUrl}/en/payment-success?reference=${reference}`;

		const paymentDescription = causeId ? `Donation – ${donationType === "cause_specific" ? "Cause" : "General"}` : "General Donation";

		// ── Get Vipps access token ─────────────────────────────────
		const accessToken = await getAccessToken();

		// ── Create payment ─────────────────────────────────────────
		const vippsPayment = await createVippsPayment(accessToken, {
			amountNOK: amount,
			phoneNumber: donorPhone,
			reference,
			paymentDescription,
			returnUrl,
		});

		// ── Build donationData for sessionStorage ──────────────────
		// Matches what your form stores: sessionStorage.setItem(`donation_${reference}`, JSON.stringify(result.donationData))
		const donationData = {
			amount,
			donorName: isAnonymous ? "Anonymous" : donorName,
			donorEmail: isAnonymous ? "anonymous@rspnorway.org" : donorEmail,
			donorPhone: normaliseMSISDN(donorPhone),
			personalNumber: personalNumber || null,
			address: address || null,
			message: message || null,
			isAnonymous: !!isAnonymous,
			causeId: causeId || null,
			donationType: donationType || "general",
			reference,
			status: "pending",
			createdAt: new Date().toISOString(),
		};

		// ── Return shape your form already expects ─────────────────
		return NextResponse.json({
			payment: {
				orderId: reference, // your form logs result.payment.orderId
				reference, // your form logs result.payment.reference
				redirectUrl: vippsPayment.redirectUrl, // your form reads result.payment.redirectUrl
			},
			donationData, // your form stores this in sessionStorage
		});
	} catch (error) {
		console.error("[Vipps] create-payment error:", error);
		return NextResponse.json(
			{
				error: "Failed to create Vipps payment",
				details: error instanceof Error ? error.message : String(error),
			},
			{ status: 500 },
		);
	}
}
