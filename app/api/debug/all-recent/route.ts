import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";

export async function GET() {
	try {
		await connectDB();

		console.log("Debug: Finding all recent completed donations with addresses");

		// Find recent completed donations that have addresses
		const donations = await Donation.find({ 
			paymentStatus: "completed",
			address: { $exists: true, $ne: null, $nin: ["", null] }
		})
		.sort({ createdAt: -1 })
		.limit(10)
		.select('donorName donorEmail address amount paymentStatus createdAt personalNumber');

		console.log("Debug: Found donations with addresses:", donations.length);

		// Also find the most recent donations regardless of address
		const recentDonations = await Donation.find({ 
			paymentStatus: "completed"
		})
		.sort({ createdAt: -1 })
		.limit(5)
		.select('donorName donorEmail address amount paymentStatus createdAt personalNumber');

		return NextResponse.json({
			success: true,
			donationsWithAddresses: donations.map(donation => ({
				id: donation._id,
				donorName: donation.donorName,
				personalNumber: donation.personalNumber,
				address: donation.address,
				addressProvided: !!donation.address,
				addressLength: donation.address?.length || 0,
				amount: donation.amount,
				createdAt: donation.createdAt
			})),
			allRecentDonations: recentDonations.map(donation => ({
				id: donation._id,
				donorName: donation.donorName,
				personalNumber: donation.personalNumber,
				address: donation.address,
				addressProvided: !!donation.address,
				amount: donation.amount,
				createdAt: donation.createdAt
			}))
		});

	} catch (error) {
		console.error("Debug endpoint error:", error);
		return NextResponse.json({ 
			error: "Debug endpoint failed", 
			details: (error as Error).message 
		}, { status: 500 });
	}
}
