import { NextResponse } from "next/server";
import { sendContactEmail } from "@/lib/email";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message.Model";

export async function POST(req) {
	let messageSaved = false;
	let emailSent = false;
	let savedMessage = null;

	try {
		await connectDB();
		const { name, email, message } = await req.json();

		if (!name || !email || !message) {
			return NextResponse.json({ error: "All fields are required." }, { status: 400 });
		}

		// Step 1: Save message to database
		try {
			savedMessage = await Message.create({ name, email, message });
			messageSaved = true;
		} catch (dbError) {
			console.error("Database error:", dbError);
			return NextResponse.json(
				{
					error: "Failed to save message to database.",
					messageSaved: false,
					emailSent: false,
				},
				{ status: 500 }
			);
		}

		// Step 2: Send email
		try {
			await sendContactEmail({ name, email, message });
			emailSent = true;
		} catch (emailError) {
			console.error("Email error:", emailError);
			return NextResponse.json(
				{
					warning: "Message saved but failed to send email notification.",
					messageSaved: true,
					emailSent: false,
					messageId: savedMessage._id,
				},
				{ status: 207 } // 207 Multi-Status
			);
		}

		// Both operations succeeded
		return NextResponse.json(
			{
				success: true,
				message: "Message sent and saved successfully.",
				messageSaved: true,
				emailSent: true,
				messageId: savedMessage._id,
			},
			{ status: 200 }
		);
	} catch (error) {
		console.error("Unexpected error:", error);
		return NextResponse.json(
			{
				error: "An unexpected error occurred.",
				messageSaved,
				emailSent,
			},
			{ status: 500 }
		);
	}
}
