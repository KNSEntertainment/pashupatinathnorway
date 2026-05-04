import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";
import Cause from "@/models/Cause.Model";
import { encryptPersonalNumber } from "@/lib/encryption";
import generateTaxId from "@/lib/taxIdGenerator";
import { sendDonationThankYouEmail } from "@/lib/email";

export async function POST(request: Request) {
	try {
		await connectDB();

		const { amount, donorName, donorEmail, donorPhone, personalNumber, membershipId, address, message, isAnonymous, causeId, donationType } = await request.json();

		// Validate amount
		if (!amount || amount < 50) {
			return NextResponse.json({ error: "Minimum donation amount is 50 NOK" }, { status: 400 });
		}

		// Validate required fields (only if not anonymous)
		if (!isAnonymous && (!donorName || !donorEmail)) {
			return NextResponse.json({ error: "Name and email are required for non-anonymous donations" }, { status: 400 });
		}

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

		// Create donation record with completed status (simulated Vipps payment)
		const donation = await Donation.create({
			donorName: isAnonymous ? "Anonymous" : donorName,
			donorEmail: isAnonymous ? "anonymous@rspnorway.org" : donorEmail,
			donorPhone,
			personalNumber: encryptedPersonalNumber,
			membershipId: membershipId || undefined,
			taxId: taxId || undefined,
			address: address || undefined,
			amount,
			currency: "NOK",
			message,
			isAnonymous,
			paymentStatus: "completed", // Vipps payments are simulated as completed
			stripeSessionId: `vipps_${Date.now()}`, // Simulated session ID
			stripePaymentIntentId: `vipps_pi_${Date.now()}`, // Simulated payment intent ID
			causeId: causeId || null,
			donationType: donationType || "general",
		});

		// Update cause amounts if this is a cause-specific donation
		if (causeId && donationType === "cause_specific") {
			await Cause.findByIdAndUpdate(
				causeId,
				{
					$inc: {
						currentAmount: amount,
						donationCount: 1
					}
				}
			);
		}

		// Send tax ID email to non-members (only if they have a tax ID and valid email)
		if (taxId && donorEmail && donorEmail !== "anonymous@rspnorway.org") {
			try {
				await sendDonationThankYouEmail({
					name: donorName || "Valued Supporter",
					email: donorEmail,
					amount: amount,
					currency: "NOK",
					transactionId: "vipps-" + Date.now(),
					date: new Date().toISOString(),
					message: message || undefined
				});
				console.log("Tax ID email sent to non-member:", donorEmail);
			} catch (emailError) {
				console.error("Error sending tax ID email:", emailError);
				// Don't fail the donation creation if email fails
			}
		}

		return NextResponse.json({ 
			success: true, 
			donation: {
				id: donation._id,
				amount: donation.amount,
				donorName: donation.donorName,
				paymentStatus: donation.paymentStatus
			}
		}, { status: 200 });

	} catch (error) {
		console.error("Vipps donation error:", error);
		return NextResponse.json({ error: "Failed to process Vipps donation" }, { status: 500 });
	}
}
