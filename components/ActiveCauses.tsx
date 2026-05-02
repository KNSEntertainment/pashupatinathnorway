"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import Image from "next/image";
import Link from "next/link";
import { formatNOK } from "@/lib/norwegianCurrency";
import { useIsAdmin } from "@/utils/adminUtils";
import DonationModal from "./DonationModal";

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

interface ActiveCausesProps {
	locale?: string;
	onSupportCause?: (cause: Cause) => void;
}

export default function ActiveCauses({ locale, onSupportCause }: ActiveCausesProps) {
	const t = useTranslations("donate");
	const [isMounted, setIsMounted] = useState(false);
	const [causes, setCauses] = useState<Cause[]>([]);
	const [loading, setLoading] = useState(true);
	const isAdmin = useIsAdmin();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedCause, setSelectedCause] = useState<Cause | undefined>();

	
	const handleCloseModal = () => {
		setIsModalOpen(false);
		setSelectedCause(undefined);
	};

	const fetchCauses = async () => {
		try {
			const localeParam = locale || 'en';
			const response = await fetch(`/api/causes?status=active&limit=10&locale=${localeParam}`);
			const data = await response.json();
			if (response.ok) {
				setCauses(data.causes || []);
			}
		} catch (error) {
			console.error("Failed to fetch causes:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		setIsMounted(true);
		fetchCauses();
	}, [locale, fetchCauses]);

	
	return (
		<>
			{/* Active Causes Section */}
			{!loading && isMounted && causes.length > 0 && (
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
													<Badge className="bg-gradient-to-r from-purple-600 to-purple-700 text-white text-xs font-medium shadow-sm">{t("featured") || "Featured"}</Badge>
												)}
												<Badge className={
													cause.urgency === 'critical' ? 'bg-gradient-to-r from-red-600 to-red-700 text-white font-medium shadow-sm' :
													cause.urgency === 'high' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white font-medium shadow-sm' :
													cause.urgency === 'medium' ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-white font-medium shadow-sm' :
													'bg-gradient-to-r from-slate-500 to-slate-600 text-white font-medium shadow-sm'
												}>
													{cause.urgency.charAt(0).toUpperCase() + cause.urgency.slice(1).toLowerCase()}
												</Badge>
											</div>
											
											<h3 className="text-xl font-bold text-gray-900 line-clamp-2 mb-3">{cause.title}</h3>
											<p className="text-gray-600 mb-4 line-clamp-3 leading-relaxed">{cause.description}</p>
											
											<div className="space-y-3">
												<div className="flex justify-between text-sm">
													<span>{t("progress") || "Progress"}:</span>
													<span className="font-semibold text-gray-900">
														{formatNOK(cause.currentAmount)} / {formatNOK(cause.goalAmount)}
													</span>
												</div>
												<Progress value={progressPercentage} className="h-2" />
												<div className="flex justify-between text-sm text-gray-600">
													<span className="font-medium">{progressPercentage.toFixed(1)}% {t("complete") || "complete"}</span>
													<span className="font-medium">{cause.donationCount || 0} {t("donations") || "donations"}</span>
												</div>
											</div>
											
											{cause.endDate && isMounted && (
												<p className="text-sm text-gray-600 mt-3 font-medium">
													{t("ends") || "Ends"}: {new Date(cause.endDate).toLocaleDateString()}
												</p>
											)}
											
											<div className="flex flex-col space-y-3 mt-6">
												<button 
													onClick={() => onSupportCause?.(cause)}
													className="w-full bg-gradient-to-r from-brand_secondary to-brand_secondary_light hover:from-brand_secondary_light hover:to-brand_secondary text-white py-3 px-6 rounded-lg transition-all font-semibold shadow-lg hover:shadow-xl transform hover:scale-[1.02] duration-200"
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
					
					{/* Admin-only Reports Link */}
					{isAdmin && (
						<div className="text-center mt-8 mb-12 md:mt-12 md:mb-20">
							<Link href={`/${locale}/donate/reports`}>
								<button className="inline-flex items-center gap-2 text-brand_secondary hover:text-brand_secondary_light font-medium transition-colors duration-200">
									{t("view_all_reports") || "View All Donation Reports"}
									<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
									</svg>
								</button>
							</Link>
						</div>
					)}
					{/* Donation Modal */}
			<DonationModal 
				isOpen={isModalOpen} 
				onClose={handleCloseModal} 
				cause={selectedCause}
				locale={locale}
			/>
				</section>
			)}
		</>
	);
}
