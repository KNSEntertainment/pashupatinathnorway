// import { NextResponse } from "next/server";
// import VippsService from "@/lib/vipps";

// export async function POST(request: Request) {
// 	try {
// 		const { amount, donorName, donorEmail, donorPhone, personalNumber, address, message, isAnonymous, causeId, donationType } = await request.json();

// 		// Note: Captcha is already verified on frontend via CustomCaptcha component
// 		// which calls /api/captcha/verify. No need to verify again here.

// 		// Validate amount
// 		if (!amount || amount < 50) {
// 			return NextResponse.json({ error: "Minimum donation amount is 50 NOK" }, { status: 400 });
// 		}

// 		// Validate required fields (only if not anonymous)
// 		if (!isAnonymous && (!donorName || !donorEmail)) {
// 			return NextResponse.json({ error: "Name and email are required for non-anonymous donations" }, { status: 400 });
// 		}

// 		// Validate phone number if provided
// 		if (donorPhone && !VippsService.validatePhoneNumber(donorPhone)) {
// 			return NextResponse.json({ error: "Invalid Norwegian phone number" }, { status: 400 });
// 		}

// 		// Generate reference for this donation
// 		const reference = VippsService.generateReference("DONATION");

// 		// Create return URL for Vipps redirect
// 		const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
// 		const returnUrl = `${baseUrl}/donate/confirm?reference=${reference}`;

// 		// Initialize Vipps service
// 		const vippsService = new VippsService();

// 		// Create Vipps payment
// 		const vippsPayment = await vippsService.createPayment(amount, reference, returnUrl, donorPhone || undefined);

// 		// Store donation details in session/database for later confirmation
// 		// For now, we'll store in a temporary storage (in production, use Redis or database)
// 		const donationData = {
// 			reference,
// 			orderId: vippsPayment.orderId,
// 			amount,
// 			donorName: isAnonymous ? "Anonymous" : donorName,
// 			donorEmail: isAnonymous ? "anonymous@rspnorway.org" : donorEmail,
// 			donorPhone,
// 			personalNumber,
// 			address,
// 			message,
// 			isAnonymous,
// 			causeId,
// 			donationType: donationType || "general",
// 			status: "PENDING",
// 			createdAt: new Date().toISOString(),
// 		};

// 		// Store donation data temporarily (in production, use proper session storage)
// 		// For now, we'll return it in the response and handle it on the frontend
// 		console.log("Donation data stored:", donationData);

// 		return NextResponse.json({
// 			success: true,
// 			payment: {
// 				orderId: vippsPayment.orderId,
// 				reference: vippsPayment.reference,
// 				redirectUrl: vippsPayment.redirectUrl,
// 				paymentLink: vippsPayment.paymentLink,
// 			},
// 			donationData,
// 		});
// 	} catch (error) {
// 		console.error("Vipps payment creation error:", error);
// 		return NextResponse.json(
// 			{
// 				error: error instanceof Error ? error.message : "Failed to create Vipps payment",
// 			},
// 			{ status: 500 },
// 		);
// 	}
// }

// src/app/api/vipps/create-payment/route.ts
//
// Receives the exact payload your DonationForm already sends:
// { amount, donorName, donorEmail, donorPhone, personalNumber?,
//   address?, message, isAnonymous, causeId, donationType, captcha }
//
// Returns the shape your form already reads:
// { payment: { orderId, reference, redirectUrl }, donationData }

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
		const returnUrl = `${appUrl}/payment-success?reference=${reference}`;

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
