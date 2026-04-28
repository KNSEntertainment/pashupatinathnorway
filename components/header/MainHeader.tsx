"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import DesktopNav from "@/components/header/DesktopNav";
import AuthSection from "@/components/header/AuthSection";
import SearchButton from "@/components/header/SearchButton";
import MobileMenu from "@/components/MobileMenu";

export default function MainHeader() {
	const t = useTranslations("navigation");
	const locale = useLocale();

	const navItems = [
		{
			title: t("home"),
			href: "/",
			dropdown: [
				{ title: t("about"), href: "/about-us" },
				{ title: t("members"), href: "/members" },
			],
		},
		{
			title: t("updates"),
			href: "/updates",
			dropdown: [
				{ title: t("events"), href: "/events" },
				{ title: t("notices"), href: "/notices" },
				{ title: t("circulars"), href: "/circulars" },
				{ title: t("downloads"), href: "/downloads" },
			],
		},
		{ title: t("gallery"), href: "/gallery" },
		{ title: t("contact"), href: "/contact" },
	];

	return (
		<header className="bg-gradient-to-r from-brand via-brand to-emerald-600">
			<div className="container mx-auto px-4 lg:px-6 h-16 md:h-24 flex items-center justify-between">
				{/* Logo */}
				<Link href="/" locale={locale} className="flex items-center gap-3">
					<Image src="/rsp-norway-logo.png" alt="Logo" width={40} height={40} className="h-10 md:h-12 w-auto" priority />
					<div className="hidden md:flex flex-col text-white leading-5">
						<span className="font-bold">{t("pnsb")}</span>
						<span>{t("norway")}</span>
					</div>
				</Link>

				{/* Desktop Nav */}
				<DesktopNav navItems={navItems} />

				{/* Right Side */}
				<div className="flex items-center gap-2">
					<SearchButton />
					<Link href="/donate" locale={locale} className="hidden sm:flex btn-success">
						<span className=" md:inline">{t("donate")}</span>
					</Link>

					<AuthSection />

					<MobileMenu navItems={navItems} />
				</div>
			</div>
		</header>
	);
}
