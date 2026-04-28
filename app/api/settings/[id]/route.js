import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Setting from "@/models/Setting.Model";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export async function PUT(request) {
	try {
		await connectDB();

		// Check if request is FormData (has file) or JSON
		const contentType = request.headers.get("content-type");
		let data;

		let oldCompanyLogo = null;

		if (contentType && contentType.includes("multipart/form-data")) {
			const formData = await request.formData();
			data = Object.fromEntries(formData);

			if (data._id) {
				const existingSetting = await Setting.findById(data._id);
				oldCompanyLogo = existingSetting?.companyLogo || null;
			}

			// Upload companyLogo to Cloudinary if present and is a file
			if (data.companyLogo && data.companyLogo instanceof File) {
				data.companyLogo = await uploadToCloudinary(data.companyLogo, "settings");
			}
		} else {
			data = await request.json();
		}

		const { _id, ...updateData } = data;
		const updatedSetting = await Setting.findByIdAndUpdate(_id, updateData, { new: true });
		if (!updatedSetting) {
			return NextResponse.json({ success: false, error: "Setting not found" }, { status: 404 });
		}

		if (oldCompanyLogo && updateData.companyLogo && oldCompanyLogo !== updateData.companyLogo) {
			try {
				await deleteFromCloudinary(oldCompanyLogo, "image");
			} catch (error) {
				console.error("Failed to delete old company logo from Cloudinary:", error);
			}
		}

		return NextResponse.json({ success: true, setting: updatedSetting }, { status: 200 });
	} catch (error) {
		console.error("Error updating setting:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
