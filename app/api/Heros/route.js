import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Hero from "@/models/Hero.Model";

export async function GET() {
	try {
		await connectDB();

		const Heros = await Hero.find();

		return NextResponse.json({ success: true, Heros }, { status: 200 });
	} catch (error) {
		console.error("Error fetching Heros:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
