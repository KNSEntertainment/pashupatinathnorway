import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Rituals from "@/models/Rituals.Model";
import { requireAdmin } from "@/lib/apiAuth";

// GET - List deleted rituals
export async function GET() {
	try {
		const auth = await requireAdmin();
		if (auth.response) return auth.response;

		await connectDB();

		const deletedRituals = await Rituals.find({ isDeleted: true }).sort({ deletedAt: -1 });

		return NextResponse.json({
			message: "Deleted rituals retrieved successfully",
			data: deletedRituals
		});
	} catch (error) {
		console.error("Error fetching deleted rituals:", error);
		return NextResponse.json({ error: "Failed to fetch deleted rituals" }, { status: 500 });
	}
}

// POST - Restore deleted ritual
export async function POST(request: NextRequest) {
	try {
		const auth = await requireAdmin();
		if (auth.response) return auth.response;

		await connectDB();

		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json({ error: "Ritual ID is required" }, { status: 400 });
		}

		const ritual = await Rituals.findByIdAndUpdate(
			id,
			{
				isDeleted: false,
				deletedAt: null,
				isActive: true
			},
			{ new: true }
		);

		if (!ritual) {
			return NextResponse.json({ error: "Ritual not found" }, { status: 404 });
		}

		return NextResponse.json({
			message: "Ritual restored successfully",
			data: ritual
		});
	} catch (error) {
		console.error("Error restoring ritual:", error);
		return NextResponse.json({ error: "Failed to restore ritual" }, { status: 500 });
	}
}
