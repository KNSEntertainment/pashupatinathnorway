import { NextResponse } from "next/server";
import { jwtVerify } from "jose";
import connectDB from "@/lib/mongodb";
import Event from "@/models/Event.Model";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";

const JWT_SECRET = process.env.JWT_SECRET_KEY;

export const config = {
	api: {
		bodyParser: false,
	},
};

export async function PUT(request, { params }) {
	const { id } = await params;

	try {
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
		await handleUpload("eventposter2", "eventposter2Url");
		await handleUpload("eventposter3", "eventposter3Url");
		await handleUpload("eventvideo", "eventvideoUrl");

		const removeEventPoster2 = formData.get("removeEventPoster2") === "true";
		const removeEventPoster3 = formData.get("removeEventPoster3") === "true";

		const handleRemove = async (removeFlag, urlField) => {
			if (!removeFlag) return;
			if (eventData[urlField]) return;
			if (event[urlField]) {
				eventData[urlField] = null;
				urlsToDelete.push(event[urlField]);
			}
		};

		await handleRemove(removeEventPoster2, "eventposter2Url");
		await handleRemove(removeEventPoster3, "eventposter3Url");

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
		await connectDB();

		const token = request.cookies.get("authToken")?.value;
		if (!token) {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}
		let payload;
		try {
			const secretKey = new TextEncoder().encode(JWT_SECRET);
			({ payload } = await jwtVerify(token, secretKey));
		} catch {
			return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
		}
		const role = payload?.role;
		if (!role || !["admin"].includes(role)) {
			return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
		}

		const event = await Event.findById(id);
		if (!event) {
			return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
		}

		await Event.findByIdAndDelete(id);

		// Delete images from Cloudinary
		if (event.eventposterUrl) await deleteFromCloudinary(event.eventposterUrl);
		if (event.eventposter2Url) await deleteFromCloudinary(event.eventposter2Url);
		if (event.eventposter3Url) await deleteFromCloudinary(event.eventposter3Url);
		if (event.eventvideoUrl) await deleteFromCloudinary(event.eventvideoUrl);

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
