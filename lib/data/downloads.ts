import connectDB from "@/lib/mongodb";
import Download from "@/models/Download.Model";

import { Download as DownloadType } from "@/types";

function normalizeDownload(doc: Record<string, unknown>): DownloadType {
	return {
		id: (doc._id as { toString: () => string })?.toString() ?? (doc.id as string),
		title_en: (doc.title_en as string) || (doc.title as string),
		title_ne: doc.title_ne as string,
		title_no: doc.title_no as string,
		title: doc.title as string, // Legacy field
		date: doc.date as string,
		fileUrl: doc.fileUrl as string,
		imageUrl: doc.imageUrl as string,
		category: doc.category as string,
		downloadCount: (doc.downloadCount as number) ?? 0,
	};
}

export async function getDownloads(): Promise<DownloadType[]> {
	await connectDB();
	const docs = await Download.find().sort({ date: -1 }).lean();
	return docs.map(normalizeDownload);
}
