import { getTranslations, getLocale } from "next-intl/server";
import { getBlogs } from "@/lib/data/blogs";
import BlogsClient from "./BlogsClient";
import { normalizeDocs } from "@/lib/utils";

export default async function Blogs() {
	const [blogsRaw, t, locale] = await Promise.all([getBlogs(), getTranslations("blogs"), getLocale()]);

	const blogs = (blogsRaw || []).map((blog) => ({
		_id: blog._id,
		blogTitle_en: blog.blogTitle_en,
		blogTitle_ne: blog.blogTitle_ne,
		blogTitle_no: blog.blogTitle_no,
		blogTitle: blog.blogTitle,
		blogDesc_en: blog.blogDesc_en,
		blogDesc_ne: blog.blogDesc_ne,
		blogDesc_no: blog.blogDesc_no,
		blogDesc: blog.blogDesc,
		blogDate: blog.blogDate,
		blogMainPicture: blog.blogMainPicture,
		blogAuthor: blog.blogAuthor,
		blogSecondPicture: blog.blogSecondPicture,
		blogContent: blog.blogContent,
		blogContent_en: blog.blogContent_en,
		blogContent_ne: blog.blogContent_ne,
		blogContent_no: blog.blogContent_no,
	}));

	const blogsNorm = normalizeDocs(blogs);
	const translations = {
		blogs_title: t("blogs_title"),
		loading: t("loading"),
		view_all: t("view_all"),
	};

	return <BlogsClient blogs={blogsNorm} translations={translations} locale={locale} />;
}
