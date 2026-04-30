"use client";
import React, { useState, useEffect, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Grid3x3, LayoutGrid, Folder, Image as ImageIcon, Video, Play } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import SectionHeader from "@/components/SectionHeader";
import Image from "next/image";

interface GalleryItem {
	_id: string;
	media: string[];
	category: string;
	alt?: string;
}

interface Photo {
	id: string;
	url: string;
	title: string;
	category: string;
	photographer: string;
}

interface Album {
	name: string;
	count: number;
	coverImage: string;
	photos: Photo[];
}

interface VideoData {
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
	title?: string;
	creator?: string;
	description?: string;
}

type ViewMode = "albums" | "all" | "photos" | "videos";

const UnifiedGallery = () => {
	const t = useTranslations("gallery");
	const locale = useLocale();
	const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
	const [selectedVideo, setSelectedVideo] = useState<VideoData | null>(null);
	const [photos, setPhotos] = useState<Photo[]>([]);
	const [videos, setVideos] = useState<VideoData[]>([]);
	const [albums, setAlbums] = useState<Album[]>([]);
	const [loading, setLoading] = useState(true);
	const [viewMode, setViewMode] = useState<ViewMode>("albums");
	const [selectedAlbum, setSelectedAlbum] = useState<string | null>(null);
	const [displayPhotos, setDisplayPhotos] = useState<Photo[]>([]);
	const [displayVideos, setDisplayVideos] = useState<VideoData[]>([]);

	// Helper functions for video localization
	const getLocalizedTitle = (video: VideoData) => {
		const key = `title_${locale}` as keyof VideoData;
		return (video[key] as string) || video.title_en || video.title || "Untitled";
	};

	const getLocalizedCreator = (video: VideoData) => {
		if (locale === "ne") {
			return video.creator_ne || video.creator_en || video.creator || "Pashupatinath Norway Temple";
		}
		return video.creator_en || video.creator || "Pashupatinath Norway Temple";
	};

	// Helper function to get YouTube thumbnail
	const getYouTubeThumbnailUrl = (url: string) => {
		if (!url) return "/pashupatinath.png";
		const videoId = url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/)?.[1];
		return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : "/pashupatinath.png";
	};

	// Fetch photos and videos
	useEffect(() => {
		const fetchData = async () => {
			try {
				const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
				
				// Fetch photos
				const photosRes = await fetch(`${baseUrl}/api/gallery`, { cache: "no-store" });
				const photosData = await photosRes.json();
				const galleryItems: GalleryItem[] = photosData.gallery || [];

				// Transform gallery items
				const transformedPhotos: Photo[] = galleryItems.flatMap((item) =>
					(item.media || []).map((url, mediaIndex) => ({
						id: `${item._id}-${mediaIndex}`,
						url: url,
						title: item.alt || `${item.category} Photo`,
						category: item.category,
						photographer: "Pashupatinath Norway Temple",
					})),
				);

				setPhotos(transformedPhotos);

				// Group photos by category (album)
				const albumsMap = new Map<string, Photo[]>();
				transformedPhotos.forEach((photo) => {
					if (!albumsMap.has(photo.category)) {
						albumsMap.set(photo.category, []);
					}
					albumsMap.get(photo.category)?.push(photo);
				});

				const albumsArray: Album[] = Array.from(albumsMap.entries()).map(([name, photos]) => ({
					name,
					count: photos.length,
					coverImage: photos[0]?.url || "",
					photos,
				}));

				setAlbums(albumsArray);
				setDisplayPhotos(transformedPhotos);

				// Fetch videos
				const videosRes = await fetch(`${baseUrl}/api/videos`, { cache: "no-store" });
				const videosData = await videosRes.json();
				setVideos(videosData.videos || []);
				setDisplayVideos(videosData.videos || []);

			} catch (error) {
				console.error("Failed to fetch gallery data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, []);

	// Update display photos based on selected album
	useEffect(() => {
		if (selectedAlbum) {
			const album = albums.find((a) => a.name === selectedAlbum);
			setDisplayPhotos(album?.photos || []);
		} else {
			setDisplayPhotos(photos);
		}
	}, [selectedAlbum, albums, photos]);

	const navigateToPhoto = useCallback(
		(direction: "prev" | "next") => {
			if (!selectedPhoto) return;
			const currentIndex = displayPhotos.findIndex((photo) => photo.id === selectedPhoto.id);
			if (currentIndex === -1) return;

			let newIndex;
			if (direction === "prev") {
				newIndex = currentIndex === 0 ? displayPhotos.length - 1 : currentIndex - 1;
			} else {
				newIndex = currentIndex === displayPhotos.length - 1 ? 0 : currentIndex + 1;
			}
			setSelectedPhoto(displayPhotos[newIndex]);
		},
		[selectedPhoto, displayPhotos],
	);

	const navigateToVideo = useCallback(
		(direction: "prev" | "next") => {
			if (!selectedVideo) return;
			const currentIndex = displayVideos.findIndex((video) => video._id === selectedVideo._id);
			if (currentIndex === -1) return;

			let newIndex;
			if (direction === "prev") {
				newIndex = currentIndex === 0 ? displayVideos.length - 1 : currentIndex - 1;
			} else {
				newIndex = currentIndex === displayVideos.length - 1 ? 0 : currentIndex + 1;
			}
			setSelectedVideo(displayVideos[newIndex]);
		},
		[selectedVideo, displayVideos],
	);

	// Keyboard navigation
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (selectedPhoto) {
				if (e.key === "ArrowLeft") {
					e.preventDefault();
					navigateToPhoto("prev");
				} else if (e.key === "ArrowRight") {
					e.preventDefault();
					navigateToPhoto("next");
				} else if (e.key === "Escape") {
					setSelectedPhoto(null);
				}
			} else if (selectedVideo) {
				if (e.key === "ArrowLeft") {
					e.preventDefault();
					navigateToVideo("prev");
				} else if (e.key === "ArrowRight") {
					e.preventDefault();
					navigateToVideo("next");
				} else if (e.key === "Escape") {
					setSelectedVideo(null);
				}
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [selectedPhoto, selectedVideo, navigateToPhoto, navigateToVideo]);

	const handleAlbumClick = (albumName: string) => {
		setSelectedAlbum(albumName);
		setViewMode("photos");
	};

	const handleBackToAlbums = () => {
		setSelectedAlbum(null);
		setViewMode("albums");
	};

	if (loading) {
		return (
			<div className="flex justify-center items-center min-h-[400px] bg-gray-50">
				<div className="text-center">
					<div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-brand border-r-transparent mb-4"></div>
					<p className="text-gray-600 text-lg">{t("loading")}</p>
				</div>
			</div>
		);
	}

	return (
		<section className="pb-16 bg-gray-50">
			<div className="bg-white border-b border-gray-200">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-4 sm:pb-6">
					<SectionHeader heading={t("title")} subtitle={t("description")} />

					{/* View Controls */}
					<div className="mt-2 flex flex-col sm:flex-row items-center justify-center gap-4">
						{selectedAlbum && (
							<button onClick={handleBackToAlbums} className="flex items-center gap-2 px-4 py-2 text-brand_primary hover:text-blue-700 font-medium transition-colors">
								<ChevronLeft className="w-5 h-5" />
								Back to Albums
							</button>
						)}

						{!selectedAlbum && (
							<div className="flex items-center gap-2 bg-white border border-gray-200 rounded-lg p-1 shadow-sm">
								<button onClick={() => setViewMode("albums")} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === "albums" ? "bg-brand_primary text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
									<Folder className="w-4 h-4" />
									<span className="text-sm font-medium">{t("Albums")} ({albums.length})</span>
								</button>
								<button onClick={() => setViewMode("photos")} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === "photos" ? "bg-brand_primary text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
									<ImageIcon className="w-4 h-4" />
									<span className="text-sm font-medium">Photos ({photos.length})</span>
								</button>
								<button onClick={() => setViewMode("videos")} className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === "videos" ? "bg-brand_primary text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
									<Video className="w-4 h-4" />
									<span className="text-sm font-medium">Videos ({videos.length})</span>
								</button>
								<button onClick={() => setViewMode("all")} className={`hidden sm:flex items-center gap-2 px-4 py-2 rounded-md transition-all ${viewMode === "all" ? "bg-brand_primary text-white shadow-sm" : "text-gray-600 hover:text-gray-900"}`}>
									<LayoutGrid className="w-4 h-4" />
									<span className="text-sm font-medium">All ({photos.length + videos.length})</span>
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
				{/* Albums View */}
				{viewMode === "albums" && !selectedAlbum && (
					<div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
						{albums.map((album) => (
							<div key={album.name} onClick={() => handleAlbumClick(album.name)} className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer">
								{/* Album Cover */}
								<div className="relative h-64 overflow-hidden bg-gray-100">
									<Image src={album.coverImage} alt={album.name} width={600} height={400} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />
									<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

									{/* Photo Count Badge */}
									<div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
										<ImageIcon className="w-4 h-4 text-brand_primary" />
										<span className="text-sm font-semibold text-gray-900">{album.count}</span>
									</div>
								</div>

								{/* Album Info */}
								<div className="p-5">
									<h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand_primary transition-colors">{album.name}</h3>
									<p className="text-gray-600 text-sm">
										{album.count} {album.count === 1 ? "photo" : "photos"}
									</p>

									{/* Preview Thumbnails */}
									<div className="mt-4 flex gap-2">
										{album.photos.slice(0, 4).map((photo) => (
											<div key={photo.id} className="w-12 h-12 rounded-lg overflow-hidden border-2 border-white shadow-sm">
												<Image src={photo.url} alt={photo.title} width={48} height={48} className="w-full h-full object-cover object-top" />
											</div>
										))}
										{album.count > 4 && <div className="w-12 h-12 rounded-lg bg-gray-100 flex items-center justify-center text-xs font-semibold text-gray-600">+{album.count - 4}</div>}
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{/* Photos Only View */}
				{viewMode === "photos" && displayPhotos.length > 0 && (
					<div>
						<div className="mb-8 text-center">
							<h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
								{selectedAlbum ? selectedAlbum : "Photos"}
							</h2>
							<p className="text-gray-600">
								{selectedAlbum 
									? `Explore ${displayPhotos.length} photos from ${selectedAlbum}` 
									: `Explore ${displayPhotos.length} beautiful moments`
								}
							</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
							{displayPhotos.map((photo, index) => (
								<div
									key={photo.id}
									onClick={() => setSelectedPhoto(photo)}
									className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer aspect-square"
									style={{
										animationDelay: `${index * 0.05}s`,
									}}
								>
									{/* Photo */}
									<div className="relative w-full h-full overflow-hidden">
										<Image src={photo.url} alt={photo.title} width={400} height={400} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />

										{/* Overlay */}
										<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

										{/* Info */}
										<div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
											<p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">{photo.category}</p>
											<h3 className="text-white font-bold text-lg line-clamp-2">{photo.title}</h3>
										</div>
									</div>

									{/* Hover Icon */}
									<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
										<div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
											<Grid3x3 className="w-8 h-8 text-white" />
										</div>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* Videos Only View */}
				{viewMode === "videos" && displayVideos.length > 0 && (
					<div>
						<div className="mb-8 text-center">
							<h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">Videos</h2>
							<p className="text-gray-600">Watch {displayVideos.length} amazing videos</p>
						</div>

						<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
							{displayVideos.map((video) => (
								<div
									key={video._id}
									onClick={() => setSelectedVideo(video)}
									className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
								>
									{/* Video Thumbnail Container */}
									<div className="relative aspect-video">
										<Image
											src={video.isYouTube ? getYouTubeThumbnailUrl(video.url) : video.thumbnail || "/pashupatinath.png"}
											alt={getLocalizedTitle(video)}
											fill
											className="object-cover group-hover:scale-105 transition-transform duration-500"
										/>

										{/* Overlay */}
										<div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />

										{/* Play Button */}
										<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-2xl cursor-pointer border border-white/20">
											<Play className="w-8 h-8 text-brand_primary ml-1" fill="currentColor" />
										</div>

										{/* Duration Badge */}
										<div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-medium">
											{video.duration || "N/A"}
										</div>
									</div>

									{/* Video Title Below */}
									<div className="mt-4 text-center px-4 pb-4">
										<h3 className="text-lg font-bold text-gray-700 line-clamp-2">{getLocalizedTitle(video)}</h3>
									</div>
								</div>
							))}
						</div>
					</div>
				)}

				{/* All Media View */}
				{viewMode === "all" && (displayPhotos.length > 0 || displayVideos.length > 0) && (
					<div>
						{selectedAlbum && (
							<div className="mb-8 text-center">
								<h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">{selectedAlbum}</h2>
								<p className="text-gray-600">Explore {displayPhotos.length} beautiful moments</p>
							</div>
						)}

						{/* Videos Section */}
						{displayVideos.length > 0 && (
							<div className="mb-12">
								<h3 className="text-2xl font-bold text-gray-900 mb-6">Videos</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
									{displayVideos.map((video) => (
										<div
											key={video._id}
											onClick={() => setSelectedVideo(video)}
											className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer"
										>
											{/* Video Thumbnail Container */}
											<div className="relative aspect-video">
												<Image
													src={video.isYouTube ? getYouTubeThumbnailUrl(video.url) : video.thumbnail || "/pashupatinath.png"}
													alt={getLocalizedTitle(video)}
													fill
													className="object-cover group-hover:scale-105 transition-transform duration-500"
												/>

												{/* Overlay */}
												<div className="absolute inset-0 bg-black/20 group-hover:bg-black/30 transition-colors duration-300" />

												{/* Play Button */}
												<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-2xl cursor-pointer border border-white/20">
													<Play className="w-8 h-8 text-brand_primary ml-1" fill="currentColor" />
												</div>

												{/* Duration Badge */}
												<div className="absolute top-4 right-4 bg-black/60 backdrop-blur-sm rounded-full px-3 py-1 text-white text-sm font-medium">
													{video.duration || "N/A"}
												</div>
											</div>

											{/* Video Title Below */}
											<div className="mt-4 text-center px-4 pb-4">
												<h3 className="text-lg font-bold text-gray-700 line-clamp-2">{getLocalizedTitle(video)}</h3>
											</div>
										</div>
									))}
								</div>
							</div>
						)}

						{/* Photos Section */}
						{displayPhotos.length > 0 && (
							<div>
								<h3 className="text-2xl font-bold text-gray-900 mb-6">Photos</h3>
								<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
									{displayPhotos.map((photo, index) => (
										<div
											key={photo.id}
											onClick={() => setSelectedPhoto(photo)}
											className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer aspect-square"
											style={{
												animationDelay: `${index * 0.05}s`,
											}}
										>
											{/* Photo */}
											<div className="relative w-full h-full overflow-hidden">
												<Image src={photo.url} alt={photo.title} width={400} height={400} className="w-full h-full object-cover object-top group-hover:scale-110 transition-transform duration-500" />

												{/* Overlay */}
												<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

												{/* Info */}
												<div className="absolute bottom-0 left-0 right-0 p-4 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
													<p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">{photo.category}</p>
													<h3 className="text-white font-bold text-lg line-clamp-2">{photo.title}</h3>
												</div>
											</div>

											{/* Hover Icon */}
											<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
												<div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
													<Grid3x3 className="w-8 h-8 text-white" />
												</div>
											</div>
										</div>
									))}
								</div>
							</div>
						)}
					</div>
				)}

				{/* Empty State */}
				{((viewMode === "photos" || viewMode === "all") && displayPhotos.length === 0 && displayVideos.length === 0) && (
					<div className="text-center py-20">
						<div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
							<ImageIcon className="w-16 h-16 text-gray-400" />
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-2">No Media Yet</h3>
						<p className="text-gray-600">Photos and videos will appear here once they are uploaded.</p>
					</div>
				)}
			</div>

			{/* Photo Lightbox Modal */}
			{selectedPhoto && (
				<div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn" onClick={() => setSelectedPhoto(null)}>
					{/* Close Button */}
					<button onClick={() => setSelectedPhoto(null)} className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:rotate-90 z-10" aria-label="Close">
						<X className="w-6 h-6" />
					</button>

					{/* Navigation Buttons */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							navigateToPhoto("prev");
						}}
						className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full items-center justify-center text-white transition-all hover:scale-110 z-10"
						aria-label="Previous photo"
					>
						<ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
					</button>

					<button
						onClick={(e) => {
							e.stopPropagation();
							navigateToPhoto("next");
						}}
						className="hidden sm:flex absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full items-center justify-center text-white transition-all hover:scale-110 z-10"
						aria-label="Next photo"
					>
						<ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
					</button>

					{/* Mobile Navigation */}
					<div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 z-10">
						<button
							onClick={(e) => {
								e.stopPropagation();
								navigateToPhoto("prev");
							}}
							className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
							aria-label="Previous photo"
						>
							<ChevronLeft className="w-6 h-6" />
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								navigateToPhoto("next");
							}}
							className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
							aria-label="Next photo"
						>
							<ChevronRight className="w-6 h-6" />
						</button>
					</div>

					{/* Image Container */}
					<div onClick={(e) => e.stopPropagation()} className="relative max-w-7xl w-full h-full flex items-center justify-center animate-scaleIn">
						<div className="relative w-full h-full flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
							{/* Image */}
							<div className="relative flex-1 w-full h-full max-h-[60vh] sm:max-h-[85vh] flex items-center justify-center">
								<Image src={selectedPhoto.url} alt={selectedPhoto.title} width={600} height={600} className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" priority />
							</div>

							{/* Info Panel - Desktop */}
							<div className="hidden sm:block w-full sm:w-80 bg-white/5 backdrop-blur-md rounded-xl p-6 text-white border border-white/10">
								<p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-3">{selectedPhoto.category}</p>
								<h2 className="text-2xl lg:text-3xl font-bold mb-3 leading-tight">{selectedPhoto.title}</h2>
								<p className="text-gray-300 text-sm mb-6 italic">Photography by {selectedPhoto.photographer}</p>

								{/* Photo Counter */}
								<div className="pt-4 border-t border-white/10">
									<p className="text-sm text-gray-400">
										Photo {displayPhotos.findIndex((p) => p.id === selectedPhoto.id) + 1} of {displayPhotos.length}
									</p>
								</div>
							</div>

							{/* Info Panel - Mobile */}
							<div className="sm:hidden absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 pt-16">
								<p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-2">{selectedPhoto.category}</p>
								<h2 className="text-xl font-bold text-white leading-tight">{selectedPhoto.title}</h2>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Video Modal */}
			{selectedVideo && (
				<div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn" onClick={() => setSelectedVideo(null)}>
					{/* Close Button */}
					<button onClick={() => setSelectedVideo(null)} className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:rotate-90 z-10" aria-label="Close">
						<X className="w-6 h-6" />
					</button>

					{/* Navigation Buttons */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							navigateToVideo("prev");
						}}
						className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full items-center justify-center text-white transition-all hover:scale-110 z-10"
						aria-label="Previous video"
					>
						<ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
					</button>

					<button
						onClick={(e) => {
							e.stopPropagation();
							navigateToVideo("next");
						}}
						className="hidden sm:flex absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full items-center justify-center text-white transition-all hover:scale-110 z-10"
						aria-label="Next video"
					>
						<ChevronRight className="w-6 h-6 sm:w-7 sm:h-7" />
					</button>

					{/* Mobile Navigation */}
					<div className="sm:hidden absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4 z-10">
						<button
							onClick={(e) => {
								e.stopPropagation();
								navigateToVideo("prev");
							}}
							className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
							aria-label="Previous video"
						>
							<ChevronLeft className="w-6 h-6" />
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								navigateToVideo("next");
							}}
							className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
							aria-label="Next video"
						>
							<ChevronRight className="w-6 h-6" />
						</button>
					</div>

					{/* Video Container */}
					<div onClick={(e) => e.stopPropagation()} className="relative max-w-7xl w-full h-full flex items-center justify-center animate-scaleIn">
						<div className="relative w-full h-full flex flex-col items-center gap-6">
							{/* Video Player */}
							<div className="relative w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl">
								{selectedVideo.isYouTube ? (
									<iframe
										src={selectedVideo.url.includes("youtube.com/embed/") ? selectedVideo.url : `https://www.youtube.com/embed/${selectedVideo.url.match(/(?:youtu\.be\/|youtube\.com(?:\/embed\/|\/v\/|\/watch\?v=|\/watch\?.+&v=))([^&\n?#]+)/)?.[1]}?autoplay=1&rel=0`}
										title={getLocalizedTitle(selectedVideo)}
										allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
										allowFullScreen
										className="w-full h-full"
									/>
								) : (
									<video
										src={selectedVideo.url}
										controls
										autoPlay
										className="w-full h-full"
									/>
								)}
							</div>

							{/* Video Info */}
							<div className="w-full max-w-3xl bg-white/5 backdrop-blur-md rounded-xl p-6 text-white border border-white/10">
								<p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-3">{selectedVideo.category}</p>
								<h2 className="text-2xl lg:text-3xl font-bold mb-3 leading-tight">{getLocalizedTitle(selectedVideo)}</h2>
								<p className="text-gray-300 text-sm mb-4">Created by {getLocalizedCreator(selectedVideo)}</p>

								{/* Video Counter */}
								<div className="pt-4 border-t border-white/10">
									<p className="text-sm text-gray-400">
										Video {displayVideos.findIndex((v) => v._id === selectedVideo._id) + 1} of {displayVideos.length}
									</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			)}

			<style jsx>{`
				@keyframes fadeIn {
					from {
						opacity: 0;
					}
					to {
						opacity: 1;
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

				.animate-fadeIn {
					animation: fadeIn 0.2s ease-out;
				}

				.animate-scaleIn {
					animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
				}
			`}</style>
		</section>
	);
};

export default UnifiedGallery;
