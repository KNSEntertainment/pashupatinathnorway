import UpcomingEventsClient from "@/components/UpcomingEventsClient";
import { getEvents } from "@/lib/data/events";
import { normalizeDocs } from "@/lib/utils";

export default async function UpcomingEvents() {
	const events = await getEvents();
	const eventsExist = events && events.length > 0;
	if (!eventsExist) return null;

	const eventsNorm = normalizeDocs(events);

	return <UpcomingEventsClient events={eventsNorm} />;
}
