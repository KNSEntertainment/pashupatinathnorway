import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Video from "@/models/Video.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

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

// POST - Create new video
export async function POST(req) {
	try {
		await connectDB();

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
		const creator_en = formData.get("creator_en") || "PNSB-Norway";
		const creator_ne = formData.get("creator_ne") || "आरएसपी नर्वे";

		if (!title_en || !category) {
			return NextResponse.json({ success: false, error: "English title and category are required" }, { status: 400 });
		}

		let videoUrl = null;
		let thumbnailUrl = null;

		if (isYouTube && youtubeUrl) {
			// Handle YouTube video
			const videoId = extractYouTubeId(youtubeUrl);
			if (!videoId) {
				return NextResponse.json({ success: false, error: "Invalid YouTube URL" }, { status: 400 });
			}
			videoUrl = `https://www.youtube.com/embed/${videoId}`;
			// Use YouTube thumbnail if no custom thumbnail is provided
			if (!thumbnailFile) {
				thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
			}
		} else if (videoFile) {
			// Upload video file to Cloudinary
			videoUrl = await uploadToCloudinary(videoFile, "rsp-videos");
		} else {
			return NextResponse.json({ success: false, error: "Video file or YouTube URL is required" }, { status: 400 });
		}

		// Upload custom thumbnail if provided
		if (thumbnailFile) {
			thumbnailUrl = await uploadToCloudinary(thumbnailFile, "rsp-video-thumbnails");
		}

		// Create video record in database
		const video = await Video.create({
			url: videoUrl,
			thumbnail: thumbnailUrl,
			title_en,
			title_ne,
			title_no,
			category,
			duration,
			description_en,
			description_ne,
			description_no,
			creator_en,
			creator_ne,
			isYouTube,
		});

		return NextResponse.json({ success: true, video }, { status: 201 });
	} catch (error) {
		console.error("Error creating video:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
