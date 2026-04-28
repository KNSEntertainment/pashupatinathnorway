"use client";
import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Calendar, MapPin, Clock } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

interface Event {
	_id: string;
	eventname: string;
	eventdate: string;
	eventtime?: string;
	eventvenue?: string;
	eventdescription?: string;
	eventposterUrl?: string;
	eventposter2Url?: string;
	eventposter3Url?: string;
	[key: string]: unknown;
}

interface Translations {
	events_tab: string;
	events_subtitle: string;
	back: string;
	other_events: string;
	view_detail: string;
	no_events: string;
	no_events_desc: string;
}

interface EventsColumnProps {
	events: Event[];
	translations: Translations;
	initialEventId?: string;
}

const formatEventDate = (dateString: string) => {
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

export default function EventsColumn({ events, translations: t, initialEventId }: EventsColumnProps) {
	const sortedEvents = useMemo(() => [...(events || [])].sort((a, b) => new Date(b.eventdate).getTime() - new Date(a.eventdate).getTime()), [events]);

	const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

	useEffect(() => {
		if (!initialEventId) {
			setSelectedEvent(null);
			return;
		}

		setSelectedEvent(sortedEvents.find((e) => e._id === initialEventId) ?? null);
	}, [initialEventId, sortedEvents]);

	// ── Detail View ──────────────────────────────────────────────────────────
	if (selectedEvent) {
		const { day, month } = formatEventDate(selectedEvent.eventdate);
		const eventImages = [selectedEvent.eventposterUrl, selectedEvent.eventposter2Url, selectedEvent.eventposter3Url].filter(Boolean) as string[];

		return (
			<div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
				<div className="container max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
					<button onClick={() => setSelectedEvent(null)} className="group inline-flex items-center gap-2 px-4 py-2 bg-white hover:bg-gray-50 text-gray-700 hover:text-gray-900 rounded-lg border border-gray-200 shadow-sm transition-all duration-200 mb-8">
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
								<div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8">
									<div className="absolute inset-0 bg-black/10" />
									<div className="relative flex items-start gap-6">
										<div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 shadow-2xl border border-white/30 min-w-[100px] text-center flex-shrink-0">
											<div className="text-4xl md:text-5xl font-bold text-white leading-none drop-shadow-lg">{day}</div>
											<div className="text-sm md:text-base uppercase tracking-wider text-white/90 mt-2 font-semibold">{month}</div>
										</div>
										<div className="flex-1">
											<h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight drop-shadow-lg">{selectedEvent.eventname}</h1>
											<div className="flex flex-wrap gap-4 text-white/95">
												{selectedEvent.eventtime && (
													<div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
														<Clock className="w-4 h-4" />
														<span className="text-sm font-medium">{selectedEvent.eventtime}</span>
													</div>
												)}
												{selectedEvent.eventvenue && (
													<div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-3 py-1">
														<MapPin className="w-4 h-4" />
														<span className="text-sm font-medium">{selectedEvent.eventvenue}</span>
													</div>
												)}
											</div>
										</div>
									</div>
								</div>

								{/* Body */}
								<div className="p-8 space-y-6">
									{/* Main Image */}
									<div className="relative overflow-hidden rounded-xl bg-gray-50 border border-gray-200">
										{eventImages.length > 0 ? (
											<div className="aspect-video sm:aspect-square relative">
												<Image src={eventImages[0]} alt={selectedEvent.eventname} fill className="object-cover transition-transform duration-300 hover:scale-105" priority />
											</div>
										) : (
											<div className="aspect-video sm:aspect-square flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200">
												<Calendar className="w-16 h-16 text-gray-400" />
											</div>
										)}
									</div>

									{/* Description */}
									<div className="bg-white rounded-xl p-6 border border-gray-100">
										<div className="flex items-center gap-3 mb-4">
											<div className="w-8 h-8 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center">
												<svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
												</svg>
											</div>
											<h2 className="text-xl font-bold text-gray-900">About this event</h2>
										</div>
										{selectedEvent.eventdescription && selectedEvent.eventdescription !== "" ? (
											<div className="prose prose-lg max-w-none">
												<p className="text-gray-700 leading-relaxed whitespace-pre-wrap text-base">{selectedEvent.eventdescription}</p>
											</div>
										) : (
											<div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-xl p-6 text-center">
												<div className="w-12 h-12 bg-amber-200 rounded-full flex items-center justify-center mx-auto mb-4">
													<svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
													</svg>
												</div>
												<h3 className="text-amber-800 font-semibold mb-2">Coming Soon</h3>
												<p className="text-amber-700">Event description will be available soon. Thank you for your patience.</p>
											</div>
										)}
									</div>

									{/* Gallery */}
									{eventImages.length > 1 && (
										<div className="bg-white rounded-xl p-6 border border-gray-100">
											<h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
												<svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
												</svg>
												Event Gallery
											</h3>
											<div className="grid grid-cols-2 md:grid-cols-3 gap-4">
												{eventImages.slice(1).map((url, index) => (
													<div key={`${url}-${index}`} className="group relative overflow-hidden rounded-lg border border-gray-200 bg-gray-50 hover:border-indigo-300 transition-all duration-300">
														<div className="aspect-square relative">
															<Image src={url} alt={`${selectedEvent.eventname} ${index + 2}`} fill className="object-cover transition-transform duration-300 group-hover:scale-110" />
														</div>
														<div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
													</div>
												))}
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
									<div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6">
										<div className="flex items-center gap-3">
											<Calendar className="w-6 h-6 text-white" />
											<h3 className="text-xl font-bold text-white">{t.other_events}</h3>
										</div>
									</div>
									<div className="p-6 space-y-4">
										{sortedEvents
											.filter((e) => e._id !== selectedEvent._id)
											.slice(0, 4)
											.map((event) => {
												const { day, month } = formatEventDate(event.eventdate);
												return (
													<div key={event._id} className="group cursor-pointer rounded-xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-lg transition-all duration-300 p-4" onClick={() => setSelectedEvent(event)}>
														<div className="flex gap-4">
															<div className="bg-gradient-to-br from-indigo-100 to-purple-100 text-indigo-600 rounded-xl p-4 text-center min-w-[80px] flex-shrink-0">
																<div className="text-2xl font-bold leading-none">{day}</div>
																<div className="text-xs uppercase tracking-wider mt-1 font-semibold">{month}</div>
															</div>
															<div className="flex-1 min-w-0">
																<h4 className="font-bold text-gray-900 line-clamp-2 mb-2 group-hover:text-indigo-600 transition-colors">{event.eventname}</h4>
																<p className="text-sm text-gray-600 line-clamp-2">{event.eventvenue}</p>
															</div>
														</div>
													</div>
												);
											})}
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
				<SectionHeader heading={t.events_tab} subtitle={t.events_subtitle} />
				{sortedEvents.length > 0 ? (
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-12">
						{sortedEvents.map((event) => {
							const { day, month } = formatEventDate(event.eventdate);
							return (
								<div key={event._id} className="group cursor-pointer bg-white rounded-2xl border border-gray-100 hover:border-indigo-200 shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden h-full flex flex-col" onClick={() => setSelectedEvent(event)}>
									{/* Image Section */}
									<div className="relative h-56 overflow-hidden">
										{event.eventposterUrl ? (
											<Image src={event.eventposterUrl} alt={event.eventname} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
										) : (
											<div className="w-full h-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center">
												<Calendar className="w-12 h-12 text-indigo-300" />
											</div>
										)}
										{/* Date Badge */}
										<div className="absolute top-3 right-3 bg-gradient-to-br from-brand to-brand/80 text-white rounded-xl p-3 text-center shadow-lg backdrop-blur-sm bg-opacity-95">
											<div className="text-2xl font-bold leading-none">{day}</div>
											<div className="text-xs uppercase font-semibold">{month}</div>
										</div>
									</div>

									{/* Content Section */}
									<div className="p-6 flex flex-col flex-1">
										<h3 className="font-bold text-lg text-gray-900 mb-3 line-clamp-2 group-hover:text-brand transition-colors">{event.eventname}</h3>
										<div className="space-y-2 text-sm text-gray-600 mb-4 flex-1">
											{event.eventtime && (
												<div className="flex items-start gap-2">
													<Clock className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
													<span className="line-clamp-1">{event.eventtime}</span>
												</div>
											)}
											{event.eventvenue && (
												<div className="flex items-start gap-2">
													<MapPin className="w-4 h-4 text-brand flex-shrink-0 mt-0.5" />
													<span className="line-clamp-1">{event.eventvenue}</span>
												</div>
											)}
										</div>
										<div className="pt-3 border-t border-gray-100">
											<span className="text-brand font-semibold text-sm inline-flex items-center gap-1 group-hover:gap-2 transition-all">
												{t.view_detail}
												<svg className="w-4 h-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
												</svg>
											</span>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				) : (
					<div className="text-center py-12">
						<div className="bg-gray-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
							<Calendar className="w-10 h-10 text-gray-400" />
						</div>
						<h3 className="text-lg font-medium text-gray-900 mb-2">{t.no_events}</h3>
						<p className="text-gray-600 text-sm">{t.no_events_desc}</p>
					</div>
				)}
			</div>
		</div>
	);
}
