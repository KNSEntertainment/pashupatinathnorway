import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import Donation from "@/models/Donation.Model";

export async function POST(request: Request) {
	try {
		await connectDB();

		const { personalNumber } = await request.json();

		// Log the exact personal number being searched
		console.log("Debug: Searching for personalNumber:", personalNumber);
		console.log("Debug: Length:", personalNumber?.length);
		console.log("Debug: Type:", typeof personalNumber);

		// Try multiple search approaches
		const exactMatch = await Membership.findOne({ personalNumber });
		console.log("Debug: Exact match result:", exactMatch);

		// Try with regex (case insensitive, trim spaces)
		const regexMatch = await Membership.findOne({ 
			personalNumber: { 
				$regex: new RegExp(`^${personalNumber?.trim()}$`, 'i') 
			} 
		});
		console.log("Debug: Regex match result:", regexMatch);

		// Try to find all members to see sample data
		const allMembers = await Membership.find({}).limit(5).select('firstName lastName personalNumber email');
		console.log("Debug: Sample members:", allMembers);

		// Check if there are any donations with this personal number
		const donationsWithNumber = await Donation.find({ personalNumber }).limit(3);
		console.log("Debug: Donations with this number:", donationsWithNumber);

		return NextResponse.json({
			debug: {
				searchedPersonalNumber: personalNumber,
				searchLength: personalNumber?.length,
				searchType: typeof personalNumber,
				exactMatchFound: !!exactMatch,
				regexMatchFound: !!regexMatch,
				sampleMembers: allMembers.map(m => ({
					name: `${m.firstName} ${m.lastName}`,
					personalNumber: m.personalNumber,
					personalNumberLength: m.personalNumber?.length,
					email: m.email
				})),
				donationsFound: donationsWithNumber.length,
				sampleDonations: donationsWithNumber.map(d => ({
					donorName: d.donorName,
					personalNumber: d.personalNumber,
					amount: d.amount,
					paymentStatus: d.paymentStatus
				}))
			}
		});

	} catch (error) {
		console.error("Debug endpoint error:", error);
		return NextResponse.json({ 
			error: "Debug endpoint failed", 
			details: (error as Error).message 
		}, { status: 500 });
	}
}
