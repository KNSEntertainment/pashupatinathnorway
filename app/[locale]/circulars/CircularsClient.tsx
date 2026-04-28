"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Calendar, FileText, Pencil } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";
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

interface Translations {
	circulars_tab: string;
	circulars_subtitle: string;
	back: string;
	other_circulars: string;
	view_detail: string;
	no_circulars: string;
	no_circulars_desc: string;
}

interface CircularsColumnProps {
	circulars: Circular[];
	translations: Translations;
	locale: string;
	initialCircularId?: string;
}

const getLocalizedValue = (value: LocalizedString | undefined, locale: string, fallback = "") => {
	if (!value) return fallback;

	if (locale === "en" || locale === "ne" || locale === "no") {
		return value[locale] || value.en || fallback;
	}

	return value.en || fallback;
};

const formatDate = (dateInput: string | Date) => {
	try {
		const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
		const year = date.getFullYear();
		const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		const month = months[date.getMonth()];
		const day = date.getDate();
		return `${month} ${day}, ${year}`;
	} catch {
		return typeof dateInput === "string" ? dateInput : dateInput.toString();
	}
};

export default function CircularsColumn({ circulars, translations: t, locale, initialCircularId }: CircularsColumnProps) {
	const sortedCirculars = useMemo(() => [...(circulars || [])].filter((c) => c.publicationStatus === "published").sort((a, b) => new Date(b.circularPublishedAt || b.createdAt).getTime() - new Date(a.circularPublishedAt || a.createdAt).getTime()), [circulars]);

	const [selectedCircular, setSelectedCircular] = useState<Circular | null>(null);

	useEffect(() => {
		if (!initialCircularId) {
			setSelectedCircular(null);
			return;
		}

		setSelectedCircular(sortedCirculars.find((c) => c._id === initialCircularId) ?? null);
	}, [initialCircularId, sortedCirculars]);

	// ── Detail View ──────────────────────────────────────────────────────────
	if (selectedCircular) {
		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
				<div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<button onClick={() => setSelectedCircular(null)} className="group inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 mb-8">
						<svg className="w-4 h-4 transition-transform group-hover:-translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
						</svg>
						<span className="font-medium">{t.back}</span>
					</button>

					<div className="grid lg:grid-cols-3 gap-8">
						{/* ── Main Content ── */}
						<div className="lg:col-span-2 space-y-6">
							<div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
								{/* Gradient Header */}
								<div className="relative bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-8">
									<div className="absolute inset-0 bg-black/10" />
									<div className="relative flex items-start gap-4">
										<div className="bg-white/20 backdrop-blur-sm rounded-2xl p-4 shadow-2xl border border-white/30 flex-shrink-0">
											<FileText className="w-8 h-8 text-white" />
										</div>
										<div className="flex-1">
											<h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight drop-shadow-lg">{getLocalizedValue(selectedCircular.circularTitle, locale, "Circular")}</h1>
											<div className="flex flex-wrap gap-4 text-white/95">
												{getLocalizedValue(selectedCircular.circularAuthor, locale) && (
													<div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
														<Pencil className="w-4 h-4" />
														<span className="text-sm font-medium">{getLocalizedValue(selectedCircular.circularAuthor, locale)}</span>
													</div>
												)}
												<div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
													<Calendar className="w-4 h-4" />
													<span className="text-sm font-medium">{formatDate(selectedCircular.circularPublishedAt || selectedCircular.createdAt)}</span>
												</div>
											</div>
										</div>
									</div>
								</div>

								{/* Body */}
								<div className="p-8 space-y-6">
									{/* Main Image */}
									<div className="relative overflow-hidden rounded-xl bg-gray-50 border border-gray-200">
										{selectedCircular.circularMainPicture ? (
											<div className="aspect-video sm:aspect-square relative">
												<Image src={selectedCircular.circularMainPicture} alt={getLocalizedValue(selectedCircular.circularTitle, locale, "Circular")} fill className="object-cover transition-transform duration-300 hover:scale-105" priority />
											</div>
										) : (
											<div className="flex items-center justify-center py-12 bg-gradient-to-br from-indigo-100 to-purple-100">
												<FileText className="w-32 h-32 text-brand" />
											</div>
										)}
									</div>

									{/* Description */}
									<div className="bg-white rounded-xl p-6 border border-gray-100">
										<div className="flex items-center gap-3 mb-4">
											<div className="w-8 h-8 bg-gradient-to-r from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
												<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
												</svg>
											</div>
											<h2 className="text-xl font-bold text-gray-900">Circular Details</h2>
										</div>
										<div className="prose prose-lg max-w-none">
											<div className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">{getLocalizedValue(selectedCircular.circularDesc, locale)}</div>
										</div>
									</div>

									{/* Second Image */}
									{selectedCircular.circularSecondPicture && (
										<div className="bg-white rounded-xl p-6 border border-gray-100">
											<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
												<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
												</svg>
												Additional Document
											</h3>
											<div className="relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
												<div className="aspect-video relative">
													<Image src={selectedCircular.circularSecondPicture} alt="Additional document" fill className="object-cover" />
												</div>
											</div>
										</div>
									)}
								</div>
							</div>
						</div>

						{/* ── Sidebar ── */}
						<div className="lg:col-span-1">
							<div className="sticky top-8 space-y-6">
								<div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
									<div className="bg-gradient-to-r from-amber-600 via-orange-600 to-red-600 p-6">
										<div className="flex items-center gap-3">
											<FileText className="w-6 h-6 text-white" />
											<h3 className="text-xl font-bold text-white">{t.other_circulars}</h3>
										</div>
									</div>
									<div className="p-6 space-y-4">
										{sortedCirculars
											.filter((c) => c._id !== selectedCircular._id)
											.slice(0, 4)
											.map((circular) => (
												<Card key={circular._id} className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => setSelectedCircular(circular)}>
													<div className="bg-amber-500 h-1" />
													<CardContent className="p-4">
														<div className="flex items-center gap-2 mb-2">
															<Calendar className="w-4 h-4 text-amber-500" />
															<p className="text-amber-500 text-xs font-medium">{formatDate(circular.circularPublishedAt || circular.createdAt)}</p>
														</div>
														<h4 className="font-bold text-gray-900 line-clamp-2 mb-2">{getLocalizedValue(circular.circularTitle, locale, "Circular")}</h4>
														<p className="text-gray-600 text-sm line-clamp-2">{getLocalizedValue(circular.circularDesc, locale)}</p>
													</CardContent>
												</Card>
											))}
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}

	// ── List View ─────────────────────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50">
			<div className="container mx-auto px-4 pt-8 lg:pt-12">
				<SectionHeader heading={t.circulars_tab} subtitle={t.circulars_subtitle} />
				{sortedCirculars.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
						{sortedCirculars.map((circular) => (
							<div key={circular._id} className="group cursor-pointer bg-white rounded-2xl border border-gray-100 hover:border-amber-200 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full" onClick={() => setSelectedCircular(circular)}>
								{/* Image Section */}
								{/* <div className="relative h-56 bg-gradient-to-br from-amber-50 to-orange-100 overflow-hidden">
									{circular.circularMainPicture ? (
										<Image src={circular.circularMainPicture} alt={circular.circularTitle[locale] || circular.circularTitle["en"]} fill className="object-cover  group-hover:scale-110 transition-transform duration-500" />
									) : (
										<div className="flex items-center justify-center h-full">
											<FileText className="w-12 h-12 text-amber-300" />
										</div>
									)}
								</div> */}

								{/* Content Section */}
								<div className="p-6 flex flex-col flex-1">
									<div className="flex items-center gap-2 mb-3">
										<Calendar className="w-4 h-4 text-amber-500" />
										<p className="text-amber-600 text-xs font-semibold uppercase tracking-wide">{formatDate(circular.circularPublishedAt || circular.createdAt)}</p>
									</div>
									<h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-amber-600 transition-colors">{getLocalizedValue(circular.circularTitle, locale, "Circular")}</h3>
									{/* <p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4 flex-1">{circular.circularDesc[locale] || circular.circularDesc["en"]}</p> */}
									<div className="pt-3 border-t border-gray-100">
										<span className="text-amber-600 font-semibold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
											{t.view_detail}
											<svg className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
											</svg>
										</span>
									</div>
								</div>
							</div>
						))}
					</div>
				) : (
					<div className="text-center py-12">
						<div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
							<FileText className="w-10 h-10 text-gray-400" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">{t.no_circulars}</h3>
						<p className="text-gray-600 text-sm">{t.no_circulars_desc}</p>
					</div>
				)}
			</div>
		</div>
	);
}
