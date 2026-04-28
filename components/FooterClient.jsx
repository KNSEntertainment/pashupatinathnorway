"use client";
import { MapPin, Mail, Phone, Facebook, Instagram, ArrowUpRight} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

export default function FooterClient({ settings }) {
	const t = useTranslations("footer");
	const locale = useLocale();
	
	return (
		<footer className="bg-gradient-to-b from-gray-100 to-gray-50 text-gray-900 pt-12 pb-6">
			<div className="container mx-auto px-4">
				{/* Logo Section - Mobile First */}
				<div className="flex flex-col items-center text-center mb-10 md:hidden">
					<Image src={settings?.[0]?.companyLogo || "/rsp-norway-logo.png"} alt={t("logo_alt")} width={100} height={100} className="w-20 h-20 object-contain mb-4" />
					<h2 className="text-xl font-bold text-gray-900 mb-2">{t("logo_head")}</h2>
					<p className="text-sm text-gray-900 max-w-xs leading-relaxed mb-6">{t("tagline")}</p>
					
			
				</div>

				
				{/* Main Footer Grid */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 mb-8">
					{/* About Column */}
					<div className="space-y-4">
						<h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
							<span className="w-1 h-5 bg-brand rounded-full"></span>
							{t("about_us")}
						</h3>
						<p className="text-md md:text-xl text-gray-900 leading-relaxed">{t("about_description")}</p>
					</div>

					{/* Logo Column - Desktop Only */}
					<div className="hidden md:flex flex-col items-center justify-start text-center">
						<Image src={settings?.[0]?.companyLogo || "/rsp-norway-logo.png"} alt={t("logo_alt")} width={100} height={100} className="w-24 h-24 object-contain mb-4" />
						<h2 className="text-2xl font-bold text-gray-900 mb-2">{t("logo_head")}</h2>
						<p className="text-md text-gray-900 max-w-md leading-relaxed mb-6">{t("tagline")}</p>
			
					</div>

					{/* Contact Column */}
					<div className="space-y-4">
						<h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
							<span className="w-1 h-5 bg-brand rounded-full"></span>
							{t("contact_details")}
						</h3>
						<div className="space-y-1">
							{/* Address */}
							<div className="flex items-start gap-3 group">
								<MapPin className="h-4 w-4 text-brand mt-0.5 flex-shrink-0 transition-transform group-hover:scale-110" />
								<p className="text-md md:text-xl text-gray-900 leading-relaxed">{t("address")}</p>
							</div>

							{/* Email */}
							<a href={`mailto:${settings?.[0]?.email}`} className="flex items-center gap-3 group hover:translate-x-1 transition-transform">
								<Mail className="h-4 w-4 text-brand flex-shrink-0 transition-transform group-hover:scale-110" />
								<span className="text-md md:text-xl text-gray-900 hover:text-brand transition-colors">{settings?.[0]?.email}</span>
							</a>

							{/* Phone */}
							<a href={`tel:${t("phone")}`} className="flex items-center gap-3 group hover:translate-x-1 transition-transform">
								<Phone className="h-4 w-4 text-brand flex-shrink-0 transition-transform group-hover:scale-110" />
								<span className="text-md md:text-xl text-gray-900 hover:text-brand transition-colors">{t("phone")}</span>
							</a>

							{/* Social Media */}
							<div className="pt-6 border-t border-light">
								<h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
									<span className="w-1 h-5 bg-brand rounded-full"></span>
									{t("follow_us")}
								</h3>

								<div className="flex gap-2 mt-2">
									{settings?.[0]?.facebook && (
										<a href={settings[0].facebook} target="_blank" rel="noopener noreferrer" className="group" aria-label="Facebook">
											<div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center group-hover:bg-brand transition-colors">
												<Facebook className="h-4 w-4 text-brand group-hover:text-white transition-colors" />
											</div>
										</a>
									)}
									{settings?.[0]?.instagram && (
										<a href={settings[0].instagram} target="_blank" rel="noopener noreferrer" className="group" aria-label="Instagram">
											<div className="w-9 h-9 rounded-full bg-brand/10 flex items-center justify-center group-hover:bg-purple-500 transition-colors">
												<Instagram className="h-4 w-4 text-brand group-hover:text-white transition-colors" />
											</div>
										</a>
									)}
								</div>
							</div>
						</div>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="border-t border-zinc-200 pt-6 mt-8">
					{/* Links - Mobile Stacked, Desktop Row */}
					<div className="flex flex-col md:flex-row md:justify-between md:items-center gap-2 md:gap-4 mb-4">
						<nav className="flex flex-wrap gap-4 justify-between md:justify-start">
							<Link href={`/${locale}/terms-and-conditions`} className="text-md text-gray-900 hover:text-brand transition-colors">
								{t("terms")}
								<ArrowUpRight className="h-3 w-3 inline-block ml-1" />
							</Link>
							<span className="text-neutral-300 hidden md:inline">·</span>
							<Link href={`/${locale}/privacy-policy`} className="text-md text-gray-900 hover:text-brand transition-colors">
								{t("privacy")} <ArrowUpRight className="h-3 w-3 inline-block ml-1" />
							</Link>
						</nav>

						<div className="text-md text-gray-900 text-center md:text-right">{t("copyright") || `© ${new Date().getFullYear()} PNSB-Norway. All rights reserved.`}</div>
					</div>

					{/* Developer Credit */}
					<div className="text-sm text-gray-900 text-center md:text-right">
						<span>{t("developed_by")} </span>
						<a href="https://harisanjel.com.np" target="_blank" rel="noopener noreferrer" className="font-semibold text-brand hover:underline transition-all">
							{t("developer")}
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}
