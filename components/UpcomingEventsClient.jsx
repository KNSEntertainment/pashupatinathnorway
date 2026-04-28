"use client";
import { motion } from "framer-motion";
import EventsGrid from "@/components/EventCard";

export default function UpcomingEvents({ events }) {
	return (
		<>
			<section id="events" className="mx-auto md:py-20">
				<div className="container mx-auto">
					<p className="text-3xl font-bold text-center mb-6">
						<span className="text-brand">Events</span>
						<div className="w-24 h-1 bg-brand mx-auto my-6 rounded-full"></div>
					</p>

					<motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex overflow-x-scroll mx-auto">
						<EventsGrid events={events} />
					</motion.div>
				</div>
			</section>
		</>
	);
}
