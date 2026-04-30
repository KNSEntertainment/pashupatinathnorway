// "use client";
// import { MapPin, Mail, Phone, Facebook, Instagram, ArrowUpRight} from "lucide-react";
// import Link from "next/link";
// import Image from "next/image";
// import { useTranslations, useLocale } from "next-intl";

// export default function FooterClient({ settings }) {
// 	const t = useTranslations("footer");
// 	const locale = useLocale();
	
// 	return (
// 		<footer className="bg-brand_primary border-t border-gray-100 text-gray-900 py-16 relative overflow-hidden">
// 			{/* Background Pattern */}
// 			<div className="absolute inset-0 opacity-5">
// 				<div className="absolute inset-0 bg-gradient-to-br from-brand_primary/20 via-transparent to-transparent"></div>
// 			</div>
			
// 			<div className="container mx-auto px-6 relative z-10">
// 				{/* Main Footer Content */}
// 				<div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-16">
// 					{/* About Column */}
// 				<div className="space-y-6">
// 						<div className="flex items-center gap-3 mb-4">
// 							<div className="w-8 h-0.5 bg-gradient-to-r from-brand_secondary to-transparent"></div>
// 							<h3 className="text-lg font-semibold text-gray-900">{t("about_us")}</h3>
// 						</div>
						
// 						<div className="space-y-4">
// 									{/* Logo */}
// 				<Link href="/" locale={locale} className="flex items-center gap-1">
// 					<Image src="/pashupatinath.png" alt="Logo" width={40} height={40} className="h-16 md:h-20 w-auto" priority />
// 					<div className="flex flex-col text-gray-700 leading-5">
// 						<span className="font-bold">Pashupatinath Norway</span>
// 						<span>Temple</span>
// 						<p className="text-sm text-gray-600 leading-relaxed">Org nr. 926499211</p>
// 					</div>
// 				</Link>
// 				<p className="text-md text-gray-600 leading-relaxed">{t("tagline")}</p>
// 						</div>

// 					</div>

// 					{/* Contact Column */}
// 					<div className="space-y-6">
// 						<div className="flex items-center gap-3 mb-4">
// 							<div className="w-8 h-0.5 bg-gradient-to-r from-brand_secondary to-transparent"></div>
// 							<h3 className="text-lg font-semibold text-gray-900">{t("contact_details")}</h3>
// 						</div>
						
// 						<div className="space-y-4">
// 							{/* Address */}
// 							<div className="flex items-center gap-3 group cursor-pointer">
// 								<div className="w-8 h-8 rounded-lg bg-brand_primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand_primary transition-all duration-300">
// 									<MapPin className="h-4 w-4 text-gray-700 group-hover:text-brand_secondary transition-colors" />
// 								</div>
// 								<div>
// 									<p className="text-sm font-medium text-gray-900">{t("address")}</p>
// 								</div>
// 							</div>

// 							{/* Email */}
// 							<a 
// 								href={`mailto:${settings?.[0]?.email}`} 
// 								className="flex items-center gap-3 group hover:translate-x-1 transition-transform duration-300"
// 							>
// 								<div className="w-8 h-8 rounded-lg bg-brand_primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand_primary transition-all duration-300">
// 									<Mail className="h-4 w-4 text-gray-700 group-hover:text-brand_secondary transition-colors" />
// 								</div>
// 								<div>
// 									<p className="text-sm font-medium text-gray-900 group-hover:text-brand_secondary transition-colors">{settings?.[0]?.email}</p>
// 								</div>
// 							</a>

// 							{/* Phone */}
// 							<a 
// 								href={`tel:${t("phone")}`} 
// 								className="flex items-center gap-3 group hover:translate-x-1 transition-transform duration-300"
// 							>
// 								<div className="w-8 h-8 rounded-lg bg-brand_primary/10 flex items-center justify-center flex-shrink-0 group-hover:bg-brand_primary transition-all duration-300">
// 									<Phone className="h-4 w-4 text-gray-700 group-hover:text-brand_secondary transition-colors" />
// 								</div>
// 								<div>
// 									<p className="text-sm font-medium text-gray-900 group-hover:text-brand_secondary transition-colors">{t("phone")}</p>
// 								</div>
// 							</a>
// 						</div>
// 					</div>

// 					{/* Social Media & Newsletter */}
// 					<div className="space-y-6">
// 						<div className="flex items-center gap-3 mb-4">
// 							<div className="w-8 h-0.5 bg-gradient-to-r from-brand_secondary to-transparent"></div>
// 							<h3 className="text-lg font-semibold text-gray-900">{t("follow_us")}</h3>
// 						</div>

// 						<div className="flex gap-3">
// 							{settings?.[0]?.facebook && (
// 								<a 
// 									href={settings[0].facebook} 
// 									target="_blank" 
// 									rel="noopener noreferrer" 
// 									className="group" 
// 									aria-label="Facebook"
// 								>
// 									<div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-blue-700 group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
// 										<Facebook className="h-5 w-5 text-gray-700 group-hover:text-white transition-colors" />
// 									</div>
// 								</a>
// 							)}
// 							{settings?.[0]?.instagram && (
// 								<a 
// 									href={settings[0].instagram} 
// 									target="_blank" 
// 									rel="noopener noreferrer" 
// 									className="group" 
// 									aria-label="Instagram"
// 								>
// 									<div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center group-hover:bg-gradient-to-br group-hover:from-purple-500 group-hover:to-pink-500 group-hover:shadow-lg transition-all duration-300 transform group-hover:scale-105">
// 										<Instagram className="h-5 w-5 text-gray-700 group-hover:text-white transition-colors" />
// 									</div>
// 								</a>
// 							)}
// 						</div>

// 					</div>
// 				</div>

// 				{/* Bottom Section */}
// 				<div className="border-t border-gray-100 pt-8">
// 					<div className="flex flex-col lg:flex-row justify-between items-center gap-6">
// 						{/* Legal Links */}
// 						<nav className="flex flex-wrap items-center gap-6">
// 							<Link 
// 								href={`/${locale}/terms-and-conditions`} 
// 								className="text-sm text-gray-600 hover:text-brand_primary transition-colors flex items-center gap-1"
// 							>
// 								{t("terms")}
// 								<ArrowUpRight className="h-3 w-3" />
// 							</Link>
// 							<Link 
// 								href={`/${locale}/privacy-policy`} 
// 								className="text-sm text-gray-600 hover:text-brand_primary transition-colors flex items-center gap-1"
// 							>
// 								{t("privacy")}
// 								<ArrowUpRight className="h-3 w-3" />
// 							</Link>
// 						</nav>

// 						{/* Copyright */}
// 						<div className="text-center lg:text-right">
// 							{/* <p className="text-sm text-gray-600 mb-2">
// 								{t("copyright") || `© ${new Date().getFullYear()} Pashupatinath Norway Temple. All rights reserved.`}
// 							</p> */}
// 							<p className="text-xs text-gray-700">
// 								<span>{t("developed_by")} </span>
// 								<a 
// 									href="https://harisanjel.com.np" 
// 									target="_blank" 
// 									rel="noopener noreferrer" 
// 									className="font-medium text-brand_secondary hover:underline transition-all"
// 								>
// 									{t("developer")}
// 								</a>
// 							</p>
// 						</div>
// 					</div>
// 				</div>
// 			</div>
// 		</footer>
// 	);
// }

"use client";
import { MapPin, Mail, Phone, Facebook, Instagram, ArrowUpRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { useTranslations, useLocale } from "next-intl";

export default function FooterClient({ settings }) {
	const t = useTranslations("footer");
	const locale = useLocale();

	return (
		<footer className="relative bg-stone-950 text-white overflow-hidden">
			{/* Decorative top border */}
			<div className="h-px w-full bg-gradient-to-r from-transparent via-amber-500/60 to-transparent" />

			{/* Subtle mandala/pattern watermark */}
			<div
				aria-hidden="true"
				className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.03]"
			>
				<svg viewBox="0 0 400 400" className="w-[600px] h-[600px]" fill="none" xmlns="http://www.w3.org/2000/svg">
					<circle cx="200" cy="200" r="190" stroke="white" strokeWidth="1" />
					<circle cx="200" cy="200" r="150" stroke="white" strokeWidth="1" />
					<circle cx="200" cy="200" r="110" stroke="white" strokeWidth="1" />
					<circle cx="200" cy="200" r="70" stroke="white" strokeWidth="1" />
					{[0,30,60,90,120,150,180,210,240,270,300,330].map((deg) => (
						<line
							key={deg}
							x1="200" y1="10"
							x2="200" y2="390"
							stroke="white" strokeWidth="0.5"
							transform={`rotate(${deg} 200 200)`}
						/>
					))}
				</svg>
			</div>

			<div className="relative z-10 max-w-6xl mx-auto px-5 sm:px-8 pt-14 pb-8">

				{/* ── Top: Logo + tagline centred on mobile, left on desktop ── */}
				<div className="flex flex-col items-center sm:items-start mb-12">
					<Link href="/" locale={locale} className="flex items-center gap-3 group mb-4">
						<Image
							src="/pashupatinath.png"
							alt="Logo"
							width={40}
							height={40}
							className="h-14 w-auto drop-shadow-[0_0_8px_rgba(251,191,36,0.4)] group-hover:drop-shadow-[0_0_14px_rgba(251,191,36,0.7)] transition-all duration-500"
							priority
						/>
						<div className="flex flex-col leading-snug">
							<span className="font-bold text-white text-base tracking-wide">Pashupatinath Norway</span>
							<span className="text-amber-400/80 text-sm tracking-widest uppercase font-light">Temple</span>
							<span className="text-stone-500 text-xs mt-0.5">Org nr. 926499211</span>
						</div>
					</Link>
					<p className="text-stone-400 text-sm leading-relaxed text-center sm:text-left max-w-xs">
						{t("tagline")}
					</p>
				</div>

				{/* ── Main grid ── */}
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10 mb-12">

					{/* Contact */}
					<div>
						<SectionLabel>{t("contact_details")}</SectionLabel>
						<ul className="space-y-4 mt-5">
							<ContactRow icon={<MapPin className="h-4 w-4" />}>
								<p className="text-sm text-stone-300">{t("address")}</p>
							</ContactRow>

							<li>
								<a
									href={`mailto:${settings?.[0]?.email}`}
									className="flex items-start gap-3 group"
								>
									<IconBubble>
										<Mail className="h-4 w-4" />
									</IconBubble>
									<span className="text-sm text-stone-300 group-hover:text-amber-400 transition-colors duration-300 break-all pt-0.5">
										{settings?.[0]?.email}
									</span>
								</a>
							</li>

							<li>
								<a
									href={`tel:${t("phone")}`}
									className="flex items-start gap-3 group"
								>
									<IconBubble>
										<Phone className="h-4 w-4" />
									</IconBubble>
									<span className="text-sm text-stone-300 group-hover:text-amber-400 transition-colors duration-300 pt-0.5">
										{t("phone")}
									</span>
								</a>
							</li>
						</ul>
					</div>

					{/* Social */}
					<div>
						<SectionLabel>{t("follow_us")}</SectionLabel>
						<div className="flex gap-3 mt-5">
							{settings?.[0]?.facebook && (
								<SocialButton
									href={settings[0].facebook}
									label="Facebook"
									hoverClass="hover:bg-blue-600 hover:border-blue-600"
								>
									<Facebook className="h-5 w-5" />
								</SocialButton>
							)}
							{settings?.[0]?.instagram && (
								<SocialButton
									href={settings[0].instagram}
									label="Instagram"
									hoverClass="hover:bg-gradient-to-br hover:from-purple-500 hover:to-pink-500 hover:border-pink-500"
								>
									<Instagram className="h-5 w-5" />
								</SocialButton>
							)}
						</div>
					</div>

					{/* Legal links — promoted to a column on desktop */}
					<div>
						<SectionLabel>{t("about_us")}</SectionLabel>
						<nav className="flex flex-col gap-3 mt-5">
							<LegalLink href={`/${locale}/terms-and-conditions`} label={t("terms")} />
							<LegalLink href={`/${locale}/privacy-policy`} label={t("privacy")} />
						</nav>
					</div>
				</div>

				{/* ── Bottom bar ── */}
				<div className="h-px w-full bg-stone-800 mb-6" />

				<div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-stone-500">
					<span>© {new Date().getFullYear()} Pashupatinath Norway Temple</span>
					<span>
						{t("developed_by")}{" "}
						<a
							href="https://harisanjel.com.np"
							target="_blank"
							rel="noopener noreferrer"
							className="text-amber-400 hover:text-amber-300 transition-colors font-medium"
						>
							{t("developer")}
						</a>
					</span>
				</div>
			</div>
		</footer>
	);
}

/* ── Small helper sub-components ── */

function SectionLabel({ children }) {
	return (
		<div className="flex items-center gap-2">
			<span className="block w-5 h-px bg-amber-500" />
			<h3 className="text-xs font-semibold tracking-widest uppercase text-amber-400/90">
				{children}
			</h3>
		</div>
	);
}

function IconBubble({ children }) {
	return (
		<div className="mt-0.5 flex-shrink-0 w-8 h-8 rounded-lg bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400 group-hover:border-amber-500/50 group-hover:text-amber-400 transition-all duration-300">
			{children}
		</div>
	);
}

function ContactRow({ icon, children }) {
	return (
		<li className="flex items-start gap-3 group">
			<IconBubble>{icon}</IconBubble>
			<div className="pt-0.5">{children}</div>
		</li>
	);
}

function SocialButton({ href, label, hoverClass, children }) {
	return (
		<a
			href={href}
			target="_blank"
			rel="noopener noreferrer"
			aria-label={label}
			className={`w-11 h-11 rounded-xl bg-stone-800 border border-stone-700 flex items-center justify-center text-stone-400 hover:text-white hover:scale-105 hover:shadow-lg transition-all duration-300 ${hoverClass}`}
		>
			{children}
		</a>
	);
}

function LegalLink({ href, label }) {
	return (
		<Link
			href={href}
			className="inline-flex items-center gap-1 text-sm text-stone-400 hover:text-amber-400 transition-colors duration-300 group"
		>
			{label}
			<ArrowUpRight className="h-3 w-3 opacity-0 group-hover:opacity-100 -translate-x-1 group-hover:translate-x-0 transition-all duration-300" />
		</Link>
	);
}
