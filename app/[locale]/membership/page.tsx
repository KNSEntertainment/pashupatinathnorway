import { getTranslations } from "next-intl/server";
import MembershipPageClient from "./MembershipPageClient";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Membership | Pashupatinath Norway Temple",
	description: "Stay informed with the latest membership information from Pashupatinath Norway Temple. Get updates on events, announcements, and important information for our community.",
	openGraph: {
		title: "Membership | Pashupatinath Norway Temple",
		description: "Stay informed with the latest membership information from Pashupatinath Norway Temple. Get updates on events, announcements, and important information for our community.",
		url: "/membership",
		siteName: "Pashupatinath Norway Temple",
		type: "website",
	},
};

export default async function MembershipPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	const t = await getTranslations("membership");

	const translations = {
		welcome: t("welcome"),
		welcome_msg: t("welcome_msg"),
		submit_another: t("submit_another"),
		title: t("title"),
		subtitle: t("subtitle"),
		personal_info: t("personal_info"),
		first_name: t("first_name"),
		middle_name: t("middle_name"),
		last_name: t("last_name"),
		first_name_placeholder: t("first_name_placeholder"),
		middle_name_placeholder: t("middle_name_placeholder"),
		last_name_placeholder: t("last_name_placeholder"),
		email_address: t("email_address"),
		email_address_placeholder: t("email_address_placeholder"),
		phone_number: t("phone_number"),
		phone_number_placeholder: t("phone_number_placeholder"),
		personal_number: t("personal_number"),
		personal_number_placeholder: t("personal_number_placeholder"),
		gender: t("gender"),
		select_gender: t("select_gender"),
		male: t("male"),
		female: t("female"),
		other: t("other"),
		prefer_not_to_say: t("prefer_not_to_say"),
		address_nepal: t("address_nepal"),
		address_nepal_ph: t("address_nepal_ph"),
		address_norway: t("address_norway"),
		street_address: t("street_address"),
		street_address_ph: t("street_address_ph"),
		city: t("city"),
		city_ph: t("city_ph"),
		postal_code: t("postal_code"),
		postal_code_ph: t("postal_code_ph"),
		agree_terms: t("agree_terms"),
		agree_terms_prefix: t("agree_terms_prefix"),
		terms_and_conditions: t("terms_and_conditions"),
		and: t("and"),
		privacy_policy: t("privacy_policy"),
		permissions_title: t("permissions_title"),
		permission_photos: t("permission_photos"),
		permission_phone: t("permission_phone"),
		permission_email: t("permission_email"),
		submit: t("submit"),
		reset: t("reset"),
		need_help: t("need_help"),
		contact_us_any_questions: t("contact_us_any_questions"),
		email_us: t("email_us"),
		locating: t("locating"),
		use_current_location: t("use_current_location"),
	};

	return (
		<MembershipPageClient translations={translations} locale={locale} />
	);
}
