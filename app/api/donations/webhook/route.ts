import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";
import Cause from "@/models/Cause.Model";
import { sendDonationThankYouEmail } from "@/lib/email";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2026-02-25.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
	try {
		console.log("Webhook received!");
		const body = await request.text();
		const headersList = await headers();
		const signature = headersList.get("stripe-signature");

		console.log("Webhook signature:", signature ? "present" : "missing");
		console.log("Webhook body length:", body.length);

		if (!signature) {
			return NextResponse.json({ error: "No signature" }, { status: 400 });
		}

		let event: Stripe.Event;

		try {
			event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
		} catch (err) {
			console.error("Webhook signature verification failed:", err);
			return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
		}

		await connectDB();

		// Handle the event
		console.log("Processing event type:", event.type);
		switch (event.type) {
			case "checkout.session.completed":
				const session = event.data.object as Stripe.Checkout.Session;
				console.log("Checkout session completed:", session.id);
				console.log("Payment intent:", session.payment_intent);

				// Update donation status
				const updatedDonation = await Donation.findOneAndUpdate(
					{ stripeSessionId: session.id },
					{
						paymentStatus: "completed",
						stripePaymentIntentId: session.payment_intent as string,
					},
					{ new: true } // Return the updated document
				);

				console.log("Donation updated:", updatedDonation?._id);
				console.log("Payment completed for session:", session.id);

				// Send thank you email to all donors (members and non-members)
				if (updatedDonation && updatedDonation.donorEmail && 
					updatedDonation.donorEmail !== "anonymous@rspnorway.org") {
					try {
						await sendDonationThankYouEmail({
							name: updatedDonation.donorName || "Valued Supporter",
							email: updatedDonation.donorEmail,
							amount: updatedDonation.amount,
							currency: "NOK",
							transactionId: updatedDonation.stripePaymentIntentId || updatedDonation.stripeSessionId,
							date: updatedDonation.createdAt.toISOString(),
							membershipId: updatedDonation.membershipId || undefined
						});
						console.log("Donation thank you email sent to:", updatedDonation.donorEmail);
					} catch (emailError) {
						console.error("Error sending donation thank you email after Stripe payment:", emailError);
						// Don't fail webhook if email fails
					}
				}

				// Update cause amounts if this is a cause-specific donation
				if (updatedDonation && updatedDonation.causeId && updatedDonation.donationType === "cause_specific") {
					await Cause.findByIdAndUpdate(
						updatedDonation.causeId,
						{
							$inc: {
								currentAmount: updatedDonation.amount,
								donationCount: 1
							}
						}
					);
					console.log("Cause updated with new donation amount");
				}
				break;

			case "charge.updated":
			case "charge.succeeded":
				const charge = event.data.object as Stripe.Charge;
				console.log("Charge completed:", charge.id);
				console.log("Payment intent:", charge.payment_intent);

				// Update donation status using payment intent
				if (charge.payment_intent) {
					const updatedDonation = await Donation.findOneAndUpdate(
						{ stripePaymentIntentId: charge.payment_intent as string },
						{ paymentStatus: "completed" },
						{ new: true }
					);

					console.log("Donation updated via charge:", updatedDonation?._id);

					// Send thank you email to all donors for successful charge payments
					if (updatedDonation && updatedDonation.donorEmail && 
						updatedDonation.donorEmail !== "anonymous@rspnorway.org") {
						try {
							await sendDonationThankYouEmail({
								name: updatedDonation.donorName || "Valued Supporter",
								email: updatedDonation.donorEmail,
								amount: updatedDonation.amount,
								currency: "NOK",
								transactionId: updatedDonation.stripePaymentIntentId || updatedDonation.stripeSessionId,
								date: updatedDonation.createdAt.toISOString(),
								membershipId: updatedDonation.membershipId || undefined
							});
							console.log("Donation thank you email sent to:", updatedDonation.donorEmail);
						} catch (emailError) {
							console.error("Error sending donation thank you email after charge:", emailError);
							// Don't fail webhook if email fails
						}
					}

					// Update cause amounts if this is a cause-specific donation
					if (updatedDonation && updatedDonation.causeId && updatedDonation.donationType === "cause_specific") {
						await Cause.findByIdAndUpdate(
							updatedDonation.causeId,
							{
								$inc: {
									currentAmount: updatedDonation.amount,
									donationCount: 1
								}
							}
						);
						console.log("Cause updated via charge webhook");
					}
				}
				break;

			case "checkout.session.expired":
				const expiredSession = event.data.object as Stripe.Checkout.Session;

				await Donation.findOneAndUpdate({ stripeSessionId: expiredSession.id }, { paymentStatus: "failed" });

				console.log("Payment session expired:", expiredSession.id);
				break;

			case "payment_intent.payment_failed":
				const failedPayment = event.data.object as Stripe.PaymentIntent;

				await Donation.findOneAndUpdate({ stripePaymentIntentId: failedPayment.id }, { paymentStatus: "failed" });

				console.log("Payment failed:", failedPayment.id);
				break;

			default:
				console.log(`Unhandled event type: ${event.type}`);
		}

		return NextResponse.json({ received: true }, { status: 200 });
	} catch (error) {
		console.error("Webhook error:", error);
		return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
	}
}
