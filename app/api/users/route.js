import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User.Model";

export async function GET(req) {
	try {
		await connectDB();
		const { searchParams } = new URL(req.url);
		const email = searchParams.get("email");

		if (email) {
			// Return specific user by email
			const user = await User.findOne({ email }).select("-password -resetToken -setupToken");
			if (!user) {
				return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
			}
			return NextResponse.json(user, { status: 200 });
		}

		// Return all users
		const users = await User.find();
		return NextResponse.json({ success: true, users }, { status: 200 });
	} catch (error) {
		console.error("Error fetching users:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
