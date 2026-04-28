"use client";
import { useState, useEffect } from "react";
import { Link } from "@/i18n/navigation";
import nepalLocationsData from "@/lib/data/nepal-locations.json";

interface District {
	id: string;
	name: string;
	nameNe: string;
}

interface Translations {
	welcome: string;
	welcome_msg: string;
	submit_another: string;
	title: string;
	subtitle: string;
	personal_info: string;
	full_name: string;
	full_name_placeholder: string;
	email_address: string;
	executive_member: string;
	executive_member_desc: string;
	email_address_placeholder: string;
	phone_number: string;
	phone_number_placeholder: string;
	date_of_birth: string;
	gender: string;
	select_gender: string;
	male: string;
	female: string;
	other: string;
	prefer_not_to_say: string;
	address_nepal: string;
	address_nepal_ph: string;
	address_norway: string;
	street_address: string;
	street_address_ph: string;
	city: string;
	city_ph: string;
	postal_code: string;
	postal_code_ph: string;
	professional_info: string;
	occupation: string;
	occupation_ph: string;
	skills_expertise: string;
	skills_expertise_ph: string;
	membership_type: string;
	general_member: string;
	general_member_desc: string;
	areas_of_interests: string;
	interest_politics: string;
	interest_social: string;
	interest_education: string;
	interest_culture: string;
	interest_events: string;
	interest_fundraising: string;
	agree_terms: string;
	agree_terms_prefix: string;
	terms_and_conditions: string;
	and: string;
	privacy_policy: string;
	permissions_title: string;
	permission_photos: string;
	permission_phone: string;
	permission_email: string;
	submit: string;
	reset: string;
	need_help: string;
	contact_us_any_questions: string;
	email_us: string;
	province: string;
	district: string;
	select_province: string;
	select_district: string;
	locating: string;
	use_current_location: string;
}

interface Props {
	translations: Translations;
	locale: string;
}

interface AddressSuggestion {
	id: string;
	label: string;
	addressLine: string;
	city: string;
	postalCode: string;
}

interface GeoapifyProperties {
	place_id?: string | number;
	formatted?: string;
	street?: string;
	housenumber?: string;
	city?: string;
	town?: string;
	village?: string;
	municipality?: string;
	county?: string;
	postcode?: string;
}

interface GeoapifyFeature {
	id?: string | number;
	properties?: GeoapifyProperties;
}

interface GeoapifyResponse {
	features?: GeoapifyFeature[];
}

export default function MembershipPageClient({ translations: t, locale }: Props) {
	const [formData, setFormData] = useState({
		fullName: "",
		email: "",
		phone: "",
		address: "",
		city: "",
		postalCode: "",
		dateOfBirth: "",
		gender: "",
		province: "",
		district: "",
		profession: "",
		membershipType: "general",
		membershipStatus: "pending",
		skills: "",
		volunteerInterest: [] as string[],
		agreeTerms: false,
		permissionPhotos: false,
		permissionPhone: false,
		permissionEmail: false,
	});

	const [submitted, setSubmitted] = useState(false);
	const [emailError, setEmailError] = useState("");
	const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
	const [addressLoading, setAddressLoading] = useState(false);
	const [addressError, setAddressError] = useState("");
	const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
	const [locating, setLocating] = useState(false);
	const geoapifyKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

	// Cascading dropdown state
	const [availableDistricts, setAvailableDistricts] = useState<District[]>([]);

	// Update available districts when province changes
	useEffect(() => {
		if (formData.province) {
			const province = nepalLocationsData.provinces.find((p) => p.id === formData.province);
			if (province) {
				setAvailableDistricts(province.districts);
				// Reset dependent fields
				setFormData((prev) => ({ ...prev, district: "" }));
			}
		} else {
			setAvailableDistricts([]);
		}
	}, [formData.province]);

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const target = e.target as HTMLInputElement | HTMLSelectElement;
		const name = target.name;
		const value = target.value;

		// Clear email error when user changes email field
		if (name === "email" && emailError) {
			setEmailError("");
		}

		if (target instanceof HTMLInputElement && target.type === "checkbox" && name === "volunteerInterest") {
			const checked = target.checked;
			const currentInterests = formData.volunteerInterest;
			setFormData({
				...formData,
				volunteerInterest: checked ? [...currentInterests, value] : currentInterests.filter((item) => item !== value),
			});
		} else if (target instanceof HTMLInputElement && target.type === "checkbox") {
			setFormData({ ...formData, [name]: target.checked });
		} else {
			setFormData({ ...formData, [name]: value });
		}
	};

	const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const value = e.target.value;
		setFormData({ ...formData, address: value });
		setAddressError("");
		setActiveSuggestionIndex(-1);
	};

	useEffect(() => {
		if (!geoapifyKey) {
			setAddressSuggestions([]);
			return;
		}
		if (!formData.address || formData.address.trim().length < 3) {
			setAddressSuggestions([]);
			return;
		}

		const controller = new AbortController();
		const timer = setTimeout(async () => {
			try {
				setAddressLoading(true);
				const text = encodeURIComponent(formData.address.trim());
				const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${text}&filter=countrycode:no&type=street&limit=5&apiKey=${geoapifyKey}`;
				const res = await fetch(url, { signal: controller.signal });
				if (!res.ok) {
					throw new Error("Failed to fetch address suggestions");
				}
				const data = (await res.json()) as GeoapifyResponse;
				const suggestions: AddressSuggestion[] = (data.features || []).map((feature: GeoapifyFeature) => {
					const props = feature.properties || {};
					const addressLine = [props.street, props.housenumber].filter(Boolean).join(" ").trim() || props.formatted || "";
					const city = props.city || props.town || props.village || props.municipality || props.county || "";
					const postalCode = props.postcode || "";
					return {
						id: props.place_id?.toString() || feature?.id?.toString() || `${addressLine}-${postalCode}`,
						label: props.formatted || addressLine || "Unknown address",
						addressLine: addressLine || props.formatted || "",
						city,
						postalCode,
					};
				});
				setAddressSuggestions(suggestions);
				setActiveSuggestionIndex(suggestions.length > 0 ? 0 : -1);
			} catch (err: unknown) {
				if (!(err instanceof Error) || err.name !== "AbortError") {
					setAddressError("Could not load address suggestions.");
				}
			} finally {
				setAddressLoading(false);
			}
		}, 350);

		return () => {
			clearTimeout(timer);
			controller.abort();
		};
	}, [formData.address, geoapifyKey]);

	const applySuggestion = (item: AddressSuggestion) => {
		setFormData((prev) => ({
			...prev,
			address: item.addressLine || item.label,
			city: item.city || prev.city,
			postalCode: item.postalCode || prev.postalCode,
		}));
		setAddressSuggestions([]);
		setActiveSuggestionIndex(-1);
	};

	const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
		if (addressSuggestions.length === 0) return;

		if (e.key === "ArrowDown") {
			e.preventDefault();
			setActiveSuggestionIndex((prev) => (prev + 1) % addressSuggestions.length);
		} else if (e.key === "ArrowUp") {
			e.preventDefault();
			setActiveSuggestionIndex((prev) => (prev - 1 + addressSuggestions.length) % addressSuggestions.length);
		} else if (e.key === "Enter") {
			if (activeSuggestionIndex >= 0) {
				e.preventDefault();
				applySuggestion(addressSuggestions[activeSuggestionIndex]);
			}
		} else if (e.key === "Escape") {
			setAddressSuggestions([]);
			setActiveSuggestionIndex(-1);
		}
	};

	const handleUseMyLocation = () => {
		if (!geoapifyKey) {
			setAddressError("Address lookup is not available.");
			return;
		}
		if (!navigator.geolocation) {
			setAddressError("Geolocation is not supported in this browser.");
			return;
		}
		setLocating(true);
		setAddressError("");
		navigator.geolocation.getCurrentPosition(
			async (pos) => {
				try {
					const { latitude, longitude } = pos.coords;
					const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&type=street&format=geojson&apiKey=${geoapifyKey}`;
					const res = await fetch(url);
					if (!res.ok) throw new Error("Failed to reverse geocode location");
					const data = await res.json();
					const props = data?.features?.[0]?.properties || {};
					const addressLine = [props.street, props.housenumber].filter(Boolean).join(" ").trim() || props.formatted || "";
					const city = props.city || props.town || props.village || props.municipality || props.county || "";
					const postalCode = props.postcode || "";
					setFormData((prev) => ({
						...prev,
						address: addressLine || prev.address,
						city: city || prev.city,
						postalCode: postalCode || prev.postalCode,
					}));
					setAddressSuggestions([]);
					setActiveSuggestionIndex(-1);
				} catch {
					setAddressError("Could not fetch your address.");
				} finally {
					setLocating(false);
				}
			},
			() => {
				setAddressError("Unable to access your location.");
				setLocating(false);
			},
			{ enableHighAccuracy: true, timeout: 8000 },
		);
	};

	const handleEmailBlur = async () => {
		if (!formData.email) return;

		try {
			const res = await fetch(`/api/membership?email=${encodeURIComponent(formData.email)}`);
			if (res.ok) {
				const data = await res.json();
				if (Array.isArray(data) && data.length > 0) {
					setEmailError("This email is already registered.");
				} else {
					setEmailError("");
				}
			}
		} catch {
			setEmailError("");
		}
	};

	const handleSubmit = async (e: React.FormEvent<HTMLButtonElement | HTMLFormElement>) => {
		e.preventDefault();
		try {
			const res = await fetch("/api/membership", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});
			if (!res.ok) throw new Error("Failed to submit application");
			setSubmitted(true);
			setFormData({
				fullName: "",
				email: "",
				phone: "",
				address: "",
				city: "",
				postalCode: "",
				dateOfBirth: "",
				gender: "",
				province: "",
				district: "",
				profession: "",
				membershipType: "general",
				membershipStatus: "pending",
				skills: "",
				volunteerInterest: [],
				agreeTerms: false,
				permissionPhotos: false,
				permissionPhone: false,
				permissionEmail: false,
			});
		} catch (error) {
			alert("There was an error submitting your application. Please try again." + error);
		}
	};

	const resetForm = () => {
		setFormData({
			fullName: "",
			email: "",
			phone: "",
			address: "",
			city: "",
			postalCode: "",
			dateOfBirth: "",
			gender: "",
			province: "",
			district: "",
			profession: "",
			membershipType: "general",
			membershipStatus: "pending",
			skills: "",
			volunteerInterest: [],
			agreeTerms: false,
			permissionPhotos: false,
			permissionPhone: false,
			permissionEmail: false,
		});
		setAddressSuggestions([]);
		setAddressError("");
		setActiveSuggestionIndex(-1);
	};

	if (submitted) {
		return (
			<div className="bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center min-h-screen justify-center p-4">
				<div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
					<div className="w-20 h-20 bg-success rounded-full flex items-center justify-center mx-auto mb-6">
						<svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
						</svg>
					</div>
					<h2 className="text-3xl font-bold text-gray-900 mb-4">{t.welcome}</h2>
					<p className="text-gray-900 mb-6">{t.welcome_msg}</p>
					<button onClick={() => setSubmitted(false)} className="bg-brand_primary text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors">
						{t.submit_another}
					</button>
				</div>
			</div>
		);
	}

	return (
		<div className="md:px-4 py-12">
			{/* Membership Form */}
			<div className="mx-auto max-w-3xl md:shadow-md p-8 md:px-12 bg-cover bg-center bg-no-repeat relative overflow-hidden">
				<div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50" style={{ backgroundImage: "url('/nepalipaper.jpg')" }} />
				<div className="relative z-10flex flex-col md:items-center md:justify-center">
					<h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t.title}</h2>
					<p className="text-gray-900 mb-8"> {t.subtitle}</p>
				</div>

				<div className="  relative z-10 space-y-6">
					{/* Personal Information */}
					<div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">{t.personal_info}</h3>
						<div className="grid md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">
									{t.full_name} <span className="text-red-500">*</span>
								</label>
								<input type="text" name="fullName" value={formData.fullName} onChange={handleChange} className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t.full_name_placeholder} />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">
									{t.email_address} <span className="text-red-500">*</span>
								</label>
								<input type="email" name="email" value={formData.email} onChange={handleChange} onBlur={handleEmailBlur} className={`w-full px-4 py-2 border ${emailError ? "border-red-500" : "border-light"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`} placeholder={t.email_address_placeholder} />
								{emailError && <p className="text-red-600 text-sm mt-1">{emailError}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">
									{t.phone_number} <span className="text-red-500">*</span>
								</label>
								<input type="tel" maxLength={14} name="phone" value={formData.phone} onChange={handleChange} className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t.phone_number_placeholder} />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">
									{t.date_of_birth} <span className="text-red-500">*</span>
								</label>
								<input type="date" name="dateOfBirth" value={formData.dateOfBirth} onChange={handleChange} className="w-full min-w-0 max-w-full text-sm px-3 py-2 border border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent box-border" style={{ minWidth: "0", maxWidth: "95%" }} />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">
									{t.gender} <span className="text-red-500">*</span>
								</label>
								<select name="gender" value={formData.gender} onChange={handleChange} className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
									<option value="">{t.select_gender}</option>
									<option value="male">{t.male}</option>
									<option value="female">{t.female}</option>
									<option value="other">{t.other}</option>
									<option value="prefer-not-to-say">{t.prefer_not_to_say}</option>
								</select>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">{t.address_nepal}</label>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* Province Dropdown */}
									<div>
										<label className="block text-xs text-gray-900 mb-1">{t.province}</label>
										<select name="province" value={formData.province} onChange={handleChange} className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent">
											<option value="">{t.select_province}</option>
											{nepalLocationsData.provinces.map((province) => (
												<option key={province.id} value={province.id}>
													{locale === "ne" ? province.nameNe : province.name}
												</option>
											))}
										</select>
									</div>

									{/* District Dropdown */}
									<div>
										<label className="block text-xs text-gray-900 mb-1">{t.district}</label>
										<select name="district" value={formData.district} onChange={handleChange} className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" disabled={!formData.province}>
											<option value="">{t.select_district}</option>
											{availableDistricts.map((district) => (
												<option key={district.id} value={district.id}>
													{locale === "ne" ? district.nameNe : district.name}
												</option>
											))}
										</select>
									</div>
								</div>
							</div>
						</div>
					</div>

					{/* Address in Norway */}
					<div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">{t.address_norway}</h3>
						<div className="grid md:grid-cols-2 gap-6">
							<div className="md:col-span-2">
								<label className="block text-sm font-medium text-gray-900 mb-2">
									{t.street_address} <span className="text-red-500">*</span>
								</label>
								<div className="relative">
									<input type="text" name="address" value={formData.address} onChange={handleAddressChange} onKeyDown={handleAddressKeyDown} className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t.street_address_ph} autoComplete="off" />
									<div className="mt-2">
										<button type="button" onClick={handleUseMyLocation} disabled={locating} className={`text-sm font-medium px-3 py-1.5 rounded border border-light bg-white hover:bg-light transition-colors ${locating ? "opacity-60 cursor-not-allowed" : ""}`}>
											{locating ? t.locating : t.use_current_location}
										</button>
									</div>
									{addressLoading && <div className="absolute right-3 top-2.5 text-xs text-gray-500">Loading…</div>}
									{addressError && <p className="text-xs text-red-600 mt-1">{addressError}</p>}
									{addressSuggestions.length > 0 && (
										<ul className="absolute z-20 mt-1 w-full bg-white border border-light rounded-lg shadow-lg max-h-60 overflow-auto">
											{addressSuggestions.map((item, index) => (
												<li
													key={item.id}
													className={`px-3 py-2 text-sm text-gray-900 cursor-pointer ${index === activeSuggestionIndex ? "bg-light" : "hover:bg-light"}`}
													onMouseDown={(e) => {
														e.preventDefault();
														applySuggestion(item);
													}}
												>
													<div className="font-medium">{item.label}</div>
													<div className="text-xs text-gray-600">{[item.postalCode, item.city].filter(Boolean).join(" ")}</div>
												</li>
											))}
										</ul>
									)}
								</div>
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">
									{t.city} <span className="text-red-500">*</span>
								</label>
								<input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t.city_ph} />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">
									{t.postal_code} <span className="text-red-500">*</span>
								</label>
								<input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t.postal_code_ph} />
							</div>
						</div>
					</div>

					{/* Professional Information */}
					<div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">{t.professional_info}</h3>
						<div className="grid md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">{t.occupation}</label>
								<input type="text" name="profession" value={formData.profession} onChange={handleChange} className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t.occupation_ph} />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">{t.skills_expertise}</label>
								<input type="text" name="skills" value={formData.skills} onChange={handleChange} className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t.skills_expertise_ph} />
							</div>
						</div>
					</div>

					{/* Membership Type */}
					<div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">{t.membership_type}</h3>
						<div className="space-y-3">
							<label className="flex items-center p-4 border border-light rounded-lg cursor-pointer hover:bg-brand_primary/10 transition-colors">
								<input type="radio" name="membershipType" value="executive" checked={formData.membershipType === "executive"} onChange={handleChange} className="w-4 h-4 text-brand_primary" />
								<div className="ml-3">
									<span className="font-medium text-gray-900">{t.executive_member}</span>
									<p className="text-sm text-gray-900">{t.executive_member_desc}</p>
								</div>
							</label>
							<label className="flex items-center p-4 border border-light rounded-lg cursor-pointer hover:bg-brand_primary/10 transition-colors">
								<input type="radio" name="membershipType" value="general" checked={formData.membershipType === "general"} onChange={handleChange} className="w-4 h-4 text-brand_primary" />
								<div className="ml-3">
									<span className="font-medium text-gray-900">{t.general_member}</span>
									<p className="text-sm text-gray-900">{t.general_member_desc}</p>
								</div>
							</label>
						</div>
					</div>

					{/* Volunteer Interests */}
					<div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">{t.areas_of_interests}</h3>
						<div className="grid md:grid-cols-2 gap-3">
							{[t.interest_politics, t.interest_social, t.interest_education, t.interest_culture, t.interest_events, t.interest_fundraising].map((interest) => (
								<label key={interest} className="flex items-center p-3 border border-light rounded-lg cursor-pointer hover:bg-brand_primary/10 transition-colors">
									<input type="checkbox" name="volunteerInterest" value={interest} checked={formData.volunteerInterest.includes(interest)} onChange={handleChange} className="w-4 h-4 text-brand_primary rounded" />
									<span className="ml-3 text-gray-900">{interest}</span>
								</label>
							))}
						</div>
					</div>

					{/* Privacy Permissions */}
					<div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">{t.permissions_title}</h3>
						<div className="space-y-3">
							<label className="flex items-start cursor-pointer p-3 border border-light rounded-lg hover:bg-brand_primary/10 transition-colors">
								<input type="checkbox" name="permissionPhotos" checked={formData.permissionPhotos} onChange={handleChange} className="w-5 h-5 text-brand_primary rounded mt-1" />
								<span className="ml-3 text-gray-900 text-sm">{t.permission_photos}</span>
							</label>
							<label className="flex items-start cursor-pointer p-3 border border-light rounded-lg hover:bg-brand_primary/10 transition-colors">
								<input type="checkbox" name="permissionPhone" checked={formData.permissionPhone} onChange={handleChange} className="w-5 h-5 text-brand_primary rounded mt-1" />
								<span className="ml-3 text-gray-900 text-sm">{t.permission_phone}</span>
							</label>
							<label className="flex items-start cursor-pointer p-3 border border-light rounded-lg hover:bg-brand_primary/10 transition-colors">
								<input type="checkbox" name="permissionEmail" checked={formData.permissionEmail} onChange={handleChange} className="w-5 h-5 text-brand_primary rounded mt-1" />
								<span className="ml-3 text-gray-900 text-sm">{t.permission_email}</span>
							</label>
						</div>
					</div>

					{/* Terms and Conditions */}
					<div className="bg-light rounded-lg p-2 md:p-6">
						<label className="flex items-start cursor-pointer">
							<input type="checkbox" name="agreeTerms" checked={formData.agreeTerms} onChange={handleChange} className="w-5 h-5 text-brand_primary rounded mt-1" />
							<span className="ml-2 md:ml-3 text-gray-900">
								{t.agree_terms_prefix}{" "}
								<Link href="/terms-and-conditions" className="text-brand_primary hover:underline">
									{t.terms_and_conditions}
								</Link>{" "}
								{t.and}{" "}
								<Link href="/privacy-policy" className="text-brand_primary hover:underline">
									{t.privacy_policy}
								</Link>
								. <span className="text-red-500"> *</span>
							</span>
						</label>
					</div>

					{/* Submit Button */}
					<div className="flex gap-4">
						<button onClick={handleSubmit} className={`flex-1 bg-brand_primary text-white py-2 md:py-4 px-6 md:px-8 rounded-lg font-semibold hover:bg-brand_primary/90 transition-colors shadow-lg hover:shadow-xl${!formData.agreeTerms ? " opacity-50 cursor-not-allowed" : ""}`} disabled={!formData.agreeTerms}>
							{t.submit}
						</button>
						<button onClick={resetForm} className="px-6 md:px-8 py-2 md:py-4 border-2 border-light text-gray-900 rounded-lg font-semibold hover:bg-light transition-colors">
							{t.reset}
						</button>
					</div>
				</div>
			</div>

			{/* Contact Info */}
			<div className="mt-12 md:rounded-2xl bg-gradient-to-r from-blue-400 to-brand text-white p-8 text-center">
				<h3 className="text-2xl font-bold mb-4">{t.need_help}</h3>
				<p className="mb-6 font-medium text-lg">{t.contact_us_any_questions}</p>
				<div className="flex flex-wrap justify-center gap-4">
					<a href="mailto:nepalihindusamfunn@gmail.com" className="inline-flex items-center px-6 py-3 bg-white text-brand_primary rounded-lg font-semibold hover:translate-y-[-2px] transition-colors">
						<svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
						</svg>
						{t.email_us}
					</a>
				</div>
			</div>
		</div>
	);
}
