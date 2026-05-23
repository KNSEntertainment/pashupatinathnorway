"use client";
import { useState, useEffect } from "react";

export default function HeroLoading() {
	const [isClient, setIsClient] = useState(false);

	useEffect(() => {
		setIsClient(true);
	}, []);

	if (!isClient) {
		// Server-side fallback - static version
		return (
			<div className="relative w-screen left-1/2 right-1/2 -translate-x-1/2 overflow-hidden bg-neutral-900">
				<section className="relative h-[82vh] w-full flex items-center justify-center">
					<div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-brand/10 to-purple-900/20" />
					<div className="relative z-10">
						<div className="w-12 h-12 md:w-16 md:h-16 bg-brand_primary/20 rounded-full animate-pulse" />
					</div>
				</section>
			</div>
		);
	}

	return (
		<div className="relative w-screen left-1/2 right-1/2 -translate-x-1/2 overflow-hidden bg-neutral-900">
			<section className="relative h-[82vh] w-full flex items-center justify-center">
				{/* Animated Background Gradient */}
				<div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 via-brand/10 to-purple-900/20 animate-pulse" />
				
				{/* Logo Container with Simple Animation */}
				<div 
					className="relative z-10"
					initial={{ scale: 0.8, opacity: 0 }}
					animate={{ 
						scale: 1, 
						opacity: 1
					}}
					transition={{ 
						duration: 0.8, 
						ease: "easeOut"
					}}
				>
					{/* Logo with Simple Glow */}
					<div className="relative">
						{/* Simple Glow Effect */}
						<div className="absolute inset-0 blur-xl bg-brand_primary/30 rounded-full scale-110" />
						
						{/* Loading Indicator */}
						<div className="w-12 h-12 md:w-16 md:h-16 relative z-10 bg-brand_primary/20 rounded-full animate-pulse" />
					</div>
				</div>

				{/* Loading Dots */}
				<div 
					className="absolute bottom-20 left-1/2 -translate-x-1/2 flex gap-2"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					transition={{ delay: 1.5, duration: 0.5 }}
				>
					{[0, 1, 2].map((i) => (
						<div
							key={i}
							className="w-3 h-3 bg-brand_primary rounded-full"
							
						/>
					))}
				</div>


				
				{/* Global CSS for Additional Effects */}
				<style jsx global>{`
					@keyframes float {
						0%, 100% { transform: translateY(0px); }
						50% { transform: translateY(-10px); }
					}
					.animate-float {
						animation: float 3s ease-in-out infinite;
					}
				`}</style>
			</section>
		</div>
	);
}
