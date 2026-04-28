"use client";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useCallback, useState, useEffect, useMemo } from "react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import HeroLoading from "@/components/HeroLoading";
import { useOptimizedFetch } from "@/hooks/useOptimizedFetch";

export default function FullWidthHero() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	const [slides, setSlides] = useState([]);
	const [loading] = useState(false); // Start with false for faster LCP
	const t = useTranslations("slider");
	const locale = useLocale();

	// Pre-optimized fallback slides with smaller images
	const fallbackSlides = useMemo(() => [
		{
			image: "/rabibalen.jpg",
			title: t("title_1"),
			description: t("subtitle_1"),
			primaryLink: "/membership",
			primaryButton: t("become_a_member"),
			secondaryLink: "/about-us",
			secondaryButton: t("explore_rsp"),
		},
	
	], [t]);

	// Set fallback slides immediately for faster LCP
	useEffect(() => {
		setSlides(fallbackSlides);
	}, [fallbackSlides]);

	// Use optimized fetch with caching - load in background
	const { data: heroData } = useOptimizedFetch(`/api/hero?locale=${locale}`);

	// Update slides when data arrives (non-blocking)
	useEffect(() => {
		if (heroData && heroData.slides && heroData.slides.length > 0) {
			// Filter only active slides
			const activeSlides = heroData.slides.filter(slide => slide.isActive);
			if (activeSlides.length > 0) {
				setSlides(activeSlides);
			}
		}
	}, [heroData]);

	const nextSlide = useCallback(() => {
		if (isAnimating || loading || slides.length === 0) return;
		setIsAnimating(true);
		setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
		setTimeout(() => setIsAnimating(false), 1200);
	}, [isAnimating, slides.length, loading]);

	// const prevSlide = useCallback(() => {
	// 	if (isAnimating || loading || slides.length === 0) return;
	// 	setIsAnimating(true);
	// 	setCurrentSlide((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
	// 	setTimeout(() => setIsAnimating(false), 1200);
	// }, [isAnimating, slides.length, loading]);

	useEffect(() => {
		if (loading || slides.length === 0) return;
		const interval = setInterval(() => {
			if (!isAnimating) nextSlide();
		}, 7000);
		return () => clearInterval(interval);
	}, [currentSlide, nextSlide, isAnimating, loading, slides.length]);

	// Show loading state only if explicitly loading, not if slides are being set
	if (loading) {
		return <HeroLoading />;
	}

	return (
		/* The trick for True Full Width:
           w-screen + relative left-1/2 -translate-x-1/2 
        */
		<div className="relative w-screen left-1/2 right-1/2 -translate-x-1/2 overflow-hidden bg-white">
			<section className="relative h-[82vh] w-full flex items-center">
				{/* Background Layer */}
				<AnimatePresence mode="wait">
					<motion.div key={currentSlide} className="absolute inset-0 z-0" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }}>
						<Image 
							src={slides[currentSlide]?.image || "/pashupatinath.png"} 
							alt="Background" 
							fill 
							className="object-cover object-top" 
							priority
							placeholder="blur"
							blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
							sizes="100vw"
							quality={60}
							loading="eager"
						/>
						<div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80 z-10" />
					</motion.div>
				</AnimatePresence>

				{/* OM Symbol */}
				<div className="absolute top-36 right-[34.5%] z-15 pointer-events-none">
					<div className="text-6xl md:text-8xl font-bold text-yellow-100/20 drop-shadow-2xl animate-pulse" style={{
						textShadow: '0 0 10px rgba(254, 240, 138, 0.3), 0 0 20px rgba(254, 240, 138, 0.1)',
						fontFamily: 'serif',
						animation: 'omGlow 10s ease-in-out infinite'
					}}>
						ॐ
					</div>
				</div>

				{/* Mantra Light Effect */}
				<div className="absolute top-[20%] right-[38%] flex items-center justify-center pointer-events-none z-5">
					<div
						className="absolute w-64 h-64 rounded-full bg-gradient-to-br from-yellow-300/60 via-orange-400/40 to-transparent blur-3xl animate-pulse"
						style={{
							animation: 'mantraPulse1 4s ease-in-out infinite'
						}}
					/>
					<div
						className="absolute w-48 h-48 rounded-full bg-gradient-to-tr from-white/60 via-red-200/40 to-transparent blur-2xl animate-pulse"
						style={{
							animation: 'mantraPulse2 6s ease-in-out infinite 2s'
						}}
					/>
					<div
						className="absolute w-36 h-36 rounded-full bg-gradient-to-bl from-yellow-200/50 via-orange-300/30 to-transparent blur-xl animate-pulse"
						style={{
							animation: 'mantraPulse3 8s ease-in-out infinite 4s'
						}}
					/>
				</div>

				{/* Content Layer */}
				<div className="container relative z-20 mx-auto px-6 md:px-12">
					<div className="max-w-3xl">
						<AnimatePresence mode="wait">
							<motion.div key={currentSlide} initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.4, ease: "easeOut" }}>
								<h1 className="text-2xl md:text-5xl font-black text-white mb-2 md:mb-6 leading-tight tracking-tighter">{slides[currentSlide]?.title || ""}</h1>
								<p className="text-xl md:text-2xl text-white/80 mb-6 md:mb-10 md:leading-relaxed font-light">{slides[currentSlide]?.description || ""}</p>

								<div className="flex flex-wrap gap-2 md:gap-4">
									<Link href={slides[currentSlide]?.primaryLink || "#"} locale={locale}>
										<Button className="h-12 px-4 md:px-6 text-md md:text-lg font-bold rounded-full bg-brand_primary/90 hover:bg-brand_primary text-gray-700 shadow-2xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">{slides[currentSlide]?.primaryButton || "Learn More"}</Button>
									</Link>
									<Link href={slides[currentSlide]?.secondaryLink || "#"} locale={locale}>
										<Button variant="outline" className="h-12 px-4 md:px-6 text-md md:text-lg font-bold rounded-full border-white/30 bg-brand_secondary/70 backdrop-blur-md text-gray-100 hover:bg-white hover:text-brand_primary transition-all flex items-center gap-2">
											{slides[currentSlide]?.secondaryButton || "Explore"}
										</Button>
									</Link>
								</div>
							</motion.div>
						</AnimatePresence>
					</div>
				</div>

			</section>

					</div>
	);
}
