import ResetPasswordClient from "./ResetPasswordClient";
import { getTranslations } from "next-intl/server";

export const metadata = {
	title: "Reset Password | PNSB-Norway",
	description: "Reset your password for PNSB-Norway account",
};

export default async function ResetPasswordPage() {
	const t = await getTranslations("resetPassword");

	const translations = {
		title: t("title"),
		subtitle: t("subtitle"),
		newPassword: t("newPassword"),
		confirmPassword: t("confirmPassword"),
		resetPassword: t("resetPassword"),
		passwordMismatch: t("passwordMismatch"),
		passwordTooShort: t("passwordTooShort"),
		success: t("success"),
		successMessage: t("successMessage"),
		error: t("error"),
		invalidToken: t("invalidToken"),
		redirecting: t("redirecting"),
		goToLogin: t("goToLogin"),
	};

	return <ResetPasswordClient translations={translations} />;
}
