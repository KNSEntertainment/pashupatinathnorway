import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/models/Event.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export const config = {
	api: {
		bodyParser: false,
	},
};

export async function POST(request) {
	try {
		await connectDB();

		const formData = await request.formData();
		console.log("Received form data", formData);
		const eventname = formData.get("eventname");
		const eventdescription = formData.get("eventdescription");
		const eventvenue = formData.get("eventvenue");
		const eventdate = formData.get("eventdate");
		const eventtime = formData.get("eventtime");
		const eventposter = formData.get("eventposter");
		if (!eventposter || typeof eventposter.arrayBuffer !== "function") {
			return NextResponse.json({ success: false, error: "Invalid file upload for eventposter" }, { status: 400 });
		}

		const eventposter2 = formData.get("eventposter2");
		const eventposter3 = formData.get("eventposter3");
		const eventvideo = formData.get("eventvideo");

		// Validate input
		if (!eventname || !eventposter) {
			return NextResponse.json({ success: false, error: "Required fields are missing" }, { status: 400 });
		}

		// Format the date
		const formattedDate = eventdate ? new Date(eventdate).toISOString().split("T")[0] : "";

		// Upload images to Cloudinary
		const eventposterUrl = await uploadToCloudinary(eventposter, "rspnorway_event_images");
		const eventposter2Url = eventposter2 ? await uploadToCloudinary(eventposter2, "rspnorway_event_images") : null;
		const eventposter3Url = eventposter3 ? await uploadToCloudinary(eventposter3, "rspnorway_event_images") : null;
		const eventvideoUrl = eventvideo ? await uploadToCloudinary(eventvideo, "rspnorway_event_images") : null;

		// Save event to MongoDB
		console.log("Creating event in database");
		const event = await Event.create({
			eventname,
			eventdescription,
			eventvenue,
			eventdate: formattedDate,
			eventtime,
			eventposterUrl,
			eventposter2Url,
			eventposter3Url,
			eventvideoUrl,
		});
		console.log("Event created successfully:", event);

		return NextResponse.json({ success: true, event }, { status: 201 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
