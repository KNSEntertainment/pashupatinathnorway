import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ManagementHistory from "@/models/ManagementHistory.Model";

export async function GET(req: NextRequest) {
	await connectDB();
	const { searchParams } = new URL(req.url);
	const tenure = searchParams.get("tenure");

	const records = await ManagementHistory.find({}).sort({
		termEnd: -1,
		membershipType: 1,
		displayOrder: 1,
	});

	if (!tenure) {
		return NextResponse.json(records);
	}

	const filtered = records.filter((record) => {
		const startYear = new Date(record.termStart).getFullYear();
		const endYear = new Date(record.termEnd).getFullYear();
		const label = startYear === endYear ? `${startYear}` : `${startYear}–${endYear}`;
		return label === tenure;
	});

	return NextResponse.json(filtered);
}
