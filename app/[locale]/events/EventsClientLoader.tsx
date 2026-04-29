"use client";

import dynamic from "next/dynamic";

const EventsClient = dynamic(() => import("./EventsClient"), {
	ssr: false,
	loading: () => (
		<div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50">
			<div className="container max-w-7xl mx-auto px-4 pt-8 lg:pt-12">
				<div className="text-center mb-8 md:mb-20">
					<div className="h-10 w-48 mx-auto rounded bg-orange-100 animate-pulse" />
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-12">
					<div className="h-72 rounded-2xl border border-orange-100 bg-white animate-pulse" />
					<div className="h-72 rounded-2xl border border-orange-100 bg-white animate-pulse" />
				</div>
			</div>
		</div>
	),
});

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

interface EventsClientLoaderProps {
	events: Event[];
	translations: Translations;
	initialEventId?: string;
}

export default function EventsClientLoader(props: EventsClientLoaderProps) {
	return <EventsClient {...props} />;
}
