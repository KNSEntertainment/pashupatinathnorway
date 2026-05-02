import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";
import Membership from "@/models/Membership.Model";

export async function POST(request: Request) {
	try {
		await connectDB();

		const { personalNumber } = await request.json();

		// Validate personal number
		if (!personalNumber || !/^\d{11}$/.test(personalNumber)) {
			return NextResponse.json({ error: "Personal number must be exactly 11 digits" }, { status: 400 });
		}

		// First verify the personal number exists in membership records
		const membership = await Membership.findOne({ personalNumber });
		if (!membership) {
			return NextResponse.json({ error: "No member found with this personal number" }, { status: 404 });
		}

		// Find all donations with this personal number
		const donations = await Donation.find({ 
			personalNumber,
			paymentStatus: "completed" 
		}).sort({ createdAt: -1 });

		// Calculate statistics
		const stats = {
			totalDonated: donations.reduce((sum, donation) => sum + donation.amount, 0),
			donationCount: donations.length,
			thisYear: donations
				.filter(donation => new Date(donation.createdAt).getFullYear() === new Date().getFullYear())
				.reduce((sum, donation) => sum + donation.amount, 0),
			thisMonth: donations
				.filter(donation => {
					const donationDate = new Date(donation.createdAt);
					const currentDate = new Date();
					return donationDate.getMonth() === currentDate.getMonth() && 
						   donationDate.getFullYear() === currentDate.getFullYear();
				})
				.reduce((sum, donation) => sum + donation.amount, 0),
		};

		return NextResponse.json({
			success: true,
			member: {
				name: `${membership.firstName} ${membership.lastName}`,
				email: membership.email,
				membershipStatus: membership.membershipStatus
			},
			donations,
			stats
		}, { status: 200 });

	} catch (error) {
		console.error("Error looking up donations by personal number:", error);
		return NextResponse.json({ error: "Failed to lookup donations" }, { status: 500 });
	}
}
