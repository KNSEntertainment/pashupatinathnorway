"use client";
import { useEffect, useMemo, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import Image from "next/image";
import { Calendar, Clock, Bell } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

interface Notice {
	_id: string;
	noticetitle: string;
	noticedate: string;
	noticetime?: string;
	notice: string;
	noticeimage?: string;
	[key: string]: unknown;
}

interface Translations {
	notices_tab: string;
	notices_subtitle: string;
	back: string;
	other_notices: string;
	view_detail: string;
	no_notices: string;
	no_notices_desc: string;
}

interface NoticesColumnProps {
	notices: Notice[];
	translations: Translations;
	initialNoticeId?: string;
}

const formatDate = (dateString: string) => {
	try {
		const date = new Date(dateString);
		const year = date.getFullYear();
		const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
		const month = months[date.getMonth()];
		const day = date.getDate();
		return `${month} ${day}, ${year}`;
	} catch {
		return dateString;
	}
};

const formatNoticeDateBadge = (dateString: string) => {
	try {
		const date = new Date(dateString);
		const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		return {
			day: date.getDate(),
			month: months[date.getMonth()],
		};
	} catch {
		return { day: "—", month: "—" };
	}
};

export default function NoticesColumn({ notices, translations: t, initialNoticeId }: NoticesColumnProps) {
	const sortedNotices = useMemo(() => [...(notices || [])].sort((a, b) => new Date(b.noticedate).getTime() - new Date(a.noticedate).getTime()), [notices]);

	const [selectedNotice, setSelectedNotice] = useState<Notice | null>(null);

	useEffect(() => {
		if (!initialNoticeId) {
			setSelectedNotice(null);
			return;
		}

		setSelectedNotice(sortedNotices.find((n) => n._id === initialNoticeId) ?? null);
	}, [initialNoticeId, sortedNotices]);

	// ── Detail View ──────────────────────────────────────────────────────────
	if (selectedNotice) {
		const { day, month } = formatNoticeDateBadge(selectedNotice.noticedate);

		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
				<div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<button onClick={() => setSelectedNotice(null)} className="group inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 mb-8">
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
								<div className="relative bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-8">
									<div className="absolute inset-0 bg-black/10" />
									<div className="relative flex items-start gap-6">
										<div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/30 min-w-[100px] text-center flex-shrink-0">
											<div className="text-4xl md:text-5xl font-bold text-white leading-none drop-shadow-lg">{day}</div>
											<div className="text-sm md:text-base uppercase tracking-wider text-white/90 mt-2 font-semibold">{month}</div>
										</div>
										<div className="flex-1">
											<h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight drop-shadow-lg">{selectedNotice.noticetitle}</h1>
											<div className="flex flex-wrap gap-4 text-white/95">
												{selectedNotice.noticetime && (
													<div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
														<Clock className="w-4 h-4" />
														<span className="text-sm font-medium">{selectedNotice.noticetime}</span>
													</div>
												)}
											</div>
										</div>
									</div>
								</div>

								{/* Body */}
								<div className="p-8 space-y-6">
									{/* Notice Image */}
									<div className="relative overflow-hidden rounded-xl bg-gray-50 border border-gray-200">
										{selectedNotice.noticeimage ? (
											<div className="aspect-video sm:aspect-square relative">
												<Image src={selectedNotice.noticeimage} alt={selectedNotice.noticetitle} fill className="object-cover transition-transform duration-300 hover:scale-105" priority />
											</div>
										) : (
											<div className="aspect-video sm:aspect-square flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
												<Bell className="w-16 h-16 text-gray-400" />
											</div>
										)}
									</div>

									{/* Notice Text */}
									<div className="bg-white rounded-xl p-6 border border-gray-100">
										<div className="flex items-center gap-3 mb-4">
											<div className="w-8 h-8 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
												<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
												</svg>
											</div>
											<h2 className="text-xl font-bold text-gray-900">Notice Details</h2>
										</div>
										{selectedNotice.notice && selectedNotice.notice !== "" ? (
											<div className="prose prose-lg max-w-none">
												<p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">{selectedNotice.notice}</p>
											</div>
										) : (
											<div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 text-center">
												<div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-4">
													<svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
												</div>
												<h3 className="text-amber-800 font-semibold mb-2">Coming Soon</h3>
												<p className="text-amber-700">Notice details will be available soon. Thank you for your patience.</p>
											</div>
										)}
									</div>
								</div>
							</div>
						</div>

						{/* ── Sidebar ── */}
						<div className="lg:col-span-1">
							<div className="sticky top-8 space-y-6">
								<div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
									<div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 p-6">
										<div className="flex items-center gap-3">
											<Bell className="w-6 h-6 text-white" />
											<h3 className="text-xl font-bold text-white">{t.other_notices}</h3>
										</div>
									</div>
									<div className="p-6 space-y-4">
										{sortedNotices
											.filter((n) => n._id !== selectedNotice._id)
											.slice(0, 4)
											.map((notice) => (
												<Card key={notice._id} className="cursor-pointer hover:shadow-lg transition-all duration-300" onClick={() => setSelectedNotice(notice)}>
													<div className="bg-emerald-500 h-1" />
													<CardContent className="p-4">
														<div className="flex items-center gap-2 mb-2">
															<Calendar className="w-4 h-4 text-emerald-500" />
															<p className="text-emerald-500 text-xs font-medium uppercase tracking-wider">{formatDate(notice.noticedate)}</p>
														</div>
														<h4 className="font-bold text-gray-900 line-clamp-2 mb-2">{notice.noticetitle}</h4>
														<p className="text-gray-900 text-sm line-clamp-2">{notice.notice}</p>
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

	// ── List View ─────────────────────────────────────────────────────
	return (
		<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-brand-50">
			<div className="container max-w-7xl mx-auto px-4 pt-8 lg:pt-12">
				<SectionHeader heading={t.notices_tab} subtitle={t.notices_subtitle} />
				{sortedNotices.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
						{sortedNotices.map((notice) => (
							<div key={notice._id} className="group cursor-pointer bg-white rounded-2xl border border-gray-100 hover:border-emerald-200 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden flex flex-col h-full" onClick={() => setSelectedNotice(notice)}>
								{/* Image Section */}
								<div className="relative h-56 bg-gradient-to-br from-emerald-50 to-emerald-100 overflow-hidden">
									{notice.noticeimage ? (
										<Image src={notice.noticeimage} alt={notice.noticetitle} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
									) : (
										<div className="flex items-center justify-center h-full">
											<Bell className="w-12 h-12 text-emerald-300" />
										</div>
									)}
								</div>

								{/* Content Section */}
								<div className="p-6 flex flex-col flex-1">
									<div className="flex items-center gap-2 mb-3">
										<Calendar className="w-4 h-4 text-emerald-500" />
										<p className="text-emerald-600 text-xs font-semibold uppercase tracking-wide">{formatDate(notice.noticedate)}</p>
									</div>
									<h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-emerald-600 transition-colors">{notice.noticetitle}</h3>
									<p className="text-gray-600 text-sm line-clamp-3 leading-relaxed mb-4 flex-1">{notice.notice}</p>
									<div className="pt-3 border-t border-gray-100">
										<span className="text-emerald-600 font-semibold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
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
							<Bell className="w-10 h-10 text-gray-400" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">{t.no_notices}</h3>
						<p className="text-gray-600 text-sm">{t.no_notices_desc}</p>
					</div>
				)}
			</div>
		</div>
	);
}
