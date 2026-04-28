import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Circular from "@/models/Circular.Model";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export const config = {
	api: {
		bodyParser: false,
	},
};
export async function GET(req, { params }) {
	const { id } = await params;
	console.log("Received ID:", id);

	await connectDB();

	try {
		const circular = await Circular.findById(id);

		if (!circular) {
			console.error("Circular not found:", id);
			return NextResponse.json({ success: false, error: "Circular not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, circular });
	} catch (error) {
		console.error("Error fetching circular:", error);
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}

export async function PUT(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		const formData = await request.formData();

		const existingCircular = await Circular.findById(id);
		if (!existingCircular) {
			return NextResponse.json({ success: false, error: "Circular not found" }, { status: 404 });
		}

		const getLocalized = (mapLike, key) => {
			if (!mapLike) return "";
			if (typeof mapLike.get === "function") return mapLike.get(key) || "";
			return mapLike[key] || "";
		};

		const getField = (name, fallback) => {
			if (!formData.has(name)) return fallback;
			const value = formData.get(name);
			return value === null || value === undefined ? fallback : value.toString();
		};

		// Update multi-language fields
		const circularTitle = {
			en: getField("circularTitle_en", getLocalized(existingCircular.circularTitle, "en")),
			no: getField("circularTitle_no", getLocalized(existingCircular.circularTitle, "no")),
			ne: getField("circularTitle_ne", getLocalized(existingCircular.circularTitle, "ne")),
		};

		const circularDesc = {
			en: getField("circularDesc_en", getLocalized(existingCircular.circularDesc, "en")),
			no: getField("circularDesc_no", getLocalized(existingCircular.circularDesc, "no")),
			ne: getField("circularDesc_ne", getLocalized(existingCircular.circularDesc, "ne")),
		};

		const circularAuthor = {
			en: getField("circularAuthor_en", getLocalized(existingCircular.circularAuthor, "en")),
			no: getField("circularAuthor_no", getLocalized(existingCircular.circularAuthor, "no")),
			ne: getField("circularAuthor_ne", getLocalized(existingCircular.circularAuthor, "ne")),
		};

		const publicationStatus = getField("publicationStatus", existingCircular.publicationStatus);
		const circularPublishedAt = getField("circularPublishedAt", existingCircular.circularPublishedAt);

		// Handle images
		let circularMainPictureUrl = existingCircular.circularMainPicture;
		let circularSecondPictureUrl = existingCircular.circularSecondPicture;
		let oldMainPictureUrl = null;
		let oldSecondPictureUrl = null;

		if (formData.get("circularMainPicture")) {
			oldMainPictureUrl = existingCircular.circularMainPicture || null;
			circularMainPictureUrl = await uploadToCloudinary(formData.get("circularMainPicture"), "circulars");
		}

		if (formData.get("circularSecondPicture")) {
			oldSecondPictureUrl = existingCircular.circularSecondPicture || null;
			circularSecondPictureUrl = await uploadToCloudinary(formData.get("circularSecondPicture"), "circulars");
		}

		existingCircular.circularTitle = circularTitle;
		existingCircular.circularDesc = circularDesc;
		existingCircular.circularAuthor = circularAuthor;
		existingCircular.publicationStatus = publicationStatus;
		const publishedAtDate = circularPublishedAt ? new Date(circularPublishedAt) : null;
		existingCircular.circularPublishedAt = publishedAtDate && !Number.isNaN(publishedAtDate.getTime()) ? publishedAtDate : null;
		existingCircular.circularMainPicture = circularMainPictureUrl;
		existingCircular.circularSecondPicture = circularSecondPictureUrl;

		await existingCircular.save();

		if (oldMainPictureUrl && circularMainPictureUrl && oldMainPictureUrl !== circularMainPictureUrl) {
			try {
				await deleteFromCloudinary(oldMainPictureUrl, "image");
			} catch (deleteError) {
				console.error("Failed to delete old circular main image from Cloudinary:", deleteError);
			}
		}

		if (oldSecondPictureUrl && circularSecondPictureUrl && oldSecondPictureUrl !== circularSecondPictureUrl) {
			try {
				await deleteFromCloudinary(oldSecondPictureUrl, "image");
			} catch (deleteError) {
				console.error("Failed to delete old circular secondary image from Cloudinary:", deleteError);
			}
		}

		return NextResponse.json({ success: true, circular: existingCircular }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function DELETE(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		console.log("Deleting circular with ID:", id);

		const deletedblog = await Circular.findByIdAndDelete(id);

		if (!deletedblog) {
			return NextResponse.json({ success: false, error: "Circular not found" }, { status: 404 });
		}

		if (deletedblog.circularMainPicture) {
			try {
				await deleteFromCloudinary(deletedblog.circularMainPicture, "image");
			} catch (deleteError) {
				console.error("Failed to delete circular main image from Cloudinary:", deleteError);
			}
		}

		if (deletedblog.circularSecondPicture) {
			try {
				await deleteFromCloudinary(deletedblog.circularSecondPicture, "image");
			} catch (deleteError) {
				console.error("Failed to delete circular secondary image from Cloudinary:", deleteError);
			}
		}

		return NextResponse.json({ success: true, message: "Circular deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
