import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog.Model";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export const config = {
	api: {
		bodyParser: false,
	},
};
export async function GET(req, { params }) {
	const { id } = await params;
	console.log("Received ID:", id);

	await connectDB();

	try {
		const blog = await Blog.findById(id);

		if (!blog) {
			console.error("Blog not found:", id);
			return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, blog });
	} catch (error) {
		console.error("Error fetching blog:", error);
		return NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
	}
}

export async function PUT(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		// Fetch form data
		const formData = await request.formData();

		// Get existing blog from DB
		const existingBlog = await Blog.findById(id);
		if (!existingBlog) {
			return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
		}

		// Update text fields
		const blogTitle_en = formData.get("blogTitle_en") || existingBlog.blogTitle_en || existingBlog.blogTitle;
		const blogTitle_ne = formData.get("blogTitle_ne") || existingBlog.blogTitle_ne;
		const blogTitle_no = formData.get("blogTitle_no") || existingBlog.blogTitle_no;
		const blogDesc_en = formData.get("blogDesc_en") || existingBlog.blogDesc_en || existingBlog.blogDesc;
		const blogDesc_ne = formData.get("blogDesc_ne") || existingBlog.blogDesc_ne;
		const blogDesc_no = formData.get("blogDesc_no") || existingBlog.blogDesc_no;
		const blogDate = formData.get("blogDate") || existingBlog.blogDate;

		// Handle images
		let blogMainPictureUrl = existingBlog.blogMainPicture;
		let blogSecondPictureUrl = existingBlog.blogSecondPicture;
		let oldMainPictureUrl = null;
		let oldSecondPictureUrl = null;

		// Update main picture if a new file is provided
		if (formData.get("blogMainPicture")) {
			oldMainPictureUrl = existingBlog.blogMainPicture || null;
			blogMainPictureUrl = await uploadToCloudinary(formData.get("blogMainPicture"), "blogs_images");
		}

		// Update second picture if a new file is provided
		if (formData.get("blogSecondPicture")) {
			oldSecondPictureUrl = existingBlog.blogSecondPicture || null;
			blogSecondPictureUrl = await uploadToCloudinary(formData.get("blogSecondPicture"), "blogs_images");
		}

		// Update the blog in the database
		existingBlog.blogTitle_en = blogTitle_en;
		existingBlog.blogTitle_ne = blogTitle_ne;
		existingBlog.blogTitle_no = blogTitle_no;
		existingBlog.blogDesc_en = blogDesc_en;
		existingBlog.blogDesc_ne = blogDesc_ne;
		existingBlog.blogDesc_no = blogDesc_no;
		existingBlog.blogTitle = blogTitle_en; // Legacy field
		existingBlog.blogDesc = blogDesc_en; // Legacy field
		existingBlog.blogDate = blogDate;
		existingBlog.blogMainPicture = blogMainPictureUrl;
		existingBlog.blogSecondPicture = blogSecondPictureUrl;

		await existingBlog.save();

		if (oldMainPictureUrl && blogMainPictureUrl && oldMainPictureUrl !== blogMainPictureUrl) {
			try {
				await deleteFromCloudinary(oldMainPictureUrl, "image");
			} catch (deleteError) {
				console.error("Failed to delete old blog main image from Cloudinary:", deleteError);
			}
		}

		if (oldSecondPictureUrl && blogSecondPictureUrl && oldSecondPictureUrl !== blogSecondPictureUrl) {
			try {
				await deleteFromCloudinary(oldSecondPictureUrl, "image");
			} catch (deleteError) {
				console.error("Failed to delete old blog secondary image from Cloudinary:", deleteError);
			}
		}

		return NextResponse.json({ success: true, blog: existingBlog }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function DELETE(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		console.log("Deleting blog with ID:", id);

		const deletedblog = await Blog.findByIdAndDelete(id);

		if (!deletedblog) {
			return NextResponse.json({ success: false, error: "Blog not found" }, { status: 404 });
		}

		if (deletedblog.blogMainPicture) {
			try {
				await deleteFromCloudinary(deletedblog.blogMainPicture, "image");
			} catch (deleteError) {
				console.error("Failed to delete blog main image from Cloudinary:", deleteError);
			}
		}

		if (deletedblog.blogSecondPicture) {
			try {
				await deleteFromCloudinary(deletedblog.blogSecondPicture, "image");
			} catch (deleteError) {
				console.error("Failed to delete blog secondary image from Cloudinary:", deleteError);
			}
		}

		return NextResponse.json({ success: true, message: "Blog deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
