// types/membership.ts

export interface FamilyMember {
	id: string;
	firstName: string;
	middleName: string;
	lastName: string;
	personalNumber: string;
	email: string;
	phone: string;
}

export interface FormData {
	firstName: string;
	middleName: string;
	lastName: string;
	email: string;
	phone: string;
	address: string;
	city: string;
	postalCode: string;
	bydel: string;
	kommune: string;
	fylke: string;
	personalNumber: string;
	membershipStatus: string;
	membershipType: string;
	agreeTerms: boolean;
	familyMembers: FamilyMember[];
}

export interface FormErrors {
	firstName?: string;
	lastName?: string;
	email?: string;
	phone?: string;
	personalNumber?: string;
	address?: string;
	city?: string;
	postalCode?: string;
	terms?: string;
}

export interface AddressSuggestion {
	id: string;
	label: string;
	addressLine: string;
	city: string;
	postalCode: string;
	kommune: string;
	fylke: string;
}


export interface MembershipTranslations {
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
	submit: string;
	reset: string;
	need_help: string;
	contact_us_any_questions: string;
	email_us: string;
	locating: string;
	use_current_location: string;
}

// constants/fylkeMapping.ts
export const FYLKE_MAPPING: Record<string, string> = {
	"NO-03": "Oslo",
	"NO-11": "Rogaland",
	"NO-15": "Møre og Romsdal",
	"NO-18": "Nordland",
	"NO-30": "Viken",
	"NO-34": "Innlandet",
	"NO-38": "Vestfold og Telemark",
	"NO-42": "Agder",
	"NO-46": "Vestland",
	"NO-50": "Trøndelag",
	"NO-54": "Troms og Finnmark",
	"NO-56": "Vestland",
	"NO-57": "Vestland",
};

export const INITIAL_FORM_DATA: FormData = {
	firstName: "",
	middleName: "",
	lastName: "",
	email: "",
	phone: "",
	address: "",
	city: "",
	postalCode: "",
	bydel: "",
	kommune: "",
	fylke: "",
	personalNumber: "",
	membershipStatus: "pending",
	membershipType: "General",
	agreeTerms: false,
	familyMembers: [],
};