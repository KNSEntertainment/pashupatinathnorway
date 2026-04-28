import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Setting from "@/models/Setting.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export async function POST(request) {
	try {
		await connectDB();

		// Check if request is FormData (has file) or JSON
		const contentType = request.headers.get("content-type");
		let data;

		if (contentType && contentType.includes("multipart/form-data")) {
			const formData = await request.formData();
			data = Object.fromEntries(formData);

			// Upload companyLogo to Cloudinary if present
			if (data.companyLogo && data.companyLogo instanceof File) {
				data.companyLogo = await uploadToCloudinary(data.companyLogo, "settings");
			}
		} else {
			data = await request.json();
		}

		const newSetting = new Setting(data);
		await newSetting.save();
		return NextResponse.json({ success: true, setting: newSetting }, { status: 201 });
	} catch (error) {
		console.error("Error creating setting:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function GET() {
	try {
		await connectDB();
		const settings = await Setting.find();
		return NextResponse.json(settings, { status: 200 });
	} catch (error) {
		console.error("Error fetching settings:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
