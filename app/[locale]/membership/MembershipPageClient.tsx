"use client";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import SimpleMemberStats from "@/components/membership/SimpleMemberStats";
import { useState } from "react";
import { ChevronDown, Users } from "lucide-react";
import { MembershipTranslations } from "@/components/membership/types/membership";
import { useMembershipForm } from "@/app/[locale]/membership/hooks/useMembershipForm";
import { useOTPVerification } from "@/app/[locale]/membership/hooks/useOTPVerification";
import UniversalLoader from "@/components/ui/UniversalLoader";
import { useAddressAutocomplete } from "@/app/[locale]/membership/hooks/useAddressAutocomplete";
import { OTPModal } from "@/components/membership/OTPModal";
import { SuccessModal } from "@/components/membership/SuccessModal";
import { AddressField } from "@/components/membership/AddressField";
import { FamilyMemberCard } from "@/components/membership/FamilyMemberCard";
import { FormField, StyledInput } from "@/components/membership/FormField";
import CustomCaptcha from "@/components/ui/custom-captcha";

interface Props {
	translations: MembershipTranslations;
	locale: string;
}

export default function MembershipPageClient({ translations: t, locale }: Props) {
	const tr = useTranslations("membership");
	const footerT = useTranslations("footer");
	const [showStats, setShowStats] = useState(false);
	const [captchaValid, setCaptchaValid] = useState(false);
	const [captchaData, setCaptchaData] = useState({ text: "", hash: "" });

	// --- Hooks ---
	const form = useMembershipForm();

	const otp = useOTPVerification({
		phone: form.formData.phone,
		onVerified: async () => {
			await form.submitForm(captchaData);
		},
	});

	const address = useAddressAutocomplete({
		address: form.formData.address,
		onApply: form.applyAddressSuggestion,
	});

	// --- Submit handler ---
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		
		// Verify captcha before submission
		if (!captchaValid) {
			return;
		}
		
		const valid = form.validateAll();
		if (!valid) return;

		if (!otp.phoneVerified) {
			await otp.openModal();
			return;
		}

		await form.submitForm();
	};

	// --- Family member labels (avoids prop-drilling repetition) ---
	const familyMemberLabels = {
		title: tr("family_member_title"),
		remove: tr("remove"),
		firstName: tr("family_member_first_name"),
		firstNamePlaceholder: tr("family_member_first_name_placeholder"),
		middleName: tr("family_member_middle_name"),
		middleNamePlaceholder: tr("family_member_middle_name_placeholder"),
		lastName: tr("family_member_last_name"),
		lastNamePlaceholder: tr("family_member_last_name_placeholder"),
		personalNumber: tr("family_member_personal_number"),
		personalNumberPlaceholder: tr("family_member_personal_number_placeholder"),
		email: tr("family_member_email_address"),
		emailPlaceholder: tr("family_member_email_address_placeholder"),
		phone: tr("family_member_phone_number"),
		phonePlaceholder: tr("family_member_phone_number_placeholder"),
	};

	return (
		<>
			<OTPModal
				show={otp.showOTPModal}
				phone={form.formData.phone}
				otpCode={otp.otpCode}
				otpSent={otp.otpSent}
				otpError={otp.otpError}
				verifying={otp.verifying}
				countdown={otp.countdown}
				onOtpChange={otp.setOtpCode}
				onVerify={otp.verifyOTPCode}
				onResend={otp.resendOTP}
				onClose={otp.closeModal}
			/>

			<SuccessModal
				show={form.showSuccessModal}
				message={form.successMessage}
				submitAnotherLabel={t.submit_another}
				onSubmitAnother={() => {
					form.setShowSuccessModal(false);
					form.resetForm();
					otp.reset();
				}}
				onGoHome={() => {
					form.setShowSuccessModal(false);
					window.location.href = "/";
				}}
			/>

			{/* Mobile: View Members Data Link */}
			<div className="md:hidden container mx-auto px-4 my-6">
				<button
					onClick={() => setShowStats(!showStats)}
					className="w-full flex items-center justify-between text-blue-600 hover:text-blue-800 py-2 transition-colors duration-200"
				>
					<div className="flex items-center gap-2">
						<Users className="w-4 h-4" />
						<span className="font-medium underline">View Members Data</span>
					</div>
					<ChevronDown 
						className={`w-4 h-4 transition-transform duration-300 ${showStats ? 'rotate-180' : ''}`} 
					/>
				</button>
			</div>

			{/* Mobile: Animated SimpleMemberStats */}
			{/* <div className="md:hidden">
				<div 
					className={`overflow-hidden transition-all duration-500 ease-in-out ${
						showStats ? 'max-h-none opacity-100 my-4' : 'max-h-0 opacity-0'
					}`}
				>
					<SimpleMemberStats />
				</div>
			</div> */}

			{/* Desktop: Always show SimpleMemberStats */}
			{/* <div className="hidden md:block">
				<SimpleMemberStats />
			</div> */}

			<div className="container mx-auto md:px-4 md:pb-12">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{/* ── Membership Form ── */}
					<div className="md:col-span-2 md:mt-8 md:shadow-md p-8 md:px-12 bg-brand_primary relative overflow-hidden">
						
						<div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50" />

	<div className="absolute top-4 right-4 z-20">
	<Link href="/membership-status" className="text-brand_secondary hover:text-red-700 underline text-sm font-medium transition-colors duration-200">
		{footerT("check_membership_status")}
	</Link>
</div>

						<div className="relative z-10 flex flex-col md:items-center md:justify-center">
							<h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t.title}</h2>
							<p className="text-gray-900 mb-8">{t.subtitle}</p>
						</div>

						<form className="relative z-10 space-y-6" onSubmit={handleSubmit} noValidate>
							{/* ── Personal Information ── */}
							<section>
								<h3 className="text-xl font-semibold text-gray-900 mb-4">{t.personal_info}</h3>
								<div className="grid md:grid-cols-2 gap-6">
									{/* Personal Number */}
									<FormField
										label={t.personal_number}
										required
										error={form.errors.personalNumber}
									>
										<div className="relative">
											<StyledInput
												type="text"
												name="personalNumber"
												value={form.formData.personalNumber}
												onChange={form.handleChange}
												onBlur={form.handlePersonalNumberBlur}
												maxLength={11}
												pattern="\d{11}"
												hasError={!!form.errors.personalNumber}
												isSuccess={form.personalNumberStatus === "available"}
												placeholder={t.personal_number_placeholder}
											/>
										</div>
										{form.personalNumberStatus === "checking" && (
											<p className="text-yellow-600 text-sm mt-1">Checking availability...</p>
										)}
									</FormField>

									{/* First Name */}
									<FormField label={t.first_name} required error={form.errors.firstName}>
										<StyledInput
											type="text"
											name="firstName"
											value={form.formData.firstName}
											onChange={form.handleChange}
											hasError={!!form.errors.firstName}
											placeholder={t.first_name_placeholder}
										/>
									</FormField>

									{/* Middle Name */}
									<FormField label={t.middle_name}>
										<StyledInput
											type="text"
											name="middleName"
											value={form.formData.middleName}
											onChange={form.handleChange}
											placeholder={t.middle_name_placeholder}
										/>
									</FormField>

									{/* Last Name */}
									<FormField label={t.last_name} required error={form.errors.lastName}>
										<StyledInput
											type="text"
											name="lastName"
											value={form.formData.lastName}
											onChange={form.handleChange}
											hasError={!!form.errors.lastName}
											placeholder={t.last_name_placeholder}
										/>
									</FormField>

									{/* Email */}
									<FormField label={t.email_address} required error={form.errors.email}>
										<StyledInput
											type="email"
											name="email"
											value={form.formData.email}
											onChange={form.handleChange}
											onBlur={form.handleEmailBlur}
											hasError={!!form.errors.email}
											placeholder={t.email_address_placeholder}
										/>
									</FormField>

									{/* Phone */}
									<FormField label={t.phone_number} required error={form.errors.phone}>
										<div className="relative">
											<StyledInput
												type="tel"
												maxLength={8}
												name="phone"
												value={form.formData.phone}
												onChange={form.handleChange}
												onBlur={form.handlePhoneBlur}
												readOnly={otp.phoneVerified}
												hasError={!!form.errors.phone}
												isSuccess={otp.phoneVerified}
												className={otp.phoneVerified ? "bg-gray-50 cursor-not-allowed" : ""}
												placeholder={t.phone_number_placeholder}
											/>
											{otp.phoneVerified && (
												<div className="absolute right-3 top-2.5 text-green-600">
													<svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
													</svg>
												</div>
											)}
											{otp.otpSending && (
												<div className="absolute right-3 top-2.5">
													<UniversalLoader size="sm" variant="spinner" showLogo={false} />
												</div>
											)}
										</div>
										{otp.phoneVerified && (
											<p className="text-green-600 text-sm mt-1">Phone number verified</p>
										)}
									</FormField>
								</div>
							</section>

							{/* ── Family Members ── */}
							<section>
								<div className="flex justify-between items-center mb-4">
									<h3 className="text-xl font-semibold text-gray-900">{tr("family_members")}</h3>
									<button
										type="button"
										onClick={form.addFamilyMember}
										disabled={!form.isMainApplicantOver15() || !!form.errors.personalNumber}
										className={`bg-brand_secondary text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
											!form.isMainApplicantOver15() || !!form.errors.personalNumber
												? "opacity-50 cursor-not-allowed"
												: "hover:bg-rd-700"
										}`}
									>
										{tr("add_children_u15")}
									</button>
								</div>

								{form.formData.familyMembers.length === 0 ? (
									<p className="text-gray-600 text-sm italic">{tr("no_family_members")}</p>
								) : (
									<div className="space-y-4">
										{form.formData.familyMembers.map((member, index) => (
											<FamilyMemberCard
												key={member.id}
												member={member}
												index={index}
												errors={form.familyMemberErrors}
												onUpdate={form.updateFamilyMember}
												onRemove={form.removeFamilyMember}
												labels={familyMemberLabels}
											/>
										))}
									</div>
								)}
							</section>

							{/* ── Address ── */}
							<section>
								<h3 className="text-xl font-semibold text-gray-900 mb-4">{t.address_norway}</h3>
								<AddressField
									address={form.formData.address}
									addressError={form.errors.address}
									onAddressChange={(e) => {
										form.setAddress(e.target.value);
										address.clearError();
									}}
									onAddressKeyDown={address.handleKeyDown}
									suggestions={address.suggestions}
									activeSuggestionIndex={address.activeSuggestionIndex}
									onSelectSuggestion={address.applySuggestion}
																		city=""
									cityError=""
									cityLabel=""
									cityPlaceholder=""
									postalCode={form.formData.postalCode}
									postalCodeError={form.errors.postalCode}
									bydel={form.formData.bydel}
									kommune={form.formData.kommune}
									fylke={form.formData.fylke}
									onFieldChange={form.handleChange}
									streetAddressLabel={t.street_address}
									streetAddressPlaceholder={t.street_address_ph}
																		postalCodeLabel={t.postal_code}
									postalCodePlaceholder={t.postal_code_ph}
								/>
							</section>

							{/* ── Captcha ── */}
							<section>
								<CustomCaptcha 
									onVerify={setCaptchaValid}
									onCaptchaChange={setCaptchaData}
								/>
							</section>

							{/* ── Terms ── */}
							<div className="rounded-lg p-2 md:p-6">
								<label className="flex items-start cursor-pointer">
									<input
										type="checkbox"
										name="agreeTerms"
										checked={form.formData.agreeTerms}
										onChange={form.handleChange}
										className="w-5 h-5 text-brand_primary rounded mt-1"
									/>
									<span className="ml-2 md:ml-3 text-gray-900">
										{t.agree_terms_prefix}{" "}
										<Link href="/terms-and-conditions" className="text-black underline">
											{t.terms_and_conditions}
										</Link>{" "}
										{t.and}{" "}
										<Link href="/privacy-policy" className="text-black underline">
											{t.privacy_policy}
										</Link>
										{locale === "ne" && "संग सहमत छु।"}
										<span className="text-red-500"> *</span>
									</span>
								</label>
								{form.errors.terms && (
									<p className="text-red-600 text-sm mt-2">{form.errors.terms}</p>
								)}
							</div>

							{/* ── Buttons ── */}
							<div className="flex gap-4">
								<button
									type="submit"
									disabled={!form.isFormValid()}
									className={`flex-1 bg-brand_secondary text-white py-2 md:py-4 px-6 md:px-8 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl${
										!form.isFormValid() ? " opacity-50 cursor-not-allowed" : ""
									}`}
								>
									{t.submit}
								</button>
								<button
									type="button"
									onClick={() => {
										form.resetForm();
										otp.reset();
									}}
									className="px-6 md:px-8 py-2 md:py-4 border-2 border-light text-gray-900 rounded-lg font-semibold hover:bg-light transition-colors"
								>
									{t.reset}
								</button>
							</div>
						</form>
					</div>

					{/* ── Sidebar Info Card ── */}
					<div className="px-4 md:px-0 relative z-10 mb-8 md:my-8 md:sticky md:top-8 md:self-start">
						<Card className="bg-brand_primary/10 md:backdrop-blur-sm">
							<CardHeader className="bg-brand_secondary">
								<CardTitle className="text-xl font-bold text-gray-200 flex items-center gap-2">
									<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
										<path
											fillRule="evenodd"
											d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
											clipRule="evenodd"
										/>
									</svg>
									{tr("membership_info_title")}
								</CardTitle>
							</CardHeader>
							<CardContent className="p-6 space-y-4">
								{/* <div className="space-y-3">
									{[
										tr("membership_info_1"),
										tr("membership_info_2"),
										tr("membership_info_3"),
									].map((info, i) => (
										<div key={i} className="flex items-start gap-3">
											<div className="w-2 h-2 rounded-full bg-brand_primary mt-2 flex-shrink-0" />
											<p className="text-gray-700 leading-relaxed text-sm">{info}</p>
										</div>
									))}
								</div> */}
								<div className="space-y-3">
									
										<div className="flex items-start gap-3">
											<div className="w-2 h-2 rounded-full bg-brand_primary mt-2 flex-shrink-0" />
											<p className="text-gray-700 leading-relaxed text-sm">Membership fee is FREE and forms for children under 15 years of age must be filled by parents/guardians.</p>
										</div>
										<div className="flex items-start gap-3">
											<div className="w-2 h-2 rounded-full bg-brand_primary mt-2 flex-shrink-0" />
											<p className="min-w-0 break-words text-gray-700 leading-relaxed text-sm"><a href="https://person.brreg.no/en/minside/tros-og-livssyn" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline break-all" aria-label="View existing memberships with other organizations on Brreg website (opens in new tab)">Click to View</a> <span className="break-all">(https://person.brreg.no/en/minside)</span> your existing memberships with other organizations. To cancel, <a href="/utmeldingsblankett-juli2006.pdf" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800 underline" aria-label="Download membership cancellation form (PDF, opens in new tab)">fill out this form</a> and send it to the respective temple/organization. </p>
										</div>
										<div className="flex items-start gap-3">
											<div className="w-2 h-2 rounded-full bg-brand_primary mt-2 flex-shrink-0" />
											<p className="text-gray-700 leading-relaxed text-sm">Your personal details will only be used by this organization. You can update them anytime through your member portal.</p>
										</div>
								</div>

								<div className="bg-brand_primary/20 p-6 flex flex-col space-y-4">
									<h3 className="text-sm font-bold">{t.need_help}</h3>
									<p className="font-medium text-sm">{t.contact_us_any_questions}</p>
									<a
										href="mailto:nepalihindusamfunn@gmail.com"
										className="inline-flex items-center w-fit px-4 py-1.5 bg-brand_primary rounded-lg font-medium text-sm hover:translate-y-[-2px] transition-colors"
									>
										<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
										</svg>
										{t.email_us}
									</a>
								</div>
							</CardContent>
						</Card>
					</div>
				</div>
			</div>
		</>
	);
}
