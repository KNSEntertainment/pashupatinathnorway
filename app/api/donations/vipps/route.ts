import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";
import Cause from "@/models/Cause.Model";

export async function POST(request: Request) {
	try {
		await connectDB();

		const { amount, donorName, donorEmail, donorPhone, personalNumber, address, message, isAnonymous, causeId, donationType } = await request.json();

		// Validate amount
		if (!amount || amount < 50) {
			return NextResponse.json({ error: "Minimum donation amount is 50 NOK" }, { status: 400 });
		}

		// Validate required fields (only if not anonymous)
		if (!isAnonymous && (!donorName || !donorEmail)) {
			return NextResponse.json({ error: "Name and email are required for non-anonymous donations" }, { status: 400 });
		}

		// Create donation record with completed status (simulated Vipps payment)
		const donation = await Donation.create({
			donorName: isAnonymous ? "Anonymous" : donorName,
			donorEmail: isAnonymous ? "anonymous@rspnorway.org" : donorEmail,
			donorPhone,
			personalNumber: personalNumber || undefined,
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
