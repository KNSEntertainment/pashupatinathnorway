import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog.Model";
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

		const blogTitle_en = formData.get("blogTitle_en");
		const blogTitle_ne = formData.get("blogTitle_ne");
		const blogTitle_no = formData.get("blogTitle_no");
		const blogDesc_en = formData.get("blogDesc_en");
		const blogDesc_ne = formData.get("blogDesc_ne");
		const blogDesc_no = formData.get("blogDesc_no");
		const blogAuthor = formData.get("blogAuthor");
		const blogDate = formData.get("blogDate");
		console.log("Received blogDate:", blogDate);

		const blogMainPicture = formData.get("blogMainPicture");
		const blogSecondPicture = formData.get("blogSecondPicture");

		console.log("blogMainPicture type:", typeof blogMainPicture);
		console.log("blogSecondPicture type:", typeof blogSecondPicture);

		if (!(blogMainPicture instanceof File)) {
			throw new Error("blogMainPicture must be a File object");
		}

		// Validate required fields
		if (!blogTitle_en || !blogDesc_en || !blogMainPicture || !blogDate) {
			return NextResponse.json({ success: false, error: "English title, description, main image or date is missing" }, { status: 400 });
		}

		// Save the files to the uploads directory
		const blogMainPictureUrl = await uploadToCloudinary(blogMainPicture, "blogs_images");
		const blogSecondPictureUrl = blogSecondPicture ? await uploadToCloudinary(blogSecondPicture, "blogs_images") : "";

		// Save blog to MongoDB
		console.log("Creating blog in database");
		const blog = await Blog.create({
			blogTitle_en,
			...(blogTitle_ne && { blogTitle_ne }),
			...(blogTitle_no && { blogTitle_no }),
			blogDesc_en,
			...(blogDesc_ne && { blogDesc_ne }),
			...(blogDesc_no && { blogDesc_no }),
			blogTitle: blogTitle_en, // Legacy field
			blogDesc: blogDesc_en, // Legacy field
			blogAuthor,
			blogMainPicture: blogMainPictureUrl,
			blogSecondPicture: blogSecondPictureUrl,
			blogDate: blogDate,
		});
		console.log("Blog created successfully:", blog);

		return NextResponse.json({ success: true, blog }, { status: 201 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
