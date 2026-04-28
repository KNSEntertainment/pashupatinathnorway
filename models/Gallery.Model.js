import mongoose from "mongoose";

const gallerySchema = new mongoose.Schema(
	{
		media: { type: [String], required: true },
		category: { type: String, required: true },
		alt: { type: String, required: false }, // Keep for backward compatibility
		alt_en: { type: String, required: false },
		alt_ne: { type: String, required: false },
		alt_no: { type: String, required: false },
	},
	{ timestamps: true },
);

export default mongoose.models.Gallery || mongoose.model("Gallery", gallerySchema);
