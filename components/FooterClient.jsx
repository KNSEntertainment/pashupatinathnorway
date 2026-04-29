"use client";
import { MapPin, Mail, Phone, Facebook, Instagram, ArrowUpRight} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

export default function FooterClient({ settings }) {
	const t = useTranslations("footer");
	const locale = useLocale();
	
	return (
		<footer className="bg-brand_primary border-t border-gray-100 text-gray-900 py-16 relative overflow-hidden">
			{/* Background Pattern */}
			<div className="absolute inset-0 opacity-5">
				<div className="absolute inset-0 bg-gradient-to-br from-brand_primary/20 via-transparent to-transparent"></div>
			</div>
			
			<div className="container mx-auto px-6 relative z-10">
				{/* Main Footer Content */}
				<div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
					{/* About Column */}
				<div className="space-y-6">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-8 h-0.5 bg-gradient-to-r from-brand_secondary to-transparent"></div>
							<h3 className="text-lg font-semibold text-gray-900">{t("about_us")}</h3>
						</div>
						
						<div className="space-y-4">
									{/* Logo */}
				<Link href="/" locale={locale} className="flex items-center gap-1">
					<Image src="/pashupatinath.png" alt="Logo" width={40} height={40} className="h-16 md:h-20 w-auto" priority />
					<div className="flex flex-col text-gray-700 leading-5">
						<span className="font-bold">Pashupatinath Norway</span>
						<span>Temple</span>
						<p className="text-sm text-gray-600 leading-relaxed">Org nr. 926499211</p>
					</div>
				</Link>
				<p className="text-md text-gray-600 leading-relaxed">{t("tagline")}</p>
						</div>

					</div>

					{/* Contact Column */}
					<div className="space-y-6">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-8 h-0.5 bg-gradient-to-r from-brand_secondary to-transparent"></div>
							<h3 className="text-lg font-semibold text-gray-900">{t("contact_details")}</h3>
						</div>
						
						<div className="space-y-4">
							{/* Address */}
							<div className="flex items-center gap-3 group cursor-pointer">
								<div className="w-8 h-8 rounded-lg bg-brand_primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand_primary transition-all duration-300">
									<MapPin className="h-4 w-4 text-gray-700 group-hover:text-brand_secondary transition-colors" />
								</div>
								<div>
									<p className="text-sm font-medium text-gray-900">{t("address")}</p>
								</div>
							</div>

							{/* Email */}
							<a 
								href={`mailto:${settings?.[0]?.email}`} 
								className="flex items-center gap-3 group hover:translate-x-1 transition-transform duration-300"
							>
								<div className="w-8 h-8 rounded-lg bg-brand_primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand_primary transition-all duration-300">
									<Mail className="h-4 w-4 text-gray-700 group-hover:text-brand_secondary transition-colors" />
								</div>
								<div>
									<p className="text-sm font-medium text-gray-900 group-hover:text-brand_secondary transition-colors">{settings?.[0]?.email}</p>
								</div>
							</a>

							{/* Phone */}
							<a 
								href={`tel:${t("phone")}`} 
								className="flex items-center gap-3 group hover:translate-x-1 transition-transform duration-300"
							>
								<div className="w-8 h-8 rounded-lg bg-brand_primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand_primary transition-all duration-300">
									<Phone className="h-4 w-4 text-gray-700 group-hover:text-brand_secondary transition-colors" />
								</div>
								<div>
									<p className="text-sm font-medium text-gray-900 group-hover:text-brand_secondary transition-colors">{t("phone")}</p>
								</div>
							</a>
						</div>
					</div>

					{/* Social Media & Newsletter */}
					<div className="space-y-6">
						<div className="flex items-center gap-3 mb-4">
							<div className="w-8 h-0.5 bg-gradient-to-r from-brand_secondary to-transparent"></div>
							<h3 className="text-lg font-semibold text-gray-900">{t("follow_us")}</h3>
						</div>

						<div className="flex gap-3">
							{settings?.[0]?.facebook && (
								<a 
									href={settings[0].facebook} 
									target="_blank" 
									rel="noopener noreferrer" 
									className="group" 
									aria-label="Facebook"
								>
									<div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-700 group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
										<Facebook className="h-5 w-5 text-gray-700 group-hover:text-white transition-colors" />
									</div>
								</a>
							)}
							{settings?.[0]?.instagram && (
								<a 
									href={settings[0].instagram} 
									target="_blank" 
									rel="noopener noreferrer" 
									className="group" 
									aria-label="Instagram"
								>
									<div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-pink-500 group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
										<Instagram className="h-5 w-5 text-gray-700 group-hover:text-white transition-colors" />
									</div>
								</a>
							)}
						</div>

					</div>
				</div>

				{/* Bottom Section */}
				<div className="border-t border-gray-100 pt-8">
					<div className="flex flex-col lg:flex-row justify-between items-center gap-6">
						{/* Legal Links */}
						<nav className="flex flex-wrap items-center gap-6">
							<Link 
								href={`/${locale}/terms-and-conditions`} 
								className="text-sm text-gray-600 hover:text-brand_primary transition-colors flex items-center gap-1"
							>
								{t("terms")}
								<ArrowUpRight className="h-3 w-3" />
							</Link>
							<Link 
								href={`/${locale}/privacy-policy`} 
								className="text-sm text-gray-600 hover:text-brand_primary transition-colors flex items-center gap-1"
							>
								{t("privacy")}
								<ArrowUpRight className="h-3 w-3" />
							</Link>
						</nav>

						{/* Copyright */}
						<div className="text-center lg:text-right">
							{/* <p className="text-sm text-gray-600 mb-2">
								{t("copyright") || `© ${new Date().getFullYear()} Pashupatinath Norway Temple. All rights reserved.`}
							</p> */}
							<p className="text-xs text-gray-700">
								<span>{t("developed_by")} </span>
								<a 
									href="https://harisanjel.com.np" 
									target="_blank" 
									rel="noopener noreferrer" 
									className="font-medium text-brand_secondary hover:underline transition-all"
								>
									{t("developer")}
								</a>
							</p>
						</div>
					</div>
				</div>
			</div>
		</footer>
	);
}
