// import { Button } from "@/components/ui/button";
// import { useEffect, useState } from "react";

// export type Download = {
// 	_id: string;
// 	title_en: string;
// 	title_ne?: string;
// 	title_no?: string;
// 	date: string;
// 	category: string;
// 	imageUrl?: string;
// 	fileUrl?: string;
// 	// Legacy field
// 	title?: string;
// };

// export interface DownloadFormProps {
// 	handleCloseModal: () => void;
// 	downloadToEdit: Download | null;
// }

// const getTodayString = () => {
// 	const today = new Date();
// 	const yyyy = today.getFullYear();
// 	const mm = String(today.getMonth() + 1).padStart(2, "0");
// 	const dd = String(today.getDate()).padStart(2, "0");
// 	return `${yyyy}-${mm}-${dd}`;
// };

// const DownloadForm: React.FC<DownloadFormProps> = ({ handleCloseModal, downloadToEdit }) => {
// 	const [formData, setFormData] = useState({
// 		title_en: "",
// 		title_ne: "",
// 		title_no: "",
// 		date: getTodayString(),
// 		file: null as File | null,
// 		image: null as File | null,
// 		category: "",
// 	});
// 	const [submitting, setSubmitting] = useState(false);
// 	const [error, setError] = useState("");

// 	useEffect(() => {
// 		if (downloadToEdit) {
// 			setFormData({
// 				title_en: downloadToEdit.title_en || downloadToEdit.title || "",
// 				title_ne: downloadToEdit.title_ne || "",
// 				title_no: downloadToEdit.title_no || "",
// 				date: downloadToEdit.date,
// 				category: downloadToEdit.category,
// 				file: null,
// 				image: null,
// 			});
// 		} else {
// 			setFormData((prev) => ({ ...prev, date: getTodayString() }));
// 		}
// 	}, [downloadToEdit]);

// 	const handleSubmit = async (e: React.FormEvent) => {
// 		e.preventDefault();
// 		setError("");
// 		setSubmitting(true);
// 		try {
// 			const form = new FormData();
// 			(Object.keys(formData) as Array<keyof typeof formData>).forEach((key) => {
// 				if ((key === "file" || key === "image") && !formData[key]) return;
// 				// For file fields, append the file, otherwise append the string
// 				if (key === "file" || key === "image") {
// 					if (formData[key]) form.append(key, formData[key] as File);
// 				} else {
// 					const value = formData[key] as string;
// 					// Only append non-empty strings
// 					if (value && value.trim() !== "") {
// 						form.append(key, value);
// 					}
// 				}
// 			});
// 			const url = downloadToEdit ? `/api/downloads/${downloadToEdit._id}` : "/api/downloads/create";
// 			const method = downloadToEdit ? "PUT" : "POST";
// 			const response = await fetch(url, {
// 				method,
// 				body: form,
// 			});
// 			const result = await response.json();
// 			if (!response.ok) throw new Error(result.error || `Failed to ${downloadToEdit ? "update" : "create"} Download`);
// 			if (result.success) {
// 				setFormData({ title_en: "", title_ne: "", title_no: "", date: "", file: null, image: null, category: "" });
// 				const fileInput = document.getElementById("file") as HTMLInputElement;
// 				if (fileInput) fileInput.value = "";
// 				const imageInput = document.getElementById("image") as HTMLInputElement;
// 				if (imageInput) imageInput.value = "";
// 				alert(`Download ${downloadToEdit ? "updated" : "created"} successfully!`);
// 				handleCloseModal();
// 			}
// 		} catch (error: unknown) {
// 			let message = "An unknown error occurred.";
// 			function hasMessage(e: unknown): e is { message: string } {
// 				return typeof e === "object" && e !== null && "message" in e && typeof (e as { message: unknown }).message === "string";
// 			}
// 			if (hasMessage(error)) {
// 				message = error.message;
// 			}
// 			setError(message);
// 			console.error(`Error ${downloadToEdit ? "updating" : "creating"} Download:`, error);
// 		} finally {
// 			setSubmitting(false);
// 		}
// 	};

// 	return (
// 		<form onSubmit={handleSubmit} className="space-y-4">
// 			{error && <div className="bg-red-50 border border-red-6000 text-red-600 px-4 py-3 rounded">{error}</div>}
// 			<div>
// 				<label className="block mb-2 font-bold">Title (Multilingual)</label>

// 				{/* English */}
// 				<div className="mb-2">
// 					<label htmlFor="title_en" className="block text-sm mb-1 text-gray-700">
// 						English *
// 					</label>
// 					<input type="text" id="title_en" value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} className="w-full p-2 border rounded" placeholder="Enter title in English" required />
// 				</div>

// 				{/* Nepali */}
// 				<div className="mb-2">
// 					<label htmlFor="title_ne" className="block text-sm mb-1 text-gray-700">
// 						Nepali (नेपाली)
// 					</label>
// 					<input type="text" id="title_ne" value={formData.title_ne} onChange={(e) => setFormData({ ...formData, title_ne: e.target.value })} className="w-full p-2 border rounded" placeholder="नेपालीमा शीर्षक प्रविष्ट गर्नुहोस्" />
// 				</div>

// 				{/* Norwegian */}
// 				<div className="mb-2">
// 					<label htmlFor="title_no" className="block text-sm mb-1 text-gray-700">
// 						Norwegian (Norsk)
// 					</label>
// 					<input type="text" id="title_no" value={formData.title_no} onChange={(e) => setFormData({ ...formData, title_no: e.target.value })} className="w-full p-2 border rounded" placeholder="Skriv inn tittel på norsk" />
// 				</div>
// 			</div>
// 			<div>
// 				<label htmlFor="date" className="block mb-2 font-bold">
// 					Date
// 				</label>
// 				<input type="date" id="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full p-2 border rounded" required />
// 			</div>
// 			<div>
// 				<label htmlFor="category" className="block mb-2 font-bold">
// 					Category
// 				</label>
// 				<input type="text" id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 border rounded" required />
// 			</div>
// 			<div>
// 				<label htmlFor="file" className="block mb-2 font-bold">
// 					Document File (max 2MB)
// 				</label>
// 				<input type="file" id="file" accept=".pdf,.doc,.docx" onChange={(e) => setFormData({ ...formData, file: e.target.files ? e.target.files[0] : null })} className="w-full p-2 border rounded" required={!downloadToEdit} />
// 			</div>
// 			<div>
// 				<label htmlFor="image" className="block mb-2 font-bold">
// 					Image (max 1MB)
// 				</label>
// 				<input type="file" id="image" accept="image/*" onChange={(e) => setFormData({ ...formData, image: e.target.files ? e.target.files[0] : null })} className="w-full p-2 border rounded" />
// 			</div>
// 			<div className="grid grid-cols-2 gap-2">
// 				<button type="submit" disabled={submitting} className={`w-full p-1.5 rounded ${submitting ? "bg-neutral-400 cursor-not-allowed" : "bg-blue-600 hover:bg-brand_primary"} text-gray-700 font-bold`}>
// 					{submitting ? `${downloadToEdit ? "Updating..." : "Creating..."}` : `${downloadToEdit ? "Update" : "Create"} Download`}
// 				</button>
// 				<Button variant="outline" onClick={handleCloseModal}>
// 					Close
// 				</Button>
// 			</div>
// 		</form>
// 	);
// };

// export default DownloadForm;

"use client";
// src/components/DonationForm.tsx  (or wherever you keep this file)
//
// Changes from your original:
//  1. Vipps redirect is now actually enabled (window.location.href = redirectUrl)
//  2. Removed the commented-out dead code and the toast that just logs the URL
//  3. showVippsSuccess state removed (not used — success is handled by /payment-success page)
//  4. Everything else is untouched — field names, state, logic, styling

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Heart, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "react-hot-toast";
import Image from "next/image";
import { formatNOK } from "@/lib/norwegianCurrency";
import AddressAutocomplete from "@/components/ui/address-autocomplete";
import CustomCaptcha from "@/components/ui/custom-captcha";

const PRESET_AMOUNTS = [100, 250, 500, 1000, 2500, 5000, 10000, 20000];

interface DonationFormProps {
	preselectedCause?: string;
	onDonationSuccess?: () => void;
	isInModal?: boolean;
	locale?: string;
}

export default function DonationForm({ preselectedCause, isInModal = false, locale }: DonationFormProps) {
	const t = useTranslations("donation");
	const { data: session } = useSession();

	const [amount, setAmount] = useState<number>(20000);
	const [customAmount, setCustomAmount] = useState<string>("20000");
	const [donorName, setDonorName] = useState(session?.user?.fullName || "");
	const [donorEmail, setDonorEmail] = useState(session?.user?.email || "");
	const [donorPhone, setDonorPhone] = useState("");
	const [personalNumber, setPersonalNumber] = useState("");
	const [address, setAddress] = useState("");
	const [message, setMessage] = useState("");
	const [isAnonymous] = useState(false);
	const [loading, setLoading] = useState(false);
	const [paymentMethod, setPaymentMethod] = useState<"card" | "vipps">("vipps");
	const [selectedCause, setSelectedCause] = useState<string>("");
	const [causes, setCauses] = useState<Array<{ _id: string; title: string; category: string }>>([]);
	const [captchaValid, setCaptchaValid] = useState(false);
	const [captchaData, setCaptchaData] = useState({ text: "", hash: "" });

	const fetchUserData = useCallback(async () => {
		if (!session?.user?.email) return;
		try {
			const response = await fetch(`/api/membership/current-user`);
			if (response.ok) {
				const data = await response.json();
				if (data.membership) {
					const membership = data.membership;
					if (membership.phone && !donorPhone) setDonorPhone(membership.phone);
					if (membership.personalNumber && !personalNumber) setPersonalNumber(membership.personalNumber);
				}
			}
		} catch (error) {
			console.error("Failed to fetch user membership data:", error);
		}
	}, [session?.user?.email, donorPhone, personalNumber]);

	const fetchCauses = useCallback(async () => {
		try {
			const localeParam = locale || "en";
			const response = await fetch(`/api/causes?status=active&limit=10&locale=${localeParam}`);
			const data = await response.json();
			if (response.ok) {
				const fetchedCauses = data.causes || [];
				setCauses(fetchedCauses);
				if (!preselectedCause && fetchedCauses.length > 0 && !selectedCause) {
					setSelectedCause(fetchedCauses[0]._id);
				}
			}
		} catch (error) {
			console.error("Failed to fetch causes:", error);
		}
	}, [locale, preselectedCause, selectedCause]);

	useEffect(() => {
		fetchCauses();
		fetchUserData();
		if (preselectedCause) setSelectedCause(preselectedCause);
	}, [preselectedCause, session?.user?.email, fetchCauses, fetchUserData]);

	const handlePresetClick = (presetAmount: number) => {
		setAmount(presetAmount);
		setCustomAmount(presetAmount.toString());
	};

	const handleCustomAmountChange = (value: string) => {
		setCustomAmount(value);
		const numValue = parseInt(value);
		if (!isNaN(numValue) && numValue > 0) setAmount(numValue);
	};

	const handlePersonalNumberChange = (value: string) => {
		const cleanValue = value.replace(/\D/g, "").slice(0, 11);
		setPersonalNumber(cleanValue);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		if (amount < 50) {
			toast.error("Minimum donation amount is 50 NOK");
			return;
		}
		if (!captchaValid) {
			toast.error("Please complete the captcha verification");
			return;
		}
		if (personalNumber && personalNumber.length !== 11) {
			toast.error("Personal number must be exactly 11 digits");
			return;
		}
		if (paymentMethod === "vipps" && !donorPhone) {
			toast.error("Phone number is required for Vipps payment");
			return;
		}

		setLoading(true);

		// ── Vipps payment ──────────────────────────────────────────
		if (paymentMethod === "vipps") {
			try {
				const response = await fetch("/api/vipps/create-payment", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						amount,
						donorName: isAnonymous ? "Anonymous" : donorName,
						donorEmail: isAnonymous ? "anonymous@rspnorway.org" : donorEmail,
						donorPhone,
						personalNumber: personalNumber || undefined,
						address: address || undefined,
						message,
						isAnonymous,
						causeId: selectedCause && selectedCause !== "general" ? selectedCause : null,
						donationType: selectedCause && selectedCause !== "general" ? "cause_specific" : "general",
						captcha: captchaData,
					}),
				});

				if (!response.ok) {
					const errorData = await response.json();
					throw new Error(errorData.error || "Failed to create Vipps payment");
				}

				const result = await response.json();

				console.log("Vipps payment created:", {
					orderId: result.payment.orderId,
					reference: result.payment.reference,
					redirectUrl: result.payment.redirectUrl,
				});

				// Store donation data so /payment-success can display it
				sessionStorage.setItem(`donation_${result.payment.reference}`, JSON.stringify(result.donationData));

				// Redirect to Vipps landing page — opens Vipps app on mobile
				if (result.payment.redirectUrl) {
					window.location.href = result.payment.redirectUrl;
				} else {
					throw new Error("No redirect URL received from Vipps");
				}
			} catch (error) {
				console.error("Vipps payment error:", error);
				setLoading(false);
				toast.error(error instanceof Error ? error.message : "Error processing Vipps payment");
			}
			return;
		}

		// ── Stripe / card payment (unchanged) ──────────────────────
		try {
			const response = await fetch("/api/donations/create-checkout", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					amount,
					donorName: isAnonymous ? "Anonymous" : donorName,
					donorEmail,
					donorPhone,
					personalNumber: personalNumber || undefined,
					address: address || undefined,
					message,
					isAnonymous,
					causeId: selectedCause || null,
					donationType: selectedCause ? "cause_specific" : "general",
					captcha: captchaData,
				}),
			});

			const data = await response.json();
			if (!response.ok) throw new Error(data.error || "Error processing donation");
			window.location.href = data.url;
		} catch (error) {
			console.error("Donation error:", error);
			toast.error(error instanceof Error ? error.message : "Error processing donation");
			setLoading(false);
		}
	};

	const formContent = (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* Preset Amounts */}
			<div>
				<label className="block text-sm font-semibold text-gray-700 mb-3">{t("select_amount") || "Select Amount"}</label>
				<div className="grid grid-cols-4 gap-3">
					{PRESET_AMOUNTS.map((presetAmount) => (
						<button key={presetAmount} type="button" onClick={() => handlePresetClick(presetAmount)} className={`text-sm md:text-lg py-1 md:py-2 px-2 md:px-4 rounded-lg border border-1 transition-all ${amount === presetAmount ? "border-brand_primary bg-green-100 text-gray-700" : "border-gray-300 text-gray-700 hover:border-brand_primary"}`}>
							<span className="hidden sm:inline">{formatNOK(presetAmount)}</span>
							<span className="sm:hidden">{presetAmount}</span>
						</button>
					))}
				</div>
			</div>

			{/* Custom Amount */}
			<div>
				<label className="block text-sm font-semibold text-gray-900 mb-2">{t("custom_amount") || "Custom Amount"}</label>
				<div className="relative">
					<input type="number" min="50" value={customAmount} onChange={(e) => handleCustomAmountChange(e.target.value)} placeholder={t("amount_placeholder") || "Enter amount"} className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:border-brand focus:outline-none text-gray-900" />
					<span className="absolute right-12 top-1/2 -translate-y-1/2 text-gray-500 font-semibold">NOK</span>
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
						{causes.map((cause) => (
							<SelectItem key={cause._id} value={cause._id}>
								{cause.title} ({cause.category})
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			</div>

			{/* Donor Information */}
			<div className="space-y-4 p-4 rounded-lg">
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
						{paymentMethod === "vipps" ? t("phone_vipps") || "Phone (required for Vipps)" : t("phone_optional") || "Phone (Optional)"}
						{paymentMethod === "vipps" && <span className="text-red-500 ml-1">*</span>}
					</label>
					<input type="tel" value={donorPhone} onChange={(e) => setDonorPhone(e.target.value)} required={paymentMethod === "vipps"} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-brand focus:outline-none text-gray-900" placeholder={t("phone_placeholder") || "Enter your phone number"} />
					{paymentMethod === "vipps" && <p className="text-xs text-gray-500 mt-1">This number will be pre-filled on the Vipps payment page.</p>}
				</div>

				<div>
					<label className="block text-sm font-medium text-gray-900 mb-2">{t("personal_number") || "Personal Number (Optional)"}</label>
					<input type="text" value={personalNumber} onChange={(e) => handlePersonalNumberChange(e.target.value)} maxLength={11} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-brand focus:outline-none text-gray-900" placeholder={t("personal_number_placeholder") || "Enter your 11-digit personal number"} />
					<p className="text-xs text-gray-500 mt-1">{t("personal_number_help") || "Enter your 11-digit personal identification number if you would like to receive an annual donation summary for tax purposes."}</p>
				</div>

				<div>
					<AddressAutocomplete value={address} onChange={setAddress} label={t("address") || "Address (Optional)"} placeholder={t("address_placeholder") || "Enter your address for tax documentation"} />
					<p className="text-xs text-gray-500 mt-1">{t("address_help") || "Include street address, postal code, and city for complete tax documentation."}</p>
				</div>
			</div>

			{/* Payment Method */}
			<div>
				<label className="block text-sm font-semibold text-gray-900 mb-3">{t("payment_method") || "Payment Method"}</label>
				<div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
					<button type="button" onClick={() => setPaymentMethod("vipps")} className={`p-2 rounded-lg border border-1 font-semibold transition-all ${paymentMethod === "vipps" ? "border-brand_primary bg-green-100 text-gray-700" : "border-gray-300 text-gray-900 hover:border-brand_primary"}`}>
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

			{/* Captcha */}
			<div>
				<CustomCaptcha onVerify={setCaptchaValid} onCaptchaChange={setCaptchaData} />
			</div>

			{/* Submit */}
			<Button type="submit" disabled={loading || amount < 50} className="w-full py-6 md:py-8 text-lg bg-brand_primary hover:bg-brand_primary/90 text-gray-700 font-bold">
				{loading ? (
					<>
						<Loader2 className="w-5 h-5 mr-2 animate-spin" />
						{paymentMethod === "vipps" ? t("processing_vipps") || "Processing with Vipps..." : t("processing") || "Processing..."}
					</>
				) : paymentMethod === "vipps" ? (
					<>
						Donate {formatNOK(amount)} with <Image src="/Vipps.webp" alt="Vipps" width={64} height={64} className="w-12 rounded-full" />
					</>
				) : (
					<>
						<svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
							<line x1="1" y1="10" x2="23" y2="10" />
						</svg>
						{formatNOK(amount)}
					</>
				)}
			</Button>

			<p className="text-xs text-center text-gray-700">{paymentMethod === "vipps" ? t("vipps_description") || "Quick and secure payment with Vipps" : t("secure_payment") || "Secure payment powered by Stripe"}</p>
		</form>
	);

	if (isInModal) return formContent;

	return (
		<Card className="w-full max-w-3xl mx-auto shadow-xl border-0 bg-white">
			<CardHeader className="bg-brand_secondary text-gray-100">
				<div className="flex items-center gap-3">
					<Heart className="w-8 h-8 text-brand_primary" />
					<div>
						<CardTitle className="text-2xl">{t("title") || "Make a Donation"}</CardTitle>
						<CardDescription className="text-gray-200">{t("description") || "Support our community with your generous contribution"}</CardDescription>
					</div>
				</div>
			</CardHeader>
			<CardContent className="pt-6">{formContent}</CardContent>
		</Card>
	);
}
