"use client";

import { Play } from "lucide-react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import SectionHeader from "@/components/SectionHeader";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import ViewAllButton from "@/components/ViewAllButton";

interface Video {
	_id: string;
	url: string;
	thumbnail?: string;
	title_en: string;
	title_ne?: string;
	title_no?: string;
	creator_en: string;
	creator_ne?: string;
	description_en?: string;
	description_ne?: string;
	description_no?: string;
	isYouTube?: boolean;
	title?: string;
	creator?: string;
}

export default function VideoGallery() {
	const tg = useTranslations("gallery");
	const locale = useLocale();
	const [videos, setVideos] = useState<Video[]>([]);
	const [loading, setLoading] = useState(true);
	const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

	// Fetch videos
	useEffect(() => {
		const fetchVideos = async () => {
			try {
				const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
				const res = await fetch(`${baseUrl}/api/videos`, { cache: "no-store" });
				const data = await res.json();
				// Get latest 6 videos for better layout options
				setVideos((data.videos || []).slice(0, 6));
			} catch (error) {
				console.error("Failed to fetch videos:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchVideos();
	}, []);

	// Helper function to get localized title
	const getLocalizedTitle = (video: Video) => {
		const key = `title_${locale}` as keyof Video;
		return (video[key] as string) || video.title_en || video.title || "Untitled";
	};

	// const getLocalizedCreator = (video: Video) => {
	// 	if (locale === "ne") {
	// 		return video.creator_ne || video.creator_en || video.creator || "Pashupatinath Norway Temple";
	// 	}
	// 	return video.creator_en || video.creator || "Pashupatinath Norway Temple";
	// };

	const getYouTubeThumbnail = (url: string) => {
		const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/)?.[1];
		return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "";
	};

	const getYouTubeEmbed = (url: string) => {
		const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/)?.[1];
		return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : "";
	};

	return (
		<section className="bg-gradient-to-b from-gray-100 to-slate-200">
			<div className="container mx-auto px-6 py-16 md:py-24">
				<div className="text-center mb-12">
					<SectionHeader heading={tg("videoGalleryTitle")} />
				</div>

				{loading ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
						{[...Array(6)].map((_, i) => (
							<div key={i} className="aspect-video bg-slate-700/50 rounded-2xl animate-pulse border border-slate-600/30"></div>
						))}
					</div>
				) : videos.length > 0 ? (
					<>
						{/* Adaptive Video Gallery Layout */}
						<div className="mb-12">
							{videos.length === 1 && (
								/* Single Video - Hero Showcase */
								<div className="max-w-5xl mx-auto">
									<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="group">
										{/* Video Container */}
										<div className="relative aspect-video bg-slate-800 rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
											{videos[0].isYouTube ? activeVideoId === videos[0]._id ? 
												<iframe src={getYouTubeEmbed(videos[0].url)} title={getLocalizedTitle(videos[0])} className="w-full h-full rounded-2xl" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : 
												<Image src={getYouTubeThumbnail(videos[0].url) || "/ghanti.jpeg"} alt={getLocalizedTitle(videos[0])} fill className="object-cover transition-transform duration-700 group-hover:scale-105" /> : 
												activeVideoId === videos[0]._id ? 
												<video src={videos[0].url} className="w-full h-full object-cover rounded-2xl" controls autoPlay /> : 
												<video src={videos[0].url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
											}
											
											{activeVideoId !== videos[0]._id && (
												<>
													{/* Subtle Overlay */}
													<div className="absolute inset-0 bg-black/20"></div>
													
													{/* Play Button */}
													<div className="absolute inset-0 flex items-center justify-center" onClick={() => setActiveVideoId(videos[0]._id)}>
														<div className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-2xl cursor-pointer border border-white/20">
															<Play className="w-8 h-8 text-brand_primary ml-1" fill="currentColor" />
														</div>
													</div>
												</>
											)}
											
											{activeVideoId === videos[0]._id && (
												<button onClick={() => setActiveVideoId(null)} className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20">
													×
												</button>
											)}
										</div>
										
										{/* Video Title Below */}
										<div className="mt-6 text-center">
											<h3 className="text-2xl md:text-3xl font-bold text-gray-700 mb-2">{getLocalizedTitle(videos[0])}</h3>
										</div>
									</motion.div>
								</div>
							)}

							{videos.length === 2 && (
								/* Two Videos - Side by Side Showcase */
								<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
									{videos.map((video, index) => {
										const isActive = activeVideoId === video._id;
										return (
											<motion.div key={video._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="group">
												{/* Video Container */}
												<div className="relative aspect-video bg-slate-800 rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
													{video.isYouTube ? isActive ? 
														<iframe src={getYouTubeEmbed(video.url)} title={getLocalizedTitle(video)} className="w-full h-full rounded-2xl" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : 
														<Image src={getYouTubeThumbnail(video.url) || "/ghanti.jpeg"} alt={getLocalizedTitle(video)} fill className="object-cover transition-transform duration-700 group-hover:scale-105" /> : 
														isActive ? 
														<video src={video.url} className="w-full h-full object-cover rounded-2xl" controls autoPlay /> : 
														<video src={video.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
													}
													
													{!isActive && (
														<>
															{/* Subtle Overlay */}
															<div className="absolute inset-0 bg-black/20"></div>
															
															{/* Play Button */}
															<div className="absolute inset-0 flex items-center justify-center" onClick={() => setActiveVideoId(video._id)}>
																<div className="w-14 h-14 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-2xl cursor-pointer border border-white/20">
																	<Play className="w-7 h-7 text-brand_primary ml-1" fill="currentColor" />
																</div>
															</div>
														</>
													)}
													
													{isActive && (
														<button onClick={() => setActiveVideoId(null)} className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20">
															×
														</button>
													)}
												</div>
												
												{/* Video Title Below */}
												<div className="mt-4 text-center">
													<h3 className="text-xl md:text-2xl font-bold text-gray-700 line-clamp-2">{getLocalizedTitle(video)}</h3>
												</div>
											</motion.div>
										);
									})}
								</div>
							)}

							{videos.length >= 3 && (
								/* Multiple Videos - Grid Layout */
								<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
									{videos.map((video, index) => {
										const isActive = activeVideoId === video._id;
										return (
											<motion.div key={video._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: index * 0.1 }} className="group">
												{/* Video Container */}
												<div className="relative aspect-video bg-slate-800 rounded-2xl overflow-hidden border border-slate-700/50 shadow-2xl">
													{video.isYouTube ? isActive ? 
														<iframe src={getYouTubeEmbed(video.url)} title={getLocalizedTitle(video)} className="w-full h-full rounded-2xl" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowFullScreen /> : 
														<Image src={getYouTubeThumbnail(video.url) || "/ghanti.jpeg"} alt={getLocalizedTitle(video)} fill className="object-cover transition-transform duration-700 group-hover:scale-105" /> : 
														isActive ? 
														<video src={video.url} className="w-full h-full object-cover rounded-2xl" controls autoPlay /> : 
														<video src={video.url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
													}
													
													{!isActive && (
														<>
															{/* Subtle Overlay */}
															<div className="absolute inset-0 bg-black/20"></div>
															
															{/* Play Button */}
															<div className="absolute inset-0 flex items-center justify-center" onClick={() => setActiveVideoId(video._id)}>
																<div className="w-12 h-12 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-2xl cursor-pointer border border-white/20">
																	<Play className="w-6 h-6 text-brand_primary ml-1" fill="currentColor" />
																</div>
															</div>
														</>
													)}
													
													{isActive && (
														<button onClick={() => setActiveVideoId(null)} className="absolute top-4 right-4 z-10 bg-black/60 hover:bg-black/80 text-white p-3 rounded-full transition-all duration-200 backdrop-blur-sm border border-white/20">
															×
														</button>
													)}
												</div>
												
												{/* Video Title Below */}
												<div className="mt-4 text-center">
													<h3 className="text-lg md:text-xl font-bold text-gray-700 line-clamp-2">{getLocalizedTitle(video)}</h3>
												</div>
											</motion.div>
										);
									})}
								</div>
							)}
							</div>

						{/* View All Button */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.4 }}
							className="flex justify-center mt-12"
						>
							<ViewAllButton href={`/${locale}/video-gallery`} label="View All Videos" />
						</motion.div>
					</>
				) : (
					<div className="text-center py-12">
						<p className="text-white/70 text-lg">No videos available at the moment.</p>
					</div>
				)}
			</div>
		</section>
	);
}
