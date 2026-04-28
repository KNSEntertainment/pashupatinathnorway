import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Circular from "@/models/Circular.Model";

export async function GET() {
	try {
		await connectDB();
		const circulars = await Circular.find().sort({ circularPublishedAt: -1, createdAt: -1 });
		return NextResponse.json({ success: true, circulars }, { status: 200 });
	} catch (error) {
		console.error("Error fetching circulars:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
