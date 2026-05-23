

"use client";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useCallback, useState, useEffect } from "react";
import Image from "next/image";
import { useOptimizedFetch } from "@/hooks/useOptimizedFetch";
import { useLocale } from "next-intl";

export default function FullWidthHero() {
	const [currentSlide, setCurrentSlide] = useState(0);
	const [isAnimating, setIsAnimating] = useState(false);
	// Static fallback data for instant LCP
	const [slides, setSlides] = useState([
		{
			title: "Warm Welcome",
			description: "Welcome to our page, where you can discover all the news, updates and information on the upcoming event. Stay tuned for more information on an event not to be missed.",
			primaryLink: "/membership",
			primaryButton: "Become a Member",
			secondaryLink: "/donate",
			secondaryButton: "Donate",
			image: "/pashupatinathcover.png"
		}
	]);
	const [loading] = useState(false);
	const locale = useLocale();

	// Load real data in background without blocking render
	const { data: heroData } = useOptimizedFetch(`/api/hero?locale=${locale}`);

	// Update slides when data arrives (non-blocking)
	useEffect(() => {
		if (heroData && heroData.slides && heroData.slides.length > 0) {
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

	useEffect(() => {
		if (loading || slides.length === 0) return;
		const interval = setInterval(() => {
			if (!isAnimating) nextSlide();
		}, 7000);
		return () => clearInterval(interval);
	}, [currentSlide, nextSlide, isAnimating, loading, slides.length]);

	// Never show loading state - always render with fallback data

	return (
		
		<div className="relative w-screen left-1/2 right-1/2 -translate-x-1/2 overflow-hidden bg-white">
			<section className="relative h-[82vh] w-full flex items-center">
				{/* Background Layer */}
					<div key={currentSlide} className="absolute inset-0 z-0">
						<Image 
							src={slides[currentSlide]?.image || "/pashupatinathcover.png"} 
							alt="Background" 
							fill 
							className="object-cover object-top" 
							priority={currentSlide === 0}
							sizes="100vw"
							quality={80}
							loading={currentSlide === 0 ? "eager" : "lazy"}
						/>
						<div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/60 to-black/80 z-10" />
					</div>

				{/* Simplified OM Symbol - reduced animations */}
				<div className="absolute top-36 right-[34.5%] z-15 pointer-events-none">
					<div className="text-6xl md:text-8xl font-bold text-yellow-100/20 drop-shadow-lg animate-pulse" style={{
						fontFamily: 'serif'
					}}>
						ॐ
					</div>
				</div>

				{/* Simplified Light Effect - single animation */}
				<div className="absolute top-[20%] right-[38%] flex items-center justify-center pointer-events-none z-5">
					<div className="absolute w-32 h-32 rounded-full bg-yellow-300/20 blur-xl animate-pulse" />
				</div>

				{/* Content Layer */}
				<div className="container relative z-20 mx-auto px-6 md:px-12">
					<div className="max-w-3xl">
								<div key={currentSlide}>
								<h1 className="text-2xl md:text-5xl font-black text-white mb-2 md:mb-6 leading-tight tracking-tighter">{slides[currentSlide]?.title || ""}</h1>
								<p className="text-xl md:text-2xl text-white/80 mb-6 md:mb-10 md:leading-relaxed font-light">{slides[currentSlide]?.description || ""}</p>

								<div className="flex flex-wrap gap-2 md:gap-4">
									<Link href={slides[currentSlide]?.primaryLink || "#"}>
										<Button className="h-12 px-4 md:px-6 text-md md:text-lg font-bold rounded-full bg-brand_primary/90 hover:bg-brand_primary text-gray-700 shadow-2xl shadow-blue-500/20 transition-all hover:scale-105 active:scale-95">{slides[currentSlide]?.primaryButton || "Learn More"}</Button>
									</Link>
									<Link href={slides[currentSlide]?.secondaryLink || "#"}>
										<Button variant="outline" className="h-12 px-4 md:px-6 text-md md:text-lg font-bold rounded-full border-white/30 bg-brand_secondary/70 backdrop-blur-md text-gray-100 hover:bg-brand_secondary hover:text-gray-100 hover:scale-105 active:scale-95 transition-all flex items-center gap-2">
											{slides[currentSlide]?.secondaryButton || "Explore"}
										</Button>
									</Link>
								</div>
							</div>
					</div>
				</div>

			</section>

					</div>
	);
}
