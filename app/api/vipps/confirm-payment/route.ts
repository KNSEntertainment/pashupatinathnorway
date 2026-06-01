import { NextResponse } from "next/server";
import { getAccessToken, getVippsPaymentStatus, captureVippsPayment } from "@/lib/vipps";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";
import Cause from "@/models/Cause.Model";
import { encryptPersonalNumber } from "@/lib/encryption";
import generateTaxId from "@/lib/taxIdGenerator";
import { sendDonationThankYouEmail } from "@/lib/email";

export async function POST(request: Request) {
	try {
		const { orderId, reference, donationData } = await request.json();

		console.log('[VIPPS Confirm] Received request:', { orderId, reference, hasDonationData: !!donationData });

		if (!orderId || !reference || !donationData) {
			console.error('[VIPPS Confirm] Missing required parameters:', { orderId, reference, hasDonationData: !!donationData });
			return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
		}

		// Get access token for Vipps API
		const accessToken = await getAccessToken();

		// Get payment status from Vipps
		const paymentStatus = await getVippsPaymentStatus(accessToken, reference);
		console.log('[VIPPS Confirm] Payment status:', { state: paymentStatus.state, reference });

		// Check if payment is authorized
		if (paymentStatus.state !== "AUTHORIZED") {
			console.error('[VIPPS Confirm] Payment not authorized:', { state: paymentStatus.state, reference });
			return NextResponse.json(
				{
					error: "Payment not authorized",
					state: paymentStatus.state,
				},
				{ status: 400 },
			);
		}

		await connectDB();
		console.log('[VIPPS Confirm] Database connected');

		// Check if donation already exists and is completed
		const existingDonation = await Donation.findOne({
			stripePaymentIntentId: orderId,
			paymentStatus: "completed",
		});

		if (existingDonation) {
			console.log('[VIPPS Confirm] Donation already exists:', existingDonation._id);
			return NextResponse.json(
				{
					error: "Donation already processed",
					donation: existingDonation,
				},
				{ status: 409 },
			);
		}

		// Find pending donation with this order ID
		const pendingDonation = await Donation.findOne({
			stripePaymentIntentId: orderId,
			paymentStatus: "pending",
		});

		if (pendingDonation) {
			console.log('[VIPPS Confirm] Found pending donation, updating to completed:', pendingDonation._id);
			// Update existing pending donation to completed
			pendingDonation.paymentStatus = "completed";
			await pendingDonation.save();
			console.log('[VIPPS Confirm] Pending donation updated to completed');
		} else {
			console.log('[VIPPS Confirm] No pending donation found, creating new donation record');
		}

		// If we found and updated a pending donation, skip creating a new one
		if (pendingDonation) {
			// Update cause amounts if this is a cause-specific donation
			if (pendingDonation.causeId && pendingDonation.donationType === "cause_specific") {
				console.log('[VIPPS Confirm] Updating cause amounts:', { causeId: pendingDonation.causeId, amount: pendingDonation.amount });
				await Cause.findByIdAndUpdate(pendingDonation.causeId, {
					$inc: {
						currentAmount: pendingDonation.amount,
						donationCount: 1,
					},
				});
			}

			// Send confirmation email
			if (pendingDonation.donorEmail && pendingDonation.donorEmail !== "anonymous@rspnorway.org") {
				try {
					console.log('[VIPPS Confirm] Sending confirmation email:', { email: pendingDonation.donorEmail, taxId: pendingDonation.taxId });
					await sendDonationThankYouEmail({
						name: pendingDonation.donorName || "Valued Supporter",
						email: pendingDonation.donorEmail,
						amount: pendingDonation.amount,
						currency: "NOK",
						transactionId: `vipps-${orderId}`,
						date: pendingDonation.createdAt || new Date().toISOString(),
						message: pendingDonation.message || undefined,
					});
					console.log("[VIPPS Confirm] Confirmation email sent");
				} catch (emailError) {
					console.error("[VIPPS Confirm] Error sending confirmation email:", emailError);
				}
			}

			console.log('[VIPPS Confirm] Donation confirmation completed successfully (updated pending donation)');
			return NextResponse.json({
				success: true,
				donation: {
					id: pendingDonation._id,
					amount: pendingDonation.amount,
					donorName: pendingDonation.donorName,
					paymentStatus: pendingDonation.paymentStatus,
					taxId: pendingDonation.taxId,
				},
			});
		}

		// Encrypt personal number if provided
		const encryptedPersonalNumber = donationData.personalNumber ? encryptPersonalNumber(donationData.personalNumber) : undefined;
		console.log('[VIPPS Confirm] Personal number encrypted:', { hasPersonalNumber: !!donationData.personalNumber });

		// Generate tax ID for non-members
		let taxId = undefined;
		if (!donationData.membershipId && donationData.personalNumber) {
			const existingDonationWithTaxId = await Donation.findOne({
				personalNumber: encryptedPersonalNumber,
				taxId: { $exists: true },
			});

			if (existingDonationWithTaxId) {
				taxId = existingDonationWithTaxId.taxId;
				console.log('[VIPPS Confirm] Using existing tax ID:', taxId);
			} else {
				taxId = await generateTaxId();
				console.log('[VIPPS Confirm] Generated new tax ID:', taxId);
			}
		}

		// Create donation record (fallback if no pending donation was found)
		console.log('[VIPPS Confirm] Creating donation record...');
		const donation = await Donation.create({
			donorName: donationData.isAnonymous ? "Anonymous" : donationData.donorName,
			donorEmail: donationData.isAnonymous ? "anonymous@rspnorway.org" : donationData.donorEmail,
			donorPhone: donationData.donorPhone,
			personalNumber: encryptedPersonalNumber,
			membershipId: donationData.membershipId || undefined,
			taxId: taxId || undefined,
			address: donationData.address || undefined,
			amount: donationData.amount,
			currency: "NOK",
			message: donationData.message,
			isAnonymous: donationData.isAnonymous,
			paymentStatus: "completed",
			stripeSessionId: reference,
			stripePaymentIntentId: orderId,
			causeId: donationData.causeId || null,
			donationType: donationData.donationType || "general",
		});
		console.log('[VIPPS Confirm] Donation created successfully:', donation._id);

		// Update cause amounts if this is a cause-specific donation
		if (donationData.causeId && donationData.donationType === "cause_specific") {
			console.log('[VIPPS Confirm] Updating cause amounts:', { causeId: donationData.causeId, amount: donationData.amount });
			await Cause.findByIdAndUpdate(donationData.causeId, {
				$inc: {
					currentAmount: donationData.amount,
					donationCount: 1,
				},
			});
		}

		// Capture the payment in Vipps (if not already captured)
		try {
			const amountInOre = Math.round(donationData.amount * 100); // Convert NOK to øre
			console.log('[VIPPS Confirm] Capturing payment:', { reference, amountInOre });
			await captureVippsPayment(accessToken, reference, amountInOre);
			console.log(`[VIPPS Confirm] Payment ${reference} captured successfully`);
		} catch (captureError) {
			console.warn(`[VIPPS Confirm] Payment ${reference} may already be captured:`, captureError);
		}

		// Send tax ID email to non-members
		if (taxId && donationData.donorEmail && donationData.donorEmail !== "anonymous@rspnorway.org") {
			try {
				console.log('[VIPPS Confirm] Sending confirmation email:', { email: donationData.donorEmail, taxId });
				await sendDonationThankYouEmail({
					name: donationData.donorName || "Valued Supporter",
					email: donationData.donorEmail,
					amount: donationData.amount,
					currency: "NOK",
					transactionId: `vipps-${orderId}`,
					date: new Date().toISOString(),
					message: donationData.message || undefined,
				});
				console.log("[VIPPS Confirm] Tax ID email sent to non-member:", donationData.donorEmail);
			} catch (emailError) {
				console.error("[VIPPS Confirm] Error sending tax ID email:", emailError);
			}
		}

		console.log('[VIPPS Confirm] Donation confirmation completed successfully');
		return NextResponse.json({
			success: true,
			donation: {
				id: donation._id,
				amount: donation.amount,
				donorName: donation.donorName,
				paymentStatus: donation.paymentStatus,
				taxId: donation.taxId,
			},
		});
	} catch (error) {
		console.error("[VIPPS Confirm] Vipps payment confirmation error:", error);
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Failed to confirm Vipps payment",
			},
			{ status: 500 },
		);
	}
}
