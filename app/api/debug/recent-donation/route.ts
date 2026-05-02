import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";

export async function POST(request: Request) {
	try {
		await connectDB();

		const { personalNumber } = await request.json();

		console.log("Debug: Searching for recent donations with personalNumber:", personalNumber);

		// Find recent donations with this personal number
		const donations = await Donation.find({ 
			personalNumber,
			paymentStatus: "completed"
		})
		.sort({ createdAt: -1 })
		.limit(5)
		.select('donorName donorEmail address amount paymentStatus createdAt personalNumber');

		console.log("Debug: Found donations:", donations.length);

		if (donations.length === 0) {
			return NextResponse.json({ 
				error: "No completed donations found",
				debug: {
					searchedNumber: personalNumber,
					searchLength: personalNumber?.length,
					searchType: typeof personalNumber
				}
			}, { status: 404 });
		}

		// Return detailed info about the donations
		return NextResponse.json({
			success: true,
			donations: donations.map(donation => ({
				id: donation._id,
				donorName: donation.donorName,
				donorEmail: donation.donorEmail,
				personalNumber: donation.personalNumber,
				address: donation.address,
				addressProvided: !!donation.address,
				addressLength: donation.address?.length || 0,
				amount: donation.amount,
				paymentStatus: donation.paymentStatus,
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
