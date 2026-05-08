import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";

export async function GET() {
	try {
		await connectDB();
		const result = await Donation.aggregate([
			{
				$group: {
					_id: null,
					totalAmount: { $sum: "$amount" },
					count: { $sum: 1 }
				}
			}
		]);
		
		const total = result.length > 0 ? result[0].totalAmount : 0;
		const count = result.length > 0 ? result[0].count : 0;
		
		return NextResponse.json({ 
			totalAmount: total,
			totalDonations: count
		}, { status: 200 });
	} catch (error) {
		console.error("Error fetching total donations:", error);
		return NextResponse.json({ error: "Failed to fetch total donations" }, { status: 500 });
	}
}
