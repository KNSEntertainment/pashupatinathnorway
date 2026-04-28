import { NextResponse } from "next/server";
import { headers } from "next/headers";
import Stripe from "stripe";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order.Model";
import Product from "@/models/Product.Model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2026-02-25.clover",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
	try {
		console.log("Store webhook received!");
		const body = await request.text();
		const headersList = await headers();
		const signature = headersList.get("stripe-signature");

		console.log("Store webhook signature:", signature ? "present" : "missing");
		console.log("Store webhook body length:", body.length);

		if (!signature) {
			return NextResponse.json({ error: "No signature" }, { status: 400 });
		}

		let event: Stripe.Event;

		try {
			event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
		} catch (err) {
			console.error("Store webhook signature verification failed:", err);
			return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
		}

		await connectDB();

		// Handle the event
		console.log("Processing store event type:", event.type);
		switch (event.type) {
			case "checkout.session.completed":
				const session = event.data.object as Stripe.Checkout.Session;
				console.log("Store checkout session completed:", session.id);
				console.log("Store payment intent:", session.payment_intent);

				// Update order status
				const updatedOrder = await Order.findOneAndUpdate(
					{ stripeSessionId: session.id },
					{
						status: "processing",
						paymentStatus: "completed",
						stripePaymentIntentId: session.payment_intent as string,
					},
					{ new: true } // Return the updated document
				).populate('items.product');

				console.log("Store order updated:", updatedOrder?._id);
				console.log("Store payment completed for session:", session.id);

				// Update stock for physical products
				if (updatedOrder) {
					for (const item of updatedOrder.items) {
						const product = item.product as {
							_id: string;
							isDigital: boolean;
							stockQuantity?: number;
						};
						if (!product.isDigital && product.stockQuantity !== undefined) {
							await Product.findByIdAndUpdate(
								product._id,
								{
									$inc: { stockQuantity: -item.quantity }
								}
							);
							console.log(`Stock updated for product ${product._id}: -${item.quantity}`);
						}
					}
				}
				break;

			case "charge.updated":
			case "charge.succeeded":
				const charge = event.data.object as Stripe.Charge;
				console.log("Store charge completed:", charge.id);
				console.log("Store payment intent:", charge.payment_intent);

				// Update order status using payment intent
				if (charge.payment_intent) {
					const updatedOrder = await Order.findOneAndUpdate(
						{ stripePaymentIntentId: charge.payment_intent as string },
						{ 
							paymentStatus: "completed",
							status: "processing"
						},
						{ new: true }
					).populate('items.product');

					console.log("Store order updated via charge:", updatedOrder?._id);

					// Update stock for physical products
					if (updatedOrder) {
						for (const item of updatedOrder.items) {
							const product = item.product as {
								_id: string;
								isDigital: boolean;
								stockQuantity?: number;
							};
							if (!product.isDigital && product.stockQuantity !== undefined) {
								await Product.findByIdAndUpdate(
									product._id,
									{
										$inc: { stockQuantity: -item.quantity }
									}
								);
								console.log(`Stock updated for product ${product._id}: -${item.quantity}`);
							}
						}
					}
				}
				break;

			case "checkout.session.expired":
				const expiredSession = event.data.object as Stripe.Checkout.Session;

				await Order.findOneAndUpdate(
					{ stripeSessionId: expiredSession.id }, 
					{ 
						status: "cancelled",
						paymentStatus: "failed"
					}
				);

				console.log("Store payment session expired:", expiredSession.id);
				break;

			case "payment_intent.payment_failed":
				const failedPayment = event.data.object as Stripe.PaymentIntent;

				await Order.findOneAndUpdate(
					{ stripePaymentIntentId: failedPayment.id }, 
					{ 
						status: "cancelled",
						paymentStatus: "failed"
					}
				);

				console.log("Store payment failed:", failedPayment.id);
				break;

			default:
				console.log(`Unhandled store event type: ${event.type}`);
		}

		return NextResponse.json({ received: true }, { status: 200 });
	} catch (error) {
		console.error("Store webhook error:", error);
		return NextResponse.json({ error: "Store webhook handler failed" }, { status: 500 });
	}
}
