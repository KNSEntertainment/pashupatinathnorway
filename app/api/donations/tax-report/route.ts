import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";
import Membership from "@/models/Membership.Model";

export async function POST(request: Request) {
	try {
		await connectDB();

		const { personalNumber, year } = await request.json();

		// Validate personal number
		if (!personalNumber || !/^\d{11}$/.test(personalNumber)) {
			return NextResponse.json({ error: "Personal number must be exactly 11 digits" }, { status: 400 });
		}

		// Validate year
		const reportYear = year || new Date().getFullYear();
		if (!reportYear || reportYear < 2000 || reportYear > new Date().getFullYear() + 1) {
			return NextResponse.json({ error: "Invalid year provided" }, { status: 400 });
		}

		// First check if there are any donations with this personal number
		console.log("Tax Report Debug: Searching for personalNumber:", personalNumber);
		console.log("Tax Report Debug: Length:", personalNumber?.length);
		
		// Find all completed donations for the specified year first
		const startDate = new Date(reportYear, 0, 1); // January 1st of the year
		const endDate = new Date(reportYear, 11, 31, 23, 59, 59); // December 31st of the year

		const donations = await Donation.find({ 
			personalNumber,
			paymentStatus: "completed",
			createdAt: { $gte: startDate, $lte: endDate }
		}).sort({ createdAt: 1 });
		
		console.log("Tax Report Debug: Donations found:", donations.length);
		
		if (donations.length === 0) {
			return NextResponse.json({ 
				error: "No completed donations found for this personal number in the specified year",
				debug: {
					searchedNumber: personalNumber,
					year: reportYear,
					dateRange: `${startDate.toISOString()} to ${endDate.toISOString()}`
				}
			}, { status: 404 });
		}

		// Now try to find membership (optional - for additional member info)
		const membership = await Membership.findOne({ personalNumber });
		console.log("Tax Report Debug: Membership found:", !!membership);

		// Calculate total and generate report data
		const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);
		const donationCount = donations.length;

		// Generate tax report data - handle both members and non-members
		const firstDonation = donations[0];
		
		// For non-members, find the most recent donation that has an address
		const donationWithAddress = donations.find(d => d.address && d.address.trim() !== "");
		
		const memberInfo = membership ? {
			name: `${membership.firstName} ${membership.lastName}`,
			personalNumber: membership.personalNumber,
			email: membership.email,
			address: `${membership.address}, ${membership.postalCode} ${membership.city}`,
			membershipStatus: membership.membershipStatus
		} : {
			name: firstDonation.donorName || "Anonymous Donor",
			personalNumber: personalNumber,
			email: firstDonation.donorEmail || "Not provided",
			address: donationWithAddress?.address || "Not provided",
			membershipStatus: "Non-member"
		};

		const taxReport = {
			member: memberInfo,
			report: {
				year: reportYear,
				generatedAt: new Date().toISOString(),
				totalDonated,
				donationCount,
				donations: donations.map(donation => ({
					date: donation.createdAt,
					amount: donation.amount,
					currency: donation.currency,
					message: donation.message,
					isAnonymous: donation.isAnonymous,
					donationType: donation.donationType,
					causeId: donation.causeId
				}))
			},
			summary: {
				averageDonation: donationCount > 0 ? Math.round(totalDonated / donationCount) : 0,
				largestDonation: donations.length > 0 ? Math.max(...donations.map(d => d.amount)) : 0,
				smallestDonation: donations.length > 0 ? Math.min(...donations.map(d => d.amount)) : 0,
				firstDonationDate: donations.length > 0 ? donations[0].createdAt : null,
				lastDonationDate: donations.length > 0 ? donations[donations.length - 1].createdAt : null
			}
		};

		return NextResponse.json({
			success: true,
			taxReport
		}, { status: 200 });

	} catch (error) {
		console.error("Error generating tax report:", error);
		return NextResponse.json({ error: "Failed to generate tax report" }, { status: 500 });
	}
}
