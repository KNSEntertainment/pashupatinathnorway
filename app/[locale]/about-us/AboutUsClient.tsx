"use client";

import { Globe, HandHeart, Landmark, MessageCirclePlusIcon, RefreshCcw, Users } from "lucide-react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import SectionHeader from "@/components/SectionHeader";
import { motion } from "framer-motion";
import { useState, useEffect, useRef } from "react";

export default function AboutUsClient() {
	const t = useTranslations("about-us");
	const ta = useTranslations("about");
	const [activeIndex, setActiveIndex] = useState(0);
	const scrollContainerRef = useRef<HTMLDivElement>(null);

	const values = [
		{ icon: Landmark, title: ta("value_cultural_preservation_title"), description: ta("value_cultural_preservation_desc") },
		{ icon: Users, title: ta("value_community_brotherhood_title"), description: ta("value_community_brotherhood_desc") },
		{ icon: Globe, title: ta("value_social_integration_title"), description: ta("value_social_integration_desc") },
		{ icon: HandHeart, title: ta("value_humanitarian_support_title"), description: ta("value_humanitarian_support_desc") },
		{ icon: RefreshCcw, title: ta("value_knowledge_exchange_title"), description: ta("value_knowledge_exchange_desc") },
	];

	useEffect(() => {
		const handleScroll = () => {
			if (scrollContainerRef.current) {
				const container = scrollContainerRef.current;
				const scrollLeft = container.scrollLeft;
				const flexContainer = container.children[0] as HTMLElement;

				if (!flexContainer) return;

				const cards = Array.from(flexContainer.children) as HTMLElement[];

				// Find which card is most visible in the viewport
				let maxVisibleArea = 0;
				let activeCardIndex = 0;

				cards.forEach((card, index) => {
					const cardLeft = card.offsetLeft;
					const cardRight = cardLeft + card.offsetWidth;
					const containerLeft = scrollLeft;
					const containerRight = scrollLeft + container.offsetWidth;

					// Calculate visible area of this card
					const visibleLeft = Math.max(cardLeft, containerLeft);
					const visibleRight = Math.min(cardRight, containerRight);
					const visibleArea = Math.max(0, visibleRight - visibleLeft);

					if (visibleArea > maxVisibleArea) {
						maxVisibleArea = visibleArea;
						activeCardIndex = index;
					}
				});

				setActiveIndex(activeCardIndex);
			}
		};

		const container = scrollContainerRef.current;
		if (container) {
			container.addEventListener("scroll", handleScroll);
			// Initial call to set the correct active index
			handleScroll();
			return () => container.removeEventListener("scroll", handleScroll);
		}
	}, [values.length]);

	return (
		<main className="pt-12 px-4">
			<SectionHeader heading={t("title")} subtitle={t("subtitle")} />

			<div className="grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
				{/* Text Content Column */}
				<div className="order-2 lg:order-1 space-y-8">
					{/* Decorative Quote Mark */}
					<div className="hidden md:block">
						<svg className="w-16 h-16 text-brand_primary/20" fill="currentColor" viewBox="0 0 32 32">
							<path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
						</svg>
					</div>

					{/* Text Blocks with Modern Styling */}
					<div className="space-y-6">
						<div className="group">
							<div className="relative pl-6 border-l-4 border-brand/30 hover:border-brand transition-all duration-300">
								<p className="text-gray-900 leading-relaxed text-base md:text-lg">{t("about_description_1")}</p>
							</div>
						</div>

						<div className="group">
							<div className="relative pl-6 border-l-4 border-blue-500/30 hover:border-blue-500 transition-all duration-300">
								<p className="text-gray-900 leading-relaxed text-base md:text-lg">{t("about_description_2")}</p>
							</div>
						</div>

						<div className="group">
							<div className="relative pl-6 border-l-4 border-indigo-500/30 hover:border-indigo-500 transition-all duration-300">
								<p className="text-gray-900 leading-relaxed text-base md:text-lg">{t("about_description_3")}</p>
							</div>
						</div>
					</div>

					{/* Decorative Stats or Highlight (Optional) */}
					<div className="hidden md:flex gap-8 pt-6">
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 rounded-full bg-brand_primary/10 flex items-center justify-center">
								<svg className="w-6 h-6 text-brand_primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
							</div>
							<div>
								<p className="text-2xl font-bold text-gray-900">200+</p>
								<p className="text-sm text-gray-900">Members</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							<div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
								<svg className="w-6 h-6 text-brand_primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
								</svg>
							</div>
							<div>
								<p className="text-2xl font-bold text-gray-900">6+</p>
								<p className="text-sm text-gray-900">Months Active</p>
							</div>
						</div>
					</div>
				</div>

				{/* Image Column with Modern Frame */}
				<div className="order-1 lg:order-2">
					<div className="relative group">
						{/* Floating Card Effect */}
						<div className="relative z-10">
							<div className="absolute inset-0 bg-gradient-to-br from-brand to-blue-600 rounded-2xl transform rotate-2 group-hover:rotate-3 transition-transform duration-500" />
							<div className="absolute inset-0 bg-gradient-to-br from-green-600 to-brand rounded-2xl transform -rotate-2 group-hover:-rotate-3 transition-transform duration-500" />

							<div className="relative rounded-2xl overflow-hidden shadow-2xl">
								<Image src="/rabibalen.jpg" alt="Event Experience" width={200} height={200} className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" />

								{/* Overlay Gradient */}
								<div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
							</div>
						</div>

						{/* Decorative Dots Pattern */}
						<div className="absolute -bottom-4 -right-4 w-32 h-32 opacity-20 pointer-events-none">
							<div className="grid grid-cols-4 gap-2">
								{[...Array(16)].map((_, i) => (
									<div key={i} className="w-2 h-2 rounded-full bg-brand_primary" />
								))}
							</div>
						</div>

						{/* Floating Badge */}
						<div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-xl p-4 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500 hidden md:block">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-blue-600 flex items-center justify-center">
									<svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
										<path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
									</svg>
								</div>
								<div>
									<p className="text-xs font-semibold text-gray-900">Community</p>
									<p className="text-xs text-gray-900">Driven</p>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Stats */}
			<div className="md:hidden flex justify-center gap-6 mt-12 order-3">
				<div className="text-center">
					<div className="w-16 h-16 mx-auto rounded-full bg-brand_primary/10 flex items-center justify-center mb-2">
						<svg className="w-8 h-8 text-brand_primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<p className="text-2xl font-bold text-gray-900">500+</p>
					<p className="text-sm text-gray-900">Members</p>
				</div>
				<div className="text-center">
					<div className="w-16 h-16 mx-auto rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
						<svg className="w-8 h-8 text-brand_primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
						</svg>
					</div>
					<p className="text-2xl font-bold text-gray-900">10+</p>
					<p className="text-sm text-gray-900">Years Active</p>
				</div>
			</div>

			<section className="h-auto flex flex-col md:flex-row items-center rounded-lg mt-4 md:mt-12 md:p-12 py-4 md:gap-12">
				<div className="flex text-black p-4 lg:px-8 border border-1 border-brand rounded-3xl mx-6">
					<MessageCirclePlusIcon className="w-8 h-8 text-brand_primary mr-4 flex-shrink-0" />
					<div>
						<h2 className="text-xl md:text-2xl font-bold mb-4">
							{t("mission_title").split(" ")[0]} <span className="text-brand_primary leading-tight">{t("mission_title").split(" ")[1]}</span>
						</h2>
						{/* We envision a future where our children understand their roots, our traditions remain vibrant, and our community serves as a model of cultural preservation and successful integration. Through unity, compassion, and shared purpose, we strive to make a positive difference in the lives of Nepalese people both in Norway and in Nepal */}
						<p className="text-lg mb-4">{t("mission_description")}</p>
					</div>
				</div>
				<div className="flex text-black p-4 lg:px-16 bg-brand_primary/10 rounded-3xl mx-6 my-6 md:my-0">
					<MessageCirclePlusIcon className="w-8 h-8 text-brand_primary mr-4 flex-shrink-0" />

					<div>
						<h2 className="text-xl md:text-2xl font-bold mb-4">
							{t("vision_title").split(" ")[0]} <span className="text-brand_primary leading-tight">{t("vision_title").split(" ")[1]}</span>
						</h2>
						<p className="text-lg mb-4">{t("vision_description")}</p>
					</div>
				</div>
			</section>
			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="mb-16">
				<header className="text-center mb-6 md:mb-8">
					<SectionHeader heading={t("values_title")} />
				</header>

				<div ref={scrollContainerRef} className="overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:mx-0 md:px-0">
					<div className="flex gap-6" style={{ minWidth: "fit-content" }}>
						{values.map((value, index) => (
							<motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }} className="bg-light rounded-xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300 w-[85vw] sm:w-[45vw] lg:w-[calc(33.333%-16px)] flex-shrink-0">
								<div className="w-12 h-12 mb-4 bg-brand_primary rounded-lg flex items-center justify-center">
									<value.icon className="w-6 h-6 text-white" />
								</div>
								<h4 className="text-lg font-semibold text-gray-900 mb-2">{value.title}</h4>
								<p className="text-gray-600 text-sm">{value.description}</p>
							</motion.div>
						))}
					</div>
				</div>

				{/* Dot indicators for mobile users */}
				<div className="flex justify-center md:hidden mt-4 gap-2">
					{values.map((_, index) => (
						<div key={index} className={`w-2 h-2 rounded-full transition-colors duration-300 ${index === activeIndex ? "bg-brand_primary" : "bg-gray-300"}`} />
					))}
				</div>
			</motion.div>
		</main>
	);
}
