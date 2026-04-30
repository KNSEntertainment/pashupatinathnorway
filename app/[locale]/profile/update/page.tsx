import UpdateClient from "./UpdateClient";
import { getTranslations } from "next-intl/server";

export const metadata = {
	title: "Settings | Pashupatinath Norway Temple",
	description: "Manage your account settings and security",
};

export default async function UpdateProfilePage() {
	const t = await getTranslations("settings");
	// const m = await getTranslations("membership");

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
		updating: t("updating", { defaultValue: "Updating..." }),
		
	};

	return <UpdateClient translations={translations} />
}
