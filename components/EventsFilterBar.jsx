import { Button } from "@/components/ui/button";
import React, { useEffect, useState } from "react";

const EventsFilterBar = () => {
	const [events, setEvents] = useState([]);
	const [filter, setFilter] = useState("all");
	const [filteredEvents, setFilteredEvents] = useState(events);

	useEffect(() => {
		const currentDate = new Date();

		if (filter === "upcoming") {
			setFilteredEvents(events.filter((event) => new Date(event.eventdate) > currentDate));
		} else if (filter === "past") {
			setFilteredEvents(events.filter((event) => new Date(event.eventdate) <= currentDate));
		} else {
			setFilteredEvents(events);
			setEvents("New Events");
		}
		console.log("Events: ", events, "Filtered Events: ", filteredEvents);
	}, [filteredEvents, filter, events]);

	return (
		<div className="flex gap-2 sm:gap-4 w-full items-center justify-center mb-6 sm:mb-12">
			<Button onClick={() => setFilter("all")} variant={filter === "all" ? "default" : "outline"} aria-pressed={filter === "all"}>
				All Events
			</Button>
			<Button onClick={() => setFilter("upcoming")} variant={filter === "upcoming" ? "default" : "outline"} aria-pressed={filter === "upcoming"}>
				Upcoming Events
			</Button>
			<Button onClick={() => setFilter("past")} variant={filter === "past" ? "default" : "outline"} aria-pressed={filter === "past"}>
				Past Events
			</Button>
		</div>
	);
};

export default EventsFilterBar;
