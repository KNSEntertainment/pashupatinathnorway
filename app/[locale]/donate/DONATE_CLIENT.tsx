"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import DonationForm from "@/components/DonationForm";
import DonorList from "@/components/DonorList";
import DonationModal from "@/components/DonationModal";
import SectionHeader from "@/components/SectionHeader";
import DonateCTA from "@/components/DonateCTA";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Building } from "lucide-react";
import Image from "next/image";
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

export default function DonatePageClient({ causes, locale }: DonatePageClientProps) {
	const t = useTranslations("donate");
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedCause, setSelectedCause] = useState<Cause | undefined>();
	const [refreshTrigger, setRefreshTrigger] = useState(0);
	const [isMounted, setIsMounted] = useState(false);

	useEffect(() => {
		setIsMounted(true);
	}, []);

	const handleSupportCause = (cause: Cause) => {
		setSelectedCause(cause);
		setIsModalOpen(true);
	};

	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedCause(undefined);
		// Trigger refresh to handle returning from Stripe or any other scenario
		handleDonationSuccess();
	};

	const handleDonationSuccess = () => {
		// Trigger refresh of donor list
		setRefreshTrigger(prev => prev + 1);
	};

	return (
		<div className="min-h-screen py-12 px-4">
			<div className="max-w-6xl mx-auto">
				{/* Hero Section */}
				<header className="text-center mb-6 md:mb-8">
					<SectionHeader heading={t("hero_title")} subtitle={t("hero_description")} />
				</header>

				{/* Active Causes Section */}
				{isMounted && causes.length > 0 && (
					<section className="mb-12">
						<div className="flex md:flex-col items-center justify-center gap-8 px-4 md:px-0">
							{causes.map((cause: Cause) => {
								const progressPercentage = cause.goalAmount > 0 
									? Math.min((cause.currentAmount / cause.goalAmount) * 100, 100) 
									: 0;
								
								return (
									<Card key={cause._id} className="overflow-hidden w-full max-w-6xl rounded-lg shadow-lg border-0">
										<div className="flex flex-col lg:flex-row gap-0">
											{/* Image on left for desktop, top for mobile */}
											{cause.poster && (
												<div className="relative w-full lg:w-1/2 h-48 sm:h-64 md:h-80 lg:h-auto lg:min-h-[400px]">
													<Image
														src={cause.poster}
														alt={cause.title}
														fill
														className="object-cover object-top"
													/>
												</div>
											)}
											
											{/* Card content on right for desktop, below image for mobile */}
											<div className="w-full lg:w-1/2 flex flex-col p-4 md:p-6">
												{/* Badges at the top */}
												<div className="flex gap-2 mb-4">
													{cause.featured && (
														<Badge className="bg-purple-500 text-white text-xs">{t("featured") || "Featured"}</Badge>
													)}
													<Badge className={
														cause.urgency === 'critical' ? 'bg-red-700 text-white' :
														cause.urgency === 'high' ? 'bg-red-500 text-white' :
														cause.urgency === 'medium' ? 'bg-orange-500 text-white' :
														'bg-gray-500 text-white'
													}>
														{cause.urgency}
													</Badge>
												</div>
												
												<h3 className="text-lg font-bold line-clamp-2 mb-3">{cause.title}</h3>
												<p className="text-gray-600 mb-4 line-clamp-3">{cause.description}</p>
												
												<div className="space-y-3">
													<div className="flex justify-between text-sm">
														<span>{t("progress") || "Progress"}:</span>
														<span className="font-semibold">
															{cause.currentAmount?.toLocaleString() || 0} / {cause.goalAmount?.toLocaleString() || 0} NOK
														</span>
													</div>
													<Progress value={progressPercentage} className="h-2" />
													<div className="flex justify-between text-sm text-gray-500">
														<span>{progressPercentage.toFixed(1)}% {t("complete") || "complete"}</span>
														<span>{cause.donationCount || 0} {t("donations") || "donations"}</span>
													</div>
												</div>
												
												{cause.endDate && isMounted && (
													<p className="text-sm text-gray-500 mt-3">
														{t("ends") || "Ends"}: {new Date(cause.endDate).toLocaleDateString()}
													</p>
												)}
												
												<div className="flex flex-col space-y-3 mt-6">
													<button 
														onClick={() => handleSupportCause(cause)}
														className="w-full bg-brand_primary hover:bg-brand_primary/90 text-gray-700 py-3 px-6 rounded-lg transition-colors font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
													>
														{t("support_this_cause") || "Support This Cause"}
													</button>
												</div>
											</div>
										</div>
									</Card>
								);
							})}
						</div>
						
						<div className="text-center mt-8">
							<Link href={`/${locale}/donate/reports`}>
								<button className="text-gray-700 hover:text-gray-600 font-medium">
									{t("view_all_reports") || "View All Donation Reports"} &rarr;
								</button>
							</Link>
						</div>
					</section>
				)}

				<div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
					{/* Donation Form */}
					<div className="lg:col-span-2">
						<DonationForm />
					</div>

					{/* Impact Section */}
					<div className="space-y-6">
						{/* Donate CTA Section */}
						<DonateCTA />
						
						{/* Donor List */}
						<DonorList refreshTrigger={refreshTrigger} />
						
						{/* Impact Preview Card */}
						<Card className="border-0 shadow-lg hover:shadow-md transition-shadow cursor-pointer">
							<Link href={`/${locale}/donate/why-donate`}>
								<CardContent className="pt-6">
									<div className="flex items-center justify-between mb-4">
										<h3 className="text-xl font-bold text-gray-900">{t("impact_title") || "Your Impact"}</h3>
										<span className="text-brand_primary">→</span>
									</div>
									<div className="space-y-3">
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 rounded-full bg-brand_primary/10 flex items-center justify-center">
												<Building className="w-4 h-4 text-brand_primary" />
											</div>
											<div className="flex-1">
												<h4 className="font-semibold text-gray-900 text-sm">{t("temple_construction") || "Temple Construction"}</h4>
												<p className="text-xs text-gray-600 line-clamp-2">{t("temple_construction_desc") || "Build Norway's first Nepali Hindu temple"}</p>
											</div>
										</div>
										<div className="flex items-center gap-3">
											<div className="w-8 h-8 rounded-full bg-success/10 flex items-center justify-center">
												<Heart className="w-4 h-4 text-success" />
											</div>
											<div className="flex-1">
												<h4 className="font-semibold text-gray-900 text-sm">{t("cultural_preservation") || "Cultural Preservation"}</h4>
												<p className="text-xs text-gray-600 line-clamp-2">{t("cultural_preservation_desc") || "Preserve and celebrate our rich Nepali heritage"}</p>
											</div>
										</div>
									</div>
									<div className="mt-4 text-center">
										<span className="text-sm text-gray-700 bg-brand_primary/20 hover:bg-brand_primary/50 px-4 py-2 rounded-full font-medium">
											{t("learn_more_impact") || "Learn more about your impact"} →
										</span>
									</div>
								</CardContent>
							</Link>
						</Card>

					</div>
				</div>
			</div>

	

			{/* Donation Modal */}
			<DonationModal 
				isOpen={isModalOpen} 
				onClose={handleCloseModal} 
				cause={selectedCause} 
				onDonationSuccess={handleDonationSuccess}
			/>
		</div>
	);
}
