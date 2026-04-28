import { NextResponse } from "next/server";
import Stripe from "stripe";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order.Model";
import Product from "@/models/Product.Model";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
	apiVersion: "2026-02-25.clover",
});

interface CheckoutItem {
	product: {
		_id: string;
		price: number;
		name: { en: string; no?: string; ne?: string };
		description?: { en: string; no?: string; ne?: string };
		imageUrl: string;
		type?: string;
	};
	quantity: number;
	variant?: string;
}

export async function POST(request: Request) {
	try {
		await connectDB();

		const { customerInfo, items, total, subtotal, tax, shipping, currency, notes } = await request.json();

		// Validate required fields
		if (!customerInfo || !customerInfo.name || !customerInfo.email || !customerInfo.phone) {
			return NextResponse.json({ error: "Customer information is required" }, { status: 400 });
		}

		if (!items || items.length === 0) {
			return NextResponse.json({ error: "No items in cart" }, { status: 400 });
		}

		// Validate products and get product snapshots
		const productIds = items.map((item: CheckoutItem) => item.product._id);
		const products = await Product.find({ _id: { $in: productIds }, isActive: true });

		if (products.length !== items.length) {
			return NextResponse.json({ error: "Some products are not available" }, { status: 400 });
		}

		// Check stock availability
		for (const item of items) {
			const product = products.find(p => p._id.toString() === item.product._id);
			if (!product) {
				return NextResponse.json({ error: `Product not found: ${item.product._id}` }, { status: 400 });
			}
			
			if (!product.isDigital && product.stockQuantity !== undefined && item.quantity > product.stockQuantity) {
				return NextResponse.json({ error: `Not enough stock for ${product.name.en}` }, { status: 400 });
			}
		}

		// Create order record
		const orderItems = items.map((item: CheckoutItem) => {
			const product = products.find(p => p._id.toString() === item.product._id);
			return {
				product: item.product._id,
				quantity: item.quantity,
				price: item.product.price,
				variant: item.variant,
				productSnapshot: {
					name: product.name,
					imageUrl: product.imageUrl,
					type: product.type
				}
			};
		});

		const order = await Order.create({
			customerInfo,
			items: orderItems,
			subtotal,
			tax,
			shipping,
			total,
			currency,
			paymentMethod: "stripe",
			paymentStatus: "pending",
			status: "pending",
			notes
		});

		// Create Stripe line items
		const lineItems = items.map((item: CheckoutItem) => ({
			price_data: {
				currency: currency.toLowerCase(),
				product_data: {
					name: item.product.name.en || item.product.name['en'],
					description: item.product.description?.en || item.product.description?.['en'] || '',
					images: [item.product.imageUrl],
				},
				unit_amount: item.product.price * 100, // Convert to øre
			},
			quantity: item.quantity,
		}));

		// Add shipping as a separate line item if applicable
		if (shipping > 0) {
			lineItems.push({
				price_data: {
					currency: currency.toLowerCase(),
					product_data: {
						name: "Shipping",
						description: "Standard shipping for physical products",
					},
					unit_amount: shipping * 100,
				},
				quantity: 1,
			});
		}

		// Create Stripe checkout session
		const session = await stripe.checkout.sessions.create({
			payment_method_types: ["card"],
			line_items: lineItems,
			mode: "payment",
			success_url: `${process.env.NEXT_PUBLIC_BASE_URL}/store/success?session_id={CHECKOUT_SESSION_ID}`,
			cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/checkout?canceled=true`,
			customer_email: customerInfo.email,
			metadata: {
				orderId: order._id.toString(),
				customerName: customerInfo.name,
			},
			shipping_address_collection: {
				allowed_countries: ['NO'], // Only allow Norway for now
			},
		});

		// Update order with Stripe session ID
		await Order.findByIdAndUpdate(order._id, {
			stripeSessionId: session.id,
		});

		return NextResponse.json({ url: session.url }, { status: 200 });
	} catch (error) {
		console.error("Store checkout error:", error);
		return NextResponse.json({ error: "Failed to create checkout session" }, { status: 500 });
	}
}
