import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Department from "@/models/Department.Model";

export async function POST(req) {
	try {
		await connectDB();

		const { departments } = await req.json();

		if (!Array.isArray(departments)) {
			return NextResponse.json({ error: "Invalid departments array" }, { status: 400 });
		}

		// Update each department's order
		const updatePromises = departments.map((dept, index) => Department.findByIdAndUpdate(dept._id, { order: index }, { new: true }));

		await Promise.all(updatePromises);

		return NextResponse.json({ success: true, message: "Order updated successfully" });
	} catch (error) {
		console.error("Error reordering departments:", error);
		return NextResponse.json({ error: "Failed to update order" }, { status: 500 });
	}
}
