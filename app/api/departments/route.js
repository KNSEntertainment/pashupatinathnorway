import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Department from "@/models/Department.Model";

export async function GET() {
	try {
		await connectDB();

		const departments = await Department.find({ isActive: true }).sort({ order: 1, createdAt: -1 });

		return NextResponse.json({ success: true, departments });
	} catch (error) {
		console.error("Error fetching departments:", error);
		return NextResponse.json({ error: "Failed to fetch departments." }, { status: 500 });
	}
}
