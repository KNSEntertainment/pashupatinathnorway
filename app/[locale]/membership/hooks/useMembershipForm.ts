// hooks/useMembershipForm.ts
"use client";
import { useState } from "react";
import { FormData, FormErrors, FamilyMember } from "@/components/membership/types/membership";
import { INITIAL_FORM_DATA } from "@/components/membership/types/membership";
import {
	validateNorwegianPersonalNumber,
	validatePartialPersonalNumber,
	validateFamilyMemberPersonalNumber,
	calculateAgeFromPersonalNumber,
	validatePhoneNumber,
	validateEmail,
} from "@/components/membership/lib/validation";
import { getPostalCodeInfo } from "@/lib/postalCodeLookup";

export type PersonalNumberStatus = "" | "checking" | "available" | "exists";

export function useMembershipForm() {
	const [formData, setFormData] = useState<FormData>(INITIAL_FORM_DATA);
	const [errors, setErrors] = useState<FormErrors>({});
	const [familyMemberErrors, setFamilyMemberErrors] = useState<Record<string, string>>({});
	const [personalNumberStatus, setPersonalNumberStatus] = useState<PersonalNumberStatus>("");
	const [showSuccessModal, setShowSuccessModal] = useState(false);
	const [successMessage, setSuccessMessage] = useState("");

	// --- Field error helpers ---
	const clearError = (field: keyof FormErrors) =>
		setErrors((prev) => { const e = { ...prev }; delete e[field]; return e; });

	const setError = (field: keyof FormErrors, message: string) =>
		setErrors((prev) => ({ ...prev, [field]: message }));

	// --- handleChange ---
	const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
		const target = e.target as HTMLInputElement;
		const { name } = target;
		let value = target.type === "checkbox" ? String(target.checked) : target.value;

		// Clear associated error
		const fieldMap: Record<string, keyof FormErrors> = {
			email: "email", firstName: "firstName", lastName: "lastName",
			address: "address", city: "city", postalCode: "postalCode",
			phone: "phone", agreeTerms: "terms",
		};
		if (fieldMap[name]) clearError(fieldMap[name]);
		if (name === "personalNumber") {
			clearError("personalNumber");
			setPersonalNumberStatus("");
		}

		// Personal number: digits only, max 11
		if (name === "personalNumber") {
			value = value.replace(/\D/g, "").slice(0, 11);
			const partialError = validatePartialPersonalNumber(value);
			if (partialError) {
				setError("personalNumber", partialError);
				if (!partialError.includes("only digits") && value.length > formData.personalNumber.length) {
					return; // Block the invalid addition
				}
			}
		}

		// Phone: digits only, max 8
		if (name === "phone") value = value.replace(/\D/g, "").slice(0, 8);

		// Postal code: digits only, max 4
		if (name === "postalCode") {
			const currentValue = formData.postalCode;
			value = value.replace(/\D/g, "").slice(0, 4);
			
			// Check if user deleted digits (going from 4 digits to fewer)
			if (currentValue.length === 4 && value.length < 4) {
				// Clear auto-populated fields when user deletes from a 4-digit postal code
				setFormData((prev) => ({
					...prev,
					[name]: value,
					city: '',
					bydel: '',
					kommune: '',
					fylke: ''
				}));
				return; // Exit early since we already updated the form data
			}
			
			// Auto-populate city, bydel, kommune, and fylke when postal code is 4 digits
			if (value.length === 4) {
				const postalInfo = getPostalCodeInfo(value);
				if (postalInfo.poststed) {
					setFormData((prev) => ({
						...prev,
						[name]: value,
						city: postalInfo.poststed,
						bydel: postalInfo.bydel,
						kommune: postalInfo.kommune,
						fylke: postalInfo.fylke
					}));
					return; // Exit early since we already updated the form data
				} else {
					// Clear auto-populated fields if postal code is not found
					setFormData((prev) => ({
						...prev,
						[name]: value,
						city: '',
						bydel: '',
						kommune: '',
						fylke: ''
					}));
					return; // Exit early since we already updated the form data
				}
			}
		}

		if (target.type === "checkbox") {
			setFormData((prev) => ({ ...prev, [name]: target.checked }));
		} else {
			setFormData((prev) => ({ ...prev, [name]: value }));
		}
	};

	// --- Email blur check ---
	const handleEmailBlur = async () => {
		if (!formData.email) return;
		try {
			const res = await fetch(`/api/membership?email=${encodeURIComponent(formData.email)}`);
			if (res.ok) {
				const data = await res.json();
				if (Array.isArray(data) && data.length > 0) {
					setError("email", "This email is already registered.");
				}
			}
		} catch {
			// silent
		}
	};

	// --- Personal number blur check ---
	const handlePersonalNumberBlur = async () => {
		if (!formData.personalNumber) {
			setError("personalNumber", "Personal number is required.");
			return;
		}
		if (!validateNorwegianPersonalNumber(formData.personalNumber)) {
			setError("personalNumber", "Invalid Norwegian personal number. Please check date, month, and year (must be 1901+).");
			return;
		}
		const age = calculateAgeFromPersonalNumber(formData.personalNumber);
		if (age !== null && age <= 15) {
			setError("personalNumber", "You must be over 15 years old to fill this form. Please ask your parents to fill it for you.");
			return;
		}

		try {
			setPersonalNumberStatus("checking");
			const res = await fetch(`/api/membership?personalNumber=${encodeURIComponent(formData.personalNumber)}`);
			if (res.ok) {
				const data = await res.json();
				if (data.exists) {
					setPersonalNumberStatus("exists");
					setError("personalNumber", "An account with this personal number already exists.");
				} else {
					setPersonalNumberStatus("available");
				}
			}
		} catch {
			setPersonalNumberStatus("");
		}
	};

	// --- Phone blur ---
	const handlePhoneBlur = () => {
		if (!formData.phone) {
			setError("phone", "Phone number is required.");
		} else if (!validatePhoneNumber(formData.phone)) {
			setError("phone", "Phone number must be exactly 8 digits.");
		}
	};

	// --- Address helpers ---
	const setAddress = (address: string) =>
		setFormData((prev) => ({ ...prev, address }));

	const applyAddressSuggestion = (item: {
		id: string; label: string;
		addressLine: string;
		city: string; postalCode: string; kommune: string; fylke: string;
	}) => {
		setFormData((prev) => ({
			...prev,
			address: item.addressLine,
			city: item.city || prev.city,
			postalCode: item.postalCode || prev.postalCode,
			kommune: item.kommune || "",
			fylke: item.fylke || "",
		}));
		clearError("address");
	};

	const applyLocationResult = (data: { address: string; city: string; postalCode: string }) => {
		setFormData((prev) => ({
			...prev,
			address: data.address || prev.address,
			city: data.city || prev.city,
			postalCode: data.postalCode || prev.postalCode,
		}));
	};

	// --- Family members ---
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
		setFormData((prev) => ({ ...prev, familyMembers: [...prev.familyMembers, newMember] }));
	};

	const removeFamilyMember = (id: string) => {
		setFormData((prev) => ({
			...prev,
			familyMembers: prev.familyMembers.filter((m) => m.id !== id),
		}));
		setFamilyMemberErrors((prev) => {
			const e = { ...prev };
			delete e[`${id}-personalNumber`];
			delete e[`${id}-required`];
			delete e[`${id}-email`];
			delete e[`${id}-phone`];
			return e;
		});
	};

	const updateFamilyMember = (id: string, field: keyof FamilyMember, value: string) => {
		if (field === "personalNumber") {
			const currentMember = formData.familyMembers.find((m) => m.id === id);
			const currentValue = currentMember?.personalNumber || "";
			value = value.replace(/\D/g, "").slice(0, 11);

			const partialError = validatePartialPersonalNumber(value);
			if (partialError) {
				setFamilyMemberErrors((prev) => ({ ...prev, [`${id}-personalNumber`]: partialError }));
				if (!partialError.includes("only digits") && value.length > currentValue.length) return;
			} else {
				setFamilyMemberErrors((prev) => {
					const e = { ...prev }; delete e[`${id}-personalNumber`]; return e;
				});
				if (value.length === 11 && validateNorwegianPersonalNumber(value)) {
					const err = validateFamilyMemberPersonalNumber(value);
					if (err) setFamilyMemberErrors((prev) => ({ ...prev, [`${id}-personalNumber`]: err }));
				}
			}
		}

		if (field === "phone") value = value.replace(/\D/g, "").slice(0, 8);

		setFormData((prev) => ({
			...prev,
			familyMembers: prev.familyMembers.map((m) =>
				m.id === id ? { ...m, [field]: value } : m
			),
		}));
	};

	// --- Derived state ---
	const isMainApplicantOver15 = (): boolean => {
		if (!formData.personalNumber || !validateNorwegianPersonalNumber(formData.personalNumber)) return false;
		const age = calculateAgeFromPersonalNumber(formData.personalNumber);
		return age !== null && age > 15;
	};

	// --- Form validity ---
	const isFormValid = (): boolean => {
		const { firstName, lastName, email, phone, personalNumber, address, city, postalCode, agreeTerms } = formData;

		if (!firstName || !lastName || !email || !phone || !personalNumber || !address || !city || !postalCode || !agreeTerms) return false;
		if (Object.values(errors).some(Boolean)) return false;
		if (personalNumberStatus === "exists") return false;
		if (!isMainApplicantOver15()) return false;
		if (!validatePhoneNumber(phone)) return false;
		if (!validateNorwegianPersonalNumber(personalNumber)) return false;
		if (!validateEmail(email)) return false;

		for (const member of formData.familyMembers) {
			if (!member.firstName || !member.lastName || !member.personalNumber || !member.email) return false;
			if (familyMemberErrors[`${member.id}-personalNumber`] || familyMemberErrors[`${member.id}-required`] ||
				familyMemberErrors[`${member.id}-email`] || familyMemberErrors[`${member.id}-phone`]) return false;
			if (!validateNorwegianPersonalNumber(member.personalNumber)) return false;
			const age = calculateAgeFromPersonalNumber(member.personalNumber);
			if (age === null || age >= 15) return false;
			if (!validateEmail(member.email)) return false;
			if (member.phone && !validatePhoneNumber(member.phone)) return false;
		}

		return true;
	};

	// --- Validate all on submit ---
	const validateAll = (): boolean => {
		const newErrors: FormErrors = {};
		let hasError = false;

		if (!formData.firstName) { newErrors.firstName = "First name is required."; hasError = true; }
		if (!formData.lastName) { newErrors.lastName = "Last name is required."; hasError = true; }
		if (!formData.address) { newErrors.address = "Address is required."; hasError = true; }
		if (!formData.city) { newErrors.city = "City is required."; hasError = true; }
		if (!formData.postalCode) { newErrors.postalCode = "Postal code is required."; hasError = true; }
		if (!formData.phone) {
			newErrors.phone = "Phone number is required."; hasError = true;
		} else if (!validatePhoneNumber(formData.phone)) {
			newErrors.phone = "Phone number must be exactly 8 digits."; hasError = true;
		}
		if (!formData.personalNumber) {
			newErrors.personalNumber = "Personal number is required."; hasError = true;
		} else if (!validateNorwegianPersonalNumber(formData.personalNumber)) {
			newErrors.personalNumber = "Invalid Norwegian personal number."; hasError = true;
		} else {
			const age = calculateAgeFromPersonalNumber(formData.personalNumber);
			if (age !== null && age <= 15) {
				newErrors.personalNumber = "You must be over 15 years old to fill this form."; hasError = true;
			}
		}
		if (!formData.agreeTerms) { newErrors.terms = "You must agree to the terms and conditions."; hasError = true; }
		if (errors.email) { newErrors.email = errors.email; hasError = true; }

		setErrors(newErrors);
		return !hasError;
	};

	// --- Submit ---
	const submitForm = async (captchaData?: { text: string; hash: string }): Promise<boolean> => {
		// Validate family members first
		const newFamilyErrors: Record<string, string> = {};
		let hasFamilyError = false;

		for (const member of formData.familyMembers) {
			if (!member.firstName || !member.lastName || !member.personalNumber || !member.email) {
				newFamilyErrors[`${member.id}-required`] = "Please fill in all required fields.";
				hasFamilyError = true;
			}
			if (member.personalNumber) {
				const err = validateFamilyMemberPersonalNumber(member.personalNumber);
				if (err) { newFamilyErrors[`${member.id}-personalNumber`] = err; hasFamilyError = true; }
			}
			if (member.phone && !validatePhoneNumber(member.phone)) {
				newFamilyErrors[`${member.id}-phone`] = "Phone number must be exactly 8 digits."; hasFamilyError = true;
			}
			if (member.email && !validateEmail(member.email)) {
				newFamilyErrors[`${member.id}-email`] = "Email address is not valid."; hasFamilyError = true;
			}
		}

		if (hasFamilyError) {
			setFamilyMemberErrors((prev) => ({ ...prev, ...newFamilyErrors }));
			return false;
		}

		try {
			const submissionData = captchaData ? { ...formData, captcha: captchaData } : formData;
			const res = await fetch("/api/membership", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(submissionData),
			});
			if (!res.ok) {
				const errorData = await res.json();
				throw new Error(errorData.error || "Failed to submit application");
			}
			const responseData = await res.json();
			const totalMembers = responseData.totalMembers || 1;
			setSuccessMessage(
				totalMembers > 1
					? `Successfully registered ${totalMembers} family members!`
					: "Successfully registered!"
			);
			setShowSuccessModal(true);
			return true;
		} catch (error) {
			alert("There was an error submitting your application. Please try again. " + error);
			return false;
		}
	};

	// --- Reset ---
	const resetForm = () => {
		setFormData(INITIAL_FORM_DATA);
		setErrors({});
		setFamilyMemberErrors({});
		setPersonalNumberStatus("");
		setShowSuccessModal(false);
		setSuccessMessage("");
	};

	return {
		formData,
		errors,
		familyMemberErrors,
		personalNumberStatus,
		showSuccessModal,
		successMessage,
		setShowSuccessModal,
		handleChange,
		handleEmailBlur,
		handlePersonalNumberBlur,
		handlePhoneBlur,
		setAddress,
		applyAddressSuggestion,
		applyLocationResult,
		addFamilyMember,
		removeFamilyMember,
		updateFamilyMember,
		isMainApplicantOver15,
		isFormValid,
		validateAll,
		submitForm,
		resetForm,
	};
}