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
