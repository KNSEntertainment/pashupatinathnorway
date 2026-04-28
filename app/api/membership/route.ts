import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";

export async function GET(req: NextRequest) {
	await connectDB();
	const { searchParams } = new URL(req.url);
	const email = searchParams.get("email");

	if (email) {
		// Check if email exists
		const membership = await Membership.findOne({ email });
		return NextResponse.json(membership ? [membership] : []);
	}

	// Return all memberships if no email filter
	const memberships = await Membership.find().sort({ createdAt: -1 });
	return NextResponse.json(memberships);
}

export async function POST(req: NextRequest) {
	await connectDB();
	const data = await req.json();
	const membership = await Membership.create(data);
	return NextResponse.json(membership, { status: 201 });
}
