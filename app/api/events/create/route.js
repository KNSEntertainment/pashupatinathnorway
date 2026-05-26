import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/models/Event.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";
import { requireAdmin } from "@/lib/apiAuth";

export const config = {
	api: {
		bodyParser: false,
	},
};

export async function POST(request) {
	try {
		const auth = await requireAdmin();
		if (auth.response) return auth.response;

		await connectDB();

		const formData = await request.formData();
		console.log("Received form data", formData);
		const eventname = formData.get("eventname");
		const eventdescription = formData.get("eventdescription");
		const eventvenue = formData.get("eventvenue");
		const eventdate = formData.get("eventdate");
		const eventtime = formData.get("eventtime");
		const eventposter = formData.get("eventposter");
		
		// New pricing and registration fields
		const memberPrice = formData.get("memberPrice");
		const guestPrice = formData.get("guestPrice");
		const allowGuestRegistration = formData.get("allowGuestRegistration") === "true";
		const registrationDeadline = formData.get("registrationDeadline");
		const maxAttendees = formData.get("maxAttendees");
		
		// Festival linkage fields
		const festivalId = formData.get("festivalId");
		if (!eventposter || typeof eventposter.arrayBuffer !== "function") {
			return NextResponse.json({ success: false, error: "Invalid file upload for eventposter" }, { status: 400 });
		}


		// Validate input
		if (!eventname || !eventposter) {
			return NextResponse.json({ success: false, error: "Required fields are missing" }, { status: 400 });
		}

		// Format the date
		const formattedDate = eventdate ? new Date(eventdate).toISOString().split("T")[0] : "";

		// Upload images to Cloudinary
		const eventposterUrl = await uploadToCloudinary(eventposter, "rspnorway_event_images");

		// Save event to MongoDB
		console.log("Creating event in database");
		const event = await Event.create({
			eventname,
			eventdescription,
			eventvenue,
			eventdate: formattedDate,
			eventtime,
			eventposterUrl,
			// New pricing and registration fields
			memberPrice: memberPrice ? parseFloat(memberPrice) : 0,
			guestPrice: guestPrice ? parseFloat(guestPrice) : 0,
			allowGuestRegistration,
			registrationDeadline: registrationDeadline ? new Date(registrationDeadline) : null,
			maxAttendees: maxAttendees ? parseInt(maxAttendees) : null,
			// Festival linkage fields
			festivalId: festivalId || null,
		});
		console.log("Event created successfully:", event);

		return NextResponse.json({ success: true, event }, { status: 201 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
