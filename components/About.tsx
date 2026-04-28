"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { Users, Heart, ArrowRight, HandHeart } from "lucide-react";

export default function About() {
	const locale = useLocale();
	const t = useTranslations("about");


	const ctas = [
		{ href: "/membership", title: t("cta_member_title"), description: t("cta_member_desc"), color: "bg-brand", icon: Users },
		{ href: "/donate", title: t("cta_donate_title"), description: t("cta_donate_desc"), color: "bg-success", icon: Heart },
		{ href: "/get-involved", title: t("cta_involved_title"), description: t("cta_involved_desc"), color: "bg-blue-600", icon: HandHeart },
	];

	return (
		<section id="about" className="pt-8 md:pt-20">
			<div className="container mx-auto px-6">


		

				{/* Call to Actions */}
				<div className="-mt-16 sm:-mt-36 relative z-10 px-6">
				
					<div className=" grid grid-cols-1 md:grid-cols-4 gap-6">
						{ctas.map((cta, index) => (
							<Link key={index} href={`/${locale}${cta.href}`}>
								<div
									className={`${cta.color} rounded-xl p-6 text-white cursor-pointer group shadow-lg hover:shadow-2xl transition-all duration-300`}
								>
									<div className="flex items-start justify-between mb-4">
										<motion.div
											whileHover={{ rotate: [0, -10, 10, 0] }}
											transition={{ duration: 0.5, ease: "easeInOut" }}
										>
											<cta.icon className="w-8 h-8" />
										</motion.div>
										<motion.div
											whileHover={{ x: 3 }}
											transition={{ duration: 0.3, ease: "easeOut" }}
										>
											<ArrowRight className="w-5 h-5 transition-transform duration-300" />
										</motion.div>
									</div>
									<h4 className="text-xl font-bold mb-2">
										{cta.title}
									</h4>
									<p className="text-white text-sm leading-relaxed">
										{cta.description}
									</p>
								</div>
							</Link>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
