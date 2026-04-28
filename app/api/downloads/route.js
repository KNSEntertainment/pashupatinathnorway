import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Download from "@/models/Download.Model";

export async function GET() {
	try {
		await connectDB();
		const downloads = await Download.find().sort({ createdAt: -1 });
		return NextResponse.json({ success: true, downloads }, { status: 200 });
	} catch (error) {
		console.error("Error fetching downloads:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function POST(request) {
	try {
		await connectDB();
		const body = await request.json();
		const { title, date, fileUrl, imageUrl = "", category } = body;
		if (!title || !date || !fileUrl || !category) {
			return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
		}
		const download = await Download.create({
			title,
			date,
			fileUrl,
			imageUrl,
			category,
		});
		return NextResponse.json({ success: true, download }, { status: 201 });
	} catch (error) {
		console.error("Error creating download:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
