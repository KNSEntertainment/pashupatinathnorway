import { NextRequest, NextResponse } from "next/server";
import { getAccessToken, createVippsPayment, generateVippsReference, normaliseMSISDN } from "@/lib/vipps";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";
import { encryptPersonalNumber } from "@/lib/encryption";
import generateTaxId from "@/lib/taxIdGenerator";

export async function POST(request: NextRequest) {
	try {
		const body = await request.json();
		console.log("[Vipps] Incoming body:", JSON.stringify(body));

		const { amount, donorName, donorEmail, donorPhone, personalNumber, address, message, isAnonymous, causeId, donationType, membershipId } = body;

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

		// ── Create pending donation record in database ─────────────
		await connectDB();

		// Encrypt personal number if provided
		const encryptedPersonalNumber = personalNumber ? encryptPersonalNumber(personalNumber) : undefined;

		// Generate tax ID for non-members (those without membershipId)
		let taxId = undefined;
		if (!membershipId && personalNumber) {
			// Check if this non-member already has donations with a tax ID
			const existingDonation = await Donation.findOne({
				personalNumber: encryptedPersonalNumber,
				taxId: { $exists: true }
			});

			if (existingDonation) {
				// Use existing tax ID
				taxId = existingDonation.taxId;
			} else {
				// Generate new tax ID
				taxId = await generateTaxId();
			}
		}

		// Create pending donation record
		const pendingDonation = await Donation.create({
			donorName: isAnonymous ? "Anonymous" : donorName,
			donorEmail: isAnonymous ? "anonymous@rspnorway.org" : donorEmail,
			donorPhone: normaliseMSISDN(donorPhone),
			personalNumber: encryptedPersonalNumber,
			membershipId: membershipId || undefined,
			taxId: taxId || undefined,
			address: address || undefined,
			amount,
			currency: "NOK",
			message,
			isAnonymous,
			paymentStatus: "pending", // Start as pending
			stripeSessionId: reference,
			stripePaymentIntentId: reference, // Use reference as orderId
			causeId: causeId || null,
			donationType: donationType || "general",
		});

		console.log("[Vipps] Pending donation created:", pendingDonation._id);

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
			membershipId: membershipId || null,
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
