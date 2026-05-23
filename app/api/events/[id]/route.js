import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/models/Event.Model";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";
import { requireAdmin } from "@/lib/apiAuth";

export const config = {
	api: {
		bodyParser: false,
	},
};

export async function PUT(request, { params }) {
	const { id } = await params;

	try {
		const auth = await requireAdmin();
		if (auth.response) return auth.response;

		await connectDB();

		const formData = await request.formData();
		const eventId = id;

		const event = await Event.findById(eventId);
		if (!event) {
			return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
		}
		const urlsToDelete = [];

		const eventData = {};
		const textKeys = ["eventname", "eventdescription", "eventvenue", "eventdate", "eventtime"];
		for (const key of textKeys) {
			if (formData.has(key)) {
				const value = formData.get(key);
				if (key === "eventdate") {
					eventData.eventdate = value ? new Date(String(value)).toISOString().split("T")[0] : "";
				} else if (value !== null && value !== undefined) {
					eventData[key] = String(value);
				}
			}
		}

		// Handle new pricing and registration fields
		if (formData.has("memberPrice")) {
			const memberPrice = formData.get("memberPrice");
			eventData.memberPrice = memberPrice ? parseFloat(memberPrice) : 0;
		}
		
		if (formData.has("guestPrice")) {
			const guestPrice = formData.get("guestPrice");
			eventData.guestPrice = guestPrice ? parseFloat(guestPrice) : 0;
		}
		
		if (formData.has("allowGuestRegistration")) {
			eventData.allowGuestRegistration = formData.get("allowGuestRegistration") === "true";
		}
		
		if (formData.has("registrationDeadline")) {
			const registrationDeadline = formData.get("registrationDeadline");
			eventData.registrationDeadline = registrationDeadline ? new Date(String(registrationDeadline)) : null;
		}
		
		if (formData.has("maxAttendees")) {
			const maxAttendees = formData.get("maxAttendees");
			eventData.maxAttendees = maxAttendees ? parseInt(maxAttendees) : null;
		}

		const handleUpload = async (formKey, urlField) => {
			const file = formData.get(formKey);
			if (file && typeof file.arrayBuffer === "function" && file.size > 0) {
				const oldUrl = event[urlField];
				const newUrl = await uploadToCloudinary(file, "rspnorway_event_images");
				eventData[urlField] = newUrl;
				if (oldUrl && oldUrl !== newUrl) {
					urlsToDelete.push(oldUrl);
				}
			}
		};

		await handleUpload("eventposter", "eventposterUrl");


		const updatedEvent = await Event.findByIdAndUpdate(eventId, eventData, { new: true });

		for (const url of urlsToDelete) {
			try {
				await deleteFromCloudinary(url);
			} catch (deleteError) {
				console.error("Failed to delete old event asset from Cloudinary:", deleteError);
			}
		}

		return NextResponse.json({ success: true, event: updatedEvent }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

// DELETE API to delete event
export async function DELETE(request, { params }) {
	const { id } = await params;

	try {
		const auth = await requireAdmin();
		if (auth.response) return auth.response;

		await connectDB();

		const event = await Event.findById(id);
		if (!event) {
			return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
		}

		await Event.findByIdAndDelete(id);

		// Delete images from Cloudinary
		if (event.eventposterUrl) await deleteFromCloudinary(event.eventposterUrl);

		return NextResponse.json({ success: true, message: "Event deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

// GET API to fetch event details
export async function GET(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		const event = await Event.findById(id);
		if (!event) {
			return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, event }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
