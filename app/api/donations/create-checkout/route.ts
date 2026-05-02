import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";
import { encryptPersonalNumber } from "@/lib/encryption";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2026-02-25.clover",
});

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

		// Encrypt personal number if provided
		const encryptedPersonalNumber = personalNumber ? encryptPersonalNumber(personalNumber) : undefined;

		// Create donation record
		const donation = await Donation.create({
			donorName: isAnonymous ? "Anonymous" : donorName,
			donorEmail: isAnonymous ? "anonymous@rspnorway.org" : donorEmail,
			donorPhone,
			personalNumber: encryptedPersonalNumber,
			address: address || undefined,
			amount,
			currency: "NOK",
			message,
			isAnonymous,
			paymentStatus: "pending",
			causeId: causeId || null,
			donationType: donationType || "general",
		});

		// Create Stripe checkout session
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: [
				{
					price_data: {
						currency: "nok",
						product_data: {
							name: "Donation to Pashupatinath Norway Temple",
							description: message || "Support for Pashupatinath Norway Temple activities",
						},
						unit_amount: amount * 100, // Convert to øre (smallest currency unit)
					},
					quantity: 1,
				},
			],
			mode: "payment",
			success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/en/donate/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/en/donate?canceled=true`,
			customer_email: isAnonymous ? undefined : donorEmail,
			metadata: {
				donationId: donation._id.toString(),
				donorName,
				isAnonymous: isAnonymous.toString(),
			},
		});

		// Update donation with Stripe session ID
		await Donation.findByIdAndUpdate(donation._id, {
			stripeSessionId: session.id,
		});

		return NextResponse.json({ url: session.url }, { status: 200 });
	} catch (error) {
		console.error("Stripe checkout error:", error);
		return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
	}
}
