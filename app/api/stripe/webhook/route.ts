import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order.Model";
import Product from "@/models/Product.Model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2026-02-25.clover",
});

export async function POST(request: Request) {
	try {
		const body = await request.text();
		const signature = request.headers.get("stripe-signature");

		if (!signature) {
			return NextResponse.json({ error: "No signature" }, { status: 400 });
		}

		const event = stripe.webhooks.constructEvent(
			body,
			signature,
			process.env.STRIPE_WEBHOOK_SECRET!
		);

		await connectDB();

		switch (event.type) {
			case "checkout.session.completed": {
				const session = event.data.object as Stripe.Checkout.Session;
				
				// Find and update the order
				const order = await Order.findOne({ stripeSessionId: session.id });
				if (!order) {
					console.error("Order not found for session:", session.id);
					return NextResponse.json({ error: "Order not found" }, { status: 404 });
				}

				// Update order status
				await Order.findByIdAndUpdate(order._id, {
					paymentStatus: "completed",
					status: "processing",
					paymentMethod: "stripe",
				});

				// Update stock for physical products
				for (const item of order.items) {
					if (!item.productSnapshot.isDigital) {
						await Product.findByIdAndUpdate(item.product, {
							$inc: { stockQuantity: -item.quantity }
						});
					}
				}

				console.log("Order payment completed:", order._id);
				break;
			}

			case "checkout.session.expired": {
				const session = event.data.object as Stripe.Checkout.Session;
				
				// Find and update the order
				const order = await Order.findOne({ stripeSessionId: session.id });
				if (order) {
					await Order.findByIdAndUpdate(order._id, {
						paymentStatus: "failed",
						status: "cancelled",
					});
					console.log("Order expired:", order._id);
				}
				break;
			}

			case "payment_intent.payment_failed": {
				const paymentIntent = event.data.object as Stripe.PaymentIntent;
				
				// Find order by payment intent
				const order = await Order.findOne({ 
					"metadata.stripePaymentIntentId": paymentIntent.id 
				});
				
				if (order) {
					await Order.findByIdAndUpdate(order._id, {
						paymentStatus: "failed",
						status: "payment_failed",
					});
					console.log("Payment failed for order:", order._id);
				}
				break;
			}

			default:
				console.log(`Unhandled event type: ${event.type}`);
		}

		return NextResponse.json({ received: true });
	} catch (error) {
		console.error("Webhook error:", error);
		return NextResponse.json({ error: "Webhook handler failed" }, { status: 500 });
	}
}
