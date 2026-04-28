import { getTranslations } from "next-intl/server";
import { Metadata } from "next";
import ContactClient from "./ContactClient";
import { getSettings } from "@/lib/data/settings";
import { normalizeDocs } from "@/lib/utils";

export const metadata: Metadata = {
	title: "Contact Us | Pashupatinath Norway Temple",
	description: "Get in touch with Pashupatinath Norway Temple. Find our contact details and send us a message. We're here to assist you with any inquiries or support you need.",
	openGraph: {
		title: "Contact Us | Pashupatinath Norway Temple",
		description: "Get in touch with Pashupatinath Norway Temple. Find our contact details and send us a message. We're here to assist you with any inquiries or support you need.",
		url: "/contact",
		siteName: "Pashupatinath Norway Temple",
		type: "website",
	},
};

export default async function ContactPage() {
	const settings = await getSettings();
	const settingsNorm = normalizeDocs(settings);
	const t = await getTranslations("contact");

	const translations = {
		title: t("title"),
		subtitle: t("subtitle"),
		description: t("description"),
		form: {
			name: t("form.name"),
			name_placeholder: t("form.name_placeholder"),
			email: t("form.email"),
			email_placeholder: t("form.email_placeholder"),
			message: t("form.message"),
			message_placeholder: t("form.message_placeholder"),
			send: t("form.send"),
			sending: t("form.sending"),
		},
		success: t("success"),
		error: t("error"),
		info: {
			title: t("info.title"),
			address: t("info.address"),
			phone: t("info.phone"),
			email: t("info.email"),
		},
	};

	return <ContactClient settings={settingsNorm} translations={translations} />;
}
