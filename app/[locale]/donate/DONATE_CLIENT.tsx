"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import DonationForm from "@/components/DonationForm";
import DonorList from "@/components/DonorList";
import DonationModal from "@/components/DonationModal";
import SectionHeader from "@/components/SectionHeader";
import DonateCTA from "@/components/DonateCTA";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Heart, Users, Target, TrendingUp } from "lucide-react";
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
					
						
						<div className="flex md:flex-col items-center justify-center gap-8 px-4 py-8">
							{causes.map((cause: Cause) => {
								const progressPercentage = cause.goalAmount > 0 
									? Math.min((cause.currentAmount / cause.goalAmount) * 100, 100) 
									: 0;
								
								return (
									<div key={cause._id} className="flex flex-col w-full max-w-2xl">
										{/* Image on top for mobile */}
										{cause.poster && (
											<div className="relative w-full h-48 sm:h-64 md:h-80 lg:h-96">
												<Image
													src={cause.poster}
													alt={cause.title}
													fill
													className="object-cover"
												/>
											</div>
										)}
										
										{/* Card content below image */}
										<Card className="overflow-hidden w-full rounded-none shadow-none">
											{/* Badges at the top */}
											<div className="flex gap-2 px-4 pt-4">
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
											
											<CardHeader>
												<CardTitle className="text-lg line-clamp-2">{cause.title}</CardTitle>
											</CardHeader>
											<CardContent>
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
													className="w-full bg-brand_primary hover:bg-brand_primary/90 text-white py-3 px-6 rounded-lg transition-colors font-medium shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200"
												>
													{t("support_this_cause") || "Support This Cause"}
												</button>
											</div>
											</CardContent>
										</Card>
									</div>
								);
							})}
						</div>
						
						<div className="text-center mt-8">
							<Link href={`/${locale}/donate/reports`}>
								<button className="text-brand_primary hover:text-brand_primary/90 font-medium">
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
						
						<Card className="border-0 shadow-lg">
							<CardContent className="pt-6">
								<h3 className="text-xl font-bold text-gray-900 mb-4">{t("impact_title") || "Your Impact"}</h3>
								<div className="space-y-4">
									<div className="flex gap-3">
										<div className="flex-shrink-0">
											<div className="w-10 h-10 rounded-full bg-brand_primary/10 flex items-center justify-center">
												<Users className="w-5 h-5 text-brand_primary" />
											</div>
										</div>
										<div>
											<h4 className="font-semibold text-gray-900">{t("community_events") || "Community Events"}</h4>
											<p className="text-sm text-gray-600">{t("community_events_desc") || "Support cultural events and community gatherings"}</p>
										</div>
									</div>

									<div className="flex gap-3">
										<div className="flex-shrink-0">
											<div className="w-10 h-10 rounded-full bg-success/10 flex items-center justify-center">
												<Target className="w-5 h-5 text-success" />
											</div>
										</div>
										<div>
											<h4 className="font-semibold text-gray-900">{t("political_advocacy") || "Political Advocacy"}</h4>
											<p className="text-sm text-gray-600">{t("political_advocacy_desc") || "Advocate for Nepalese community rights in Norway"}</p>
										</div>
									</div>

									<div className="flex gap-3">
										<div className="flex-shrink-0">
											<div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
												<TrendingUp className="w-5 h-5 text-purple-600" />
											</div>
										</div>
										<div>
											<h4 className="font-semibold text-gray-900">{t("organizational_growth") || "Organizational Growth"}</h4>
											<p className="text-sm text-gray-600">{t("organizational_growth_desc") || "Expand our reach and impact in the community"}</p>
										</div>
									</div>

									<div className="flex gap-3">
										<div className="flex-shrink-0">
											<div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
												<Heart className="w-5 h-5 text-amber-600" />
											</div>
										</div>
										<div>
											<h4 className="font-semibold text-gray-900">{t("member_support") || "Member Support"}</h4>
											<p className="text-sm text-gray-600">{t("member_support_desc") || "Provide resources and assistance to our members"}</p>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
{/* Why Donate */}
						<Card className="border-0 shadow-lg bg-gradient-to-br from-brand to-blue-700 text-gray-700">
							<CardContent className="pt-6">
								<h3 className="text-xl font-bold mb-3">{t("why_donate") || "Why Donate to Pashupatinath Norway Temple?"}</h3>
								<ul className="space-y-2 text-sm">
									<li className="flex items-start gap-2">
										<span className="text-white/80">👍</span>
										<span>{t("why_donate_1") || "Support community development initiatives"}</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-white/80">👍</span>
										<span>{t("why_donate_2") || "Help preserve Nepalese culture in Norway"}</span>
									</li>
									<li className="flex items-start gap-2">
										<span className="text-white/80">👍</span>
										<span>{t("why_donate_3") || "Empower our community through education and advocacy"}</span>
									</li>
								</ul>
							</CardContent>
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
