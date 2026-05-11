"use client";

import { useTranslations } from "next-intl";
import { useState, useEffect } from "react";
import DonationForm from "@/components/DonationForm";
import DonateCTA from "@/components/DonateCTA";
import { Heart, Building, Star } from "lucide-react";
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
	const [totalAmount, setTotalAmount] = useState<number>(0);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchTotalDonations = async () => {
			try {
				const response = await fetch('/api/donations/total');
				if (response.ok) {
					const data = await response.json();
					setTotalAmount(data.totalAmount);
				}
			} catch (error) {
				console.error('Error fetching total donations:', error);
			} finally {
				setLoading(false);
			}
		};

		fetchTotalDonations();
	}, []);
	return (
		<div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-12 px-4">
			<div className="max-w-6xl mx-auto">
				{/* Hero Section */}
				<header className="text-center">
					{/* <SectionHeader heading={t("hero_title")} subtitle={t("hero_description")} /> */}
				{/* Quick Impact Reasons */}
				<div className="px-6 pb-6 mb-8 md:mb-12">
					{/* <div className="text-center">
						<SectionHeader 
							heading={t("make_an_impact") || "Make an Impact Today"}
							subtitle={t("impact_subtitle") || "Your donation helps build our community's future"}
						/>
					</div> */}
					
					{/* Total Donations Display */}
					<div className="text-center my-0 md:my-8">
						<div className="mt-0 md:-mt-12 p-6 max-w-lg mx-auto">
							<h3 className="text-lg font-semibold text-gray-700 mb-1">
								{t("total_donations") || "Total Donations till now"}
							</h3>
							<div className="text-4xl md:text-8xl font-bold bg-gradient-to-r from-brand_primary to-brand_secondary bg-clip-text text-transparent mb-2">
								{loading ? (
									<div className="flex items-center justify-center">
										<svg className="animate-spin h-8 w-8 text-brand_primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
											<circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
											<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
										</svg>
									</div>
								) : (
									totalAmount.toLocaleString('nb-NO', { 
										style: 'currency', 
										currency: 'NOK',
										minimumFractionDigits: 0,
										maximumFractionDigits: 0 
									})
								)}
							</div>
						</div>
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
					<div className="bg-gradient-to-r from-orange-100 to-amber-100 rounded-2xl p-8 border border-orange-100">
						<h3 className="text-2xl font-bold text-center mb-8 text-brand_secondary">
							{t("why_donate_title") || "Why Build Pashupatinath Temple in Norway?"}
						</h3>
						
						<div className="grid grid-cols-1 gap-2 mb-6">
							<div className="rounded-xl p-6 shadow-sm border border-orange-50">
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand_primary/20 to-brand_primary/10 flex items-center justify-center flex-shrink-0">
										<Building className="w-5 h-5 text-brand_secondary" />
									</div>
									<div>
										<h4 className="font-bold text-gray-900 mb-2">{t("spiritual_home") || "Spiritual Home"}</h4>
										<p className="text-sm text-gray-600">{t("spiritual_home_desc") || "Create a sacred space for Nepali Hindus in Norway to connect with their faith and traditions."}</p>
									</div>
								</div>
							</div>
							
							<div className="rounded-xl p-6 shadow-sm border border-orange-50">
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand_secondary/20 to-brand_secondary/10 flex items-center justify-center flex-shrink-0">
										<Heart className="w-5 h-5 text-brand_secondary" />
									</div>
									<div>
										<h4 className="font-bold text-gray-900 mb-2">{t("cultural_preservation") || "Cultural Heritage"}</h4>
										<p className="text-sm text-gray-600">{t("cultural_preservation_desc") || "Preserve and share our rich Nepali Hindu culture with future generations in Norway."}</p>
									</div>
								</div>
							</div>
							
							<div className="rounded-xl p-6 shadow-sm border border-orange-50">
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500/20 to-amber-400/10 flex items-center justify-center flex-shrink-0">
										<Star className="w-5 h-5 text-amber-600" />
									</div>
									<div>
										<h4 className="font-bold text-gray-900 mb-2">{t("community_center") || "Community Hub"}</h4>
										<p className="text-sm text-gray-600">{t("community_center_desc") || "Build a vibrant community center for festivals, education, and social gatherings."}</p>
									</div>
								</div>
							</div>
							
							{/* <div className="bg-white rounded-xl p-6 shadow-sm border border-orange-50">
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-500/20 to-green-400/10 flex items-center justify-center flex-shrink-0">
										<Users className="w-5 h-5 text-green-600" />
									</div>
									<div>
										<h4 className="font-bold text-gray-900 mb-2">{t("legacy_building") || "Build Our Legacy"}</h4>
										<p className="text-sm text-gray-600">{t("legacy_building_desc") || "Leave a lasting legacy for our children and the Nepali diaspora in Scandinavia."}</p>
									</div>
								</div>
							</div> */}
						</div>
						
						<div className="text-center">
							{/* <div className="bg-gradient-to-r from-brand_primary to-brand_secondary rounded-xl p-6 mb-6">
								<p className="text-white text-lg font-semibold mb-2">
									{t("temple_vision") || "Together, we can build the first Pashupatinath Temple in Norway - a beacon of faith and culture for generations to come."}
								</p>
							</div> */}
							
							<Link href={`/${locale}/donate/why-donate`} className="inline-flex items-center gap-2 bg-gradient-to-r from-brand_secondary to-brand_secondary_light hover:from-brand_secondary_light hover:to-brand_secondary text-white rounded-lg px-8 py-3 font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:scale-[1.02]">
								{t("learn_more") || "Learn More About Our Vision"} →
							</Link>
						</div>
					</div>
			
						
						
					</div>
				</div>
			</div>

	

			
		</div>
	);
}
