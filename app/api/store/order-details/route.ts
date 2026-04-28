import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Order from "@/models/Order.Model";

export async function GET(request: Request) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);
		const session_id = searchParams.get('session_id');

		if (!session_id) {
			return NextResponse.json({ error: "Session ID is required" }, { status: 400 });
		}

		// Find order by Stripe session ID
		const order = await Order.findOne({ stripeSessionId: session_id })
			.populate('items.product', 'name imageUrl type isDigital')
			.lean();

		if (!order) {
			return NextResponse.json({ error: "Order not found" }, { status: 404 });
		}

		return NextResponse.json(order);
	} catch (error) {
		console.error("Error fetching order details:", error);
		return NextResponse.json({ error: "Failed to fetch order details" }, { status: 500 });
	}
}
