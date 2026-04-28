"use client";
import Image from "next/image";
import { Calendar, User } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
import {  useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import ViewAllButton from "@/components/ViewAllButton";

interface Blog {
	_id: string;
	blogTitle_en: string;
	blogTitle_ne?: string;
	blogTitle_no?: string;
	blogDate: string;
	blogMainPicture?: string;
	blogAuthor?: string;
	blogDesc_en?: string;
	blogDesc_ne?: string;
	blogDesc_no?: string;
	// Legacy field
	blogTitle?: string;
}

interface Translations {
	blogs_title: string;
	loading: string;
	view_all: string;
}

interface Props {
	blogs: Blog[];
	translations: Translations;
	locale: string;
}


export default function BlogsClient({ blogs, locale }: Props) {
	const router = useRouter();
	const [navLoading, setNavLoading] = useState(false);
	const [isMobile, setIsMobile] = useState(false);

	// Detect mobile devices
	useEffect(() => {
		const checkMobile = () => {
			setIsMobile(window.innerWidth < 768);
		};
		
		checkMobile();
		window.addEventListener('resize', checkMobile);
		return () => window.removeEventListener('resize', checkMobile);
	}, []);

	// Helper function to get localized blog title
	const getLocalizedTitle = (blog: Blog): string => {
		const key = `blogTitle_${locale}` as keyof Blog;
		const localizedTitle = blog[key];
		return (typeof localizedTitle === "string" && localizedTitle) || blog.blogTitle_en || blog.blogTitle || "Untitled";
	};

	// Helper function to get localized blog description
	const getLocalizedDescription = (blog: Blog): string => {
		const key = `blogDesc_${locale}` as keyof Blog;
		const localizedDesc = blog[key];
		return (typeof localizedDesc === "string" && localizedDesc) || blog.blogDesc_en || "";
	};

	// Enhanced description processing for professional preview
	const cleanDescription = (description: string): string => {
		if (!description) return "";
		
		// Process HTML to preserve more formatting for professional look
		let processedText = description
			// Handle paragraphs and line breaks
			.replace(/<br\s*\/?>/gi, ' ') // Replace <br> with spaces
			.replace(/<\/p>/gi, ' </p>') // Add space before closing p
			.replace(/<p[^>]*>/gi, '') // Remove opening p tags
			.replace(/<\/p>/gi, '') // Remove closing p tags after spacing
			
			// Preserve text formatting
			.replace(/<strong[^>]*>/gi, '<strong>') // Normalize strong
			.replace(/<\/strong>/gi, '</strong>') // Keep strong closing
			.replace(/<b[^>]*>/gi, '<strong>') // Convert b to strong
			.replace(/<\/b>/gi, '</strong>') // Convert /b to /strong
			.replace(/<em[^>]*>/gi, '<em>') // Normalize em
			.replace(/<\/em>/gi, '</em>') // Keep em closing
			.replace(/<i[^>]*>/gi, '<em>') // Convert i to em
			.replace(/<\/i>/gi, '</em>') // Convert /i to /em
			
			// Remove complex elements but keep basic formatting
			.replace(/<[^>]*(?!strong|\/strong|em|\/em)[^>]*>/gi, ''); // Remove all other tags except formatting
		
		// Clean up extra spaces and limit length
		processedText = processedText.replace(/\s+/g, ' ').trim();
		return processedText.length > 250 ? processedText.substring(0, 250) + "..." : processedText;
	};

	// Get the latest blog for featured display
	const featuredBlog = blogs.length > 0 ? blogs[0] : null;

	const handleNavigation = async (blogId: string) => {
		if (navLoading) return;
		setNavLoading(true);
		router.push(`/${locale}/blogs/${blogId}`);
	};

	if (!featuredBlog) {
		return (
			<section className="relative min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 overflow-hidden">
				<div className="container mx-auto px-6 py-20">
					<div className="text-center">
						<h2 className="text-4xl font-light text-gray-900 mb-4">Blogs</h2>
						<p className="text-gray-500">No blogs available at the moment.</p>
					</div>
				</div>
			</section>
		);
	}

	return (
		<section className="relative min-h-screen overflow-hidden">
			{/* Background Decorative Elements */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-brand/5 to-transparent rounded-full blur-3xl"></div>
				<div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-emerald-500/5 to-transparent rounded-full blur-3xl"></div>
			</div>

			<div className="relative z-10 container mx-auto px-6 pb-20">
				{/* Section Header */}
				<SectionHeader heading="Blogs" subtitle="Discover insights, stories, and updates from our community" />
		

				{/* Featured Blog Grid */}
				<motion.div
					initial={{ opacity: 0, y: 50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
					className="max-w-7xl mx-auto"
				>
					{isMobile ? (
						// Mobile: Show only the latest blog
						<div 
							className="group relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 overflow-hidden cursor-pointer min-h-[400px]"
							onClick={() => handleNavigation(featuredBlog._id)}
						>
							{/* Card Border Gradient */}
							<div className="absolute inset-0 bg-gradient-to-r from-brand/20 via-transparent to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
							
							<div className="relative h-full min-h-[400px]">
								<Image 
									src={featuredBlog?.blogMainPicture || "/pashupatinath.png"} 
									alt={getLocalizedTitle(featuredBlog)} 
									fill 
									className="object-cover transition-transform duration-1000 group-hover:scale-110" 
								/>
								
								{/* Image Overlay Gradient */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
								
								{/* Content Overlay */}
								<div className="absolute inset-0 p-6 flex flex-col justify-end">
									{/* Category Badge */}
									<div className="mb-2 md:mb-4">
										<div className="bg-brand_primary/90 backdrop-blur-sm rounded-full px-4 py-1 md:py-2 shadow-lg inline-block">
											<span className="text-xs font-semibold text-white uppercase tracking-wider">Latest</span>
										</div>
									</div>
									
									{/* Blog Title */}
									<h2 className="text-xl lg:text-2xl xl:text-3xl font-bold text-white mb-2 md:mb-4 leading-tight group-hover:text-brand_primary transition-colors duration-500">
										{getLocalizedTitle(featuredBlog)}
									</h2>
									
									{/* Blog Description Preview */}
									<div className="text-white/90 text-sm mb-2 md:mb-4 line-clamp-2 leading-relaxed prose prose-invert prose-sm max-w-none">
										<div dangerouslySetInnerHTML={{ __html: cleanDescription(getLocalizedDescription(featuredBlog)) }} />
									</div>
									
									{/* Blog Meta */}
									<div className="flex items-center gap-4 text-white/80">
										{featuredBlog?.blogAuthor && (
											<div className="flex items-center gap-2">
												<User className="w-4 h-4" />
												<span className="text-sm font-medium">{featuredBlog.blogAuthor}</span>
											</div>
										)}
										<div className="flex items-center gap-2">
											<Calendar className="w-4 h-4" />
											<span className="text-sm">{featuredBlog?.blogDate}</span>
										</div>
									</div>
								</div>
							</div>
						</div>
					) : (
						// Desktop: Show only 2 blogs side by side
						<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
							{/* First Blog - Latest */}
							<motion.div
								initial={{ opacity: 0, y: 30 }}
								animate={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
								className="group relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 overflow-hidden cursor-pointer min-h-[450px]"
								onClick={() => handleNavigation(featuredBlog._id)}
							>
								{/* Card Border Gradient */}
								<div className="absolute inset-0 bg-gradient-to-r from-brand/20 via-transparent to-emerald-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
								
								<div className="relative h-full min-h-[450px]">
									<Image 
										src={featuredBlog?.blogMainPicture || "/pashupatinath.png"} 
										alt={getLocalizedTitle(featuredBlog)} 
										fill 
										className="object-cover transition-transform duration-1000 group-hover:scale-110" 
									/>
									
									{/* Image Overlay Gradient */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
									
									{/* Content Overlay */}
									<div className="absolute inset-0 p-8 flex flex-col justify-end">
										{/* Category Badge */}
										<div className="mb-4">
											<div className="bg-brand_primary/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg inline-block">
												<span className="text-xs font-semibold text-white uppercase tracking-wider">Latest</span>
											</div>
										</div>
										
										{/* Blog Title */}
										<h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight group-hover:text-brand_primary transition-colors duration-500">
											{getLocalizedTitle(featuredBlog)}
										</h2>
										
										{/* Blog Description Preview */}
										<div className="text-white/90 text-sm mb-4 line-clamp-2 leading-relaxed prose prose-invert prose-sm max-w-none">
											<div dangerouslySetInnerHTML={{ __html: cleanDescription(getLocalizedDescription(featuredBlog)) }} />
										</div>
										
										{/* Blog Meta */}
										<div className="flex items-center gap-4 text-white/80">
											{featuredBlog?.blogAuthor && (
												<div className="flex items-center gap-2">
													<User className="w-4 h-4" />
													<span className="text-sm font-medium">{featuredBlog.blogAuthor}</span>
												</div>
											)}
											<div className="flex items-center gap-2">
												<Calendar className="w-4 h-4" />
												<span className="text-sm">{featuredBlog?.blogDate}</span>
											</div>
										</div>
									</div>
								</div>
							</motion.div>

							{/* Second Blog - Next Latest */}
							{blogs.length > 1 && (
								<motion.div
									initial={{ opacity: 0, y: 30 }}
									animate={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
									className="group relative bg-white rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-700 overflow-hidden cursor-pointer min-h-[450px]"
									onClick={() => handleNavigation(blogs[1]._id)}
								>
									{/* Card Border Gradient */}
									<div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 via-transparent to-brand/20 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
									
									<div className="relative h-full min-h-[450px]">
										<Image 
											src={blogs[1]?.blogMainPicture || "/pashupatinath.png"} 
											alt={getLocalizedTitle(blogs[1])} 
											fill 
											className="object-cover transition-transform duration-1000 group-hover:scale-110" 
										/>
										
										{/* Image Overlay Gradient */}
										<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
										
										{/* Content Overlay */}
										<div className="absolute inset-0 p-8 flex flex-col justify-end">
											{/* Category Badge */}
											<div className="mb-4">
												<div className="bg-emerald-500/90 backdrop-blur-sm rounded-full px-4 py-2 shadow-lg inline-block">
													<span className="text-xs font-semibold text-white uppercase tracking-wider">Featured</span>
												</div>
											</div>
											
											{/* Blog Title */}
											<h2 className="text-2xl lg:text-3xl font-bold text-white mb-3 leading-tight group-hover:text-emerald-400 transition-colors duration-500">
												{getLocalizedTitle(blogs[1])}
											</h2>
											
											{/* Blog Description Preview */}
											<div className="text-white/90 text-sm mb-4 line-clamp-2 leading-relaxed prose prose-invert prose-sm max-w-none">
												<div dangerouslySetInnerHTML={{ __html: cleanDescription(getLocalizedDescription(blogs[1])) }} />
											</div>
											
											{/* Blog Meta */}
											<div className="flex items-center gap-4 text-white/80">
												{blogs[1]?.blogAuthor && (
													<div className="flex items-center gap-2">
														<User className="w-4 h-4" />
														<span className="text-sm font-medium">{blogs[1].blogAuthor}</span>
													</div>
												)}
												<div className="flex items-center gap-2">
													<Calendar className="w-4 h-4" />
													<span className="text-sm">{blogs[1]?.blogDate}</span>
												</div>
											</div>
										</div>
									</div>
								</motion.div>
							)}
						</div>
					)}
				</motion.div>

				{/* Bottom Navigation - Show on all devices */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8, delay: 0.4, ease: "easeOut" }}
					className="flex justify-center pt-12"
				>
					<ViewAllButton href={`/${locale}/blogs`} label="View All Blogs" />
				</motion.div>
			</div>
		</section>
	);
}
