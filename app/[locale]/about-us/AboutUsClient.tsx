"use client";

import { Globe, HandHeart, Landmark, MessageCirclePlusIcon, Users } from "lucide-react";
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
		<main className="container mx-auto max-w-6xl pt-12 px-4">
			<SectionHeader heading={t("title")} subtitle={t("subtitle")} />

			<div className="relative">


  <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">

    {/* Image Column — spans 5 cols, sits left */}
    <div className="lg:col-span-5 relative">
      {/* Clean photo frame */}
      <div className="relative rounded-2xl overflow-hidden aspect-[4/5] bg-gray-100 shadow-lg">
        <Image
          src="/pashupatinath.png"
          alt="Event Experience"
          width={600}
          height={750}
          className="w-full h-full object-cover"
        />
        {/* Subtle bottom vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-brand_primary/80 via-transparent to-transparent" />
      </div>

      {/* Floating stat cards — anchored to the image */}
      <div className="md:hidden absolute -bottom-6 -right-4 flex flex-col gap-3">
        <div className="bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-brand_primary/10 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-brand_primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 leading-none">200+</p>
            <p className="text-xs text-gray-500 mt-0.5">Members</p>
          </div>
        </div>
        <div className="bg-white rounded-xl shadow-lg px-4 py-3 flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center shrink-0">
            <svg className="w-4 h-4 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <p className="text-lg font-bold text-gray-900 leading-none">6+</p>
            <p className="text-xs text-gray-500 mt-0.5">Months Active</p>
          </div>
        </div>
      </div>

      {/* Community badge — top left */}
      <div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-lg px-4 py-3 hidden md:flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand to-blue-600 flex items-center justify-center shrink-0">
          <svg className="w-5 h-5 text-brand_secondary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
        <div>
          <p className="text-xs font-semibold text-gray-900 leading-none">Community</p>
          <p className="text-xs text-gray-500 mt-0.5">Driven</p>
        </div>
      </div>
    </div>

    {/* Text Column — spans 7 cols, sits right */}
    <div className="lg:col-span-7 lg:pt-6 space-y-8">

      {/* Large decorative quote mark */}
      <svg className="w-16 h-16 text-brand_secondary/40" fill="currentColor" viewBox="0 0 32 32">
        <path d="M10 8c-3.3 0-6 2.7-6 6v10h10V14H8c0-1.1.9-2 2-2V8zm14 0c-3.3 0-6 2.7-6 6v10h10V14h-6c0-1.1.9-2 2-2V8z" />
      </svg>

      {/* Paragraph blocks — left-ruled, stacked cleanly */}
      <div className="space-y-5">
        <div className="pl-5 border-l-[3px] border-brand_secondary/20 hover:border-brand_secondary transition-colors duration-300">
          <p className="text-gray-800 leading-relaxed text-base md:text-lg">{t("about_description_1")}</p>
        </div>

        <div className="pl-5 border-l-[3px] border-blue-400/20 hover:border-blue-500 transition-colors duration-300">
          <p className="text-gray-800 leading-relaxed text-base md:text-lg">{t("about_description_2")}</p>
        </div>

        <div className="pl-5 border-l-[3px] border-indigo-400/20 hover:border-indigo-500 transition-colors duration-300">
          <p className="text-gray-800 leading-relaxed text-base md:text-lg">{t("about_description_3")}</p>
        </div>
      </div>

      {/* Thin divider */}
      <div className="h-px bg-gray-200" />

      {/* Stats row — desktop only, placed at natural bottom of text */}
      <div className="hidden md:flex items-center gap-10">
        <div>
          <p className="text-3xl font-bold text-gray-900">200+</p>
          <p className="text-sm text-gray-500 mt-0.5">Members</p>
        </div>
        <div className="h-10 w-px bg-gray-200" />
        <div>
          <p className="text-3xl font-bold text-gray-900">6+</p>
          <p className="text-sm text-gray-500 mt-0.5">Months Active</p>
        </div>
      </div>
    </div>

  </div>
</div>

	

			<section className="my-12 md:my-20">
				<div className="grid md:grid-cols-2 gap-8 lg:gap-12">
					{/* Mission Card */}
					<div className="group relative bg-yellow-100 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-gray-100">
						<div className="absolute inset-0 bg-gradient-to-br from-brand_primary/5 to-brand_secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
						<div className="relative p-8 lg:p-10">
							<div className="flex items-center mb-6">
								<div className="w-16 h-16 bg-gradient-to-br from-brand_primary to-brand_secondary rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
									<MessageCirclePlusIcon className="w-8 h-8 text-white" />
								</div>
								<div className="ml-4">
									<span className="text-sm font-semibold text-gray-700 uppercase tracking-wide">Mission</span>
								</div>
							</div>
							<h3 className="text-2xl lg:text-3xl font-bold text-gray-900 mb-6 leading-tight">
								{t("mission_title")}
							</h3>
							<p className="text-gray-600 leading-relaxed text-lg">
								{t("mission_description")}
							</p>
						
						</div>
					</div>

					{/* Vision Card */}
					<div className="group relative bg-red-900 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden">
						<div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
						<div className="relative p-8 lg:p-10 text-white">
							<div className="flex items-center mb-6">
								<div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
									<MessageCirclePlusIcon className="w-8 h-8 text-white" />
								</div>
								<div className="ml-4">
									<span className="text-sm font-semibold text-white/90 uppercase tracking-wide">Vision</span>
								</div>
							</div>
							<h3 className="text-2xl lg:text-3xl font-bold text-white mb-6 leading-tight">
								{t("vision_title")}
							</h3>
							<p className="text-white/90 leading-relaxed text-lg">
								{t("vision_description")}
							</p>
						
						</div>
					</div>
				</div>
			</section>
			<motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.4 }} className="mb-16">
				<header className="text-center mb-6 md:mb-8">
					<SectionHeader heading={t("values_title")} />
				</header>

				<div ref={scrollContainerRef} className="overflow-x-auto pb-4 no-scrollbar -mx-4 px-4 md:overflow-visible md:mx-0 md:px-0">
					<div className="flex gap-6 md:grid md:grid-cols-2 lg:grid-cols-3 md:gap-6" style={{ minWidth: "fit-content" }}>
						{values.map((value, index) => (
							<motion.div key={index} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }} className="bg-light rounded-xl p-6 hover:bg-white hover:shadow-lg transition-all duration-300 w-[85vw] sm:w-[45vw] md:w-full flex-shrink-0">
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
