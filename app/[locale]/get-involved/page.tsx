import { getTranslations, getLocale } from "next-intl/server";
import VolunteerFormClient from "./VolunteerFormClient";

export default async function VolunteerForm() {
	// const [tr, locale] = await Promise.all([getTranslations("getInvolved"), getLocale()]);
	const tr = await getTranslations("getInvolved");
	const locale = await getLocale();

	const translations = {
		title: tr("title"),
		volunteerDesc: tr("volunteerDesc"),
		flexibleCommitment: tr("flexibleCommitment"),
		flexibleCommitmentDesc: tr("flexibleCommitmentDesc"),
		skillDevelopment: tr("skillDevelopment"),
		skillDevelopmentDesc: tr("skillDevelopmentDesc"),
		makeRealImpact: tr("makeRealImpact"),
		makeRealImpactDesc: tr("makeRealImpactDesc"),
		trainingProvided: tr("trainingProvided"),
		trainingProvidedDesc: tr("trainingProvidedDesc"),
		fullName: tr("fullName"),
		fullName_ph: tr("fullName_ph"),
		email: tr("email"),
		phone: tr("phone"),
		areasOfInterest: tr("areasOfInterest"),
		events: tr("events"),
		socialMedia: tr("socialMedia"),
		fundraising: tr("fundraising"),
		outreach: tr("outreach"),
		research: tr("research"),
		design: tr("design"),
		submitApplication: tr("submitApplication"),
	};

	return <VolunteerFormClient translations={translations} locale={locale} />;
}
