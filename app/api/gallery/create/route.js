import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Gallery from "@/models/Gallery.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export const config = {
	api: {
		bodyParser: false,
	},
};

// export async function POST(request) {
// 	try {
// 		await connectDB();

// 		const formData = await request.formData();
// 		console.log("Received form data:", Object.fromEntries(formData));

// 		const category = formData.get("category");
// 		const alt = formData.get("alt");
// 		const media = formData.get("media");

// 		// Validate input
// 		if (!category || !media || !(media instanceof Blob)) {
// 			return NextResponse.json({ success: false, error: "Required fields are missing or invalid" }, { status: 400 });
// 		}

// 		// Save file to the uploads directory
// 		const mediaUrl = await uploadToCloudinary(media, "gallery_images");

// 		// Create DB entry
// 		const galleryItem = await Gallery.create({
// 			media: mediaUrl,
// 			category,
// 			alt: alt || "",
// 		});

// 		console.log("Gallery item created successfully:", galleryItem);

// 		return NextResponse.json({ success: true, galleryItem }, { status: 201 });
// 	} catch (error) {
// 		console.error("Error in API route:", error);
// 		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
// 	}
// }

export async function POST(request) {
	try {
		await connectDB();
		const formData = await request.formData();

		const category = formData.get("category");
		const alt_en = formData.get("alt_en");
		const alt_ne = formData.get("alt_ne");
		const alt_no = formData.get("alt_no");
		const mediaFiles = formData.getAll("media"); // Get multiple files

		console.log("Received multilingual data:", { category, alt_en, alt_ne, alt_no });

		if (!mediaFiles.length) {
			return NextResponse.json({ success: false, error: "Required fields are missing or invalid" }, { status: 400 });
		}

		// Upload all files
		const mediaUrls = await Promise.all(mediaFiles.map(async (file) => await uploadToCloudinary(file, "gallery_images")));

		// Create DB entry
		const galleryItem = await Gallery.create({
			media: mediaUrls,
			category: category,
			alt: alt_en || category, // Keep for backward compatibility
			alt_en: alt_en || category,
			alt_ne: alt_ne || "",
			alt_no: alt_no || "",
		});

		console.log("Gallery item created:", galleryItem);

		return NextResponse.json({ success: true, galleryItem }, { status: 201 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
