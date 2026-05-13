// lib/validation.ts

export const validatePhoneNumber = (phone: string): boolean => {
	return /^\d{8}$/.test(phone);
};

export const validateNorwegianPersonalNumber = (personalNumber: string): boolean => {
	if (!/^\d{11}$/.test(personalNumber)) return false;

	const day = parseInt(personalNumber.substring(0, 2));
	const month = parseInt(personalNumber.substring(2, 4));
	const yearShort = parseInt(personalNumber.substring(4, 6));

	if (day < 1 || day > 31) return false;
	if (month < 1 || month > 12) return false;
	if (yearShort < 1) return false;

	const monthsWith30Days = [4, 6, 9, 11];

	if (month === 2 && day > 29) return false;
	if (monthsWith30Days.includes(month) && day > 30) return false;

	return true;
};

export const calculateAgeFromPersonalNumber = (personalNumber: string): number | null => {
	if (!validateNorwegianPersonalNumber(personalNumber)) return null;

	const day = parseInt(personalNumber.substring(0, 2));
	const month = parseInt(personalNumber.substring(2, 4)) - 1;
	const yearShort = parseInt(personalNumber.substring(4, 6));
	const individualNumber = parseInt(personalNumber.substring(6, 9));
	const currentYear = new Date().getFullYear();

	let fullYear: number;
	if (individualNumber >= 750 && individualNumber <= 999 && yearShort <= 39) {
		fullYear = 2000 + yearShort;
	} else {
		fullYear = 1900 + yearShort;
	}

	if (fullYear > currentYear) fullYear -= 100;

	const birthDate = new Date(fullYear, month, day);
	const today = new Date();

	let age = today.getFullYear() - birthDate.getFullYear();
	const monthDiff = today.getMonth() - birthDate.getMonth();
	if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
		age--;
	}

	if (age < 0 || age > 99) return null;
	return age;
};

export const validatePartialPersonalNumber = (personalNumber: string): string => {
	if (personalNumber.length === 0) return "";
	if (!/^\d*$/.test(personalNumber)) return "Personal number must contain only digits.";

	if (personalNumber.length >= 2) {
		const day = parseInt(personalNumber.substring(0, 2));
		if (day < 1 || day > 31) return "Invalid day. Must be between 01 and 31.";
	}

	if (personalNumber.length >= 4) {
		const month = parseInt(personalNumber.substring(2, 4));
		if (month < 1 || month > 12) return "Invalid month. Must be between 01 and 12.";

		const day = parseInt(personalNumber.substring(0, 2));
		const monthsWith30Days = [4, 6, 9, 11];

		if (month === 2 && day > 29) return "Invalid date. February has maximum 29 days.";
		if (monthsWith30Days.includes(month) && day > 30) return "Invalid date. This month has only 30 days.";
	}

	if (personalNumber.length >= 6) {
		const yearShort = parseInt(personalNumber.substring(4, 6));
		if (yearShort < 1) return "Invalid year. Must be 01 or later (1901+).";
	}

	if (personalNumber.length === 11) {
		if (!validateNorwegianPersonalNumber(personalNumber)) {
			return "Invalid Norwegian personal number format.";
		}
	}

	return "";
};

export const validateFamilyMemberPersonalNumber = (personalNumber: string): string => {
	if (!validateNorwegianPersonalNumber(personalNumber)) {
		return "Invalid Norwegian personal number. Please check date, month, and year (must be 1901+).";
	}
	const age = calculateAgeFromPersonalNumber(personalNumber);
	if (age !== null && age >= 15) {
		return "You cannot add another adult (15+ years). They must fill their own form.";
	}
	return "";
};

export const validateEmail = (email: string): boolean => {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};