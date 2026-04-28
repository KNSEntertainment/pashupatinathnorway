import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Subscriber from "@/models/Subscriber.Model";
import { sendSubscriptionThankYouEmail } from "@/lib/email";

export async function GET() {
	try {
		await connectDB();
		const subscribers = await Subscriber.find({}).sort({ createdAt: -1 });
		return NextResponse.json({ subscribers });
	} catch (error) {
		console.error("Error fetching subscribers:", error);
		return NextResponse.json({ error: error.message || "Failed to fetch subscribers" }, { status: 500 });
	}
}

export async function POST(request) {
	try {
		await connectDB();
		const body = await request.json();
		const { subscriber } = body;

		console.log("Received subscriber email:", subscriber);

		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!subscriber || typeof subscriber !== "string" || !emailRegex.test(subscriber)) {
			return NextResponse.json(
				{
					success: false,
					error: "Please provide a valid email address.",
				},
				{ status: 400 }
			);
		}
		const normalizedEmail = subscriber.toLowerCase().trim();

		// Check for existing subscriber
		const existingSubscriber = await Subscriber.findOne({ subscriber: normalizedEmail });
		if (existingSubscriber) {
			return NextResponse.json(
				{
					success: false,
					error: "This email is already subscribed.",
				},
				{ status: 400 }
			);
		}

		// Save the new subscriber
		const subscriberData = await Subscriber.create({ subscriber: normalizedEmail });
		console.log("Subscriber saved successfully:", subscriberData);

		// Send thank you email
		try {
			await sendSubscriptionThankYouEmail(normalizedEmail);
			console.log("Thank you email sent successfully to:", normalizedEmail);
		} catch (emailError) {
			console.error("Failed to send thank you email:", emailError);
			// Continue even if email fails - subscription was successful
		}

		return NextResponse.json(
			{
				success: true,
				subscriber: subscriberData,
			},
			{ status: 201 }
		);
	} catch (error) {
		console.error("Detailed Error:", {
			message: error.message,
			name: error.name,
			stack: error.stack,
		});

		// Handle Mongoose validation errors
		if (error.name === "ValidationError") {
			return NextResponse.json(
				{
					success: false,
					error: Object.values(error.errors)[0].message,
				},
				{ status: 400 }
			);
		}

		// Handle duplicate key error
		if (error.code === 11000) {
			return NextResponse.json(
				{
					success: false,
					error: "This email is already subscribed.",
				},
				{ status: 400 }
			);
		}

		// Generic error handler
		return NextResponse.json(
			{
				success: false,
				error: "An error occurred while processing your request.",
				details: error.message,
			},
			{ status: 500 }
		);
	}
}
