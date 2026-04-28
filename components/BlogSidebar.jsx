import Link from "next/link";
import Image from "next/image";
import React from "react";
import { useLocale } from "next-intl";

function BlogSidebar({ blogs, locale: propLocale }) {
	const hookLocale = useLocale();
	const locale = propLocale || hookLocale;

	const getLocalizedTitle = (blog) => {
		if (!blog) return "";
		if (locale === "ne" && blog.blogTitle_ne) return blog.blogTitle_ne;
		if (locale === "no" && blog.blogTitle_no) return blog.blogTitle_no;
		return blog.blogTitle_en || blog.blogTitle || "";
	};
	return (
		<div className="space-y-6 md:sticky md:top-36 h-auto overflow-y-scroll p-6 rounded-lg shadow-md">
			{/* Share Box */}

			{/* Other Blogs */}
			<div className="rounded-lg p-6">
				<h3 className="text-lg font-semibold text-gray-900 mb-4">Blogs</h3>
				<div className="space-y-4">
					{blogs &&
						blogs.map((relBlog) => (
							<Link href={`/${locale}/blogs/${relBlog._id}`} key={relBlog._id} className="flex space-x-4 group border-b pb-4 last:border-0 last:pb-0">
								<div className="relative w-16 h-16 flex-shrink-0 overflow-hidden rounded-md">
									<Image src={relBlog?.blogMainPicture || "/ghanti.png"} alt={getLocalizedTitle(relBlog) || "Blog Title"} fill sizes="64px" className="object-cover" />
								</div>
								<div>
									<h4 className="font-medium text-gray-900 group-hover:text-brand transition duration-200">{getLocalizedTitle(relBlog)}</h4>
									<p className="text-sm text-gray-900">{relBlog?.blogDate ? new Date(relBlog.blogDate).toISOString().slice(0, 10) : ""}</p>
								</div>
							</Link>
						))}
				</div>
			</div>
		</div>
	);
}

export default React.memo(BlogSidebar);
