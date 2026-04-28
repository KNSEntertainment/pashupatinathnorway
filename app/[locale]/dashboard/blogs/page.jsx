import { getBlogs } from "@/lib/data/blogs";
import { normalizeDocs } from "@/lib/utils";
import DashboardBlogClient from "./DashboardBlogClient";

export default async function BlogsPage() {
	const blogsRaw = await getBlogs();
	const blogs = Array.isArray(blogsRaw) ? blogsRaw : [];
	const blogsNorm = normalizeDocs(blogs);

	return <DashboardBlogClient blogs={blogsNorm} />;
}
