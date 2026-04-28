import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Circular from "@/models/Circular.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export const config = {
	api: {
		bodyParser: false,
	},
};

export async function POST(request) {
	try {
		await connectDB();

		const formData = await request.formData();
		console.log("Received form data: ", formData);

		// Get multi-language fields
		const circularTitle = {
			en: formData.get("circularTitle_en")?.toString() || "",
			no: formData.get("circularTitle_no")?.toString() || "",
			ne: formData.get("circularTitle_ne")?.toString() || "",
		};
		if (!circularTitle.en && !circularTitle.no && !circularTitle.ne) {
			return NextResponse.json({ success: false, error: "At least one title is required" }, { status: 400 });
		}

		const circularDesc = {
			en: formData.get("circularDesc_en")?.toString() || "",
			no: formData.get("circularDesc_no")?.toString() || "",
			ne: formData.get("circularDesc_ne")?.toString() || "",
		};

		const circularAuthor = {
			en: formData.get("circularAuthor_en")?.toString() || "",
			no: formData.get("circularAuthor_no")?.toString() || "",
			ne: formData.get("circularAuthor_ne")?.toString() || "",
		};

		const publicationStatus = formData.get("publicationStatus")?.toString() || "draft";
		const circularPublishedAt = formData.get("circularPublishedAt")?.toString() || "";
		const circularMainPicture = formData.get("circularMainPicture");
		const circularSecondPicture = formData.get("circularSecondPicture");

		// Generate slug from English title (fallback to first available language)
		const titleForSlug = circularTitle.en || circularTitle.no || circularTitle.ne || "circular";
		let slug = titleForSlug
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, "-")
			.replace(/(^-|-$)+/g, "");
		if (!slug) {
			slug = `circular-${Date.now()}`;
		}

		let mainPictureUrl = "";
		if (circularMainPicture && typeof circularMainPicture.arrayBuffer === "function") {
			mainPictureUrl = await uploadToCloudinary(circularMainPicture, "circulars");
		}

		let secondPictureUrl = "";
		if (circularSecondPicture && typeof circularSecondPicture.arrayBuffer === "function") {
			secondPictureUrl = await uploadToCloudinary(circularSecondPicture, "circulars");
		}

		const publishedAt = circularPublishedAt ? new Date(circularPublishedAt) : null;
		const circular = await Circular.create({
			slug,
			circularTitle,
			circularDesc,
			circularAuthor,
			circularMainPicture: mainPictureUrl || null,
			circularSecondPicture: secondPictureUrl || null,
			publicationStatus,
			circularPublishedAt: publishedAt && !Number.isNaN(publishedAt.getTime()) ? publishedAt : null,
		});

		return NextResponse.json({ success: true, circular }, { status: 201 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
