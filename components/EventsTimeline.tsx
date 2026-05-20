"use client";

import { Calendar, MapPin, Clock } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import Image from "next/image";
import SectionHeader from "./SectionHeader";
import { useState, useEffect } from "react";

interface Event {
	_id: string;
	eventname: string;
	eventdescription: string;
	eventvenue: string;
	eventdate: string;
	eventtime: string;
	eventposterUrl: string;
	eventposter2Url?: string;
	eventposter3Url?: string;
	eventvideoUrl?: string;
	createdAt: string;
}

export default function EventsTimeline() {
	const locale = useLocale();
	const t = useTranslations("events");
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);

	const getEventToDisplay = (allEvents: Event[]) => {
		const today = new Date();
		today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison
		
		// Separate future and past events
		const futureEvents = allEvents.filter(event => {
			const eventDate = new Date(event.eventdate);
			return eventDate >= today;
		});
		
		const pastEvents = allEvents.filter(event => {
			const eventDate = new Date(event.eventdate);
			return eventDate < today;
		});
		
		// Sort future events by date (closest first)
		futureEvents.sort((a, b) => new Date(a.eventdate).getTime() - new Date(b.eventdate).getTime());
		// Sort past events by date (most recent first)
		pastEvents.sort((a, b) => new Date(b.eventdate).getTime() - new Date(a.eventdate).getTime());
		
		// Return the first future event if available, otherwise the most recent past event
		return futureEvents.length > 0 ? [futureEvents[0]] : pastEvents.length > 0 ? [pastEvents[0]] : [];
	};

	const getSectionTitle = () => {
		if (events.length === 0) return t("title");
		
		const today = new Date();
		today.setHours(0, 0, 0, 0);
		const eventDate = new Date(events[0].eventdate);
		
		return eventDate >= today ? t("upcoming_event") : t("recent_event");
	};

	useEffect(() => {
		const fetchEvents = async () => {
			try {
				const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "";
				
				// Use no-cache and proper headers
				const res = await fetch(`${baseUrl}/api/events`, { 
					cache: "no-store",
					headers: {
						'Content-Type': 'application/json',
					}
				});
				
				console.log("Events response status:", res.status);
				
				if (!res.ok) {
					throw new Error(`HTTP error! status: ${res.status}`);
				}
				
				const data = await res.json();
				
				// Get all events and determine which one to display
				const allEvents = data.events || [];
				const eventToDisplay = getEventToDisplay(allEvents);
				setEvents(eventToDisplay);
			} catch  {
				// Try fallback to relative URL
				try {
					const fallbackRes = await fetch('/api/events', { cache: "no-store" });
					const fallbackData = await fallbackRes.json();
					console.log("Fallback events response data:", fallbackData);
					
					const allEvents = fallbackData.events || [];
					const eventToDisplay = getEventToDisplay(allEvents);
					setEvents(eventToDisplay);
				} catch (fallbackError) {
					console.error("Fallback events also failed:", fallbackError);
				}
			} finally {
				setLoading(false);
			}
		};

		fetchEvents();
	}, []);

	const getLocalizedTitle = (event: Event): string => {
		return event.eventname || "Untitled Event";
	};

	const getLocalizedDescription = (event: Event): string => {
		return event.eventdescription || "";
	};

	const formatFullDate = (dateString: string): string => {
		try {
			const date = new Date(dateString);
			return date.toLocaleDateString(locale === 'no' ? 'nb-NO' : locale === 'ne' ? 'ne-NP' : 'en-US', {
				weekday: 'long',
				year: 'numeric',
				month: 'long',
				day: 'numeric'
			});
		} catch {
			return dateString;
		}
	};

	if (loading) {
			return (
				<section className="py-20 bg-white w-full">
					<div className="text-center mb-16 px-4">
						<h2 className="text-3xl font-bold text-gray-900 mb-4">{t("title")}</h2>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
							{[...Array(4)].map((_, i) => (
								<div key={i} className="bg-gray-100 rounded-xl p-6 animate-pulse">
									<div className="h-4 bg-gray-300 rounded mb-4 w-3/4"></div>
									<div className="h-3 bg-gray-300 rounded mb-2"></div>
									<div className="h-3 bg-gray-300 rounded w-5/6"></div>
								</div>
							))}
						</div>
					</div>
				</section>
			);
	}

	
	return (

			<section className="py-12 md:py-20 bg-brand_primary/20 w-full">
				{/* Section Header */}
				<div
					className="text-center mb-16 px-4"
				>
					<SectionHeader 
					heading={getSectionTitle()} 
				/>
			
				</div>

					{events.length > 0 ? (
						<div className="w-full md:max-w-4xl mx-auto">
								{/* Single Event Display */}
								<div className="container mx-auto px-4">
									{events.slice(0, 1).map((event) => (
									<div
										key={event._id}
										
									>
										<div className="flex flex-col md:flex-row bg-gray-50 transition-all duration-300 overflow-hidden h-full">
											{/* Event Poster */}
											<div className="w-full md:w-2/3 relative h-64 md:h-auto">
												<Image 
													src={event.eventposterUrl || "/pashupatinath.png"} 
													alt={getLocalizedTitle(event)} 
													fill 
													className="object-cover bg-gray-50 transition-transform duration-700" 
												/>
												{/* Gradient Overlay */}
												<div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
											</div>

											{/* Event Information */}
											<div className="w-full md:w-1/2 p-6 flex flex-col space-y-3 justify-center">
											

												{/* Event Title */}
													<h3 className="text-2xl md:text-3xl font-bold text-gray-900 md:mb-4 group-hover:text-brand_primary transition-colors duration-300 ">
														{getLocalizedTitle(event)}
													</h3>

												{/* Event Description */}
												<p className="text-gray-600 mb-6 line-clamp-3 text-base leading-relaxed">
													{getLocalizedDescription(event)}
												</p>

												{/* Event Details Grid */}
												<div className="grid grid-cols-1 gap-4 mb-6">
													<div className="flex items-center text-gray-500">
														<Calendar className="w-5 h-5 mr-3 text-brand_primary" />
														<span className="font-medium">{formatFullDate(event.eventdate)}</span>
													</div>
													<div className="flex items-center text-gray-500">
														<Clock className="w-5 h-5 mr-3 text-brand_primary" />
														<span className="font-medium">{event.eventtime}</span>
													</div>
													<div className="flex items-center text-gray-500">
														<MapPin className="w-5 h-5 mr-3 text-brand_primary" />
														<span className="font-medium">{event.eventvenue}</span>
													</div>
												</div>

												
											</div>
										</div>
									</div>
								))}
								{/* View All Events Button */}
								<div className="text-center mt-8">
									<a
										href={`/${locale}/events`}
										className="inline-flex items-center gap-2 px-6 py-3 bg-brand_primary text-gray-700 rounded-lg font-medium hover:bg-brand_primary/90 transition-colors"
									>
										{t("see_all")}
									</a>
								</div>
							</div>

							
						</div>
					) : (
						<div className="text-center py-12 px-4">
							<Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
							<h3 className="text-xl font-semibold text-gray-600 mb-2">{t("no_events")}</h3>
							<p className="text-gray-500">{t("no_events_desc")}</p>
						</div>
					)}
			</section>
	
	);
}
