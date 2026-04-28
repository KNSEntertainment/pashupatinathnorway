import { getTranslations } from "next-intl/server";
import { getNotices } from "@/lib/data/notices";
import { normalizeDocs } from "@/lib/utils";
import NoticesClient from "./NoticesClient";

interface Notice {
	_id: string;
	noticetitle: string;
	noticedate: string;
	noticetime?: string;
	notice: string;
	noticeimage?: string;
	[key: string]: unknown;
}

export const metadata = {
	title: "Notices | Pashupatinath Norway Temple",
	description: "Stay informed with the latest notices and announcements from Pashupatinath Norway Temple. Important information and updates for our community.",
	openGraph: {
		title: "Notices | Pashupatinath Norway Temple",
		description: "Stay informed with the latest notices and announcements from Pashupatinath Norway Temple. Important information and updates for our community.",
		url: "/updates/notices",
		siteName: "Pashupatinath Norway Temple",
		type: "website",
	},
};

export default async function NoticesPage({ searchParams }: { searchParams: Promise<{ noticeId?: string }> }) {
	const { noticeId } = await searchParams;

	const notices = await getNotices();
	const noticesNorm = normalizeDocs(notices);

	const t = await getTranslations("notices");

	const translations = {
		notices_tab: t("notices_tab"),
		notices_subtitle: t("notices_subtitle"),
		back: t("back"),
		other_notices: t("other_notices"),
		view_detail: t("view_detail"),
		no_notices: t("no_notices"),
		no_notices_desc: t("no_notices_desc"),
	};

	return <NoticesClient notices={noticesNorm as Notice[]} translations={translations} initialNoticeId={noticeId} />;
}
