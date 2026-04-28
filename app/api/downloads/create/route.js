import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Download from "@/models/Download.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export async function POST(request) {
	try {
		await connectDB();
		const formData = await request.formData();
		const title_en = formData.get("title_en");
		const title_ne = formData.get("title_ne");
		const title_no = formData.get("title_no");
		const date = formData.get("date");
		const category = formData.get("category");
		const file = formData.get("file");
		const image = formData.get("image");

		if (!title_en || !date || !category || !file) {
			return NextResponse.json({ success: false, error: "Missing required fields." }, { status: 400 });
		}

		// Upload file to Cloudinary (Downloads folder)
		const fileUrl = await uploadToCloudinary(file, "Downloads");
		let imageUrl = "";
		if (image) {
			try {
				imageUrl = await uploadToCloudinary(image, "Downloads");
			} catch (e) {
				imageUrl = "";
				console.error("Error uploading image to Cloudinary:", e);
			}
		}

		const download = await Download.create({
			title_en,
			...(title_ne && { title_ne }),
			...(title_no && { title_no }),
			title: title_en, // Legacy field for backward compatibility
			date,
			category,
			fileUrl,
			imageUrl,
			fileSize: file.size,
			imageSize: image ? image.size : undefined,
		});
		return NextResponse.json({ success: true, download }, { status: 201 });
	} catch (error) {
		console.error("Error creating download:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
