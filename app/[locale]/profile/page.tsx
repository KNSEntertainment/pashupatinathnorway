import ProfileClient from "./ProfileClient";
import { getTranslations } from "next-intl/server";

export const metadata = {
	title: "My Profile | Pashupatinath Norway Temple",
	description: "View and manage your profile information",
};

export default async function ProfilePage() {
	const t = await getTranslations("profile");

	const translations = {
		title: t("title"),
		personalInfo: t("personalInfo"),
		fullName: t("fullName"),
		email: t("email"),
		phone: t("phone"),
		username: t("username"),
		memberSince: t("memberSince"),
		accountType: t("accountType"),
		admin: t("admin"),
		member: t("member"),
		logout: t("logout"),
		editProfile: t("editProfile"),
		membershipDetails: t("membershipDetails"),
		membershipStatus: t("membershipStatus"),
		membershipType: t("membershipType"),
		approved: t("approved"),
		pending: t("pending"),
		blocked: t("blocked"),
		general: t("general"),
		active: t("active"),
		loading: t("loading"),
	};

	return <ProfileClient translations={translations} />;
}
