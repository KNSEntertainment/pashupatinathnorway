"use client";
import Image from "next/image";
import { FileText, Download as DownloadIcon, Calendar, Eye, ZoomIn, X } from "lucide-react";
import { useState, useEffect } from "react";
import { useLocale } from "next-intl";

interface Document {
	id: string;
	title_en: string;
	title_ne?: string;
	title_no?: string;
	title?: string; // Legacy field
	date: string;
	fileUrl: string;
	imageUrl?: string;
	category: string;
	downloadCount: number;
}

export default function DownloadDetailClient({ doc, otherDownloads }: { doc: Document; otherDownloads: Document[] }) {
	const [showPreview, setShowPreview] = useState(false);
	const [isZoomed, setIsZoomed] = useState(false);
	const locale = useLocale();

	// Helper function to get localized title
	const getLocalizedTitle = (document: Document): string => {
		if (locale === "ne" && document.title_ne) return document.title_ne;
		if (locale === "no" && document.title_no) return document.title_no;
		return document.title_en || document.title || "Untitled";
	};

	// Handle ESC key to close fullscreen
	useEffect(() => {
		const handleEsc = (e: KeyboardEvent) => {
			if (e.key === "Escape" && isZoomed) {
				setIsZoomed(false);
			}
		};
		window.addEventListener("keydown", handleEsc);
		return () => window.removeEventListener("keydown", handleEsc);
	}, [isZoomed]);

	// Improved PDF detection: checks for .pdf at end of fileUrl before ? or #, case-insensitive
	const isPdf = typeof doc.fileUrl === "string" && /\.pdf($|[?#])/i.test(doc.fileUrl);

	const handleDownload = async (fileUrl: string, title: string) => {
		let ext = ".pdf";
		const match = fileUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
		if (match) ext = "." + match[1];
		const safeTitle = title.replace(/[\\/:*?"<>|\r\n]+/g, "_") + ext;
		const response = await fetch(fileUrl);
		const blob = await response.blob();
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");
		link.href = url;
		link.download = safeTitle;
		link.click();
		URL.revokeObjectURL(url);
	};

	return (
		<div className="flex flex-col md:flex-row gap-8 p-4 md:p-8">
			{/* Main Detail */}
			<div className="flex-1 bg-white rounded-xl shadow-lg p-8">
				<div className="mb-6">
					{doc.imageUrl ? (
						<div className="relative group cursor-pointer" onClick={() => setIsZoomed(true)}>
							<Image src={doc.imageUrl} alt={getLocalizedTitle(doc)} width={400} height={300} className="rounded-lg object-contain max-h-80 w-full" />
							<div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 rounded-lg flex items-center justify-center">
								<ZoomIn size={48} className="text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
							</div>
						</div>
					) : (
						<div className="w-full h-60 flex items-center justify-center bg-blue-50 rounded-lg">
							<FileText size={64} className="text-blue-200" />
						</div>
					)}
				</div>
				<h1 className="text-3xl font-bold mb-2">{getLocalizedTitle(doc)}</h1>
				<div className="flex items-center text-gray-900 mb-4">
					<Calendar size={18} className="mr-2" /> {doc.date}
				</div>
				<div className="flex gap-4 mb-4">
					<button type="button" onClick={handleDownload.bind(null, doc.fileUrl, getLocalizedTitle(doc))} className="inline-flex items-center gap-2 px-6 py-3 bg-brand text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors">
						<DownloadIcon size={20} /> Download
					</button>
					{isPdf && (
						<button type="button" className="inline-flex items-center gap-2 px-6 py-3 bg-light text-brand rounded-lg font-semibold hover:bg-light transition-colors" onClick={() => setShowPreview((v) => !v)} aria-label={showPreview ? "Hide PDF preview" : "Show PDF preview"}>
							<Eye size={20} /> {showPreview ? "Hide Preview" : "Preview"}
						</button>
					)}
				</div>
				{showPreview && isPdf && (
					<div className="w-full h-[70vh] border rounded-lg overflow-hidden mb-4">
						<iframe src={doc.fileUrl} title="PDF Preview" className="w-full h-full" frameBorder={0} />
					</div>
				)}
			</div>
			{/* Sidebar */}
			<aside className="w-full md:w-80 flex-shrink-0">
				<h2 className="text-lg font-bold mb-4">Other Downloads</h2>
				<div className="space-y-4">
					{otherDownloads.map((item) => (
						<div key={item.id} className="block bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all">
							<div className="flex items-center gap-3">
								{item.imageUrl ? (
									<Image src={item.imageUrl} alt={getLocalizedTitle(item)} width={48} height={48} className="rounded object-cover w-12 h-12" />
								) : (
									<div className="w-12 h-12 flex items-center justify-center bg-blue-50 rounded">
										<FileText size={28} className="text-blue-200" />
									</div>
								)}
								<div className="flex-1 min-w-0">
									<a href={`/${locale}/downloads/${item.id}`} className="block min-w-0">
										<div className="font-semibold text-gray-900 truncate">{getLocalizedTitle(item)}</div>
										<div className="text-xs text-gray-900 truncate">{item.date}</div>
									</a>
								</div>
								<button type="button" className="p-1 rounded hover:bg-blue-100 focus:outline-none" title="Download" onClick={() => handleDownload(item.fileUrl, getLocalizedTitle(item))}>
									<DownloadIcon size={18} className="text-blue-400" />
								</button>
							</div>
						</div>
					))}
				</div>
			</aside>
			{/* Fullscreen Zoom Modal */}
			{isZoomed && doc.imageUrl && (
				<div className="fixed inset-0 z-50 bg-black bg-opacity-95 flex items-center justify-center p-4" onClick={() => setIsZoomed(false)}>
					<button type="button" className="absolute top-4 right-4 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 transition-all" onClick={() => setIsZoomed(false)} aria-label="Close fullscreen">
						<X size={32} className="text-white" />
					</button>
					<div className="relative max-w-7xl max-h-full" onClick={(e) => e.stopPropagation()}>
						<Image src={doc.imageUrl} alt={getLocalizedTitle(doc)} width={1920} height={1080} className="max-w-full max-h-[90vh] w-auto h-auto object-contain" />
					</div>
				</div>
			)}{" "}
		</div>
	);
}
