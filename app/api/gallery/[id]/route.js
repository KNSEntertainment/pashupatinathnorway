import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Gallery from "@/models/Gallery.Model";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";

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
		const galleryData = {};
		const mediaFiles = formData.getAll("media");

		for (const [key, value] of formData.entries()) {
			if (key !== "media") {
				galleryData[key] = value;
			}
		}

		const existingGallery = await Gallery.findById(id);
		if (!existingGallery) {
			return NextResponse.json({ success: false, error: "Gallery not found" }, { status: 404 });
		}

		if (mediaFiles.length > 0) {
			const oldMedia = [...existingGallery.media];
			const newMedia = await Promise.all(mediaFiles.map(async (file) => await uploadToCloudinary(file, "gallery_images")));
			galleryData.media = newMedia;

			const updatedGallery = await Gallery.findByIdAndUpdate(id, galleryData, { new: true });

			for (const url of oldMedia) {
				try {
					await deleteFromCloudinary(url);
				} catch (deleteError) {
					console.error("Failed to delete old gallery media from Cloudinary:", deleteError);
				}
			}

			return NextResponse.json({ success: true, gallery: updatedGallery }, { status: 200 });
		}

		// Keep alt for backward compatibility
		if (galleryData.alt_en) {
			galleryData.alt = galleryData.alt_en;
		} else if (galleryData.category && !galleryData.alt) {
			galleryData.alt = galleryData.category;
		}

		const updatedGallery = await Gallery.findByIdAndUpdate(id, galleryData, { new: true });

		return NextResponse.json({ success: true, gallery: updatedGallery }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

// export async function PUT(request, { params }) {
// 	const { id } = await params;

// 	try {
// 		await connectDB();

// 		const formData = await request.formData();
// 		const galleryId = id;

// 		const galleryData = {};
// 		for (const [key, value] of formData.entries()) {
// 			if (key !== "media") {
// 				galleryData[key] = value;
// 			}
// 		}

// 		const media = formData.get("media");
// 		if (media) {
// 			galleryData.media = await uploadToCloudinary(media, "gallery_images");
// 		}

// 		const updatedgallery = await Gallery.findByIdAndUpdate(galleryId, galleryData, { new: true });

// 		if (!updatedgallery) {
// 			return NextResponse.json({ success: false, error: "gallery not found" }, { status: 404 });
// 		}

// 		return NextResponse.json({ success: true, gallery: updatedgallery }, { status: 200 });
// 	} catch (error) {
// 		console.error("Error in API route:", error);
// 		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
// 	}
// }

export async function DELETE(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		const galleryId = id;

		const deletedpartner = await Gallery.findByIdAndDelete(galleryId);

		if (!deletedpartner) {
			return NextResponse.json({ success: false, error: "gallery not found" }, { status: 404 });
		}

		if (Array.isArray(deletedpartner.media)) {
			for (const url of deletedpartner.media) {
				try {
					await deleteFromCloudinary(url);
				} catch (deleteError) {
					console.error("Failed to delete gallery media from Cloudinary:", deleteError);
				}
			}
		}

		return NextResponse.json({ success: true, message: "gallery deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function GET(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		const galleryId = id;
		const gallery = await Gallery.findById(galleryId);

		if (!gallery) {
			return NextResponse.json({ success: false, error: "gallery not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, gallery }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
