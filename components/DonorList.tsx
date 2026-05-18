"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Heart, Loader2 } from "lucide-react";
import { useTranslations } from "next-intl";

interface Donor {
	name: string;
	amount: number;
	isAnonymous: boolean;
	date: string;
}

export default function DonorList({ refreshTrigger }: { refreshTrigger?: number }) {
	const [donors, setDonors] = useState<Donor[]>([]);
	const [loading, setLoading] = useState(true);
	const t = useTranslations("donate");

	useEffect(() => {
		const fetchDonations = async () => {
			try {
				const response = await fetch("/api/donations/donors");
				if (response.ok) {
					const data = await response.json();
					setDonors(data);
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
			<Card className="bg-white rounded-2xl shadow-lg border border-orange-100">
				<CardHeader className="pb-4">
					<CardTitle className="text-xl font-bold text-center text-brand_secondary">
						{t("recent_donors") || "All Donors"}
					</CardTitle>
				</CardHeader>
				<CardContent className="pt-0">
					{donors.length === 0 ? (
						<div className="text-center py-8 text-gray-500">
							<Heart className="w-8 h-8 mx-auto mb-2 text-brand_secondary" />
							<p className="text-sm">{t("no_donors_yet") || "No donors yet"}</p>
						</div>
					) : (
						<div className="max-h-96 overflow-y-auto">
							<div className="space-y-3">
								{donors.map((donor, index) => (
									<div
										key={index}
										className="flex justify-between items-center p-3 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-100"
									>
										<div className="flex items-center gap-3">
										
											<span className="font-medium text-gray-800">
												{donor.name}
											</span>
										</div>
										<span className="font-semibold text-gray-500">
											{donor.amount.toLocaleString('nb-NO', { 
												style: 'currency', 
												currency: 'NOK',
												minimumFractionDigits: 0,
												maximumFractionDigits: 0 
											})}
										</span>
									</div>
								))}
							</div>
						</div>
					)}
				</CardContent>
			</Card>
	);
}
