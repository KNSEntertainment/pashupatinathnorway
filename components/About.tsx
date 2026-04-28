"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Users, Heart, ArrowRight, HandHeart } from "lucide-react";

export default function About() {
	const locale = useLocale();
	const t = useTranslations("about");


	const ctas = [
		{ href: "/membership", title: t("cta_member_title"), description: t("cta_member_desc"), color: "bg-brand_secondary", icon: Users },
		{ href: "/donate", title: t("cta_donate_title"), description: t("cta_donate_desc"), color: "bg-success", icon: Heart },
		{ href: "/get-involved", title: t("cta_involved_title"), description: t("cta_involved_desc"), color: "bg-blue-600", icon: HandHeart },
	];

	return (
		<section id="about" className="relative py-20 md:py-32 overflow-hidden" aria-labelledby="about-heading">
			{/* Background Pattern */}
			<div className="absolute inset-0 bg-gradient-to-br from-light via-white to-light" aria-hidden="true">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,196,69,0.1),transparent_50%)]" />
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(204,0,0,0.05),transparent_50%)]" />
			</div>
			
			<div className="relative container mx-auto px-6">
				{/* Section Header */}
				<motion.div 
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-16"
				>
					<h2 id="about-heading" className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
						Get Involved
					</h2>
					<p className="text-xl text-gray-600 max-w-2xl mx-auto">
						Join our community and help us preserve and share our rich cultural heritage
					</p>
				</motion.div>

				{/* Call to Actions */}
				<div className="max-w-6xl mx-auto">
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8" role="list">
						{ctas.map((cta, index) => (
							<motion.div
								key={index}
								initial={{ opacity: 0, y: 30 }}
								whileInView={{ opacity: 1, y: 0 }}
								transition={{ duration: 0.6, delay: index * 0.1 }}
								role="listitem"
							>
								<Link 
									href={`/${locale}${cta.href}`} 
									className="block group focus:outline-none focus:ring-4 focus:ring-brand_primary/20 rounded-2xl"
									aria-label={`Learn more about ${cta.title}: ${cta.description}`}
								>
									<div className="relative h-full p-8 bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
										{/* Gradient Overlay */}
										<div className={`absolute inset-0 ${cta.color} opacity-0 group-hover:opacity-5 rounded-2xl transition-opacity duration-500`} aria-hidden="true" />
										
										{/* Icon Container */}
										<div className="relative mb-6">
											<div className={`inline-flex p-4 ${cta.color} rounded-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`} aria-hidden="true">
												<cta.icon className="w-8 h-8 text-white" />
											</div>
										</div>

										{/* Content */}
										<div className="relative">
											<h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-brand_secondary transition-colors duration-300">
												{cta.title}
											</h3>
											<p className="text-gray-600 leading-relaxed mb-6">
												{cta.description}
											</p>
											
											{/* Arrow Indicator */}
											<div className="flex items-center text-brand_secondary font-semibold group-hover:text-brand_secondary_light transition-colors duration-300">
												<span className="mr-2">Learn More</span>
												<ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" aria-hidden="true" />
											</div>
										</div>

										{/* Decorative Corner */}
										<div className={`absolute top-0 right-0 w-20 h-20 ${cta.color} opacity-10 rounded-bl-full`} aria-hidden="true" />
									</div>
								</Link>
							</motion.div>
						))}
					</div>
				</div>

				{/* Bottom Decorative Element */}
				<motion.div
					initial={{ opacity: 0, scale: 0.8 }}
					whileInView={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.8, delay: 0.4 }}
					className="mt-20 text-center"
					aria-hidden="true"
				>
					<div className="inline-flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-md border border-gray-100">
						<div className="w-2 h-2 bg-brand_primary rounded-full animate-pulse" />
						<span className="text-sm text-gray-600">Community Driven • Culturally Rich • Future Focused</span>
						<div className="w-2 h-2 bg-brand_secondary rounded-full animate-pulse" />
					</div>
				</motion.div>
			</div>
		</section>
	);
}
