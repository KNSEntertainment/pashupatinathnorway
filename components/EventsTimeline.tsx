"use client";

import { motion } from "framer-motion";
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

	// Function to get most recent events (regardless of date)
	const getRecentEvents = (allEvents: Event[]) => {
		// Sort events by date (newest first) and take the latest 4
		return allEvents
			.sort((a, b) => new Date(b.eventdate).getTime() - new Date(a.eventdate).getTime())
			.slice(0, 4);
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
				
				// Get all events and sort by most recent
				const allEvents = data.events || [];
				const recentEvents = getRecentEvents(allEvents);
				setEvents(recentEvents);
			} catch  {
				// Try fallback to relative URL
				try {
					const fallbackRes = await fetch('/api/events', { cache: "no-store" });
					const fallbackData = await fallbackRes.json();
					console.log("Fallback events response data:", fallbackData);
					
					const allEvents = fallbackData.events || [];
					const recentEvents = getRecentEvents(allEvents);
					setEvents(recentEvents);
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

	// const getEventTypeColor = (type?: string) => {
	// 	return "from-blue-500 to-blue-600";
	// };

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
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className="text-center mb-16 px-4"
				>
					<SectionHeader 
						heading={t("title")} 
						seeAllLink={`/${locale}/events`}
						seeAllText={t("see_all")}
					/>
			
				</motion.div>

				{events.length > 0 ? (
					<div className="w-full md:max-w-4xl mx-auto">
							{/* Two Events Display */}
							<div className="container mx-auto grid grid-cols-1 gap-6 lg:gap-8 px-4">
								{events.slice(0, 2).map((event, index) => (
									<motion.div
										key={event._id}
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.6, delay: index * 0.1 }}
									>
										<div className="flex flex-col md:flex-row bg-gray-50 transition-all duration-300 overflow-hidden h-full">
											{/* Event Poster */}
											<div className="w-full md:w-1/2 relative h-64 md:h-auto">
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
														<span className="font-medium">{event.eventdate}</span>
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

												{/* Action Buttons */}
												{/* <div className="flex gap-4">
													<Link href={`/${locale}/events?eventId=${event._id}`}>
														<button
															className="flex-1 bg-brand_primary text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-brand_primary/90 transition-colors duration-200"
														>
															{t("view_details")}
														</button>
													</Link>
												</div> */}
											</div>
										</div>
									</motion.div>
								))}
							</div>

							{/* View All Events Button
							<motion.div
												initial={{ opacity: 0, y: 20 }}
												animate={{ opacity: 1, y: 0 }}
												transition={{ duration: 0.6, delay: 0.4 }}
												className="flex justify-center pt-12"
											>
												<ViewAllButton href={`/${locale}/events`} label={t("view_all_events")} />
											</motion.div> */}
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
