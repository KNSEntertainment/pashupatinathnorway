"use client";
import React from "react";
import { motion } from "framer-motion";
import { Users, RefreshCcw } from "lucide-react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import ViewAllButton from "@/components/ViewAllButton";

export default function AboutPreview() {
	const t = useTranslations("about-us");
	const locale = useLocale();



	return (
		<section className="relative py-24 bg-gradient-to-b from-white to-light overflow-hidden" aria-labelledby="about-preview-heading">
			{/* Background Pattern */}
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,rgba(255,196,69,0.08),transparent_40%)]" aria-hidden="true" />
			<div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,rgba(204,0,0,0.06),transparent_40%)]" aria-hidden="true" />
			
			<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Section Header */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.8 }}
					className="text-center mb-20"
				>
					<h2 id="about-preview-heading" className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
						{t("title")}
					</h2>
					<p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
						{t("subtitle")}
					</p>
				</motion.div>

				{/* Main Content Grid */}
				<div className="grid lg:grid-cols-2 gap-16 lg:gap-24 items-center mb-20">
					{/* Text Content Column */}
					<motion.div 
						initial={{ opacity: 0, x: -60 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8 }}
						className="space-y-8"
					>
						{/* About Description */}
						<div className="space-y-6">
							<motion.div 
								initial={{ opacity: 0, x: -20 }}
								whileInView={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.6, delay: 0.2 }}
								className="relative"
							>
								<div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-brand_primary to-brand_secondary rounded-full" />
								<div className="pl-8">
									<p className="text-gray-900 leading-relaxed text-lg">
										{t("about_description_1")}
									</p>
								</div>
							</motion.div>
							
							<motion.div 
								initial={{ opacity: 0, x: -20 }}
								whileInView={{ opacity: 1, x: 0 }}
								transition={{ duration: 0.6, delay: 0.3 }}
								className="relative"
							>
								<div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-brand_secondary to-blue-500 rounded-full" />
								<div className="pl-8">
									<p className="text-gray-900 leading-relaxed text-lg">
										{t("about_description_2")}
									</p>
								</div>
							</motion.div>
						</div>

						{/* Statistics */}
						<motion.div 
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.6, delay: 0.4 }}
							className="grid grid-cols-2 gap-8 pt-8"
							role="list"
							aria-label="Organization statistics"
						>
							<div className="group" role="listitem">
								<div className="flex items-center gap-4 mb-3">
									<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand_primary to-brand_primary_light flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
										<Users className="w-7 h-7 text-white" />
									</div>
									<div>
										<motion.p 
											initial={{ opacity: 0 }}
											whileInView={{ opacity: 1 }}
											transition={{ duration: 0.8, delay: 0.6 }}
											className="text-3xl font-bold text-gray-900"
											aria-label="200 plus members"
										>
											200+
										</motion.p>
										<p className="text-sm text-gray-600 font-medium">Active Members</p>
									</div>
								</div>
							</div>
							
							<div className="group" role="listitem">
								<div className="flex items-center gap-4 mb-3">
									<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-brand_secondary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300" aria-hidden="true">
										<RefreshCcw className="w-7 h-7 text-white" />
									</div>
									<div>
										<motion.p 
											initial={{ opacity: 0 }}
											whileInView={{ opacity: 1 }}
											transition={{ duration: 0.8, delay: 0.7 }}
											className="text-3xl font-bold text-gray-900"
											aria-label="6 plus months active"
										>
											6+
										</motion.p>
										<p className="text-sm text-gray-600 font-medium">Months Active</p>
									</div>
								</div>
							</div>
						</motion.div>
					</motion.div>

					{/* Image Column */}
					<motion.div 
						initial={{ opacity: 0, x: 60 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="relative"
					>
						<div className="relative group">
							{/* Main Image Container */}
							<div className="relative z-10">
								{/* <div className="absolute -inset-4 bg-gradient-to-br from-brand_primary via-brand_secondary to-blue-500 rounded-3xl transform rotate-1 group-hover:rotate-2 transition-transform duration-700 opacity-20" aria-hidden="true" /> */}
								
								<div className="relative rounded-3xl overflow-hidden border border-white/50">
									<Image 
										src="/pashupatinath.png" 
										alt="Community members gathered together at a cultural event" 
										width={500} 
										height={500} 
										className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" 
									/>

									{/* Overlay Gradient */}
									{/* <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" aria-hidden="true" /> */}
								</div>
							</div>

							{/* Floating Badge */}
							{/* <motion.div 
								initial={{ opacity: 0, scale: 0.8, rotate: -12 }}
								whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
								transition={{ duration: 0.6, delay: 0.5 }}
								className="absolute -top-6 -left-6 bg-white rounded-2xl shadow-xl p-6 hidden lg:block"
								role="complementary"
								aria-label="Community focused organization"
							>
								<div className="flex items-center gap-4">
									<div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-brand_primary to-brand_secondary flex items-center justify-center shadow-md" aria-hidden="true">
										<Users className="w-7 h-7 text-white" />
									</div>
									<div>
										<p className="text-sm font-bold text-gray-900">Community</p>
										<p className="text-sm text-gray-600">First</p>
									</div>
								</div>
							</motion.div> */}

							{/* Decorative Elements */}
							<div className="absolute -bottom-4 -right-4 w-24 h-24 bg-gradient-to-br from-brand_primary to-transparent rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700" aria-hidden="true" />
							<div className="absolute top-1/2 -left-8 w-16 h-16 bg-gradient-to-br from-brand_secondary to-transparent rounded-full opacity-10 group-hover:scale-150 transition-transform duration-700" aria-hidden="true" />
						</div>
					</motion.div>
				</div>

				{/* Call to Action */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.6 }}
					className="text-center"
				>
					<ViewAllButton href={`/${locale}/about-us`} label="Learn More About Us" />
				</motion.div>
			</div>
		</section>
	);
}
