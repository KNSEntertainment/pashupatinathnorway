"use client";

import { useState, useEffect } from "react";
import { Phone, Mail } from "lucide-react";
import LanguageSelector from "@/components/LanguageSelector";
import { useTranslations } from "next-intl";
import AuthSection from "@/components/header/AuthSection";

interface Settings {
	_id?: string;
	name: string;
	address: string;
	email: string;
	phone?: string;
	mobile?: string;
	facebook?: string;
	youtube?: string;
	instagram?: string;
	linkedin?: string;
	businessHoursMF?: string;
	companyLogo?: string;
	organizationNumber?: string;
	dateOfEstablishment?: string;
}


export default function TopBar() {
	const t = useTranslations("footer");
	const [settings, setSettings] = useState<Settings[]>([]);

	useEffect(() => {
		const fetchSettings = async () => {
			try {
				const response = await fetch('/api/settings');
				if (response.ok) {
					const data = await response.json();
					setSettings(data);
				}
			} catch (error) {
				console.error('Error fetching settings:', error);
			}
		};
		fetchSettings();
	}, []);

	return (
		<section className="h-11 bg-brand_primary backdrop-blur-md">
			<div className="container mx-auto px-4 lg:px-6 h-full flex items-center justify-between">
				<div className="flex items-center gap-4 md:gap-6 text-sm font-medium">
					<a href="tel:+4741267124" className="flex items-center gap-2 hover:text-brand_secondary">
						<Phone size={16} />
						{t("phone_small_device")}
					</a>

					<a href={`mailto:${settings?.[0]?.email || 'nepalihindusamfunn@gmail.com'}`} className="hidden md:flex items-center gap-2 hover:text-brand_secondary">
						<Mail size={16} />
						{settings?.[0]?.email || 'nepalihindusamfunn@gmail.com'}
					</a>

				</div>

				<div className="flex items-center gap-4">
					<LanguageSelector />
					<AuthSection />
				</div>

			</div>
		</section>
	);
}
