import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ExecutiveMember from "@/models/ExecutiveMember.Model";

export async function GET() {
	try {
		await connectDB();
		const members = await ExecutiveMember.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
		return NextResponse.json(members);
	} catch (error) {
		console.error("Error fetching executive members:", error);
		return NextResponse.json({ error: "Failed to fetch executive members." }, { status: 500 });
	}
}
