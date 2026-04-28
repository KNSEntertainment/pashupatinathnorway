"use client";
import React, { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRight, Folder, Image as ImageIcon, X, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import SectionHeader from "@/components/SectionHeader";
import Image from "next/image";
import ViewAllButton from "@/components/ViewAllButton";

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



const GalleryPreview = () => {
	const t = useTranslations("gallery");
	const locale = useLocale();
	const [albums, setAlbums] = useState<Album[]>([]);
	const [loading, setLoading] = useState(true);
	const [visibleAlbums, setVisibleAlbums] = useState(6);
	const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
	const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0);
	const [allAlbumPhotos, setAllAlbumPhotos] = useState<Photo[]>([]);


	// Fetch only albums data (lightweight)
	useEffect(() => {
		const fetchAlbums = async () => {
			try {
				const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
				
				// Fetch photos (only for album creation)
				const photosRes = await fetch(`${baseUrl}/api/gallery`, { cache: "no-store" });
				const photosData = await photosRes.json();
				const galleryItems: GalleryItem[] = photosData.gallery || [];

				// Transform and group photos into albums
				const transformedPhotos: Photo[] = galleryItems.flatMap((item) =>
					(item.media || []).map((url, mediaIndex) => ({
						id: `${item._id}-${mediaIndex}`,
						url: url,
						title: item.alt || `${item.category} Photo`,
						category: item.category,
						photographer: "Pashupatinath Norway Temple",
					})),
				);

				// Group photos by category (album)
				const albumsMap = new Map<string, Photo[]>();
				transformedPhotos.forEach((photo) => {
					if (!albumsMap.has(photo.category)) {
						albumsMap.set(photo.category, []);
					}
					albumsMap.get(photo.category)?.push(photo);
				});

				// Create albums with only first 4 photos for preview
				const albumsArray: Album[] = Array.from(albumsMap.entries()).map(([name, photos]) => ({
					name,
					count: photos.length,
					coverImage: photos[0]?.url || "",
					photos: photos.slice(0, 4), // Only keep first 4 for preview
				}));

				// Sort albums by photo count (most photos first)
				albumsArray.sort((a, b) => b.count - a.count);

				setAlbums(albumsArray);
			} catch (error) {
				console.error("Failed to fetch gallery data:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchAlbums();
	}, []);

	// Load more albums
	const loadMore = () => {
		setVisibleAlbums(prev => Math.min(prev + 3, albums.length));
	};

	// Fetch all photos for a specific album
	const fetchAlbumPhotos = async (albumName: string) => {
		try {
			const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
			
			// Fetch all photos
			const photosRes = await fetch(`${baseUrl}/api/gallery`, { cache: "no-store" });
			const photosData = await photosRes.json();
			const galleryItems: GalleryItem[] = photosData.gallery || [];

			// Transform and filter photos for this album
			const transformedPhotos: Photo[] = galleryItems
				.filter(item => item.category === albumName)
				.flatMap((item) =>
					(item.media || []).map((url, mediaIndex) => ({
						id: `${item._id}-${mediaIndex}`,
						url: url,
						title: item.alt || `${item.category} Photo`,
						category: item.category,
						photographer: "Pashupatinath Norway Temple",
					})),
				);

			setAllAlbumPhotos(transformedPhotos);
		} catch (error) {
			console.error("Failed to fetch album photos:", error);
		}
	};

	// Handle album click to view photos
	const handleAlbumClick = (album: Album, e: React.MouseEvent) => {
		e.preventDefault(); // Prevent navigation
		e.stopPropagation(); // Prevent link navigation
		setSelectedAlbum(album);
		setSelectedPhotoIndex(0);
		fetchAlbumPhotos(album.name);
	};

	// Navigate photos in modal
	const navigatePhoto = useCallback((direction: "prev" | "next") => {
		if (!selectedAlbum || allAlbumPhotos.length === 0) return;
		
		if (direction === "prev") {
			setSelectedPhotoIndex(prev => prev === 0 ? allAlbumPhotos.length - 1 : prev - 1);
		} else {
			setSelectedPhotoIndex(prev => prev === allAlbumPhotos.length - 1 ? 0 : prev + 1);
		}
	}, [selectedAlbum, allAlbumPhotos.length]);

	// Close modal
	const closeModal = () => {
		setSelectedAlbum(null);
		setSelectedPhotoIndex(0);
		setAllAlbumPhotos([]);
	};

	// Keyboard navigation
	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			if (selectedAlbum) {
				if (e.key === "ArrowLeft") {
					e.preventDefault();
					navigatePhoto("prev");
				} else if (e.key === "ArrowRight") {
					e.preventDefault();
					navigatePhoto("next");
				} else if (e.key === "Escape") {
					e.preventDefault();
					closeModal();
				}
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [selectedAlbum, navigatePhoto]);

	// Get albums to display
	const displayedAlbums = albums.slice(0, visibleAlbums);
	const hasMore = albums.length > visibleAlbums;

	if (loading) {
		return (
			<section className="py-16 bg-gray-50">
				<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
					<div className="text-center mb-12">
						<div className="h-8 bg-gray-200 rounded w-48 mx-auto mb-4 animate-pulse"></div>
						<div className="h-4 bg-gray-200 rounded w-64 mx-auto animate-pulse"></div>
					</div>
					
					{/* Loading skeleton */}
					<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<div key={i} className="bg-white rounded-xl overflow-hidden shadow-md animate-pulse">
								<div className="h-64 bg-gray-200"></div>
								<div className="p-5">
									<div className="h-6 bg-gray-200 rounded w-3/4 mb-2"></div>
									<div className="h-4 bg-gray-200 rounded w-1/2"></div>
								</div>
							</div>
						))}
					</div>
				</div>
			</section>
		);
	}

	return (
		<>
			<section className="py-16 bg-gray-50">
			<div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<SectionHeader heading={t("title")} subtitle={t("description")} />

				{/* Albums Grid */}
				{displayedAlbums.length > 0 ? (
					<>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-12">
							{displayedAlbums.map((album, index) => (
								<div 
									key={album.name} 
									className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 cursor-pointer relative"
									onClick={(e) => handleAlbumClick(album, e)}
								>
									{/* Album Cover */}
									<div className="relative overflow-hidden bg-gray-100 h-64">
										<Image 
											src={album.coverImage} 
											alt={album.name} 
											width={300} 
											height={100} 
											className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-500"
											loading={index < 3 ? "eager" : "lazy"}
											priority={index < 2}
										/>
										
										{/* Overlay */}
										<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

										{/* Photo Count Badge */}
										{/* <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-3 py-1.5 flex items-center gap-1.5 shadow-lg">
											<ImageIcon className="w-4 h-4 text-brand_primary" />
											<span className="text-sm font-semibold text-gray-900">{album.count}</span>
										</div> */}

										{/* Hover Icon */}
										<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
											<div className="w-16 h-16 bg-white/95 backdrop-blur-sm rounded-full flex items-center justify-center transform group-hover:scale-110 transition-all duration-300 shadow-2xl">
												<Folder className="w-8 h-8 text-brand_primary" />
											</div>
										</div>
									</div>

									{/* Album Info */}
									<div className="p-5">
										<h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-brand_primary transition-colors">
											{album.name}
										</h3>
										<p className="text-gray-600 text-sm mb-4">
											{album.count} {album.count === 1 ? "photo" : "photos"}
										</p>

										{/* Preview Thumbnails */}
										<div className="flex gap-2 mb-4">
											{album.photos.slice(0, 4).map((photo, index) => (
												<div key={photo.id} className="w-20 h-20 rounded-lg overflow-hidden border-2 border-white shadow-sm relative">
													<Image 
														src={photo.url} 
														alt={photo.title} 
														width={48} 
														height={48} 
														className="w-full h-full object-cover object-top"
														loading="lazy"
													/>
													{index === 3 && album.count > 4 && (
														<div className="absolute inset-0 bg-black/60 flex items-center justify-center">
															<span className="text-white text-xs font-semibold">
																+{album.count - 4}
															</span>
														</div>
													)}
												</div>
											))}
										</div>

										{/* Action Buttons */}
										<div className="flex gap-2">
											<button
												onClick={(e) => handleAlbumClick(album, e)}
												className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-brand_primary text-white text-sm font-medium rounded-lg hover:bg-blue-600 transition-colors"
											>
												<ImageIcon className="w-4 h-4" />
												View Photos
											</button>
										
										</div>
									</div>
								</div>
							))}
						</div>

						{/* Load More Button */}
						{hasMore && (
							<div className="text-center mb-8">
								<button
									onClick={loadMore}
									className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 hover:border-gray-400 transition-all duration-300"
								>
									Load More Albums
									<ArrowRight className="w-5 h-5" />
								</button>
							</div>
						)}

						{/* View Full Gallery CTA */}
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.4 }}
							className="flex justify-center pt-8"
						>
							<ViewAllButton href={`/${locale}/gallery`} label="View Full Gallery" />
						</motion.div>
					</>
				) : (
					/* Empty State */
					<div className="text-center py-20">
						<div className="inline-block p-6 bg-gray-100 rounded-full mb-4">
							<Folder className="w-16 h-16 text-gray-400" />
						</div>
						<h3 className="text-2xl font-bold text-gray-900 mb-2">No Albums Yet</h3>
						<p className="text-gray-600">Photo albums will appear here once they are uploaded.</p>
					</div>
				)}
			</div>
		</section>

			{/* Photo Viewing Modal */}
			{selectedAlbum && allAlbumPhotos.length > 0 && (
				<div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-50 flex items-center justify-center p-4 sm:p-6 animate-fadeIn" onClick={closeModal}>
					{/* Close Button */}
					<button onClick={closeModal} className="absolute top-4 right-4 sm:top-6 sm:right-6 w-12 h-12 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center text-white transition-all hover:rotate-90 z-10" aria-label="Close">
						<X className="w-6 h-6" />
					</button>

					{/* Navigation Buttons */}
					<button
						onClick={(e) => {
							e.stopPropagation();
							navigatePhoto("prev");
						}}
						className="hidden sm:flex absolute left-4 sm:left-6 top-1/2 -translate-y-1/2 w-12 h-12 sm:w-14 sm:h-14 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full items-center justify-center text-white transition-all hover:scale-110 z-10"
						aria-label="Previous photo"
					>
						<ChevronLeft className="w-6 h-6 sm:w-7 sm:h-7" />
					</button>

					<button
						onClick={(e) => {
							e.stopPropagation();
							navigatePhoto("next");
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
								navigatePhoto("prev");
							}}
							className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
							aria-label="Previous photo"
						>
							<ChevronLeft className="w-6 h-6" />
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation();
								navigatePhoto("next");
							}}
							className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center text-white"
							aria-label="Next photo"
						>
							<ChevronRight className="w-6 h-6" />
						</button>
					</div>

					{/* Photo Container */}
					<div onClick={(e) => e.stopPropagation()} className="relative max-w-7xl w-full h-full flex items-center justify-center animate-scaleIn">
						<div className="relative w-full h-full flex flex-col sm:flex-row items-center gap-6 sm:gap-8">
							{/* Photo */}
							<div className="relative flex-1 w-full h-full max-h-[60vh] sm:max-h-[85vh] flex items-center justify-center">
								{allAlbumPhotos[selectedPhotoIndex] && (
									<Image 
										src={allAlbumPhotos[selectedPhotoIndex].url} 
										alt={allAlbumPhotos[selectedPhotoIndex].title} 
										width={1200} 
										height={800} 
										className="max-w-full max-h-full object-contain rounded-lg shadow-2xl" 
										priority 
									/>
								)}
							</div>

							{/* Info Panel - Desktop */}
							<div className="hidden sm:block w-full sm:w-80 bg-white/5 backdrop-blur-md rounded-xl p-6 text-white border border-white/10">
								<p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-3">{selectedAlbum.name}</p>
								<h2 className="text-2xl lg:text-3xl font-bold mb-3 leading-tight">
									{allAlbumPhotos[selectedPhotoIndex]?.title || `${selectedAlbum.name} Photo`}
								</h2>
								<p className="text-gray-300 text-sm mb-6 italic">Photography by Pashupatinath Norway Temple</p>

								{/* Photo Counter */}
								<div className="pt-4 border-t border-white/10">
									<p className="text-sm text-gray-400">
										Photo {selectedPhotoIndex + 1} of {allAlbumPhotos.length}
									</p>
								</div>

								{/* Album Stats */}
								<div className="mt-4 pt-4 border-t border-white/10">
									<p className="text-sm text-gray-400">
										{allAlbumPhotos.length} total photos in {selectedAlbum.name}
									</p>
								</div>
							</div>

							{/* Info Panel - Mobile */}
							<div className="sm:hidden absolute top-0 left-0 right-0 bg-gradient-to-b from-black/80 to-transparent p-4 pt-16">
								<p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-2">{selectedAlbum.name}</p>
								<h2 className="text-xl font-bold text-white leading-tight">
									{allAlbumPhotos[selectedPhotoIndex]?.title || `${selectedAlbum.name} Photo`}
								</h2>
							</div>
						</div>
					</div>

					{/* Mobile Photo Counter */}
					<div className="sm:hidden absolute bottom-20 left-0 right-0 text-center">
						<p className="text-white text-sm">
							{selectedPhotoIndex + 1} of {allAlbumPhotos.length}
						</p>
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
		</>
	);
};

export default GalleryPreview;
