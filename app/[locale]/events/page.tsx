import { getTranslations } from "next-intl/server";
import { getEvents } from "@/lib/data/events";
import { normalizeDocs } from "@/lib/utils";
import EventsClientLoader from "./EventsClientLoader";

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

export const metadata = {
	title: "Events | Pashupatinath Norway Temple",
	description: "Stay updated with upcoming and past events from Pashupatinath Norway Temple. Join us for community gatherings, celebrations, and important meetings.",
	openGraph: {
		title: "Events | Pashupatinath Norway Temple",
		description: "Stay updated with upcoming and past events from Pashupatinath Norway Temple. Join us for community gatherings, celebrations, and important meetings.",
		url: "/updates/events",
		siteName: "Pashupatinath Norway Temple",
		type: "website",
	},
};

export default async function EventsPage({ searchParams }: { searchParams: Promise<{ eventId?: string }> }) {
	const { eventId } = await searchParams;

	const events = await getEvents();
	const eventsNorm = normalizeDocs(events);

	const t = await getTranslations("notices");

	const translations = {
		events_tab: t("events_tab"),
		events_subtitle: t("events_subtitle"),
		back: t("back"),
		other_events: t("other_events"),
		view_detail: t("view_detail"),
		no_events: t("no_events"),
		no_events_desc: t("no_events_desc"),
	};

	return <EventsClientLoader events={eventsNorm as Event[]} translations={translations} initialEventId={eventId} />;
}
