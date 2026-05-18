import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";

export async function GET() {
	try {
		await connectDB();
		
		// Fetch completed donations, sorted by amount in descending order
		const donations = await Donation.find({ 
			paymentStatus: "completed" 
		})
		.select("donorName donorEmail donorPhone address amount message isAnonymous paymentStatus createdAt")
		.sort({ amount: -1 })
		.lean();
		
		// Format the donor data
		const donorList = donations.map(donation => ({
			name: donation.isAnonymous ? "Anonymous Donor" : donation.donorName,
			amount: donation.amount,
			isAnonymous: donation.isAnonymous,
			date: donation.createdAt,
			email: donation.donorEmail,
			phone: donation.donorPhone,
			address: donation.address,
			message: donation.message,
			paymentStatus: donation.paymentStatus
		}));
		
		return NextResponse.json(donorList, { status: 200 });
	} catch (error) {
		console.error("Error fetching donor list:", error);
		return NextResponse.json({ error: "Failed to fetch donor list" }, { status: 500 });
	}
}
