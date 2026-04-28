import PrivacyClient from "./PrivacyClient";

export const metadata = {
	title: "Privacy | PNSB-Norway",
	description: "Manage your privacy settings",
};

export default async function PrivacyPage() {
	return <PrivacyClient />;
}
