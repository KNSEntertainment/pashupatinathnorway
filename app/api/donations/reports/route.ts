import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";

// GET donation reports
export async function GET(request: NextRequest) {
	try {
		await connectDB();
		
		const { searchParams } = new URL(request.url);
		const limit = searchParams.get('limit');
		
		// Fetch all completed donations with populated cause information
		const donationsQuery = Donation.find({ paymentStatus: 'completed' })
			.populate('causeId')
			.sort({ createdAt: -1 });
		
		if (limit) {
			donationsQuery.limit(parseInt(limit));
		}
		
		const donations = await donationsQuery;
		
		// Calculate totals
		const totals = {
			totalAmount: donations.reduce((sum, donation) => sum + donation.amount, 0),
			totalDonations: donations.length,
			generalDonations: donations.filter(d => d.donationType === 'general').length,
			causeSpecificDonations: donations.filter(d => d.donationType === 'cause_specific').length,
			anonymousDonations: donations.filter(d => d.isAnonymous).length,
			publicDonations: donations.filter(d => !d.isAnonymous).length
		};
		
		// Group by cause
		const causeTotals: { [key: string]: {
			causeId: string;
			title: string;
			totalAmount: number;
			donationCount: number;
		} } = {};
		donations.forEach(donation => {
			if (donation.causeId) {
				const causeId = donation.causeId._id.toString();
				if (!causeTotals[causeId]) {
					causeTotals[causeId] = {
						causeId,
						title: donation.causeId.title?.en || 'Unknown Cause',
						totalAmount: 0,
						donationCount: 0
					};
				}
				causeTotals[causeId].totalAmount += donation.amount;
				causeTotals[causeId].donationCount += 1;
			}
		});
		
		return NextResponse.json({ 
			donations: donations.map(donation => ({
				...donation.toObject(),
				causeId: donation.causeId ? {
					_id: donation.causeId._id,
					title: donation.causeId.title?.en || 'Unknown Cause'
				} : null
			})),
			totals,
			causeTotals: Object.values(causeTotals)
		});
	} catch (error) {
		console.error("Error fetching donation reports:", error);
		return NextResponse.json(
			{ error: "Failed to fetch donation reports" },
			{ status: 500 }
		);
	}
}
