import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Video from "@/models/Video.Model";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";

// Helper function to extract YouTube video ID
function extractYouTubeId(url) {
	const patterns = [
		/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\s]+)/,
		/^([a-zA-Z0-9_-]{11})$/, // Direct video ID
	];

	for (const pattern of patterns) {
		const match = url.match(pattern);
		if (match) return match[1];
	}
	return null;
}

// GET single video by ID
export async function GET(req, { params }) {
	try {
		await connectDB();
		const { id } = await params;
		const video = await Video.findById(id);

		if (!video) {
			return NextResponse.json({ success: false, error: "Video not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, video }, { status: 200 });
	} catch (error) {
		console.error("Error fetching video:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

// PUT - Update video
export async function PUT(req, { params }) {
	try {
		await connectDB();
		const { id } = await params;

		const formData = await req.formData();
		const videoFile = formData.get("video");
		const thumbnailFile = formData.get("thumbnail");
		const youtubeUrl = formData.get("youtubeUrl");
		const isYouTube = formData.get("isYouTube") === "true";

		const title_en = formData.get("title_en");
		const title_ne = formData.get("title_ne");
		const title_no = formData.get("title_no");
		const category = formData.get("category");
		const duration = formData.get("duration");
		const description_en = formData.get("description_en");
		const description_ne = formData.get("description_ne");
		const description_no = formData.get("description_no");
		const creator_en = formData.get("creator_en");
		const creator_ne = formData.get("creator_ne");

		const existingVideo = await Video.findById(id);
		if (!existingVideo) {
			return NextResponse.json({ success: false, error: "Video not found" }, { status: 404 });
		}

		const updateData = {
			title_en: title_en || existingVideo.title_en,
			title_ne: title_ne || existingVideo.title_ne,
			title_no: title_no || existingVideo.title_no,
			category: category || existingVideo.category,
			duration: duration || existingVideo.duration,
			description_en: description_en || existingVideo.description_en,
			description_ne: description_ne || existingVideo.description_ne,
			description_no: description_no || existingVideo.description_no,
			creator_en: creator_en || existingVideo.creator_en,
			creator_ne: creator_ne || existingVideo.creator_ne,
			isYouTube,
		};

		// Handle video URL update
		if (isYouTube && youtubeUrl) {
			// Update to YouTube video
			const videoId = extractYouTubeId(youtubeUrl);
			if (!videoId) {
				return NextResponse.json({ success: false, error: "Invalid YouTube URL" }, { status: 400 });
			}

			// Delete old video from Cloudinary if it was a file upload
			if (existingVideo.url && !existingVideo.isYouTube) {
				await deleteFromCloudinary(existingVideo.url, "video");
			}

			updateData.url = `https://www.youtube.com/embed/${videoId}`;

			// Use YouTube thumbnail if no custom thumbnail is provided
			if (!thumbnailFile && !existingVideo.thumbnail) {
				updateData.thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
			}
		} else if (videoFile) {
			// Update with new video file
			// Delete old video from Cloudinary if it exists and is not YouTube
			if (existingVideo.url && !existingVideo.isYouTube) {
				await deleteFromCloudinary(existingVideo.url, "video");
			}
			// Upload new video
			updateData.url = await uploadToCloudinary(videoFile, "rsp-videos");
		}

		// If new thumbnail is uploaded, delete old and upload new
		if (thumbnailFile) {
			// Delete old thumbnail from Cloudinary if it exists and is not a YouTube thumbnail
			if (existingVideo.thumbnail && !existingVideo.thumbnail.includes("youtube.com")) {
				await deleteFromCloudinary(existingVideo.thumbnail, "image");
			}
			// Upload new thumbnail
			updateData.thumbnail = await uploadToCloudinary(thumbnailFile, "rsp-video-thumbnails");
		}

		const updatedVideo = await Video.findByIdAndUpdate(id, updateData, { new: true });

		return NextResponse.json({ success: true, video: updatedVideo }, { status: 200 });
	} catch (error) {
		console.error("Error updating video:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

// DELETE video
export async function DELETE(req, { params }) {
	try {
		await connectDB();
		const { id } = params;

		const video = await Video.findById(id);
		if (!video) {
			return NextResponse.json({ success: false, error: "Video not found" }, { status: 404 });
		}

		// Delete video from Cloudinary
		if (video.url) {
			await deleteFromCloudinary(video.url, "video");
		}

		// Delete thumbnail from Cloudinary
		if (video.thumbnail) {
			await deleteFromCloudinary(video.thumbnail, "image");
		}

		// Delete from database
		await Video.findByIdAndDelete(id);

		return NextResponse.json({ success: true, message: "Video deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error deleting video:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
