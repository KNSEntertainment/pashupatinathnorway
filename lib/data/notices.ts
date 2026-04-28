import connectDB from "@/lib/mongodb";
import Notice from "@/models/Notice.Model";

export async function getNotices() {
	await connectDB();
	return Notice.find().sort({ noticedate: -1 }).lean();
}
