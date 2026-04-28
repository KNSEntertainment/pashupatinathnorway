import mongoose from "mongoose";

const blogSchema = new mongoose.Schema(
	{
		// Multilingual title fields
		blogTitle_en: {
			type: String,
			required: true,
			trim: true,
		},
		blogTitle_ne: {
			type: String,
			trim: true,
		},
		blogTitle_no: {
			type: String,
			trim: true,
		},
		// Multilingual description fields
		blogDesc_en: {
			type: String,
			required: true,
			trim: true,
		},
		blogDesc_ne: {
			type: String,
			trim: true,
		},
		blogDesc_no: {
			type: String,
			trim: true,
		},
		// Legacy fields for backward compatibility
		blogTitle: {
			type: String,
			trim: true,
		},
		blogDesc: {
			type: String,
			trim: true,
		},
		blogAuthor: {
			type: String,
			trim: true,
		},
		blogMainPicture: {
			type: String,
			required: true,
		},
		blogSecondPicture: {
			type: String,
		},
		blogDate: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: true,
	},
);

export default mongoose.models.Blog || mongoose.model("Blog", blogSchema);
