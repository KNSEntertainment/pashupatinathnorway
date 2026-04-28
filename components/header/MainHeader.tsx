"use client";

import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { useTranslations, useLocale } from "next-intl";
import DesktopNav from "@/components/header/DesktopNav";
import AuthSection from "@/components/header/AuthSection";
import SearchButton from "@/components/header/SearchButton";
import MobileMenu from "@/components/MobileMenu";
import CartButton from "@/components/CartButton";

export default function MainHeader() {
	const t = useTranslations("navigation");
	const locale = useLocale();

	const navItems = [
		{
			title: t("home"),
			href: "/",
			
		},
		{
			title: t("events"),
			href: "/events",
		
		},
		{ title: t("rituals"), href: "/rituals" },
		{ title: t("festivals"), href: "/festivals" },
		{ title: t("management"), href: "/management" },
		{ title: t("gallery"), href: "/gallery" },
		{ title: "Store", href: "/store" },
		{ title: t("contact"), href: "/contact" },
	];

	return (
		<header className="bg-red-700">
			<div className="container mx-auto px-4 lg:px-6 h-16 md:h-24 flex items-center justify-between">
				{/* Logo */}
				<Link href="/" locale={locale} className="flex items-center gap-1">
					<Image src="/pashupatinath.png" alt="Logo" width={40} height={40} className="h-10 md:h-12 w-auto" priority />
					<div className="hidden md:flex flex-col text-white leading-5">
						<span className="font-bold">Pashupatinath Norway</span>
						<span>Temple</span>
					</div>
				</Link>

				{/* Desktop Nav */}
				<DesktopNav navItems={navItems} />

				{/* Right Side */}
				<div className="flex items-center gap-2">
					<SearchButton />
					<CartButton />
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
