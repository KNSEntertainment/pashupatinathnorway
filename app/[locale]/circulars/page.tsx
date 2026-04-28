import { getTranslations } from "next-intl/server";
import { getPublishedCirculars } from "@/lib/data/circulars";
import { normalizeDocs } from "@/lib/utils";
import CircularsClient from "./CircularsClient";
import type { LocalizedString } from "@/types";

interface Circular {
	_id: string;
	slug: string;
	circularTitle: LocalizedString;
	circularDesc: LocalizedString;
	circularAuthor?: LocalizedString;
	circularMainPicture?: string;
	circularSecondPicture?: string;
	publicationStatus: string;
	circularPublishedAt?: string | Date;
	createdAt: string | Date;
}

export const metadata = {
	title: "Circulars | PNSB-Norway",
	description: "Access official circulars and documents from PNSB-Norway. Important announcements and communications for our community.",
	openGraph: {
		title: "Circulars | PNSB-Norway",
		description: "Access official circulars and documents from PNSB-Norway. Important announcements and communications for our community.",
		url: "/updates/circulars",
		siteName: "PNSB-Norway",
		type: "website",
	},
};

export default async function CircularsPage({ params, searchParams }: { params: Promise<{ locale: string }>; searchParams: Promise<{ circularId?: string }> }) {
	const { locale } = await params;
	const { circularId } = await searchParams;

	const circulars = await getPublishedCirculars();
	const circularsNorm = normalizeDocs(circulars);

	const t = await getTranslations("notices");

	const translations = {
		circulars_tab: t("circulars_tab"),
		circulars_subtitle: t("circulars_subtitle"),
		back: t("back"),
		other_circulars: t("other_circulars"),
		view_detail: t("view_detail"),
		no_circulars: t("no_circulars"),
		no_circulars_desc: t("no_circulars_desc"),
	};

	return <CircularsClient circulars={circularsNorm as Circular[]} translations={translations} locale={locale} initialCircularId={circularId} />;
}
