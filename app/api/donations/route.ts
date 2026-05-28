import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";

export async function GET() {
	try {
		await connectDB();
		const donations = await Donation.find().sort({ createdAt: -1 });
		return NextResponse.json(donations, { status: 200 });
	} catch (error) {
		console.error("Error fetching donations:", error);
		return NextResponse.json({ error: "Failed to fetch donations" }, { status: 500 });
	}
}

export async function POST(request: Request) {
	try {
		await connectDB();

		const body = await request.json();
		const amount = Number(body.amount);

		if (!body.donorName || typeof body.donorName !== "string" || body.donorName.trim().length === 0) {
			return NextResponse.json({ error: "Donor name is required" }, { status: 400 });
		}

		if (!amount || Number.isNaN(amount) || amount <= 0) {
			return NextResponse.json({ error: "Amount must be a positive number" }, { status: 400 });
		}

		if (body.donorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(body.donorEmail)) {
			return NextResponse.json({ error: "Invalid email format" }, { status: 400 });
		}

		if (body.paymentStatus && !["pending", "completed", "failed", "refunded"].includes(body.paymentStatus)) {
			return NextResponse.json({ error: "Invalid payment status" }, { status: 400 });
		}

		if (body.donationType && !["general", "cause_specific"].includes(body.donationType)) {
			return NextResponse.json({ error: "Invalid donation type" }, { status: 400 });
		}

		if (body.donationPurpose && !["general", "cause", "event"].includes(body.donationPurpose)) {
			return NextResponse.json({ error: "Invalid donation purpose" }, { status: 400 });
		}

		const optionalFields = [
			"donorEmail",
			"donorPhone",
			"personalNumber",
			"membershipId",
			"taxId",
			"address",
			"message",
			"stripeSessionId",
			"stripePaymentIntentId",
			"causeId",
			"eventId",
			"linkedRegistrationId",
		];
		const sanitizedBody = { ...body };

		for (const field of optionalFields) {
			if (sanitizedBody[field] === "") {
				delete sanitizedBody[field];
			}
		}

		const donation = await Donation.create({
			...sanitizedBody,
			amount,
			currency: sanitizedBody.currency || "NOK",
			paymentStatus: sanitizedBody.paymentStatus || "completed",
			donationType: sanitizedBody.donationType || "general",
			donationPurpose: sanitizedBody.donationPurpose || "general",
			createdAt: sanitizedBody.createdAt ? new Date(sanitizedBody.createdAt) : new Date(),
		});

		return NextResponse.json(donation, { status: 201 });
	} catch (error) {
		console.error("Error creating donation:", error);
		return NextResponse.json(
			{
				error: "Failed to create donation",
				details: error instanceof Error ? error.message : "Unknown error",
			},
			{ status: 500 },
		);
	}
}
