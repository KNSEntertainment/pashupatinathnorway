import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notice from "@/models/Notice.Model";

export async function GET() {
	try {
		await connectDB();
		const notices = await Notice.find().sort({ noticedate: -1 });
		return NextResponse.json({ success: true, notices }, { status: 200 });
	} catch (error) {
		console.error("Error fetching notices:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
