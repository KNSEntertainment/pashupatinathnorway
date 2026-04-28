import mongoose from "mongoose";

const videoSchema = new mongoose.Schema(
	{
		url: { type: String, required: true }, // Cloudinary video URL or YouTube URL
		thumbnail: { type: String, required: false }, // Cloudinary thumbnail/poster URL
		title_en: { type: String, required: true },
		title_ne: { type: String, required: false },
		title_no: { type: String, required: false },
		category: { type: String, required: true },
		duration: { type: String, required: false }, // e.g., "2:45"
		description_en: { type: String, required: false },
		description_ne: { type: String, required: false },
		description_no: { type: String, required: false },
		creator_en: { type: String, default: "PNSB-Norway" },
		creator_ne: { type: String, default: "आरएसपी नर्वे" },
		isYouTube: { type: Boolean, default: false }, // Flag to indicate if it's a YouTube video
		uploadedBy: { type: String, required: false }, // Admin user who uploaded
		isActive: { type: Boolean, default: true },
		// Legacy fields for backward compatibility
		title: { type: String, required: false },
		description: { type: String, required: false },
		creator: { type: String, required: false },
	},
	{ timestamps: true },
);

export default mongoose.models.Video || mongoose.model("Video", videoSchema);
