import mongoose from "mongoose";

const NoticeSchema = new mongoose.Schema(
	{
		noticetitle: {
			type: String,
			required: true,
			trim: true,
		},
		noticedate: {
			type: Date,
			required: false,
			default: () => new Date(),
		},
		noticetime: {
			type: String,
			required: false,
			trim: true,
		},
		notice: {
			type: String,
			required: true,
			trim: true,
		},
		noticeimage: {
			type: String,
		},
		createdBy: {
			type: String,
			required: true,
			trim: true,
			default: "Admin",
		},
	},
	{
		timestamps: true,
	},
);

export default mongoose.models.Notice || mongoose.model("Notice", NoticeSchema);
