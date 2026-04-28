// app/downloads/DownloadsClient.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { Download, FileText, Calendar, Search, Filter } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useLocale } from "next-intl";

interface Document {
	id: string;
	title_en: string;
	title_ne?: string;
	title_no?: string;
	date: string;
	fileUrl: string;
	imageUrl?: string;
	category: string;
	downloadCount: number;
	// Legacy field
	title?: string;
}

interface DownloadsClientProps {
	documents: Document[];
	translations: {
		searchPlaceholder: string;
		download: string;
		all: string;
		downloadsCount: string;
		noDocuments: string;
		noDocumentsDesc: string;
	};
}

export default function DownloadsClient({ documents, translations }: DownloadsClientProps) {

	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState(translations.all);
	const [showMobileFilter, setShowMobileFilter] = useState(false);
	const locale = useLocale();

	// Helper function to get localized title
	const getLocalizedTitle = useCallback((doc: Document) => {
		const key = `title_${locale}` as keyof Document;
		return (doc[key] as string) || doc.title_en || doc.title || "Untitled";
	}, [locale]);

	const categories = useMemo(() => {
		return [translations.all, ...Array.from(new Set(documents.map((d) => d.category)))];
	}, [documents, translations.all]);

	const filteredDocuments = useMemo(() => {
		return documents.filter((doc) => {
			const localizedTitle = getLocalizedTitle(doc);
			const matchesSearch = localizedTitle.toLowerCase().includes(searchQuery.toLowerCase());
			const matchesCategory = selectedCategory === translations.all || doc.category === selectedCategory;

			return matchesSearch && matchesCategory;
		});
	}, [documents, searchQuery, selectedCategory, translations.all, getLocalizedTitle]);

	const handleDownload = async (doc: Document) => {
		const localizedTitle = getLocalizedTitle(doc);
		let ext = ".pdf";
		const match = doc.fileUrl.match(/\.([a-zA-Z0-9]+)(?:\?|$)/);
		if (match) ext = "." + match[1];

		const safeTitle = localizedTitle.replace(/[\\/:*?"<>|\r\n]+/g, "_") + ext;

		if (doc.id) {
			fetch(`/api/downloads/${doc.id}/increment`, { method: "POST" });
		}

		const response = await fetch(doc.fileUrl);
		const blob = await response.blob();
		const url = URL.createObjectURL(blob);

		const link = document.createElement("a");
		link.href = url;
		link.download = safeTitle;
		link.click();

		URL.revokeObjectURL(url);
	};

	return (
		<div className="px-4">
			{/* Main Content */}
			<div className="">
				{/* Search and Filter Bar */}
				<div className=" p-2 md:p-6 mb-4 md:mb-8 ">
					<div className="flex flex-col md:flex-row gap-2 md:gap-4 items-center">
						{/* Search Input + Filter Icon for mobile */}
						<div className="flex items-center w-full md:flex-1 min-w-0 relative">
							<Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-900" size={20} />
							<input type="text" placeholder={translations.searchPlaceholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full pl-12 pr-4 py-3 border border-brand/50 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent" />
							{/* Filter icon for mobile */}{" "}
							<button type="button" className="ml-2 md:hidden flex items-center justify-center p-2 rounded-lg bg-light hover:bg-light focus:outline-none focus:ring-2 focus:ring-blue-500" aria-label="Show filter categories" onClick={() => setShowMobileFilter((v) => !v)}>
								<Filter size={22} className="text-gray-900" />
							</button>{" "}
						</div>
						{/* Category Filter */}{" "}
						<div className="w-full md:w-auto min-w-0">
							{/* Dropdown for small screens (shown when filter icon clicked) */}
							{showMobileFilter && (
								<div className="block md:hidden mb-2 animate-fade-in">
									<select
										value={selectedCategory}
										onChange={(e) => {
											setSelectedCategory(e.target.value);
											setShowMobileFilter(false);
										}}
										className="w-full px-4 py-2 rounded-lg border border-light focus:outline-none focus:ring-2 focus:ring-blue-500"
									>
										{categories.map((category) => (
											<option key={category} value={category}>
												{" "}
												{category}{" "}
											</option>
										))}{" "}
									</select>{" "}
								</div>
							)}
							{/* Buttons for medium and larger screens */}{" "}
							<div className="hidden md:flex gap-2 overflow-x-auto pb-2 md:pb-0">
								{categories.map((category) => (
									<button key={category} onClick={() => setSelectedCategory(category)} className={`px-4 py-2 rounded-lg font-medium whitespace-nowrap transition-all ${selectedCategory === category ? "bg-blue-600 text-white shadow-md" : "bg-light text-gray-900 hover:bg-light"}`}>
										{" "}
										{category}{" "}
									</button>
								))}{" "}
							</div>
						</div>{" "}
					</div>{" "}
				</div>
				{/* Documents Grid */}{" "}
				{filteredDocuments.length && filteredDocuments.length > 0 ? (
					<div className="sm:px-6 grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-12">
						{filteredDocuments.map((doc) => (
							<div key={doc.id} className="flex bg-gray-100 rounded-lg shadow-sm md:shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden max-h-[224px] group">
								{" "}
								{doc.imageUrl && doc.imageUrl.trim() !== "" ? (
									<Image src={doc.imageUrl} alt={doc.title_en} width={350} height={350} className="text-white hidden lg:block object-fill w-36 lg:w-36 h-full" />
								) : (
									<div className="hidden lg:flex w-48 h-full items-center justify-center bg-brand_primary">
										{" "}
										<FileText size={48} className="text-blue-100" />{" "}
									</div>
								)}{" "}
								{/* Mobile fallback for both image and icon */}{" "}
								{!(doc.imageUrl && doc.imageUrl.trim() !== "") && (
									<div className="lg:hidden w-full max-h-48 h-[192px] flex items-center justify-center bg-brand_primary">
										{" "}
										<FileText size={48} className="text-blue-100" />{" "}
									</div>
								)}{" "}
								{/* Document Info */}{" "}
								<div className="p-6 flex flex-col justify-between flex-1">
									{" "}
									<span className="px-3 py-1 w-fit bg-blue-100 text-brand_primary text-xs font-semibold rounded-full mb-3">{doc.category}</span>
									<Link href={`/${locale}/downloads/${doc.id}`} className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500">
										{getLocalizedTitle(doc)}
									</Link>
									<div className="flex items-center text-sm text-gray-900 mb-4">
										{" "}
										<Calendar size={16} className="mr-2" /> {doc.date}{" "}
									</div>{" "}
									<div className="flex justify-between items-end">
										{" "}
										{/* Action Buttons */}{" "}
										<div className="flex gap-3 w-fit">
											{" "}
											<button onClick={() => handleDownload(doc)} className="flex-1 flex items-center justify-center gap-2 px-4 md:px-4 py-1 md:py-2 bg-brand_primary text-white rounded-xl hover:bg-blue-700 transition-colors font-medium shadow-md">
												{" "}
												<Download size={18} /> {translations.download}{" "}
											</button>{" "}
										</div>{" "}
										<div className="flex items-center text-xs text-gray-900 mb-2">
											{" "}
											<Download size={14} className="mr-1" /> {doc.downloadCount ?? 0} {translations.downloadsCount}{" "}
										</div>{" "}
									</div>{" "}
								</div>{" "}
							</div>
						))}{" "}
					</div>
				) : (
					<div className="bg-white rounded-2xl shadow-lg p-6 md:p-12 text-center">
						{" "}
						<div className="inline-flex items-center justify-center w-20 h-20 bg-light rounded-full mb-4">
							{" "}
							<FileText size={40} className="text-gray-900" />{" "}
						</div>{" "}
						<h3 className="text-2xl font-bold text-gray-900 mb-2">{translations.noDocuments}</h3> <p className="text-gray-900">{translations.noDocumentsDesc}</p>{" "}
					</div>
				)}{" "}
			</div>{" "}
		</div>
	);
}
