"use client";
import React from "react";
import { motion } from "framer-motion";
import { Users, RefreshCcw } from "lucide-react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import SectionHeader from "@/components/SectionHeader";
import ViewAllButton from "@/components/ViewAllButton";

export default function AboutPreview() {
	const t = useTranslations("about-us");
	const locale = useLocale();



	return (
		<section className="py-16 bg-white">
			<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<SectionHeader heading={t("title")} subtitle={t("subtitle")} />

				{/* Main Content Grid */}
				<div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center mb-16">
					{/* Text Content Column */}
					<motion.div 
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6 }}
						className="space-y-6"
					>
						{/* About Description */}
						<div className="space-y-4">
							<div className="relative pl-6 border-l-4 border-brand/30">
								<p className="text-gray-900 leading-relaxed text-lg">{t("about_description_1")}</p>
							</div>
							<div className="relative pl-6 border-l-4 border-blue-500/30">
								<p className="text-gray-900 leading-relaxed text-lg">{t("about_description_2")}</p>
							</div>
						</div>

						{/* Statistics */}
						<div className="flex gap-8 pt-6">
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 rounded-full bg-brand/10 flex items-center justify-center">
									<Users className="w-6 h-6 text-brand" />
								</div>
								<div>
									<p className="text-2xl font-bold text-gray-900">200+</p>
									<p className="text-sm text-gray-600">Members</p>
								</div>
							</div>
							<div className="flex items-center gap-3">
								<div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center">
									<RefreshCcw className="w-6 h-6 text-brand" />
								</div>
								<div>
									<p className="text-2xl font-bold text-gray-900">6+</p>
									<p className="text-sm text-gray-600">Months Active</p>
								</div>
							</div>
						</div>
					</motion.div>

					{/* Image Column */}
					<motion.div 
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.6, delay: 0.2 }}
						className="relative"
					>
						<div className="relative group">
							{/* Floating Card Effect */}
							<div className="relative z-10">
								<div className="absolute inset-0 bg-gradient-to-br from-brand to-blue-600 rounded-2xl transform rotate-2 group-hover:rotate-3 transition-transform duration-500" />
								<div className="absolute inset-0 bg-gradient-to-br from-green-600 to-brand rounded-2xl transform -rotate-2 group-hover:-rotate-3 transition-transform duration-500" />

								<div className="relative rounded-2xl overflow-hidden shadow-2xl">
									<Image 
										src="/rabibalen.jpg" 
										alt="Community Experience" 
										width={400} 
										height={400} 
										className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" 
									/>

									{/* Overlay Gradient */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
								</div>
							</div>

							{/* Floating Badge */}
							<div className="absolute -top-4 -left-4 bg-white rounded-2xl shadow-xl p-4 transform -rotate-6 group-hover:rotate-0 transition-transform duration-500 hidden lg:block">
								<div className="flex items-center gap-3">
									<div className="w-12 h-12 rounded-full bg-gradient-to-br from-brand to-blue-600 flex items-center justify-center">
										<Users className="w-6 h-6 text-white" />
									</div>
									<div>
										<p className="text-xs font-semibold text-gray-900">Community</p>
										<p className="text-xs text-gray-900">Driven</p>
									</div>
								</div>
							</div>
						</div>
					</motion.div>
				</div>

				{/* Call to Action */}
				<div className="flex justify-center">
					<ViewAllButton href={`/${locale}/about-us`} label="Learn More About Us" />
				</div>
			</div>
		</section>
	);
}
