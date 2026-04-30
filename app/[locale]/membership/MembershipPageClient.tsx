"use client";
import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
	first_name: string;
	middle_name: string;
	last_name: string;
	first_name_placeholder: string;
	middle_name_placeholder: string;
	last_name_placeholder: string;
	email_address: string;
	email_address_placeholder: string;
	phone_number: string;
	phone_number_placeholder: string;
	personal_number: string;
	personal_number_placeholder: string;
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

interface FamilyMember {
	id: string;
	firstName: string;
	middleName: string;
	lastName: string;
	personalNumber: string;
	email: string;
	phone: string;
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
	const tr = useTranslations("membership");
	const [formData, setFormData] = useState({
		firstName: "",
		middleName: "",
		lastName: "",
		email: "",
		phone: "",
		address: "",
		city: "",
		postalCode: "",
		personalNumber: "",
		gender: "",
		province: "",
		district: "",
		membershipStatus: "pending",
		agreeTerms: false,
		permissionPhotos: false,
		permissionPhone: false,
		permissionEmail: false,
		familyMembers: [] as FamilyMember[],
	});

	const [emailError, setEmailError] = useState("");
	const [personalNumberError, setPersonalNumberError] = useState("");
	const [phoneError, setPhoneError] = useState("");
	const [familyMemberErrors, setFamilyMemberErrors] = useState<Record<string, string>>({});
	const [firstNameError, setFirstNameError] = useState("");
	const [lastNameError, setLastNameError] = useState("");
	const [genderError, setGenderError] = useState("");
	const [addressError, setAddressError] = useState("");
	const [cityError, setCityError] = useState("");
	const [postalCodeError, setPostalCodeError] = useState("");
	const [termsError, setTermsError] = useState("");
	const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
	const [addressLoading, setAddressLoading] = useState(false);
	const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
	const [locating, setLocating] = useState(false);
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");
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

	const validatePhoneNumber = (phone: string) => {
		// Check if phone contains only digits and is exactly 8 characters
		return /^\d{8}$/.test(phone);
	};

	const validateNorwegianPersonalNumber = (personalNumber: string) => {
		// Check if exactly 11 digits
		if (!/^\d{11}$/.test(personalNumber)) {
			return false;
		}

		// Extract components
		const day = parseInt(personalNumber.substring(0, 2));
		const month = parseInt(personalNumber.substring(2, 4));
		const yearShort = parseInt(personalNumber.substring(4, 6));

		// Validate day (1-31)
		if (day < 1 || day > 31) {
			return false;
		}

		// Validate month (1-12)
		if (month < 1 || month > 12) {
			return false;
		}

		// Validate year (must be 01 or later, meaning 1901+)
		if (yearShort < 1) {
			return false;
		}

		// Additional validation for specific months with fewer days
		const monthsWith31Days = [1, 3, 5, 7, 8, 10, 12];
		const monthsWith30Days = [4, 6, 9, 11];
		const february = 2;

		if (month === february) {
			// February - basic validation (1-29)
			if (day > 29) {
				return false;
			}
		} else if (monthsWith30Days.includes(month)) {
			// Months with 30 days
			if (day > 30) {
				return false;
			}
		} else if (monthsWith31Days.includes(month)) {
			// Months with 31 days
			if (day > 31) {
				return false;
			}
		}

		return true;
	};

	const validatePartialPersonalNumber = (personalNumber: string) => {
		if (personalNumber.length === 0) {
			return "";
		}

		// Only allow digits
		if (!/^\d*$/.test(personalNumber)) {
			return "Personal number must contain only digits.";
		}

		// Validate day (first 2 digits) - MUST be valid to proceed
		if (personalNumber.length >= 2) {
			const day = parseInt(personalNumber.substring(0, 2));
			if (day < 1 || day > 31) {
				return "Invalid day. Must be between 01 and 31.";
			}
		}

		// Validate month (digits 3-4) - MUST be valid to proceed
		if (personalNumber.length >= 4) {
			const month = parseInt(personalNumber.substring(2, 4));
			if (month < 1 || month > 12) {
				return "Invalid month. Must be between 01 and 12.";
			}

			// Additional validation for specific months
			const day = parseInt(personalNumber.substring(0, 2));
			const monthsWith30Days = [4, 6, 9, 11];
			const february = 2;

			if (month === february && day > 29) {
				return "Invalid date. February has maximum 29 days.";
			} else if (monthsWith30Days.includes(month) && day > 30) {
				return "Invalid date. This month has only 30 days.";
			}
					}

		// Validate year (digits 5-6) - MUST be valid to proceed
		if (personalNumber.length >= 6) {
			const yearShort = parseInt(personalNumber.substring(4, 6));
			if (yearShort < 1) {
				return "Invalid year. Must be 01 or later (1901+).";
			}
					}

		// Final validation for complete 11-digit number
		if (personalNumber.length === 11) {
			if (!validateNorwegianPersonalNumber(personalNumber)) {
				return "Invalid Norwegian personal number format.";
			}
		}

		return "";
	};

	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const target = e.target as HTMLInputElement | HTMLSelectElement;
		const name = target.name;
		let value = target.value;

		// Clear field-specific errors when user changes corresponding field
		if (name === "email" && emailError) {
			setEmailError("");
		}
		if (name === "firstName" && firstNameError) {
			setFirstNameError("");
		}
		if (name === "lastName" && lastNameError) {
			setLastNameError("");
		}
		if (name === "gender" && genderError) {
			setGenderError("");
		}
		if (name === "address" && addressError) {
			setAddressError("");
		}
		if (name === "city" && cityError) {
			setCityError("");
		}
		if (name === "postalCode" && postalCodeError) {
			setPostalCodeError("");
		}
		if (name === "phone" && phoneError) {
			setPhoneError("");
		}
		if (name === "agreeTerms" && termsError) {
			setTermsError("");
		}

		// Real-time validation for personal number field
		if (name === "personalNumber") {
			// Only allow digits and limit to 11
			const cleanValue = value.replace(/\D/g, '');
			if (cleanValue.length > 11) {
				value = formData.personalNumber; // Keep previous value if trying to exceed 11 digits
			} else {
				value = cleanValue;
			}
			
			// Validate and prevent progression if invalid
			const partialError = validatePartialPersonalNumber(value);
			if (partialError) {
				setPersonalNumberError(partialError);
				// Don't update the form value if there's an error (except for digit-only errors)
				if (!partialError.includes("must contain only digits")) {
					// Keep the current valid portion
					if (value.length > formData.personalNumber.length) {
						// User is trying to add an invalid character/digit
						value = formData.personalNumber;
					}
				}
			} else {
				setPersonalNumberError("");
			}
		}

		// Handle phone number validation and formatting
		if (name === "phone") {
			// Only allow digits
			value = value.replace(/\D/g, '');
			// Limit to 8 digits
			if (value.length > 8) {
				value = value.slice(0, 8);
			}
			// Clear phone error when user edits the field
			if (phoneError) {
				setPhoneError("");
			}
		}

		if (target instanceof HTMLInputElement && target.type === "checkbox") {
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

	const handlePersonalNumberBlur = () => {
		if (!formData.personalNumber) {
			setPersonalNumberError("Personal number is required.");
			return;
		}

		if (!validateNorwegianPersonalNumber(formData.personalNumber)) {
			setPersonalNumberError("Invalid Norwegian personal number. Please check date, month, and year (must be 1901+).");
		} else {
			setPersonalNumberError("");
		}
	};

	const addFamilyMember = () => {
		const newMember: FamilyMember = {
			id: Date.now().toString(),
			firstName: "",
			middleName: "",
			lastName: "",
			personalNumber: "",
			email: formData.email || "",
			phone: formData.phone || "",
		};
		setFormData({ ...formData, familyMembers: [...formData.familyMembers, newMember] });
	};

	const removeFamilyMember = (id: string) => {
		setFormData({ ...formData, familyMembers: formData.familyMembers.filter(member => member.id !== id) });
		// Clean up validation errors for removed member
		setFamilyMemberErrors(prev => {
			const newErrors = { ...prev };
			delete newErrors[`${id}-personalNumber`];
			return newErrors;
		});
	};

	const updateFamilyMember = (id: string, field: keyof FamilyMember, value: string) => {
		// Real-time validation for personal number field
		if (field === 'personalNumber') {
			const member = formData.familyMembers.find(m => m.id === id);
			const currentValue = member?.personalNumber || "";
			
			// Only allow digits and limit to 11
			const cleanValue = value.replace(/\D/g, '');
			if (cleanValue.length > 11) {
				value = currentValue; // Keep previous value if trying to exceed 11 digits
			} else {
				value = cleanValue;
			}
			
			// Validate and prevent progression if invalid
			const partialError = validatePartialPersonalNumber(value);
			if (partialError) {
				setFamilyMemberErrors(prev => ({
					...prev,
					[`${id}-personalNumber`]: partialError
				}));
				// Don't update the form value if there's an error (except for digit-only errors)
				if (!partialError.includes("must contain only digits")) {
					// Keep the current valid portion
					if (value.length > currentValue.length) {
						// User is trying to add an invalid character/digit
						value = currentValue;
					}
				}
			} else {
				// Clear error when valid
				setFamilyMemberErrors(prev => {
					const newErrors = { ...prev };
					delete newErrors[`${id}-personalNumber`];
					return newErrors;
				});
			}
		}
		
		setFormData({
			...formData,
			familyMembers: formData.familyMembers.map(member =>
				member.id === id ? { ...member, [field]: value } : member
			)
		});
	};

	
	const handleSubmit = async (e: React.FormEvent<HTMLButtonElement | HTMLFormElement>) => {
		e.preventDefault();
		
		// Clear all previous errors
		setFirstNameError("");
		setLastNameError("");
		setGenderError("");
		setAddressError("");
		setCityError("");
		setPostalCodeError("");
		setTermsError("");
		setPhoneError("");
		setPersonalNumberError("");
		
		let hasError = false;
		
		// Validate first name
		if (!formData.firstName) {
			setFirstNameError("First name is required.");
			hasError = true;
		}
		
		// Validate last name
		if (!formData.lastName) {
			setLastNameError("Last name is required.");
			hasError = true;
		}
		
		// Validate gender
		if (!formData.gender) {
			setGenderError("Gender is required.");
			hasError = true;
		}
		
		// Validate address
		if (!formData.address) {
			setAddressError("Address is required.");
			hasError = true;
		}
		
		// Validate city
		if (!formData.city) {
			setCityError("City is required.");
			hasError = true;
		}
		
		// Validate postal code
		if (!formData.postalCode) {
			setPostalCodeError("Postal code is required.");
			hasError = true;
		}
		
		// Validate phone number
		if (!formData.phone) {
			setPhoneError("Phone number is required.");
			hasError = true;
		} else if (!validatePhoneNumber(formData.phone)) {
			setPhoneError("Phone number must be exactly 8 digits.");
			hasError = true;
		}
		
		// Validate personal number
		if (!formData.personalNumber) {
			setPersonalNumberError("Personal number is required.");
			hasError = true;
		} else if (!validateNorwegianPersonalNumber(formData.personalNumber)) {
			setPersonalNumberError("Invalid Norwegian personal number. Please check date, month, and year (must be 1901+).");
			hasError = true;
		}
		
		// Validate terms agreement
		if (!formData.agreeTerms) {
			setTermsError("You must agree to the terms and conditions.");
			hasError = true;
		}
		
		// Don't proceed if there are validation errors
		if (hasError || emailError) {
			return;
		}

		// Validate family members
		for (const member of formData.familyMembers) {
			if (!member.firstName || !member.lastName || !member.personalNumber || !member.email) {
				// Set error for the specific family member field
				setFamilyMemberErrors(prev => ({
					...prev,
					[`${member.id}-required`]: "Please fill in all required fields for family members."
				}));
				hasError = true;
			}
			
			if (member.personalNumber && !validateNorwegianPersonalNumber(member.personalNumber)) {
				setFamilyMemberErrors(prev => ({
					...prev,
					[`${member.id}-personalNumber`]: `Invalid Norwegian personal number. Please check date, month, and year (must be 1901+).`
				}));
				hasError = true;
			}
			
			// Validate family member phone number (optional but if provided must be 8 digits)
			if (member.phone && !validatePhoneNumber(member.phone)) {
				setFamilyMemberErrors(prev => ({
					...prev,
					[`${member.id}-phone`]: "Phone number must be exactly 8 digits."
				}));
				hasError = true;
			}
			
			// Basic email validation
			const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
			if (member.email && !emailRegex.test(member.email)) {
				setFamilyMemberErrors(prev => ({
					...prev,
					[`${member.id}-email`]: "Email address is not valid."
				}));
				hasError = true;
			}
		}
		
		// Don't proceed if there are family member validation errors
		if (hasError) {
			return;
		}
		
		try {
			const res = await fetch("/api/membership", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});
			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || "Failed to submit application");
			}
			
			const responseData = await res.json();
			const totalMembers = responseData.totalMembers || 1;
			const message = totalMembers > 1 
				? `Successfully registered ${totalMembers} family members!` 
				: "Successfully registered!";
			
			setSuccessMessage(message);
			setShowSuccessModal(true);
			setFormData({
				firstName: "",
				middleName: "",
				lastName: "",
				email: "",
				phone: "",
				address: "",
				city: "",
				postalCode: "",
				personalNumber: "",
				gender: "",
				province: "",
				district: "",
				membershipStatus: "pending",
				agreeTerms: false,
				permissionPhotos: false,
				permissionPhone: false,
				permissionEmail: false,
				familyMembers: [],
			});
		} catch (error) {
			alert("There was an error submitting your application. Please try again." + error);
		}
	};

	const resetForm = () => {
		setFormData({
			firstName: "",
			middleName: "",
			lastName: "",
			email: "",
			phone: "",
			address: "",
			city: "",
			postalCode: "",
			personalNumber: "",
			gender: "",
			province: "",
			district: "",
			membershipStatus: "pending",
			agreeTerms: false,
			permissionPhotos: false,
			permissionPhone: false,
			permissionEmail: false,
			familyMembers: [],
		});
		setAddressSuggestions([]);
		setAddressError("");
		setActiveSuggestionIndex(-1);
		setEmailError("");
		setPersonalNumberError("");
		setPhoneError("");
		setFamilyMemberErrors({});
		setFirstNameError("");
		setLastNameError("");
		setGenderError("");
		setAddressError("");
		setCityError("");
		setPostalCodeError("");
		setTermsError("");
	};

	// Success Modal Component
	const SuccessModal = () => {
		if (!showSuccessModal) return null;

		return (
			<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
				<div className="bg-white rounded-2xl shadow-2xl max-w-lg w-full transform transition-all max-h-[90vh] overflow-y-auto">
					<div className="bg-gradient-to-r from-green-400 to-blue-500 p-6 rounded-t-2xl">
						<div className="flex items-center justify-center">
							<div className="bg-white rounded-full p-3">
								<svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
									<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
								</svg>
							</div>
						</div>
					</div>
					
					<div className="p-6 text-center">
						<h3 className="text-2xl font-bold text-gray-900 mb-4">Registration Successful!</h3>
						<p className="text-gray-600 mb-6">{successMessage}</p>
						
						{/* Welcome Message */}
						<div className="bg-blue-50 rounded-lg p-4 mb-6">
							<h4 className="text-lg font-semibold text-gray-900 mb-2">{t.welcome}</h4>
							<p className="text-gray-700 text-sm">{t.welcome_msg}</p>
						</div>
						
						<div className="flex flex-col sm:flex-row gap-3">
							<button
								onClick={() => {
									setShowSuccessModal(false);
									resetForm();
								}}
								className="flex-1 bg-gradient-to-r from-brand_primary to-brand_secondary text-gray-700 px-6 py-3 rounded-lg hover:opacity-90 transition-all font-medium shadow-lg"
							>
								{t.submit_another}
							</button>
							<button
								onClick={() => {
									setShowSuccessModal(false);
									// Navigate to home or dashboard if needed
									window.location.href = '/';
								}}
								className="flex-1 bg-gray-100 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-200 transition-colors font-medium"
							>
								Go to Homepage
							</button>
						</div>
					</div>
				</div>
			</div>
		);
	};

	return (
		<>
			<SuccessModal />
			<div className="container mx-auto md:px-4 md:py-12">
				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
				{/* Membership Form */}
			<div className="md:col-span-2 md:mt-8 md:shadow-md p-8 md:px-12 bg-brand_primary relative overflow-hidden">
				<div className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-50" style={{ backgroundImage: "url('/nepalipaper.jpg')" }} />
				<div className="relative z-10flex flex-col md:items-center md:justify-center">
					<h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{t.title}</h2>
					<p className="text-gray-900 mb-8"> {t.subtitle}</p>
				</div>

			

				<div className="relative z-10 space-y-6">
					{/* Personal Information */}
					<div>
						<h3 className="text-xl font-semibold text-gray-900 mb-4">{t.personal_info}</h3>
						<div className="grid md:grid-cols-2 gap-6">
							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">
									{t.first_name} <span className="text-red-500">*</span>
								</label>
								<input type="text" name="firstName" value={formData.firstName} onChange={handleChange} className={`w-full px-4 py-2 border ${firstNameError ? "border-red-500" : "border-light"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`} placeholder={t.first_name_placeholder} />
								{firstNameError && <p className="text-red-600 text-sm mt-1">{firstNameError}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">
									{t.middle_name}
								</label>
								<input type="text" name="middleName" value={formData.middleName} onChange={handleChange} className="w-full px-4 py-2 border border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent" placeholder={t.middle_name_placeholder} />
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">
									{t.last_name} <span className="text-red-500">*</span>
								</label>
								<input type="text" name="lastName" value={formData.lastName} onChange={handleChange} className={`w-full px-4 py-2 border ${lastNameError ? "border-red-500" : "border-light"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`} placeholder={t.last_name_placeholder} />
								{lastNameError && <p className="text-red-600 text-sm mt-1">{lastNameError}</p>}
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
								<input type="tel" maxLength={8} name="phone" value={formData.phone} onChange={handleChange} className={`w-full px-4 py-2 border ${phoneError ? "border-red-500" : "border-light"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`} placeholder={t.phone_number_placeholder} />
								{phoneError && <p className="text-red-600 text-sm mt-1">{phoneError}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">
									{t.personal_number} <span className="text-red-500">*</span>
								</label>
								<input type="text" name="personalNumber" value={formData.personalNumber} onChange={handleChange} onBlur={handlePersonalNumberBlur} maxLength={11} pattern="\d{11}" className={`w-full px-4 py-2 border ${personalNumberError ? "border-red-500" : "border-light"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`} placeholder={t.personal_number_placeholder} />
								{personalNumberError && <p className="text-red-600 text-sm mt-1">{personalNumberError}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">
									{t.gender} <span className="text-red-500">*</span>
								</label>
								<select name="gender" value={formData.gender} onChange={handleChange} className={`w-full px-4 py-2 border ${genderError ? "border-red-500" : "border-light"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}>
									<option value="">{t.select_gender}</option>
									<option value="male">{t.male}</option>
									<option value="female">{t.female}</option>
									<option value="other">{t.other}</option>
									<option value="prefer-not-to-say">{t.prefer_not_to_say}</option>
								</select>
								{genderError && <p className="text-red-600 text-sm mt-1">{genderError}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">{t.address_nepal}</label>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									{/* Province Dropdown */}
									<div>
										{/* <label className="block text-xs text-gray-900 mb-1">{t.province}</label> */}
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
										{/* <label className="block text-xs text-gray-900 mb-1">{t.district}</label> */}
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

					{/* Family Members Section */}
					<div>
						<div className="flex justify-between items-center mb-4">
							<h3 className="text-xl font-semibold text-gray-900">{tr("family_members")}</h3>
							<button
								type="button"
								onClick={addFamilyMember}
								className="bg-brand_secondary text-white px-4 py-2 rounded-lg hover:bg-rd-700 transition-colors text-sm font-medium"
							>
								{tr("add_family_member")}
							</button>
						</div>
						
						{formData.familyMembers.length === 0 ? (
							<p className="text-gray-600 text-sm italic">{tr("no_family_members")}</p>
						) : (
							<div className="space-y-4">
								{formData.familyMembers.map((member, index) => (
									<div key={member.id} className="border border-light rounded-lg p-4 bg-gray-50">
										<div className="flex justify-between items-center mb-3">
											<h4 className="font-medium text-gray-900">{tr("family_member_title")} {index + 1}</h4>
											<button
												type="button"
												onClick={() => removeFamilyMember(member.id)}
												className="text-red-600 hover:text-red-800 text-sm font-medium"
											>
												{tr("remove")}
											</button>
										</div>
										<div className="grid md:grid-cols-2 gap-4">
											<div>
												<label className="block text-sm font-medium text-gray-900 mb-1">
													{tr("family_member_first_name")} <span className="text-red-500">*</span>
												</label>
												<input
													type="text"
													value={member.firstName}
													onChange={(e) => updateFamilyMember(member.id, 'firstName', e.target.value)}
													className="w-full px-3 py-2 border border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
													placeholder={tr("family_member_first_name_placeholder")}
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-900 mb-1">
													{tr("family_member_middle_name")}
												</label>
												<input
													type="text"
													value={member.middleName}
													onChange={(e) => updateFamilyMember(member.id, 'middleName', e.target.value)}
													className="w-full px-3 py-2 border border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
													placeholder={tr("family_member_middle_name_placeholder")}
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-900 mb-1">
													{tr("family_member_last_name")} <span className="text-red-500">*</span>
												</label>
												<input
													type="text"
													value={member.lastName}
													onChange={(e) => updateFamilyMember(member.id, 'lastName', e.target.value)}
													className="w-full px-3 py-2 border border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
													placeholder={tr("family_member_last_name_placeholder")}
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-900 mb-1">
													{tr("family_member_personal_number")} <span className="text-red-500">*</span>
												</label>
												<input
													type="text"
													value={member.personalNumber}
													onChange={(e) => updateFamilyMember(member.id, 'personalNumber', e.target.value)}
													maxLength={11}
													pattern="\d{11}"
													className={`w-full px-3 py-2 border ${familyMemberErrors[`${member.id}-personalNumber`] ? "border-red-500" : "border-light"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`}
													placeholder={tr("family_member_personal_number_placeholder")}
												/>
												{familyMemberErrors[`${member.id}-personalNumber`] && (
													<p className="text-red-600 text-sm mt-1">{familyMemberErrors[`${member.id}-personalNumber`]}</p>
												)}
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-900 mb-1">
													{tr("family_member_email_address")} <span className="text-red-500">*</span>
												</label>
												<input
													type="email"
													value={member.email}
													onChange={(e) => updateFamilyMember(member.id, 'email', e.target.value)}
													className="w-full px-3 py-2 border border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
													placeholder={tr("family_member_email_address_placeholder")}
												/>
											</div>
											<div>
												<label className="block text-sm font-medium text-gray-900 mb-1">
													{tr("family_member_phone_number")}
												</label>
												<input
													type="tel"
													value={member.phone}
													onChange={(e) => {
														// Only allow digits and limit to 8
														let value = e.target.value.replace(/\D/g, '');
														if (value.length > 8) {
															value = value.slice(0, 8);
														}
														updateFamilyMember(member.id, 'phone', value);
													}}
													maxLength={8}
													className="w-full px-3 py-2 border border-light rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
													placeholder={tr("family_member_phone_number_placeholder")}
												/>
											</div>
										</div>
									</div>
								))}
							</div>
						)}
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
									<input type="text" name="address" value={formData.address} onChange={handleAddressChange} onKeyDown={handleAddressKeyDown} className={`w-full px-4 py-2 border ${addressError ? "border-red-500" : "border-light"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`} placeholder={t.street_address_ph} autoComplete="off" />
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
								<input type="text" name="city" value={formData.city} onChange={handleChange} className={`w-full px-4 py-2 border ${cityError ? "border-red-500" : "border-light"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`} placeholder={t.city_ph} />
								{cityError && <p className="text-red-600 text-sm mt-1">{cityError}</p>}
							</div>
							<div>
								<label className="block text-sm font-medium text-gray-900 mb-2">
									{t.postal_code} <span className="text-red-500">*</span>
								</label>
								<input type="text" name="postalCode" value={formData.postalCode} onChange={handleChange} className={`w-full px-4 py-2 border ${postalCodeError ? "border-red-500" : "border-light"} rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent`} placeholder={t.postal_code_ph} />
								{postalCodeError && <p className="text-red-600 text-sm mt-1">{postalCodeError}</p>}
							</div>
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
								<Link href="/terms-and-conditions" className="text-black underline">
									{t.terms_and_conditions}
								</Link>{" "}
								{t.and}{" "}
								<Link href="/privacy-policy" className="text-black underline">
									{t.privacy_policy}
								</Link>
								. <span className="text-red-500"> *</span>
							</span>
						</label>
						{termsError && <p className="text-red-600 text-sm mt-2">{termsError}</p>}
					</div>

					{/* Submit Button */}
					<div className="flex gap-4">
						<button onClick={handleSubmit} className={`flex-1 bg-brand_secondary text-white py-2 md:py-4 px-6 md:px-8 rounded-lg font-semibold transition-colors shadow-lg hover:shadow-xl${!formData.agreeTerms ? " opacity-50 cursor-not-allowed" : ""}`} disabled={!formData.agreeTerms}>
							{t.submit}
						</button>
						<button onClick={resetForm} className="px-6 md:px-8 py-2 md:py-4 border-2 border-light text-gray-900 rounded-lg font-semibold hover:bg-light transition-colors">
							{t.reset}
						</button>
					</div>
				</div>
			</div>

			{/* Membership Information Card */}
			<div className="px-4 md:px-0 relative z-10 mb-8 md:my-8 md:sticky md:top-8 md:self-start">
					<Card className="bg-brand_primary/10 md:backdrop-blur-sm">
						<CardHeader className="bg-gradient-to-r from-brand_primary to-brand_secondary">
							<CardTitle className="text-xl font-bold text-gray-700 flex items-center gap-2">
								<svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
									<path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
								</svg>
								{tr("membership_info_title")}
							</CardTitle>
						</CardHeader>
						<CardContent className="p-6 space-y-4">
							<div className="space-y-3">
								<div className="flex items-start gap-3">
									<div className="w-2 h-2 rounded-full bg-brand_primary mt-2 flex-shrink-0"></div>
									<p className="text-gray-700 leading-relaxed text-sm">
										{tr("membership_info_1")}
									</p>
								</div>
								<div className="flex items-start gap-3">
									<div className="w-2 h-2 rounded-full bg-brand_primary mt-2 flex-shrink-0"></div>
									<p className="text-gray-700 leading-relaxed text-sm">
										{tr("membership_info_2")}
									</p>
								</div>
								<div className="flex items-start gap-3">
									<div className="w-2 h-2 rounded-full bg-brand_primary mt-2 flex-shrink-0"></div>
									<p className="text-gray-700 leading-relaxed text-sm">
										{tr("membership_info_3")}
									</p>
								</div>
							
							</div>
				
				<div className="bg-brand_primary/20 p-6 flex flex-col space-y-4">
					<h3 className="text-sm font-bold">{t.need_help}</h3>
				<p className="font-medium text-sm">{t.contact_us_any_questions}</p>
				<a href="mailto:nepalihindusamfunn@gmail.com" className="inline-flex items-center w-fit px-4 py-1.5 bg-brand_primary rounded-lg font-medium  text-sm hover:translate-y-[-2px] transition-colors">
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
