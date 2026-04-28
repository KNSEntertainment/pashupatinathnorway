import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export const config = {
	api: {
		bodyParser: false,
	},
};

export async function POST(request: Request) {
	try {
		const formData = await request.formData();
		const file = formData.get("file") as File;
		const folder = formData.get("folder") as string || "uploads";

		if (!file) {
			return NextResponse.json(
				{ error: "No file provided" },
				{ status: 400 }
			);
		}

		// Upload to Cloudinary
		const url = await uploadToCloudinary(file, folder);

		return NextResponse.json({ 
			success: true,
			url 
		});
	} catch (error) {
		console.error("Upload error:", error);
		return NextResponse.json(
			{ error: "Failed to upload file" },
			{ status: 500 }
		);
	}
}
