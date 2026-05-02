"use client";

import { useTranslations } from "next-intl";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Heart } from "lucide-react";
import DonationForm from "@/components/DonationForm";

interface DonationModalProps {
	isOpen: boolean;
	onClose: () => void;
	cause?: {
		_id: string;
		title: string;
		description: string;
		category: string;
		goalAmount: number;
		currentAmount: number;
	};
	onDonationSuccess?: () => void;
	locale?: string;
}

export default function DonationModal({ isOpen, onClose, cause, onDonationSuccess, locale }: DonationModalProps) {
	const t = useTranslations("donation");

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-center gap-3">
						<Heart className="w-6 h-6 text-brand_primary" />
						<DialogTitle className="text-xl">
							{cause ? `${t("support_cause") || "Support:"} ${cause.title}` : t("title") || "Make a Donation"}
						</DialogTitle>
					</div>
				</DialogHeader>

				{cause && (
					<div className="bg-gray-50 rounded-lg p-4 mb-6">
						<h3 className="font-semibold text-gray-900 mb-2">{t("about_cause") || "About this cause"}</h3>
						<p className="text-sm text-gray-600 mb-3">{cause.description}</p>
						<div className="flex justify-between text-sm text-gray-500">
							<span>{t("category") || "Category"}: {cause.category}</span>
							<span>{t("goal") || "Goal"}: {cause.goalAmount.toLocaleString()} NOK</span>
						</div>
					</div>
				)}

				<DonationForm 
					preselectedCause={cause?._id} 
					onDonationSuccess={onDonationSuccess}
					isInModal={true}
					locale={locale}
				/>
			</DialogContent>
		</Dialog>
	);
}
