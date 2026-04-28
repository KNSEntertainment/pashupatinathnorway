import connectDB from "@/lib/mongodb";
import Blog from "@/models/Blog.Model";

export async function getBlogs() {
	await connectDB();
	return Blog.find().lean();
}
