"use client";

import { Phone, Mail } from "lucide-react";
import SocialMediaLinks from "@/components/SocialMediaLinks";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslations } from "next-intl";

export default function TopBar() {
	const t = useTranslations("footer");

	return (
		<section className="h-11 border-b bg-light/95 backdrop-blur-md">
			<div className="container mx-auto px-4 lg:px-6 h-full flex items-center justify-between">
				<div className="flex items-center gap-4 md:gap-6 text-sm font-medium">
					<a href="tel:+4796800984" className="flex items-center gap-2 hover:opacity-75">
						<Phone size={16} />
						{t("phone_small_device")}
					</a>

					<a href="mailto:info@pnsbnorway.org" className="hidden md:flex items-center gap-2 hover:opacity-75">
						<Mail size={16} />
						info@pnsbnorway.org
					</a>

					<SocialMediaLinks />
				</div>

				<LanguageSelector />
			</div>
		</section>
	);
}
