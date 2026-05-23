import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Festivals from "@/models/Festivals.Model";
import { requireAdmin } from "@/lib/apiAuth";

// GET - List deleted festivals
export async function GET() {
	try {
		const auth = await requireAdmin();
		if (auth.response) return auth.response;

		await connectDB();

		const deletedFestivals = await Festivals.find({ isDeleted: true }).sort({ deletedAt: -1 });

		return NextResponse.json({
			message: "Deleted festivals retrieved successfully",
			data: deletedFestivals
		});
	} catch (error) {
		console.error("Error fetching deleted festivals:", error);
		return NextResponse.json({ error: "Failed to fetch deleted festivals" }, { status: 500 });
	}
}

// POST - Restore deleted festival
export async function POST(request: NextRequest) {
	try {
		const auth = await requireAdmin();
		if (auth.response) return auth.response;

		await connectDB();

		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json({ error: "Festival ID is required" }, { status: 400 });
		}

		const festival = await Festivals.findByIdAndUpdate(
			id,
			{
				isDeleted: false,
				deletedAt: null,
				isActive: true
			},
			{ new: true }
		);

		if (!festival) {
			return NextResponse.json({ error: "Festival not found" }, { status: 404 });
		}

		return NextResponse.json({
			message: "Festival restored successfully",
			data: festival
		});
	} catch (error) {
		console.error("Error restoring festival:", error);
		return NextResponse.json({ error: "Failed to restore festival" }, { status: 500 });
	}
}
