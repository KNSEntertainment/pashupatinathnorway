"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Heart, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface Donation {
	_id: string;
	donorName: string;
	amount: number;
	currency: string;
	isAnonymous: boolean;
	paymentStatus: string;
	createdAt: string;
}

export default function DonorList({ refreshTrigger }: { refreshTrigger?: number }) {
	const [donations, setDonations] = useState<Donation[]>([]);
	const [loading, setLoading] = useState(true);
	const t = useTranslations("donate");

	useEffect(() => {
		const fetchDonations = async () => {
			try {
				const response = await fetch("/api/donations");
				if (response.ok) {
					const data = await response.json();
					// Filter only completed donations and sort by amount (highest first)
					const completedDonations = data
						.filter((donation: Donation) => donation.paymentStatus === "completed")
						.sort((a: Donation, b: Donation) => b.amount - a.amount);
					setDonations(completedDonations);
				}
			} catch (error) {
				console.error("Error fetching donations:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchDonations();
	}, [refreshTrigger]);

	if (loading) {
		return (
			<Card className="border-0 shadow-lg">
				<CardContent className="pt-6">
					<div className="flex items-center justify-center py-8">
						<Loader2 className="w-6 h-6 animate-spin text-brand_primary" />
					</div>
				</CardContent>
			</Card>
		);
	}

	return (
		<Card className="border-2 border-brand">
			<CardHeader className="pb-3">
				<CardTitle className="text-xl font-bold text-gray-900 flex items-center gap-2">
					<Users className="w-5 h-5 text-brand_primary" />
					{t("recent_donors")}
				</CardTitle>
			</CardHeader>
			<CardContent className="pt-0">
				{donations.length === 0 ? (
					<div className="text-center py-8 text-gray-500">
						<Heart className="w-8 h-8 mx-auto mb-2 text-gray-300" />
						<p className="text-sm">{t("no_donors_yet")}</p>
					</div>
				) : (
					<div className="space-y-3 max-h-96 overflow-y-auto">
						{donations.map((donation) => (
							<div
								key={donation._id}
								className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
							>
								<div className="flex items-center gap-3">
									<div className="w-8 h-8 rounded-full bg-brand_primary/10 flex items-center justify-center">
										<Heart className="w-4 h-4 text-brand_primary" />
									</div>
									<div>
										<p className="font-medium text-gray-900 text-sm">
											{donation.isAnonymous ? t("anonymous") : donation.donorName}
										</p>
										<p className="text-xs text-gray-500">
											{new Date(donation.createdAt).toLocaleDateString('en-US')}
										</p>
									</div>
								</div>
								<div className="text-right">
									<p className="font-semibold text-brand_primary">
										{donation.amount} {donation.currency}
									</p>
								</div>
							</div>
						))}
					</div>
				)}
			</CardContent>
		</Card>
	);
}
