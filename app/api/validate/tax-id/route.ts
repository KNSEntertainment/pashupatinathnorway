import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";

export async function POST(request: Request) {
	try {
		await connectDB();
		
		const { taxId } = await request.json();
		
		if (!taxId) {
			return NextResponse.json({ 
				valid: false, 
				error: "Tax ID is required" 
			}, { status: 400 });
		}

		// Validate format
		if (!/^TAX-\d{4}-\d{6}$/.test(taxId)) {
			return NextResponse.json({ 
				valid: false, 
				error: "Invalid tax ID format. Expected format: TAX-YYYY-XXXXXX" 
			}, { status: 400 });
		}

		// Check if tax ID exists in donations
		const donation = await Donation.findOne({ taxId, paymentStatus: "completed" });
		
		if (!donation) {
			return NextResponse.json({ 
				valid: false, 
				error: "Tax ID not found in system or no completed donations found" 
			}, { status: 404 });
		}

		// Get all donations for this tax ID
		const donations = await Donation.find({ 
			taxId, 
			paymentStatus: "completed" 
		}).sort({ createdAt: -1 });

		// Calculate totals
		const totalDonated = donations.reduce((sum, d) => sum + d.amount, 0);
		const donationCount = donations.length;

		return NextResponse.json({ 
			valid: true, 
			message: "Tax ID is valid",
			donorInfo: {
				name: donation.donorName || "Anonymous Donor",
				email: donation.donorEmail || "Not provided",
				totalDonated,
				donationCount,
				firstDonationDate: donations[donations.length - 1]?.createdAt,
				lastDonationDate: donations[0]?.createdAt
			}
		}, { status: 200 });

	} catch (error) {
		console.error("Error validating tax ID:", error);
		return NextResponse.json({ 
			valid: false, 
			error: "Failed to validate tax ID" 
		}, { status: 500 });
	}
}
