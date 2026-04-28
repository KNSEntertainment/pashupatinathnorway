import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Subscriber from "@/models/Subscriber.Model";

export async function DELETE(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		const subscriberId = id;

		const deletedsubscriber = await Subscriber.findByIdAndDelete(subscriberId);

		if (!deletedsubscriber) {
			return NextResponse.json({ success: false, error: "subscriber not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, message: "subscriber deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
