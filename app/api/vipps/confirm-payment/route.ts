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

		if (!orderId || !reference || !donationData) {
			return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
		}

		// Get access token for Vipps API
		const accessToken = await getAccessToken();

		// Get payment status from Vipps
		const paymentStatus = await getVippsPaymentStatus(accessToken, reference);

		// Check if payment is authorized
		if (paymentStatus.state !== "AUTHORIZED") {
			return NextResponse.json(
				{
					error: "Payment not authorized",
					state: paymentStatus.state,
				},
				{ status: 400 },
			);
		}

		await connectDB();

		// Check if donation already exists
		const existingDonation = await Donation.findOne({
			stripePaymentIntentId: orderId,
			paymentStatus: "completed",
		});

		if (existingDonation) {
			return NextResponse.json(
				{
					error: "Donation already processed",
					donation: existingDonation,
				},
				{ status: 409 },
			);
		}

		// Encrypt personal number if provided
		const encryptedPersonalNumber = donationData.personalNumber ? encryptPersonalNumber(donationData.personalNumber) : undefined;

		// Generate tax ID for non-members
		let taxId = undefined;
		if (!donationData.membershipId && donationData.personalNumber) {
			const existingDonationWithTaxId = await Donation.findOne({
				personalNumber: encryptedPersonalNumber,
				taxId: { $exists: true },
			});

			if (existingDonationWithTaxId) {
				taxId = existingDonationWithTaxId.taxId;
			} else {
				taxId = await generateTaxId();
			}
		}

		// Create donation record
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

		// Update cause amounts if this is a cause-specific donation
		if (donationData.causeId && donationData.donationType === "cause_specific") {
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
			await captureVippsPayment(accessToken, reference, amountInOre);
			console.log(`Payment ${reference} captured successfully`);
		} catch (captureError) {
			console.warn(`Payment ${reference} may already be captured:`, captureError);
		}

		// Send tax ID email to non-members
		if (taxId && donationData.donorEmail && donationData.donorEmail !== "anonymous@rspnorway.org") {
			try {
				await sendDonationThankYouEmail({
					name: donationData.donorName || "Valued Supporter",
					email: donationData.donorEmail,
					amount: donationData.amount,
					currency: "NOK",
					transactionId: `vipps-${orderId}`,
					date: new Date().toISOString(),
					message: donationData.message || undefined,
				});
				console.log("Tax ID email sent to non-member:", donationData.donorEmail);
			} catch (emailError) {
				console.error("Error sending tax ID email:", emailError);
			}
		}

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
		console.error("Vipps payment confirmation error:", error);
		return NextResponse.json(
			{
				error: error instanceof Error ? error.message : "Failed to confirm Vipps payment",
			},
			{ status: 500 },
		);
	}
}
