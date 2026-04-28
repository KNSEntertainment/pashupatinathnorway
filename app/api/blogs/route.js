import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog.Model";

export async function GET() {
	try {
		await connectDB();
		const blogs = await Blog.find();
		return NextResponse.json({ success: true, blogs }, { status: 200 });
	} catch (error) {
		console.error("Error fetching Blogs:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
