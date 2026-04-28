"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Play, Pause, Volume2, VolumeX, X, ChevronLeft, ChevronRight, Video } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import SectionHeader from "@/components/SectionHeader";
import Image from "next/image";

interface Video {
	_id: string;
	url: string;
	thumbnail?: string;
	title_en: string;
	title_ne?: string;
	title_no?: string;
	category: string;
	duration?: string;
	creator_en: string;
	creator_ne?: string;
	description_en?: string;
	description_ne?: string;
	description_no?: string;
	isYouTube?: boolean;
	// Legacy fields for backward compatibility
	title?: string;
	creator?: string;
	description?: string;
}

// Helper function to extract YouTube video ID
const getYouTubeVideoId = (url: string) => {
	if (!url) return "";
	if (url.includes("youtube.com/embed/")) {
		return url.split("embed/")[1]?.split("?")[0] || "";
	} else if (url.includes("youtube.com/watch?v=")) {
		return url.split("v=")[1]?.split("&")[0] || "";
	} else if (url.includes("youtu.be/")) {
		return url.split("youtu.be/")[1]?.split("?")[0] || "";
	}
	return "";
};

// Helper function to get YouTube thumbnail URL
const getYouTubeThumbnailUrl = (url: string) => {
	if (!url) return "/ghanti.jpg";
	
	const videoId = getYouTubeVideoId(url);
	
	// Return high-quality thumbnail
	return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "/ghanti.jpg";
};

// Helper function to detect YouTube URLs
const isYouTubeUrl = (url: string) => {
	if (!url) return false;
	return (
		url.includes("youtube.com/embed/") ||
		url.includes("youtube.com/watch?v=") ||
		url.includes("youtu.be/") ||
		url.includes("youtube.com")
	);
};

const VideoGallery: React.FC = () => {
	const [videos, setVideos] = useState<Video[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
	const [playingId, setPlayingId] = useState<string | null>(null);
	const [embeddedVideoId, setEmbeddedVideoId] = useState<string | null>(null);
	const [isMuted, setIsMuted] = useState(true);
	const videoRefs = useRef<{ [key: string]: HTMLVideoElement | null }>({});
	const modalVideoRef = useRef<HTMLVideoElement | null>(null);
	const t = useTranslations("gallery");
	const locale = useLocale();

	// Helper functions to get localized content
	const getLocalizedTitle = (video: Video) => {
		const key = `title_${locale}` as keyof Video;
		return (video[key] as string) || video.title_en || video.title || "Untitled";
	};

	const getLocalizedCreator = (video: Video) => {
		if (locale === "ne") {
			return video.creator_ne || video.creator_en || video.creator || "PNSB-Norway";
		}
		return video.creator_en || video.creator || "PNSB-Norway";
	};

	const getYouTubeAutoplayUrl = (url: string) => {
		if (!url) return url;
		return url.includes("?") ? `${url}&autoplay=1` : `${url}?autoplay=1`;
	};

	// Fetch videos from database
	useEffect(() => {
		const fetchVideos = async () => {
			try {
				const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
				console.log("Fetching videos from:", `${baseUrl}/api/videos`);
				console.log("Environment check - NEXT_PUBLIC_BASE_URL:", process.env.NEXT_PUBLIC_BASE_URL);

				const res = await fetch(`${baseUrl}/api/videos`, {
					cache: "no-store",
					headers: {
						"Content-Type": "application/json",
					},
				});

				console.log("Response status:", res.status);
				console.log("Response headers:", res.headers);

				if (!res.ok) {
					const errorText = await res.text();
					console.error("API Error Response:", errorText);
					throw new Error(`HTTP error! status: ${res.status}, message: ${errorText}`);
				}

				const data = await res.json();
				console.log("Response data:", data);
				setVideos(data.videos || []);
			} catch (error) {
				console.error("Failed to fetch videos:", error);
				setError(error instanceof Error ? error.message : "Unknown error occurred");
				// Try fallback to relative URL
				try {
					const fallbackRes = await fetch("/api/videos", { cache: "no-store" });
					const fallbackData = await fallbackRes.json();
					console.log("Fallback response data:", fallbackData);
					setVideos(fallbackData.videos || []);
				} catch (fallbackError) {
					console.error("Fallback also failed:", fallbackError);
				}
			} finally {
				setLoading(false);
			}
		};

		fetchVideos();
	}, []);

	const togglePlay = (id: string, e: React.MouseEvent) => {
		e.stopPropagation();
		const video = videoRefs.current[id];
		if (!video) return;

		if (playingId === id) {
			video.pause();
			setPlayingId(null);
		} else {
			// Pause any currently playing video
			if (playingId !== null && videoRefs.current[playingId]) {
				videoRefs.current[playingId]?.pause();
			}
			video.play();
			setPlayingId(id);
		}
	};


	const openModal = (video: Video) => {
		// For YouTube videos, embed directly in the grid
		if (video.isYouTube || isYouTubeUrl(video.url)) {
			const videoId = getYouTubeVideoId(video.url);
			
			if (videoId) {
				// Toggle embedded video
				if (embeddedVideoId === video._id) {
					setEmbeddedVideoId(null); // Close embedded video
				} else {
					setEmbeddedVideoId(video._id); // Open embedded video
					setPlayingId(null); // Pause any other playing videos
				}
				return;
			}
		}
		
		// For non-YouTube videos, use the modal
		setSelectedVideo(video);
		setPlayingId(null);
		// Pause all grid videos
		Object.values(videoRefs.current).forEach((v) => v?.pause());
	};

	const closeModal = useCallback(() => {
		setSelectedVideo(null);
		modalVideoRef.current?.pause();
	}, []);

	// Navigation functions for video modal
	const getCurrentVideoIndex = useCallback(() => {
		if (!selectedVideo) return -1;
		return videos.findIndex((video) => video._id === selectedVideo._id);
	}, [selectedVideo, videos]);

	const navigateToVideo = useCallback(
		(direction: "prev" | "next") => {
			const currentIndex = getCurrentVideoIndex();
			if (currentIndex === -1) return;

			let newIndex;
			if (direction === "prev") {
				newIndex = currentIndex === 0 ? videos.length - 1 : currentIndex - 1;
			} else {
				newIndex = currentIndex === videos.length - 1 ? 0 : currentIndex + 1;
			}
			setSelectedVideo(videos[newIndex]);
		},
		[getCurrentVideoIndex, videos],
	);

	// Keyboard navigation for video modal
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (!selectedVideo) return;

			if (e.key === "ArrowLeft") {
				e.preventDefault();
				navigateToVideo("prev");
			} else if (e.key === "ArrowRight") {
				e.preventDefault();
				navigateToVideo("next");
			} else if (e.key === "Escape") {
				closeModal();
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [selectedVideo, navigateToVideo, closeModal]);

	useEffect(() => {
		if (selectedVideo && modalVideoRef.current) {
			modalVideoRef.current.play();
		}
	}, [selectedVideo]);

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-neutral-900"></div>
			</div>
		);
	}

	if (error) {
		return (
			<div className="flex justify-center items-center min-h-screen">
				<div className="text-center p-8">
					<h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Videos</h2>
					<p className="text-gray-600 mb-4">{error}</p>
					<button 
						onClick={() => window.location.reload()} 
						className="bg-brand text-white px-6 py-2 rounded-lg hover:bg-brand/90"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		<div
			style={{
				minHeight: "100vh",
				position: "relative",
				overflow: "hidden",
				paddingTop: "48px",
				paddingLeft: "16px",
				paddingRight: "16px",
			}}
		>
			{/* Animated background grid */}
			<div
				style={{
					position: "absolute",
					inset: 0,
					backgroundImage: `
          linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
          linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px)
        `,
					backgroundSize: "100px 100px",
					opacity: 0.3,
					pointerEvents: "none",
				}}
			/>

			{/* Gradient orbs */}
			<div
				style={{
					position: "absolute",
					top: "10%",
					left: "10%",
					width: "500px",
					height: "500px",
					borderRadius: "50%",
					background: "radial-gradient(circle, rgba(138, 43, 226, 0.08) 0%, transparent 70%)",
					filter: "blur(60px)",
					pointerEvents: "none",
					animation: "float 20s ease-in-out infinite",
				}}
			/>

			<div
				style={{
					position: "absolute",
					bottom: "20%",
					right: "15%",
					width: "400px",
					height: "400px",
					borderRadius: "50%",
					background: "radial-gradient(circle, rgba(255, 20, 147, 0.08) 0%, transparent 70%)",
					filter: "blur(60px)",
					pointerEvents: "none",
					animation: "float 25s ease-in-out infinite reverse",
				}}
			/>

			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<header className="text-center mb-6 md:mb-8 px-4">
					<SectionHeader heading={t("video_title")} subtitle={t("video_description")} />
				</header>

				{/* Video Grid */}
				<div
					style={{
						display: "grid",
						gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
						gap: "24px",
					}}
				>
					{videos.map((video, index) => {
						const isPlaying = playingId === video._id;
						const isYouTube = video.isYouTube || isYouTubeUrl(video.url);

						return (
							<div
								key={video._id}
								onClick={() => openModal(video)}
								style={{
									position: "relative",
									borderRadius: "20px",
									overflow: "hidden",
									cursor: "pointer",
									aspectRatio: "16/10",
									animation: `fadeInUp 0.6s ease-out ${index * 0.08}s backwards`,
									transition: "all 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
									boxShadow: "0 10px 40px rgba(0, 0, 0, 0.4)",
									background: "#000",
								}}
								onMouseEnter={(e) => {
									e.currentTarget.style.transform = "translateY(-12px)";
									e.currentTarget.style.boxShadow = "0 25px 70px rgba(138, 43, 226, 0.3)";
								}}
								onMouseLeave={(e) => {
									e.currentTarget.style.transform = "translateY(0)";
									e.currentTarget.style.boxShadow = "0 10px 40px rgba(0, 0, 0, 0.4)";
								}}
							>
								{/* Conditional rendering for YouTube vs uploaded videos */}
								{isYouTube ? (
									<div style={{ position: "relative", width: "100%", height: "100%" }}>
										{embeddedVideoId === video._id ? (
											// Show embedded YouTube video
											<iframe
												src={`https://www.youtube.com/embed/${getYouTubeVideoId(video.url)}?autoplay=1&rel=0`}
												style={{
													position: "absolute",
													top: 0,
													left: 0,
													width: "100%",
													height: "100%",
													border: "none",
													borderRadius: "20px",
												}}
												allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
												allowFullScreen
											/>
										) : (
											// Show thumbnail with play button
											<>
												<Image
													src={getYouTubeThumbnailUrl(video.url)}
													alt={getLocalizedTitle(video)}
													fill
													sizes="(min-width: 1024px) 380px, (min-width: 768px) 50vw, 100vw"
													style={{
														objectFit: "cover",
														transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
													}}
													onMouseEnter={(e) => {
														e.currentTarget.style.transform = "scale(1.05)";
													}}
													onMouseLeave={(e) => {
														e.currentTarget.style.transform = "scale(1)";
													}}
												/>
												{/* YouTube play button overlay */}
												<div
													style={{
														position: "absolute",
														top: "50%",
														left: "50%",
														transform: "translate(-50%, -50%)",
														width: "70px",
														height: "70px",
														background: "rgba(255, 0, 0, 0.8)",
														borderRadius: "50%",
														display: "flex",
														alignItems: "center",
														justifyContent: "center",
														transition: "all 0.3s ease",
													}}
												>
													<svg width="30" height="30" viewBox="0 0 24 24" fill="white">
														<path d="M8 5v14l11-7z" />
													</svg>
												</div>
											 </>
										)}
									</div>
								) : (
									<video
										ref={(el) => {
											videoRefs.current[video._id] = el;
										}}
										src={video.url}
										poster={video.thumbnail}
										loop
										muted={isMuted}
										playsInline
										style={{
											objectFit: "cover",
											transition: "transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)",
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.transform = "scale(1.05)";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.transform = "scale(1)";
										}}
									/>
								)}

								{/* Duration Badge */}
								<div
									style={{
										position: "absolute",
										top: "20px",
										right: "20px",
										padding: "8px 16px",
										borderRadius: "8px",
										background: "rgba(0, 0, 0, 0.8)",
										backdropFilter: "blur(10px)",
										fontFamily: '"Space Mono", monospace',
										fontSize: "0.875rem",
										fontWeight: 700,
										color: "white",
										border: "1px solid rgba(255, 255, 255, 0.1)",
									}}
								>
									{video.duration || "N/A"}
								</div>

								{/* Play/Pause Button - Hide for YouTube videos */}
								{!isYouTube && (
									<button
										onClick={(e) => togglePlay(video._id, e)}
										style={{
											position: "absolute",
											top: "50%",
											left: "50%",
											transform: "translate(-50%, -50%)",
											width: "80px",
											height: "80px",
											borderRadius: "50%",
											border: "3px solid white",
											background: isPlaying ? "rgba(0, 0, 0, 0.6)" : "rgba(138, 43, 226, 0.9)",
											backdropFilter: "blur(10px)",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											cursor: "pointer",
											opacity: isPlaying ? 0 : 1,
											transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
											zIndex: 2,
										}}
										className="play-btn"
										onMouseEnter={(e) => {
											e.currentTarget.style.transform = "translate(-50%, -50%) scale(1.15)";
											e.currentTarget.style.background = "rgba(138, 43, 226, 1)";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.transform = "translate(-50%, -50%) scale(1)";
											e.currentTarget.style.background = isPlaying
												? "rgba(0, 0, 0, 0.6)"
												: "rgba(138, 43, 226, 0.9)";
										}}
									>
										{isPlaying ? (
											<Pause size={32} color="white" fill="white" />
										) : (
											<Play size={32} color="white" fill="white" style={{ marginLeft: "4px" }} />
										)}
									</button>
								)}

								{/* Video Info */}
								<div
									style={{
										position: "absolute",
										bottom: 0,
										left: 0,
										right: 0,
										padding: "28px",
										transform: "translateY(10px)",
										opacity: 0,
										transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
									}}
									className="video-info"
								>
									<div
										style={{
											fontSize: "0.75rem",
											color: "#8A2BE2",
											fontFamily: '"Space Mono", monospace',
											fontWeight: 700,
											textTransform: "uppercase",
											letterSpacing: "0.15em",
											marginBottom: "8px",
										}}
									>
										{video.category}
									</div>
									<h3
										style={{
											fontFamily: '"Bebas Neue", sans-serif',
											fontSize: "1.75rem",
											fontWeight: 700,
											color: "white",
											marginBottom: "6px",
											lineHeight: 1.1,
											letterSpacing: "0.05em",
										}}
									>
										{getLocalizedTitle(video)}
									</h3>
									<p
										style={{
											fontFamily: '"Space Mono", monospace',
											fontSize: "0.8rem",
											color: "#999",
										}}
									>
										Created by {getLocalizedCreator(video)}
									</p>
								</div>
							</div>
						);
					})}
				</div>
			</div>

			{/* Fullscreen Modal */}
			{selectedVideo && (
				<div
					style={{
						position: "fixed",
						inset: 0,
						background: "rgba(0, 0, 0, 0.98)",
						backdropFilter: "blur(20px)",
						zIndex: 1000,
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
						padding: "60px",
						animation: "fadeIn 0.3s ease-out",
					}}
					onClick={closeModal}
				>
					{/* Close Button */}
					<button
						onClick={closeModal}
						style={{
							position: "absolute",
							top: "32px",
							right: "32px",
							width: "56px",
							height: "56px",
							borderRadius: "50%",
							border: "2px solid rgba(255, 255, 255, 0.2)",
							background: "rgba(0, 0, 0, 0.5)",
							backdropFilter: "blur(10px)",
							color: "white",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							cursor: "pointer",
							transition: "all 0.3s ease",
							zIndex: 1001,
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "rgba(138, 43, 226, 0.8)";
							e.currentTarget.style.transform = "rotate(90deg) scale(1.1)";
							e.currentTarget.style.borderColor = "rgba(138, 43, 226, 0.5)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
							e.currentTarget.style.transform = "rotate(0deg) scale(1)";
							e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
						}}
					>
						<X size={28} />
					</button>

					{/* Left Arrow */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							navigateToVideo("prev");
						}}
						style={{
							position: "absolute",
							left: "24px",
							top: "50%",
							transform: "translateY(-50%)",
							width: "56px",
							height: "56px",
							borderRadius: "50%",
							border: "2px solid rgba(255, 255, 255, 0.2)",
							background: "rgba(0, 0, 0, 0.5)",
							backdropFilter: "blur(10px)",
							color: "white",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							cursor: "pointer",
							transition: "all 0.3s ease",
							zIndex: 1001,
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "rgba(138, 43, 226, 0.8)";
							e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
							e.currentTarget.style.transform = "translateY(-50%) scale(1)";
						}}
					>
						<ChevronLeft size={28} />
					</button>

					{/* Right Arrow */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							navigateToVideo("next");
						}}
						style={{
							position: "absolute",
							right: "24px",
							top: "50%",
							transform: "translateY(-50%)",
							width: "56px",
							height: "56px",
							borderRadius: "50%",
							border: "2px solid rgba(255, 255, 255, 0.2)",
							background: "rgba(0, 0, 0, 0.5)",
							backdropFilter: "blur(10px)",
							color: "white",
							display: "flex",
							alignItems: "center",
							justifyContent: "center",
							cursor: "pointer",
							transition: "all 0.3s ease",
							zIndex: 1001,
						}}
						onMouseEnter={(e) => {
							e.currentTarget.style.background = "rgba(138, 43, 226, 0.8)";
							e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
						}}
						onMouseLeave={(e) => {
							e.currentTarget.style.background = "rgba(0, 0, 0, 0.5)";
							e.currentTarget.style.transform = "translateY(-50%) scale(1)";
						}}
					>
						<ChevronRight size={28} />
					</button>

					<div
						onClick={(e) => e.stopPropagation()}
						style={{
							width: "100%",
							maxWidth: "1400px",
							animation: "scaleIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
						}}
					>
						{/* Video Player */}
						<div
							style={{
								position: "relative",
								borderRadius: "16px",
								overflow: "hidden",
								boxShadow: "0 30px 100px rgba(138, 43, 226, 0.4)",
								marginBottom: "32px",
							}}
						>
							{selectedVideo.isYouTube || isYouTubeUrl(selectedVideo.url) ? (
								<iframe
									src={getYouTubeAutoplayUrl(selectedVideo.url)}
									title={getLocalizedTitle(selectedVideo)}
									allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
									allowFullScreen
									style={{
										width: "100%",
										maxHeight: "70vh",
										aspectRatio: "16/9",
										display: "block",
										background: "#000",
										border: "none",
									}}
								/>
							) : (
								<video
									ref={modalVideoRef}
									src={selectedVideo.url}
									controls
									autoPlay
									muted={isMuted}
									style={{
										width: "100%",
										maxHeight: "70vh",
										height: "auto",
										display: "block",
										background: "#000",
									}}
								/>
							)}
						</div>

						{/* Video Details */}
						<div
							style={{
								display: "flex",
								justifyContent: "space-between",
								alignItems: "flex-start",
								gap: "40px",
							}}
						>
							<div>
								<div
									style={{
										fontSize: "0.875rem",
										color: "#8A2BE2",
										fontFamily: '"Space Mono", monospace',
										fontWeight: 700,
										textTransform: "uppercase",
										letterSpacing: "0.15em",
										marginBottom: "12px",
									}}
								>
									{selectedVideo.category}
								</div>

								<h2
									style={{
										fontFamily: '"Bebas Neue", sans-serif',
										fontSize: "3.5rem",
										fontWeight: 700,
										color: "white",
										marginBottom: "12px",
										lineHeight: 0.9,
										letterSpacing: "0.02em",
									}}
								>
									{getLocalizedTitle(selectedVideo)}
								</h2>

								<div
									className="flex items-center gap-2"
									style={{
										fontFamily: '"Space Mono", monospace',
										fontSize: "1rem",
										color: "#999",
										marginBottom: "24px",
									}}
								>
									<Video className="w-5 h-5 text-brand" /> {getLocalizedCreator(selectedVideo)}
								</div>
							</div>

							<div
								style={{
									display: "flex",
									gap: "12px",
									alignItems: "center",
								}}
							>
								{/* Hide mute button for YouTube videos */}
								{!(selectedVideo.isYouTube || isYouTubeUrl(selectedVideo.url)) && (
									<button
										onClick={() => setIsMuted(!isMuted)}
										style={{
											width: "48px",
											height: "48px",
											borderRadius: "12px",
											border: "2px solid rgba(255, 255, 255, 0.2)",
											background: "rgba(255, 255, 255, 0.05)",
											color: "white",
											display: "flex",
											alignItems: "center",
											justifyContent: "center",
											cursor: "pointer",
											transition: "all 0.3s ease",
										}}
										onMouseEnter={(e) => {
											e.currentTarget.style.background = "rgba(138, 43, 226, 0.3)";
											e.currentTarget.style.borderColor = "rgba(138, 43, 226, 0.5)";
										}}
										onMouseLeave={(e) => {
											e.currentTarget.style.background = "rgba(255, 255, 255, 0.05)";
											e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.2)";
										}}
									>
										{isMuted ? <VolumeX size={22} /> : <Volume2 size={22} />}
									</button>
								)}

								<div
									style={{
										padding: "12px 20px",
										borderRadius: "12px",
										border: "2px solid rgba(255, 255, 255, 0.2)",
										background: "rgba(255, 255, 255, 0.05)",
										fontFamily: '"Space Mono", monospace',
										fontSize: "0.875rem",
										color: "white",
										fontWeight: 700,
									}}
								>
									{selectedVideo.duration}
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			<style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Space+Mono:wght@400;700&display=swap');

        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(40px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) rotate(0deg);
          }
          33% {
            transform: translate(30px, -30px) rotate(120deg);
          }
          66% {
            transform: translate(-20px, 20px) rotate(240deg);
          }
        }

        :global(div:hover > .video-overlay) {
          opacity: 0.7;
        }

        :global(div:hover > .video-info) {
          opacity: 1;
          transform: translateY(0);
        }

        :global(div:hover > .play-btn) {
          opacity: 1;
          transform: translate(-50%, -50%) scale(1);
        }

        @media (max-width: 768px) {
          :global(.play-btn) {
            opacity: 1 !important;
          }
        }
      `}</style>
		</div>
	);
};

export default VideoGallery;