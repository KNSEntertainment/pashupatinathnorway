"use client";

import { Phone, Mail } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslations } from "next-intl";

export default function TopBar() {
	const t = useTranslations("footer");

	return (
		<section className="h-11 bg-brand_primary backdrop-blur-md">
			<div className="container mx-auto px-4 lg:px-6 h-full flex items-center justify-between">
				<div className="flex items-center gap-4 md:gap-6 text-sm font-medium">
					<a href="tel:+4741267124" className="flex items-center gap-2 hover:text-brand_secondary">
						<Phone size={16} />
						{t("phone_small_device")}
					</a>

					<a href="mailto:nepalihindusamfunn@gmail.com" className="hidden md:flex items-center gap-2 hover:text-brand_secondary">
						<Mail size={16} />
						nepalihindusamfunn@gmail.com
					</a>

				</div>

				<LanguageSelector />
			</div>
		</section>
	);
}
