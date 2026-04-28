import type { Metadata } from "next";
import { getDownloads } from "@/lib/data/downloads";
import DownloadsClient from "./DownloadsClient";
import { getTranslations } from "next-intl/server";
import SectionHeader from "@/components/SectionHeader";

export const metadata: Metadata = {
	title: "Downloads | Pashupatinath Norway Temple",
	description: "Download important documents, forms, and resources from Pashupatinath Norway Temple. All files are available for members and visitors.",
	openGraph: {
		title: "Downloads | Pashupatinath Norway Temple",
		description: "Download important documents, forms, and resources from Pashupatinath Norway Temple. All files are available for members and visitors.",
		url: "/downloads",
		siteName: "Pashupatinath Norway Temple",
		type: "website",
	},
};

export default async function DownloadsPage() {
	const t = await getTranslations("downloads");
	const downloads = await getDownloads();

	return (
		<section className="px-4 pt-12">
			<div className="mb-6 md:mb-8">
				<SectionHeader heading={t("title")} />
			</div>

			<DownloadsClient
				documents={downloads}
				translations={{
					searchPlaceholder: t("search_placeholder"),
					download: t("download"),
					all: t("all"),
					downloadsCount: t("downloads_count"),
					noDocuments: t("no_documents"),
					noDocumentsDesc: t("no_documents_desc"),
				}}
			/>
		</section>
	);
}
