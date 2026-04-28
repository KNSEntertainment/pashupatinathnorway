"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, Calendar, Clock, MapPin, ArrowRight, Users } from "lucide-react";
import { useState, useEffect } from "react";
import Image from "next/image";

interface Event {
	_id: string;
	eventname: string;
	eventdescription: string;
	eventvenue: string;
	eventdate: string;
	eventtime: string;
	eventposterUrl: string;
}

interface EventPopupProps {
	latestEvent: Event | null;
}

export default function EventPopup({ latestEvent }: EventPopupProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [hasSeenPopup, setHasSeenPopup] = useState(false);
	const [isTicketPopupOpen, setIsTicketPopupOpen] = useState(false);

	useEffect(() => {
		// Check if user has seen the popup before
		const hasSeen = localStorage.getItem("event-popup-seen");
		if (!hasSeen && latestEvent) {
			// Check if event date is not in the past
			const eventDate = new Date(latestEvent.eventdate);
			const today = new Date();
			today.setHours(0, 0, 0, 0); // Set to start of day for accurate comparison

			if (eventDate >= today) {
				// Show popup only if event is today or in the future
				setIsOpen(true);
			}
		}
	}, [latestEvent]);

	const handleClose = () => {
		setIsOpen(false);
		setHasSeenPopup(true);
		localStorage.setItem("event-popup-seen", "true");
	};

	const handleBookTicket = () => {
		setIsOpen(false);
		setIsTicketPopupOpen(true);
	};

	const handleTicketPopupClose = () => {
		setIsTicketPopupOpen(false);
	};

	if (!latestEvent) return null;

	return (
		<>
			<AnimatePresence>
				{isOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						{/* Backdrop */}
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />

						{/* Modal Content */}
						<motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ duration: 0.3, ease: "easeOut" }} className="relative bg-white rounded-2xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden z-10">
							{/* Close Button */}
							<button onClick={handleClose} className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-600 hover:text-gray-900 hover:bg-white transition-all duration-200 shadow-lg">
								<X className="w-5 h-5" />
							</button>

							{/* Two Column Layout */}
							<div className="flex flex-col md:flex-row h-full">
								{/* Left Column - Event Poster */}
								<div className="w-full md:w-1/2 bg-gray-100 relative">
									<div className="relative h-64 md:h-full overflow-hidden">
										<Image src={latestEvent.eventposterUrl || "/ghanti.png"} alt={latestEvent.eventname} width={800} height={600} className="w-full h-full object-contain" priority />
									</div>
								</div>

								{/* Right Column - Event Details */}
								<div className="w-full md:w-1/2 p-8 md:p-10 bg-white overflow-y-auto">
									{/* Event Title */}
									<div className="mb-6">
										<h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-3">{latestEvent.eventname}</h2>
										<div className="h-1 w-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full"></div>
									</div>

									{/* Event Description */}
									<div className="mb-8">
										<p className="text-gray-600 text-base leading-relaxed">{latestEvent.eventdescription}</p>
									</div>

									{/* Event Info Cards */}
									<div className="space-y-4 mb-8">
										{latestEvent.eventdate && (
											<div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
												<div className="flex items-center gap-3">
													<div className="p-2 bg-blue-600 rounded-lg">
														<Calendar className="w-5 h-5 text-white" />
													</div>
													<div>
														<p className="text-sm text-blue-600 font-medium">Date</p>
														<p className="text-gray-900 font-semibold">{latestEvent.eventdate}</p>
													</div>
												</div>
											</div>
										)}
										{latestEvent.eventtime && (
											<div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
												<div className="flex items-center gap-3">
													<div className="p-2 bg-purple-600 rounded-lg">
														<Clock className="w-5 h-5 text-white" />
													</div>
													<div>
														<p className="text-sm text-purple-600 font-medium">Time</p>
														<p className="text-gray-900 font-semibold">{latestEvent.eventtime}</p>
													</div>
												</div>
											</div>
										)}
										{latestEvent.eventvenue && (
											<div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
												<div className="flex items-center gap-3">
													<div className="p-2 bg-green-600 rounded-lg">
														<MapPin className="w-5 h-5 text-white" />
													</div>
													<div>
														<p className="text-sm text-green-600 font-medium">Location</p>
														<p className="text-gray-900 font-semibold">{latestEvent.eventvenue}</p>
													</div>
												</div>
											</div>
										)}
									</div>

									{/* Action Buttons */}
									<div className="flex flex-col sm:flex-row gap-4 mb-8">
										<button onClick={handleBookTicket} className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold text-base rounded-xl transition-all duration-300 hover:scale-105 shadow-xl">
											Book Ticket Now
											<ArrowRight className="w-5 h-5 ml-2" />
										</button>
										<button onClick={handleClose} className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-base rounded-xl transition-all duration-300 border-2 border-gray-200 hover:border-gray-300">
											Close
										</button>
									</div>

									{/* Don't show again checkbox */}
									<div className="pt-6 border-t border-gray-200">
										<label className="flex items-center text-sm text-gray-600 cursor-pointer hover:text-gray-700 transition-colors">
											<input
												type="checkbox"
												checked={hasSeenPopup}
												onChange={(e) => {
													if (e.target.checked) {
														setHasSeenPopup(true);
														localStorage.setItem("event-popup-seen", "true");
													}
												}}
												className="mr-3 rounded border-gray-300 text-blue-600 focus:ring-blue-500 w-4 h-4"
											/>
											<span className="font-medium">Don&apos;t show this popup again</span>
										</label>
									</div>
								</div>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>

			{/* Ticket Booking Popup */}
			<AnimatePresence>
				{isTicketPopupOpen && (
					<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
						{/* Backdrop */}
						<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleTicketPopupClose} />

						{/* Modal Content */}
						<motion.div initial={{ opacity: 0, scale: 0.9, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9, y: 20 }} transition={{ duration: 0.3, ease: "easeOut" }} className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full z-10">
							{/* Close Button */}
							<button onClick={handleTicketPopupClose} className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/90 backdrop-blur-sm text-gray-600 hover:text-gray-900 hover:bg-white transition-all duration-200 shadow-lg">
								<X className="w-5 h-5" />
							</button>

							{/* Content */}
							<div className="p-8">
								{/* Icon */}
								<div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
									<Users className="w-8 h-8 text-white" />
								</div>

								{/* Title */}
								<h3 className="text-2xl font-bold text-gray-900 text-center mb-4">Ticket Booking</h3>

								{/* Message */}
								<div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mb-6">
									<p className="text-gray-700 text-center leading-relaxed">
										Please contact <span className="font-semibold text-blue-600">Mr. Saroj Thapa</span> for ticket booking by calling on
									</p>
									<div className="mt-3 text-center">
										<a href="tel:47734203" className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-bold rounded-lg transition-all duration-300 hover:scale-105 shadow-lg">
											<Calendar className="w-5 h-5 mr-2" />
											477 342 03
										</a>
									</div>
								</div>

								{/* Additional Info */}
								<div className="text-center text-sm text-gray-500">
									<p className="mb-2">Available Monday - Friday, 10:00 AM - 6:00 PM</p>
									<p>
										Or email us at{" "}
										<a href="mailto:info@pnsbnorway.org" className="text-blue-600 hover:text-blue-700 font-medium">
											info@pnsbnorway.org
										</a>
									</p>
								</div>

								{/* Close Button */}
								<div className="mt-6">
									<button onClick={handleTicketPopupClose} className="w-full px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-300">
										Close
									</button>
								</div>
							</div>
						</motion.div>
					</div>
				)}
			</AnimatePresence>
		</>
	);
}
