import ForgotPasswordClient from "./ForgotPasswordClient";
import { getTranslations } from "next-intl/server";

export const metadata = {
	title: "Forgot Password | PNSB-Norway",
	description: "Reset your password for PNSB-Norway account",
};

export default async function ForgotPasswordPage() {
	const t = await getTranslations("forgotPassword");

	const translations = {
		title: t("title"),
		subtitle: t("subtitle"),
		email: t("email"),
		emailPlaceholder: t("emailPlaceholder"),
		sendResetLink: t("sendResetLink"),
		backToLogin: t("backToLogin"),
		success: t("success"),
		successMessage: t("successMessage"),
		error: t("error"),
		invalidEmail: t("invalidEmail"),
		emailNotFound: t("emailNotFound"),
		redirecting: t("redirecting"),
	};

	return <ForgotPasswordClient translations={translations} />;
}
