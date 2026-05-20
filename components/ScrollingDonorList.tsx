"use client";

import { useState, useEffect, useRef } from "react";
import { Heart } from "lucide-react";

interface Donor {
	name: string;
	amount: number;
	isAnonymous: boolean;
	date: string;
}

interface ScrollingDonorListProps {
	donors: Donor[];
}

export default function ScrollingDonorList({ donors }: ScrollingDonorListProps) {
	// Ensure donors is always an array
	const safeDonors = Array.isArray(donors) ? donors : [];
	
	const [isPaused, setIsPaused] = useState(false);
	const [isScrollable, setIsScrollable] = useState(false);
	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const scrollSpeed = 20; // pixels per second

	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container || safeDonors.length === 0) return;

		// Check if content is scrollable
		const isContentScrollable = container.scrollHeight > container.clientHeight;
		setIsScrollable(isContentScrollable);

		if (!isContentScrollable) return;

		let animationFrameId: number;
		let lastTime = performance.now();
		let scrollPosition = 0;

		const scroll = (currentTime: number) => {
			if (!isPaused) {
				const deltaTime = (currentTime - lastTime) / 1000; // Convert to seconds
				lastTime = currentTime;

				scrollPosition += scrollSpeed * deltaTime;

				// Reset scroll position when reaching the end
				if (scrollPosition >= container.scrollHeight - container.clientHeight) {
					scrollPosition = 0;
				}

				container.scrollTop = scrollPosition;
			} else {
				lastTime = currentTime;
			}

			animationFrameId = requestAnimationFrame(scroll);
		};

		animationFrameId = requestAnimationFrame(scroll);

		return () => {
			if (animationFrameId) {
				cancelAnimationFrame(animationFrameId);
			}
		};
	}, [safeDonors, isPaused]);

	const handleMouseEnter = () => setIsPaused(true);
	const handleMouseLeave = () => setIsPaused(false);
	const handleTouchStart = () => setIsPaused(true);
	const handleTouchEnd = () => setIsPaused(false);

	if (safeDonors.length === 0) {
		return (
			<div className="text-center py-8 text-gray-500">
				<Heart className="w-8 h-8 mx-auto mb-2 text-brand_secondary" />
				<p className="text-sm">No donors yet</p>
			</div>
		);
	}

	return (
		<div className="relative">
			<div
				ref={scrollContainerRef}
				className="h-64 overflow-hidden"
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				onTouchStart={handleTouchStart}
				onTouchEnd={handleTouchEnd}
				style={{ cursor: isScrollable ? (isPaused ? 'grab' : 'grabbing') : 'default' }}
			>
				<div className="py-3 space-y-2">
					{safeDonors.map((donor, index) => (
						<div
							key={index}
							className="flex justify-between items-center p-2 bg-white rounded-lg border border-orange-100 shadow-sm"
						>
							<div className="flex items-center gap-2">
								<Heart className="w-4 h-4 text-brand_secondary flex-shrink-0" />
								<span className="font-medium text-gray-800 text-sm truncate">
									{donor.name}
								</span>
							</div>
							<span className="font-semibold text-gray-600 text-sm">
								{donor.amount.toLocaleString('nb-NO', {
									style: 'currency',
									currency: 'NOK',
									minimumFractionDigits: 0,
									maximumFractionDigits: 0
								})}
							</span>
						</div>
					))}
					
					{/* Duplicate content for seamless scrolling */}
					{isScrollable && donors.map((donor, index) => (
						<div
							key={`duplicate-${index}`}
							className="flex justify-between items-center p-2 bg-white rounded-lg border border-orange-100 shadow-sm"
						>
							<div className="flex items-center gap-2">
								<Heart className="w-4 h-4 text-brand_secondary flex-shrink-0" />
								<span className="font-medium text-gray-800 text-sm truncate">
									{donor.name}
								</span>
							</div>
							<span className="font-semibold text-gray-600 text-sm">
								{donor.amount.toLocaleString('nb-NO', {
									style: 'currency',
									currency: 'NOK',
									minimumFractionDigits: 0,
									maximumFractionDigits: 0
								})}
							</span>
						</div>
					))}
				</div>
			</div>
		

		</div>
	);
}
