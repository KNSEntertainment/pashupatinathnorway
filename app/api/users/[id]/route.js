export async function PUT(request, { params }) {
	const { id } = params;
	try {
		await connectDB();
		const body = await request.json();
		// Only allow updating certain fields for security
		const allowedFields = ["fullName", "email", "userName", "role", "phone"];
		const updateData = {};
		for (const key of allowedFields) {
			if (body[key] !== undefined) updateData[key] = body[key];
		}
		const updatedUser = await User.findByIdAndUpdate(id, updateData, { new: true });
		if (!updatedUser) {
			return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
		}
		return NextResponse.json({ success: true, user: updatedUser }, { status: 200 });
	} catch (error) {
		console.error("Error updating user:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User.Model";

export async function DELETE(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		const userId = id;

		const deleteduser = await User.findByIdAndDelete(userId);

		if (!deleteduser) {
			return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, message: "User deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
