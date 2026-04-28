"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "react-hot-toast";
import Image from "next/image";

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000];

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
}

export default function DonationModal({ isOpen, onClose, cause, onDonationSuccess }: DonationModalProps) {
	const t = useTranslations("donation");
	const [amount, setAmount] = useState<number>(500);
	const [customAmount, setCustomAmount] = useState<string>("500");
	const [donorName, setDonorName] = useState("");
	const [donorEmail, setDonorEmail] = useState("");
	const [donorPhone, setDonorPhone] = useState("");
	const [message, setMessage] = useState("");
	const [isAnonymous, setIsAnonymous] = useState(false);
	const [loading, setLoading] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState<'card' | 'vipps'>('card');
	const [showVippsSuccess, setShowVippsSuccess] = useState(false);
	const [selectedCause, setSelectedCause] = useState<string>("");
	const [causes, setCauses] = useState<Array<{ _id: string; title: { [key: string]: string }; category: string }>>([]);

	useEffect(() => {
		if (isOpen) {
			fetchCauses();
			// Pre-select the cause if provided
			if (cause) {
				setSelectedCause(cause._id);
			}
		}
	}, [isOpen, cause]);

	const fetchCauses = async () => {
		try {
			const response = await fetch("/api/causes?status=active&limit=10");
			const data = await response.json();
			if (response.ok) {
				setCauses(data.causes || []);
			}
		} catch (error) {
			console.error("Failed to fetch causes:", error);
		}
	};

	const handlePresetClick = (presetAmount: number) => {
		setAmount(presetAmount);
		setCustomAmount(presetAmount.toString());
	};

	const handleCustomAmountChange = (value: string) => {
		setCustomAmount(value);
		const numValue = parseInt(value);
		if (!isNaN(numValue) && numValue > 0) {
			setAmount(numValue);
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (amount < 50) {
			toast.error("Minimum donation amount is 50 NOK");
			return;
		}

		setLoading(true);

		// Handle Vipps payment simulation
		if (paymentMethod === 'vipps') {
			try {
				// Create donation record with completed status
				const response = await fetch("/api/donations/vipps", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({
						amount,
						donorName: isAnonymous ? "Anonymous" : donorName,
						donorEmail: isAnonymous ? "anonymous@rspnorway.org" : donorEmail,
						donorPhone,
						message,
						isAnonymous,
						causeId: selectedCause && selectedCause !== "general" ? selectedCause : null,
						donationType: selectedCause && selectedCause !== "general" ? "cause_specific" : "general",
					}),
				});

				if (!response.ok) {
					throw new Error("Failed to process Vipps donation");
				}

				// Simulate Vipps payment processing delay
				setTimeout(() => {
					setLoading(false);
					setShowVippsSuccess(true);
					// Reset form after showing success
					setTimeout(() => {
						setShowVippsSuccess(false);
						onClose();
						resetForm();
						// Trigger refresh of donor list
						if (onDonationSuccess) {
							onDonationSuccess();
						}
					}, 3000);
				}, 2000);
			} catch (error) {
				console.error("Vipps donation error:", error);
				setLoading(false);
				toast(error instanceof Error ? error.message : "Error processing donation");
			}
			return;
		}

		try {
			const response = await fetch("/api/donations/create-checkout", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					amount,
					donorName: isAnonymous ? "Anonymous" : donorName,
					donorEmail,
					donorPhone,
					message,
					isAnonymous,
					causeId: selectedCause && selectedCause !== "general" ? selectedCause : null,
					donationType: selectedCause && selectedCause !== "general" ? "cause_specific" : "general",
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Error creating checkout session");
			}

			// Redirect to Stripe Checkout
			window.location.href = data.url;
		} catch (error) {
			console.error("Donation error:", error);
			toast(error instanceof Error ? error.message : "Error processing donation");
			setLoading(false);
		}
	};

	const resetForm = () => {
		setAmount(500);
		setCustomAmount("500");
		setDonorName("");
		setDonorEmail("");
		setDonorPhone("");
		setMessage("");
		setIsAnonymous(false);
		setSelectedCause("");
	};

	const handleClose = () => {
		onClose();
		resetForm();
	};

	return (
		<Dialog open={isOpen} onOpenChange={handleClose}>
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

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Preset Amounts */}
					<div>
						<label className="block text-sm font-semibold text-gray-900 mb-3">{t("select_amount") || "Select Amount"}</label>
						<div className="grid grid-cols-3 gap-3">
							{PRESET_AMOUNTS.map((presetAmount) => (
								<button key={presetAmount} type="button" onClick={() => handlePresetClick(presetAmount)} className={`text-sm md:text-xl py-3 px-2 md:px-4 rounded-lg border-2 font-semibold transition-all ${amount === presetAmount ? "border-brand bg-brand_primary text-white" : "border-gray-300 text-gray-900 hover:border-brand"}`}>
									{presetAmount} NOK
								</button>
							))}
						</div>
					</div>

					{/* Custom Amount */}
					<div>
						<label className="block text-sm font-semibold text-gray-900 mb-2">{t("custom_amount") || "Custom Amount"}</label>
						<div className="relative">
							<input type="number" min="50" value={customAmount} onChange={(e) => handleCustomAmountChange(e.target.value)} placeholder={t("amount_placeholder") || "Enter amount"} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-brand focus:outline-none text-gray-900" />
							<span className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">NOK</span>
						</div>
						<p className="text-xs text-gray-500 mt-1">{t("minimum_donation") || "Minimum donation: 50 NOK"}</p>
					</div>

					{/* Cause Selection */}
					<div>
						<label className="block text-sm font-semibold text-gray-900 mb-2">{t("donation_cause") || "Donation Cause (Optional)"}</label>
						<Select value={selectedCause} onValueChange={setSelectedCause}>
							<SelectTrigger className="w-full">
								<SelectValue placeholder={t("select_cause_placeholder") || "Select a cause or donate generally"} />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="general">{t("general_donation") || "General Donation"}</SelectItem>
								{causes.map((causeOption) => (
									<SelectItem key={causeOption._id} value={causeOption._id}>
										{causeOption.title.en || causeOption.title.no || causeOption.title.ne} ({causeOption.category})
									</SelectItem>
								))}
							</SelectContent>
						</Select>
						{selectedCause && selectedCause !== "general" && (
							<p className="text-xs text-gray-500 mt-1">
								{t("support_specific_cause") || "Your donation will support this specific cause"}
							</p>
						)}
					</div>

					{/* Anonymous Donation */}
					<div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
						<input type="checkbox" id="anonymous" checked={isAnonymous} onChange={(e) => setIsAnonymous(e.target.checked)} className="w-4 h-4 text-brand_primary rounded focus:ring-brand" />
						<label htmlFor="anonymous" className="text-sm text-gray-900 cursor-pointer">
							{t("anonymous_donation") || "Donate anonymously"}
						</label>
					</div>

					{/* Donor Information */}
					{!isAnonymous && (
						<div className="space-y-4 p-4 bg-gray-50 rounded-lg">
							<h3 className="font-semibold text-gray-900">{t("donor_information") || "Your Information"}</h3>

							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">
									{t("full_name") || "Full Name"} <span className="text-red-500">*</span>
								</label>
								<input type="text" value={donorName} onChange={(e) => setDonorName(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-brand focus:outline-none text-gray-900" placeholder={t("name_placeholder") || "Enter your name"} />
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">
									{t("email") || "Email"} <span className="text-red-500">*</span>
								</label>
								<input type="email" value={donorEmail} onChange={(e) => setDonorEmail(e.target.value)} required className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-brand focus:outline-none text-gray-900" placeholder={t("email_placeholder") || "Enter your email"} />
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">
									{t("phone_optional") || "Phone (Optional)"}
								</label>
								<input type="tel" value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-brand focus:outline-none text-gray-900" placeholder={t("phone_placeholder") || "Enter your phone number"} />
							</div>
						</div>
					)}

					{/* Payment Method Selection */}
					<div>
						<label className="block text-sm font-semibold text-gray-900 mb-3">{t("payment_method") || "Payment Method"}</label>
						<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
							<button
								type="button"
								onClick={() => setPaymentMethod('card')}
								className={`p-2 md:p-4 rounded-lg border-2 font-semibold transition-all ${
									paymentMethod === 'card'
										? 'border-brand bg-brand_primary text-white'
										: 'border-gray-300 text-gray-900 hover:border-brand'
								}`}
							>
								<div className="flex items-center justify-center gap-2">
									<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
										<line x1="1" y1="10" x2="23" y2="10" />
									</svg>
									<span>{t("card_payment") || "Card Payment"}</span>
								</div>
							</button>
							<button
								type="button"
								onClick={() => setPaymentMethod('vipps')}
								className={`p-2 md:p-4 rounded-lg border-2 font-semibold transition-all ${
									paymentMethod === 'vipps'
										? 'border-brand bg-brand_primary text-white'
										: 'border-gray-300 text-gray-900 hover:border-brand'
								}`}
							>
								<div className="flex items-center justify-center gap-2">
									<Image src="/Vipps.webp" alt="Vipps" width={64} height={64} className="w-12 rounded-full" />
									<span>{t("vipps_payment") || "Vipps Payment"}</span>
								</div>
							</button>
						</div>
					</div>

					{/* Message */}
					<div>
						<label className="block text-sm font-medium text-gray-900 mb-2">{t("message_optional") || "Message (Optional)"}</label>
						<textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={3} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-brand focus:outline-none text-gray-900 resize-none" placeholder={t("message_placeholder") || "Add a message (optional)"} />
					</div>

					{/* Submit Button */}
					<Button type="submit" disabled={loading || amount < 50} className="w-full py-6 text-lg bg-brand_primary hover:bg-brand_primary/90 text-white">
						{loading ? (
							<>
								<Loader2 className="w-5 h-5 mr-2 animate-spin" />
								{paymentMethod === 'vipps' ? t("processing_vipps") || "Processing with Vipps..." : t("processing") || "Processing..."}
							</>
						) : (
							<>
								{paymentMethod === 'vipps' ? (
									<>
										<Image src="/Vipps.webp" alt="Vipps" width={64} height={64} className="w-12 rounded-full" />
										{t("donate_button") || `Donate ${amount} NOK`}
									</>
								) : (
									<>
										<Heart className="w-5 h-5 mr-2" />
										{t("donate_button") || `Donate ${amount} NOK`}
									</>
								)}
							</>
						)}
					</Button>

					<p className="text-xs text-center text-gray-500">
						{paymentMethod === 'vipps' ? t("vipps_description") || "Quick and secure payment with Vipps" : t("secure_payment") || "Secure payment powered by Stripe"}
					</p>
				</form>

				{/* Vipps Success Modal */}
				{showVippsSuccess && (
					<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
						<div className="bg-white rounded-lg p-8 max-w-md mx-4 text-center">
							<div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
								<Image src="/Vipps.webp" alt="Vipps" width={48} height={48} className="w-12 rounded-full" />
							</div>
							<h3 className="text-xl font-semibold text-gray-900 mb-2">{t("vipps_success") || "Payment Successful!"}</h3>
							<p className="text-gray-600 mb-4">
								{t("donation_success_message") || `Your donation of ${amount} NOK has been processed successfully.`}
							</p>
							<button
								onClick={() => setShowVippsSuccess(false)}
								className="px-6 py-2 bg-brand_primary text-white rounded-lg hover:bg-brand_primary/90 transition-colors"
							>
								{t("close") || "Close"}
							</button>
						</div>
					</div>
				)}
			</DialogContent>
		</Dialog>
	);
}
