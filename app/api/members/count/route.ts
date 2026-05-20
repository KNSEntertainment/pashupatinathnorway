import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";

export async function GET() {
	try {
		await connectDB();
		
		// Count total members
		const totalCount = await Membership.countDocuments();
		
		return NextResponse.json({ count: totalCount }, { status: 200 });
	} catch (error) {
		console.error("Error fetching member count:", error);
		return NextResponse.json({ error: "Failed to fetch member count" }, { status: 500 });
	}
}
