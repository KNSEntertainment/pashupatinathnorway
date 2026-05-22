import { NextResponse } from "next/server";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";
import { requireAdmin } from "@/lib/apiAuth";

export const config = {
	api: {
		bodyParser: false,
	},
};

export async function POST(request: Request) {
	try {
		const auth = await requireAdmin();
		if (auth.response) return auth.response;

		const formData = await request.formData();
		const file = formData.get("file") as File;
		const folder = formData.get("folder") as string || "uploads";

		if (!file) {
			return NextResponse.json(
				{ error: "No file provided" },
				{ status: 400 }
			);
		}

		const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "application/pdf"]);
		if (!allowedTypes.has(file.type)) {
			return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
		}

		const maxFileSize = 5 * 1024 * 1024;
		if (file.size > maxFileSize) {
			return NextResponse.json({ error: "File size must be 5MB or less" }, { status: 400 });
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
