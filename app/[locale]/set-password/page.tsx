import SetPasswordClient from "./SetPasswordClient";
import { getTranslations } from "next-intl/server";

export const metadata = {
	title: "Set Password | Pashupatinath Norway Temple",
	description: "Set your password to complete your account setup",
};

export default async function SetPasswordPage() {
	const t = await getTranslations("setPassword");

	const translations = {
		title: t("title"),
		subtitle: t("subtitle"),
		newPassword: t("newPassword"),
		confirmPassword: t("confirmPassword"),
		setPassword: t("setPassword"),
		passwordMismatch: t("passwordMismatch"),
		passwordTooShort: t("passwordTooShort"),
		success: t("success"),
		successMessage: t("successMessage"),
		error: t("error"),
		invalidToken: t("invalidToken"),
		redirecting: t("redirecting"),
		goToLogin: t("goToLogin"),
	};

	return <SetPasswordClient translations={translations} />;
}
