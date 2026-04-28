import SettingsClient from "./SettingsClient";
import { getTranslations } from "next-intl/server";

export const metadata = {
	title: "Settings | PNSB-Norway",
	description: "Manage your account settings and security",
};

export default async function SettingsPage() {
	const t = await getTranslations("settings");
	const m = await getTranslations("membership");

	const translations = {
		title: t("title"),
		settings: t("settings"),
		changePassword: t("changePassword"),
		currentPassword: t("currentPassword"),
		newPassword: t("newPassword"),
		confirmPassword: t("confirmPassword"),
		updatePassword: t("updatePassword"),
		passwordUpdated: t("passwordUpdated"),
		passwordUpdateError: t("passwordUpdateError"),
		passwordsNotMatch: t("passwordsNotMatch"),
		passwordTooShort: t("passwordTooShort"),
		passwordChanged: t("passwordChanged"),
		securityWarning: t("securityWarning"),
		temporaryPasswordWarning: t("temporaryPasswordWarning"),
		changePasswordNow: t("changePasswordNow"),
		// Membership translations for interests
		personalInfo: t("personalInfo", { defaultValue: "Personal Information" }),
		updateProfile: t("updateProfile", { defaultValue: "Update Profile" }),
		profileUpdated: t("profileUpdated", { defaultValue: "Profile updated successfully" }),
		profileUpdateError: t("profileUpdateError", { defaultValue: "Failed to update profile" }),
		phone: t("phone", { defaultValue: "Phone Number" }),
		address: t("address", { defaultValue: "Address" }),
		city: t("city", { defaultValue: "City" }),
		postalCode: t("postalCode", { defaultValue: "Postal Code" }),
		province: t("province", { defaultValue: "Province" }),
		district: t("district", { defaultValue: "District" }),
		profession: t("profession", { defaultValue: "Profession" }),
		skills: t("skills", { defaultValue: "Skills" }),
		volunteerInterest: t("volunteerInterest", { defaultValue: "Volunteer Interest" }),
		updating: t("updating", { defaultValue: "Updating..." }),
		areas_of_interests: m("areas_of_interests"),
		interest_politics: m("interest_politics"),
		interest_social: m("interest_social"),
		interest_education: m("interest_education"),
		interest_culture: m("interest_culture"),
		interest_events: m("interest_events"),
		interest_fundraising: m("interest_fundraising"),
	};

	return <SettingsClient translations={translations} />;
}
