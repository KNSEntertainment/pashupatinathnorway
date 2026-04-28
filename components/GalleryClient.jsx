"use client";
import Image from "next/image";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { Zoom, Fullscreen, Thumbnails } from "yet-another-react-lightbox/plugins";
import "yet-another-react-lightbox/plugins/thumbnails.css";
import { useState, useRef, useEffect } from "react";
import { Folder, Images, ChevronLeft, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

export default function GalleryClient({ images }) {
	const t = useTranslations("gallery");
	const [open, setOpen] = useState(false);
	const [index, setIndex] = useState(0);
	const [selectedAlbum, setSelectedAlbum] = useState(null);
	const scrollContainerRef = useRef(null);
	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);

	// Group images by alt text (album name)
	const albums = images.reduce((acc, img, idx) => {
		const albumName = img.alt || "Untitled Album";
		if (!acc[albumName]) {
			acc[albumName] = {
				name: albumName,
				photos: [],
				thumbnail: img.src,
			};
		}
		acc[albumName].photos.push({ ...img, originalIndex: idx });
		return acc;
	}, {});

	const albumsArray = Object.values(albums);
	// const isSingleAlbum = albumsArray.length === 1;

	const checkScrollPosition = () => {
		if (scrollContainerRef.current) {
			const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
			setCanScrollLeft(scrollLeft > 0);
			setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
		}
	};

	useEffect(() => {
		checkScrollPosition();
		const handleScroll = () => checkScrollPosition();
		const container = scrollContainerRef.current;

		if (container) {
			container.addEventListener("scroll", handleScroll);
			window.addEventListener("resize", checkScrollPosition);
		}

		return () => {
			if (container) {
				container.removeEventListener("scroll", handleScroll);
			}
			window.removeEventListener("resize", checkScrollPosition);
		};
	}, [albumsArray]);

	const scroll = (direction) => {
		if (scrollContainerRef.current) {
			const scrollAmount = 400;
			const newScrollLeft = scrollContainerRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount);
			scrollContainerRef.current.scrollTo({
				left: newScrollLeft,
				behavior: "smooth",
			});
		}
	};

	const handleAlbumClick = (album) => {
		setSelectedAlbum(album);
		setIndex(album.photos[0].originalIndex);
		setOpen(true);
	};

	// Get all images for lightbox
	const lightboxImages = selectedAlbum ? selectedAlbum.photos : images;

	return (
		<div className="w-full relative">
			{/* Navigation Arrows - Only for horizontal scroll layouts */}
			{albumsArray.length > 4 && (
				<div className="hidden absolute -top-16 right-0 md:flex gap-2 z-10">
					<button onClick={() => scroll("left")} disabled={!canScrollLeft} className={`p-2 rounded-full shadow-md transition-all duration-200 ${canScrollLeft ? "bg-white hover:bg-brand hover:text-white text-gray-900 cursor-pointer" : "bg-light text-gray-900 cursor-not-allowed"}`} aria-label="Scroll left">
						<ChevronLeft className="w-5 h-5" />
					</button>
					<button onClick={() => scroll("right")} disabled={!canScrollRight} className={`p-2 rounded-full shadow-md transition-all duration-200 ${canScrollRight ? "bg-white hover:bg-brand hover:text-white text-gray-900 cursor-pointer" : "bg-light text-gray-900 cursor-not-allowed"}`} aria-label="Scroll right">
						<ChevronRight className="w-5 h-5" />
					</button>
				</div>
			)}

			{/* Adaptive Gallery Layout */}
			<div className="mt-12">
				{albumsArray.length === 1 && (
					/* Single Album - Hero Showcase */
					<div className="max-w-6xl mx-auto">
						<div className="group relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer" onClick={() => handleAlbumClick(albumsArray[0])}>
							<div className="relative h-96 lg:h-[28rem] overflow-hidden">
								<Image src={albumsArray[0].thumbnail} alt={albumsArray[0].name} fill className="object-cover transition-transform duration-1000 group-hover:scale-110" />
								<div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
								
								{/* Floating Badge */}
								<div className="absolute top-6 right-6">
									<span className="px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full text-brand font-semibold text-sm shadow-lg">
										Featured Collection
									</span>
								</div>
								
								<div className="absolute bottom-0 left-0 right-0 p-8 lg:p-12 text-white">
									<div className="flex items-center gap-4 mb-4">
										<div className="bg-white/20 backdrop-blur-sm p-3 rounded-lg">
											<Folder className="w-6 h-6 text-white" />
										</div>
										<div className="flex items-center gap-2">
											<Images className="w-5 h-5" />
											<span className="text-lg font-semibold">
												{albumsArray[0].photos.length} {albumsArray[0].photos.length === 1 ? t("photo") : t("photos")}
											</span>
										</div>
									</div>
									<h3 className="text-3xl lg:text-4xl font-bold mb-4 hover:text-cyan-400 transition-colors duration-300">{albumsArray[0].name}</h3>
									<button className="inline-flex items-center px-6 py-3 bg-brand hover:bg-cyan-600 rounded-lg font-semibold transition-all duration-300 group-hover:gap-2">
										View Gallery
										<ChevronRight className="w-5 h-5 ml-1 group-hover:ml-2 transition-all duration-300" />
									</button>
								</div>
							</div>
						</div>
					</div>
				)}

				{albumsArray.length === 2 && (
					/* Two Albums - Side by Side Hero */
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-7xl mx-auto">
						{albumsArray.map((album, index) => (
							<div key={index} className="group relative bg-white rounded-2xl shadow-xl overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer" onClick={() => handleAlbumClick(album)}>
								<div className="relative h-80 lg:h-96 overflow-hidden">
									<Image src={album.thumbnail} alt={album.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
									<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
									
									<div className="absolute top-6 left-6">
										<span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-brand font-semibold text-sm">
											{index === 0 ? "Latest" : "Popular"}
										</span>
									</div>
									
									<div className="absolute bottom-0 left-0 right-0 p-6 lg:p-8 text-white">
										<div className="flex items-center gap-3 mb-3">
											<Folder className="w-5 h-5" />
											<span className="text-sm font-medium">
												{album.photos.length} {album.photos.length === 1 ? t("photo") : t("photos")}
											</span>
										</div>
										<h3 className="text-2xl lg:text-3xl font-bold hover:text-cyan-400 transition-colors duration-300 line-clamp-2">{album.name}</h3>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{albumsArray.length === 3 && (
					/* Three Albums - Magazine Grid */
					<div className="grid grid-cols-1 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
						{albumsArray.map((album, index) => (
							<div key={index} className={`group relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer ${index === 0 ? 'lg:col-span-2 lg:row-span-2' : ''}`} onClick={() => handleAlbumClick(album)}>
								<div className={`relative ${index === 0 ? 'h-80 lg:h-96' : 'h-64 lg:h-80'} overflow-hidden`}>
									<Image src={album.thumbnail} alt={album.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
									<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
									
									<div className="absolute top-4 left-4">
										<span className="px-3 py-1 bg-white/90 backdrop-blur-sm rounded-full text-brand font-semibold text-sm">
											{index === 0 ? "Featured" : `Collection ${index}`}
										</span>
									</div>
									
									<div className="absolute bottom-0 left-0 right-0 p-6 text-white">
										<div className="flex items-center gap-3 mb-3">
											<Folder className="w-4 h-4" />
											<span className="text-sm font-medium">
												{album.photos.length} {album.photos.length === 1 ? t("photo") : t("photos")}
											</span>
										</div>
										<h3 className={`font-bold hover:text-cyan-400 transition-colors duration-300 line-clamp-2 ${index === 0 ? 'text-2xl lg:text-3xl' : 'text-lg lg:text-xl'}`}>{album.name}</h3>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{albumsArray.length === 4 && (
					/* Four Albums - 2x2 Grid */
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
						{albumsArray.map((album, index) => (
							<div key={index} className="group relative bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 cursor-pointer" onClick={() => handleAlbumClick(album)}>
								<div className="relative h-64 lg:h-80 overflow-hidden">
									<Image src={album.thumbnail} alt={album.name} fill className="object-cover transition-transform duration-700 group-hover:scale-105" />
									<div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"></div>
									
									<div className="absolute top-4 right-4">
										<div className="bg-white/90 backdrop-blur-sm p-2 rounded-lg">
											<Folder className="w-5 h-5 text-brand" />
										</div>
									</div>
									
									<div className="absolute bottom-0 left-0 right-0 p-6 text-white">
										<div className="flex items-center gap-3 mb-3">
											<Images className="w-4 h-4" />
											<span className="text-sm font-medium">
												{album.photos.length} {album.photos.length === 1 ? t("photo") : t("photos")}
											</span>
										</div>
										<h3 className="text-xl lg:text-2xl font-bold hover:text-cyan-400 transition-colors duration-300 line-clamp-2">{album.name}</h3>
									</div>
								</div>
							</div>
						))}
					</div>
				)}

				{albumsArray.length >= 5 && (
					/* Five+ Albums - Horizontal Scroll (Original Layout Enhanced) */
					<div ref={scrollContainerRef} className="flex overflow-x-auto gap-6 pb-4 scroll-smooth snap-x snap-mandatory hide-scrollbar">
						{albumsArray.map((album, i) => (
							<div key={i} className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-2xl transition-all duration-300 hover:translate-y-[-4px] cursor-pointer border border-gray-200 hover:border-brand flex-shrink-0 w-[85vw] sm:w-80 snap-start" onClick={() => handleAlbumClick(album)}>
								{/* Folder Icon Background */}
								<div className="absolute top-4 right-4 z-10">
									<div className="bg-white backdrop-blur-sm p-1.5 rounded-lg">
										<Folder className="w-5 h-5 text-brand" />
									</div>
								</div>

								{/* Thumbnail Image */}
								<div className="relative h-64 w-full overflow-hidden bg-gray-100">
									<Image src={album.thumbnail} alt={album.name} width={320} height={256} className="object-cover object-top w-full h-full transition-transform duration-500 group-hover:scale-110" />
									{/* Overlay on hover */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-black/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
								</div>

								{/* Album Info */}
								<div className="p-6">
									<h3 className="font-bold text-gray-900 text-lg mb-2 line-clamp-1 group-hover:text-brand transition-colors">{album.name}</h3>
									<div className="flex items-center gap-2 text-gray-600">
										<Images className="w-4 h-4" />
										<span className="text-sm font-medium">
											{album.photos.length} {album.photos.length === 1 ? t("photo") : t("photos")}
										</span>
									</div>
								</div>

								{/* Bottom accent line */}
								<div className="h-1 bg-gradient-to-r from-brand to-success transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300" />
							</div>
						))}
					</div>
				)}
			</div>

			{/* Enhanced Lightbox */}
			<Lightbox
				open={open}
				close={() => {
					setOpen(false);
					setSelectedAlbum(null);
				}}
				slides={lightboxImages}
				index={selectedAlbum ? 0 : index}
				plugins={[Zoom, Fullscreen, Thumbnails]}
				animation={{ fade: 400, swipe: 250 }}
				styles={{
					container: { backgroundColor: "rgba(15, 23, 42, 0.95)" },
					thumbnailsContainer: { backgroundColor: "#0f172a" },
				}}
			/>

			<style jsx>{`
				.hide-scrollbar::-webkit-scrollbar {
					display: none;
				}
				.hide-scrollbar {
					-ms-overflow-style: none;
					scrollbar-width: none;
				}
			`}</style>
		</div>
	);
}
