"use client";

import { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
const BlogForm = dynamic(() => import("@/components/BlogForm"), { ssr: false });

export default function DashboardBlogClient({ blogs }) {
	const router = useRouter();
	const [openBlogModal, setOpenBlogModal] = useState(false);
	const [blogToEdit, setBlogToEdit] = useState(null);

	const handleEdit = (blog) => {
		setBlogToEdit(blog);
		setOpenBlogModal(true);
	};

	const handleDelete = async (id) => {
		try {
			const response = await fetch(`/api/blogs/${id}`, {
				method: "DELETE",
			});
			if (!response.ok) {
				throw new Error("Failed to delete blog");
			}
			router.refresh();
		} catch (error) {
			console.error("Error deleting blog:", error);
			alert("Failed to delete blog. Please try again.");
		}
	};

	const handleCloseBlogModal = () => {
		setOpenBlogModal(false);
		setBlogToEdit(null);
		router.refresh();
	};

	const handleCreateBlog = () => {
		setBlogToEdit(null);
		setOpenBlogModal(!openBlogModal);
	};
	return (
		<div className="max-w-6xl">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Manage Blogs</h1>
				<button onClick={handleCreateBlog} className="bg-brand_primary text-gray-700 font-bold px-4 py-2 rounded hover:bg-red-700 transition-colors">
					{openBlogModal ? "Cancel" : "Create Blog"}
				</button>
			</div>

			{/* Inline Form Section */}
			{openBlogModal && (
				<div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-brand">
					<BlogForm handleCloseBlogModal={handleCloseBlogModal} fetchBlogs={blogs} blogToEdit={blogToEdit} />
				</div>
			)}
			<div className="bg-white rounded-lg shadow">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Blog Title</TableHead>
							{/* <TableHead>Blog Description</TableHead> */}
							{/* <TableHead>Blog Author</TableHead> */}
							<TableHead>Blog Date</TableHead>
							<TableHead>Main Image</TableHead>
							<TableHead>Secondary Image</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{blogs.length > 0 ? (
							blogs.map((blog) => (
								<TableRow key={blog?._id}>
									<TableCell className="w-64 font-semibold">{blog.blogTitle}</TableCell>
									{/* <TableCell className="w-72">{blog.blogDesc}</TableCell> */}
									{/* <TableCell className="w-36">{blog.blogAuthor}</TableCell> */}
									<TableCell className="w-32">{blog.blogDate}</TableCell>
									<TableCell className="w-16">
										<Image src={blog?.blogMainPicture || "/pashupatinath.png"} width={50} height={50} alt={blog?.blogAuthor || "alt"} className="w-16 h-16 object-cover" />
									</TableCell>
									<TableCell className="w-16">
										<Image src={blog?.blogSecondPicture || "/pashupatinath.png"} width={50} height={50} alt={blog?.blogAuthor || "alt"} className="w-16 h-16 object-cover" />
									</TableCell>

									<TableCell className="w-32">
										<div className="flex space-x-2">
											<Button variant="ghost" size="icon" onClick={() => handleEdit(blog)}>
												<Pencil className="w-6 h-6 text-brand_primary" />
											</Button>
											<Button variant="ghost" size="icon" onClick={() => handleDelete(blog._id)}>
												<Trash2 className="w-6 h-6 text-red-600" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={5} className="text-center">
									No blogs found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
