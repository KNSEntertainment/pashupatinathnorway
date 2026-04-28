import React from "react";

const EventCard = ({ date, title, time, venue }) => {
	const eventDate = new Date(date);
	const formattedDay = eventDate.getDate();
	const monthName = eventDate.toLocaleString("default", { month: "short" });

	return (
		<div className="relative flex flex-col justify-between bg-white/70 backdrop-blur-md border border-light shadow-xl rounded-2xl p-6 h-72 w-72 mx-auto transition-transform duration-300 hover:scale-105 hover:shadow-2xl group overflow-hidden">
			{/* Accent Bar */}
			<div className="absolute left-0 top-0 h-full w-2 bg-gradient-to-b from-brand to-brand rounded-l-2xl" />

			{/* Date Section */}
			<div className="flex items-center gap-4 mb-4 z-10">
				<div className="w-16 h-16 bg-gradient-to-br from-brand to-brand rounded-xl flex flex-col items-center justify-center shadow-lg border-4 border-white group-hover:scale-110 transition-transform">
					<span className="text-4xl font-extrabold text-white drop-shadow-lg">{formattedDay}</span>
					<span className="text-xs font-semibold text-white uppercase tracking-widest">{monthName}</span>
				</div>
				<div className="flex-1">
					<h3 className="text-lg font-bold text-gray-900 group-hover:text-brand_primary transition-colors line-clamp-2">{title}</h3>
				</div>
			</div>

			{/* Details Section */}
			<div className="flex-1 flex flex-col justify-end z-10">
				<div className="flex items-center gap-2 mb-2">
					<svg className="w-5 h-5 text-brand_primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10m-7 4h4m-7 4h10" />
					</svg>
					<span className="text-sm text-gray-900 font-medium">{time}</span>
				</div>
				<div className="flex items-center gap-2">
					<svg className="w-5 h-5 text-brand_primary" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
						<path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 12.414a2 2 0 00-2.828 0l-4.243 4.243M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
					</svg>
					<span className="text-sm text-gray-900 font-medium line-clamp-1">{venue}</span>
				</div>
			</div>

			{/* Decorative Blur Circle */}
			<div className="absolute -bottom-10 -right-10 w-32 h-32 bg-brand_primary rounded-full blur-2xl opacity-60 z-0" />
		</div>
	);
};

const EventsGrid = ({ events }) => {
	return (
		<div className="py-12 px-2 mx-auto max-w-5xl">
			<div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
				{events.map((event, index) => (
					<EventCard key={index} date={event.eventdate} title={event.eventname} time={event.eventtime} venue={event.eventvenue} />
				))}
			</div>
		</div>
	);
};

export default EventsGrid;
