import { getDownloads } from "@/lib/data/downloads";
import { notFound } from "next/navigation";
import DownloadDetailClient from "../DownloadDetailClient";

export default async function DownloadDetailPage({ params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	const downloads = await getDownloads();
	const doc = downloads.find((d) => d.id === id);
	if (!doc) return notFound();
	const otherDownloads = downloads.filter((d) => d.id !== id);
	return <DownloadDetailClient doc={doc} otherDownloads={otherDownloads} />;
}
