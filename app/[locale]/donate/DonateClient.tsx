"use client";

import { useTranslations } from "next-intl";
import DonationForm from "@/components/DonationForm";
import SectionHeader from "@/components/SectionHeader";
import DonateCTA from "@/components/DonateCTA";
import { Heart, Building } from "lucide-react";
import Link from "next/link";

interface Cause {
	_id: string;
	title: string;
	description: string;
	category: string;
	status: string;
	goalAmount: number;
	currentAmount: number;
	donationCount: number;
	featured: boolean;
	endDate?: string;
	urgency: string;
	poster?: string;
}

interface DonatePageClientProps {
	causes: Cause[];
	locale: string;
	translations?: Record<string, string>;
}

export default function DonatePageClient({ locale }: DonatePageClientProps) {
	const t = useTranslations("donate");
	return (
		<div className="min-h-screen py-12 px-4">
			<div className="max-w-6xl mx-auto">
				{/* Hero Section */}
				<header className="text-center">
					{/* <SectionHeader heading={t("hero_title")} subtitle={t("hero_description")} /> */}
				{/* Quick Impact Reasons */}
				<div className="bg-gradient-to-r from-brand_primary/5 to-brand_secondary/5 rounded-xl px-6 pb-6 mb-8 md:mb-12">
					<div className="text-center">
						<SectionHeader 
							heading={t("make_an_impact") || "Make an Impact Today"}
							subtitle={t("impact_subtitle") || "Your donation helps build our community's future"}
						/>
					</div>
					<div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-6">
						<div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm">
							<div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand_primary/20 to-brand_primary/10 flex items-center justify-center">
								<Building className="w-4 h-4 text-brand_secondary" />
							</div>
							<span className="font-semibold text-gray-900 text-sm">{t("build_temple") || "Build Temple"}</span>
						</div>
						<div className="flex items-center gap-2 bg-white rounded-lg px-4 py-2 shadow-sm">
							<div className="w-8 h-8 rounded-full bg-gradient-to-br from-success/20 to-success/10 flex items-center justify-center">
								<Heart className="w-4 h-4 text-success" />
							</div>
							<span className="font-semibold text-gray-900 text-sm">{t("preserve_culture") || "Preserve Culture"}</span>
						</div>
						<Link href={`/${locale}/donate/why-donate`} className="bg-gradient-to-r from-brand_secondary to-brand_secondary_light hover:from-brand_secondary_light hover:to-brand_secondary text-white rounded-lg px-6 py-2 font-medium text-sm transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]">
							{t("learn_more") || "Learn More"} →
						</Link>
					</div>
				</div>
				</header>


		

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
					{/* Donation Form */}
					<div className="lg:col-span-2">
						<DonationForm locale={locale} />
					</div>

					{/* Impact Section */}
					<div className="space-y-6">
						{/* Donate CTA Section */}
						<DonateCTA />
			
						
						
					</div>
				</div>
			</div>

	

			
		</div>
	);
}
