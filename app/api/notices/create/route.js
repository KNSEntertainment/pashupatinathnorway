import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Notice from "@/models/Notice.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export async function POST(request) {
	try {
		await connectDB();

		const formData = await request.formData();

		const noticetitle = formData.get("noticetitle");
		const noticedate = formData.get("noticedate");
		const notice = formData.get("notice");
		const noticeImageFile = formData.get("noticeimage");

		if (!noticetitle || !noticedate || !notice) {
			return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
		}

		let noticeImageUrl = "";
		if (noticeImageFile && noticeImageFile.size > 0) {
			noticeImageUrl = await uploadToCloudinary(noticeImageFile, "notices");
		}

		const newNotice = await Notice.create({
			noticetitle,
			noticedate,
			notice,
			noticeimage: noticeImageUrl,
		});

		return NextResponse.json({ success: true, notice: newNotice }, { status: 201 });
	} catch (error) {
		console.error("Error creating notice:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
