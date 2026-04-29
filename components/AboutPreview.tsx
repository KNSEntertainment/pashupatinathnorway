"use client";
import React from "react";
import { motion } from "framer-motion";
import { Users, RefreshCcw, Heart, Target, Sparkles } from "lucide-react";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";
import ViewAllButton from "@/components/ViewAllButton";

export default function AboutPreview() {
	const t = useTranslations("about-us");
	const locale = useLocale();

	return (
		<section className="relative min-h-screen py-20 lg:py-32 bg-gradient-to-br from-slate-50 via-white to-orange-50/30 overflow-hidden" aria-labelledby="about-preview-heading">
			{/* Enhanced Background Elements */}
			<div className="absolute inset-0" aria-hidden="true">
				{/* Geometric Pattern */}
				<div className="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-orange-200/20 to-transparent rounded-full blur-3xl" />
				<div className="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-red-100/20 to-transparent rounded-full blur-3xl" />
				<div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-orange-50/10 via-transparent to-red-50/10 rounded-full blur-2xl" />
				
				{/* Subtle Grid Pattern */}
				<div 
					className="absolute inset-0 opacity-20"
					style={{
						backgroundImage: `linear-gradient(orange 1px, transparent 1px), linear-gradient(90deg, orange 1px, transparent 1px)`,
						backgroundSize: '60px 60px'
					}}
				/>
			</div>
			
			<div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
				{/* Enhanced Section Header */}
				<motion.div
					initial={{ opacity: 0, y: 40 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, ease: "easeOut" }}
					className="text-center mb-12 sm:mb-16 lg:mb-24 px-4"
				>
					{/* Badge */}
					<motion.div
						initial={{ opacity: 0, scale: 0.8 }}
						whileInView={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.6, delay: 0.1 }}
						className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 bg-gradient-to-r from-orange-100 to-red-100 rounded-full mb-4 sm:mb-6"
					>
						<Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-600" />
						<span className="text-xs sm:text-sm font-medium text-orange-800">Our Mission</span>
					</motion.div>
					
					<h1 id="about-preview-heading" className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold bg-gradient-to-r from-gray-900 via-orange-800 to-red-800 bg-clip-text text-transparent mb-4 sm:mb-6 leading-tight px-2">
						{t("title")}
					</h1>
					
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						whileInView={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
						className="max-w-4xl mx-auto px-4"
					>
						<p className="text-lg sm:text-xl md:text-2xl text-gray-600 leading-relaxed font-light">
							{t("subtitle")}
						</p>
					</motion.div>
				</motion.div>

				{/* Main Content Layout */}
				<div className="grid lg:grid-cols-2 gap-8 sm:gap-12 lg:gap-20 items-center mb-16 lg:mb-20">
					{/* Enhanced Text Content */}
					<motion.div 
						initial={{ opacity: 0, x: -50 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 1, ease: "easeOut" }}
						className="space-y-6 sm:space-y-8 lg:space-y-10"
					>
						{/* Mission Cards */}
						<div className="space-y-4 sm:space-y-6">
							<motion.div 
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.3 }}
								className="group relative bg-white/60 backdrop-blur-sm p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-orange-100/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2"
							>
								<div className="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-red-50/50 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
								<div className="relative z-10">
									<div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
										<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center flex-shrink-0">
											<Target className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
										</div>
									</div>
									<p className="text-gray-800 leading-relaxed text-base sm:text-lg font-medium">
										{t("about_description_1")}
									</p>
								</div>
							</motion.div>
							
							<motion.div 
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.8, delay: 0.4 }}
								className="group relative bg-white/60 backdrop-blur-sm p-6 sm:p-8 rounded-2xl sm:rounded-3xl border border-red-100/50 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-1 sm:hover:-translate-y-2"
							>
								<div className="absolute inset-0 bg-gradient-to-br from-red-50/50 to-orange-50/50 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
								<div className="relative z-10">
									<div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
										<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-gradient-to-br from-red-500 to-orange-500 flex items-center justify-center flex-shrink-0">
											<Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
										</div>
									</div>
									<p className="text-gray-800 leading-relaxed text-base sm:text-lg font-medium">
										{t("about_description_2")}
									</p>
								</div>
							</motion.div>
						</div>

						{/* Enhanced Statistics */}
						<motion.div 
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.8, delay: 0.5 }}
							className="grid grid-cols-2 gap-4 sm:gap-6"
							role="list"
							aria-label="Organization statistics"
						>
							<motion.div 
								whileHover={{ scale: 1.05 }}
								transition={{ duration: 0.3 }}
								className="group bg-gradient-to-br from-orange-500 to-orange-600 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
								role="listitem"
							>
								<div className="flex items-center justify-between mb-3 sm:mb-4">
									<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
										<Users className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
									</div>
									<div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center">
										<motion.div
											animate={{ rotate: 360 }}
											transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
										>
											<Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
										</motion.div>
									</div>
								</div>
								<motion.div
									initial={{ opacity: 0, scale: 0.5 }}
									whileInView={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.6, delay: 0.7 }}
									className="space-y-1"
								>
									<p className="text-2xl sm:text-3xl font-bold text-white">200+</p>
									<p className="text-orange-100 text-xs sm:text-sm font-medium">Active Members</p>
								</motion.div>
							</motion.div>
							
							<motion.div 
								whileHover={{ scale: 1.05 }}
								transition={{ duration: 0.3 }}
								className="group bg-gradient-to-br from-red-500 to-red-600 p-4 sm:p-6 rounded-xl sm:rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300"
								role="listitem"
							>
								<div className="flex items-center justify-between mb-3 sm:mb-4">
									<div className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
										<RefreshCcw className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
									</div>
									<div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-white/10 flex items-center justify-center">
										<motion.div
											animate={{ rotate: 360 }}
											transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
										>
											<Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-white/60" />
										</motion.div>
									</div>
								</div>
								<motion.div
									initial={{ opacity: 0, scale: 0.5 }}
									whileInView={{ opacity: 1, scale: 1 }}
									transition={{ duration: 0.6, delay: 0.8 }}
									className="space-y-1"
								>
									<p className="text-2xl sm:text-3xl font-bold text-white">6+</p>
									<p className="text-red-100 text-xs sm:text-sm font-medium">Months Active</p>
								</motion.div>
							</motion.div>
						</motion.div>
					</motion.div>

					{/* Enhanced Image Section */}
					<motion.div 
						initial={{ opacity: 0, x: 50 }}
						whileInView={{ opacity: 1, x: 0 }}
						transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
						className="relative order-first lg:order-last mb-8 lg:mb-0"
					>
						{/* Floating Card Design */}
						<div className="relative group">
							{/* Background Glow */}
							<div className="absolute -inset-4 sm:-inset-6 lg:-inset-8 bg-gradient-to-br from-orange-400/20 via-red-400/20 to-orange-400/20 rounded-2xl sm:rounded-3xl blur-xl sm:blur-2xl group-hover:blur-2xl sm:group-hover:blur-3xl transition-all duration-700" />
							
							{/* Main Image Container */}
							<div className="relative z-10">
								{/* Decorative Frame */}
								<div className="absolute inset-0 bg-gradient-to-br from-orange-200 via-white to-red-200 rounded-2xl sm:rounded-3xl transform rotate-2 sm:rotate-3 group-hover:rotate-4 sm:group-hover:rotate-6 transition-transform duration-700" />
								
								{/* Image */}
								<div className="relative rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl sm:shadow-2xl border-2 sm:border-4 border-white/80 backdrop-blur-sm">
									<Image 
										src="/pashupatinath.png" 
										alt="Pashupatinath Norway Temple - Community gathering and spiritual center" 
										width={600} 
										height={600} 
										className="w-full h-auto object-cover transform group-hover:scale-105 transition-transform duration-700" 
									/>
									
									{/* Overlay Gradient */}
									<div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
								</div>
							</div>

							{/* Floating Decorative Elements */}
							<motion.div
								animate={{ 
									y: [0, -15, 0],
									rotate: [0, 3, 0]
								}}
								transition={{ 
									duration: 6, 
									repeat: Infinity, 
									ease: "easeInOut"
								}}
								className="absolute -bottom-4 -right-4 sm:-bottom-6 sm:-right-6 w-12 h-12 sm:w-20 sm:h-20 bg-gradient-to-br from-orange-400 to-red-400 rounded-xl sm:rounded-2xl opacity-20 blur-lg sm:blur-xl"
								aria-hidden="true"
							/>
							<motion.div
								animate={{ 
									y: [0, 10, 0],
									rotate: [0, -3, 0]
								}}
								transition={{ 
									duration: 8, 
									repeat: Infinity, 
									ease: "easeInOut",
									delay: 2
								}}
								className="absolute top-1/3 -left-4 sm:-left-8 w-10 h-10 sm:w-16 sm:h-16 bg-gradient-to-br from-red-400 to-orange-400 rounded-xl sm:rounded-2xl opacity-20 blur-lg sm:blur-xl"
								aria-hidden="true"
							/>
						</div>
					</motion.div>
				</div>

				{/* Enhanced Call to Action */}
				<motion.div
					initial={{ opacity: 0, y: 30 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 1, delay: 0.6 }}
					className="flex justify-center pt-8"
				>
					<ViewAllButton href={`/${locale}/about-us`} label="Discover Our Journey" />
				</motion.div>
			</div>
		</section>
	);
}
