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
		updating: t("updating", { defaultValue: "Updating..." }),
		changeEmail: t("changeEmail", { defaultValue: "Change Email" }),
		currentEmail: t("currentEmail", { defaultValue: "Current Email" }),
		newEmail: t("newEmail", { defaultValue: "New Email" }),
		password: t("password", { defaultValue: "Password" }),
		sending: t("sending", { defaultValue: "Sending..." }),
		emailUpdated: t("emailUpdated", { defaultValue: "Email updated successfully" }),
		emailUpdateError: t("emailUpdateError", { defaultValue: "Failed to update email" }),
		emailVerificationSent: t("emailVerificationSent", { defaultValue: "Email verification sent" }),
		emailVerificationError: t("emailVerificationError", { defaultValue: "Failed to send verification email" }),
		
	};

	return <UpdateClient translations={translations} />
}
