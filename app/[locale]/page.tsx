import { Metadata } from "next";
import dynamic from "next/dynamic";
import Hero from "@/components/Hero";

// Dynamic imports for non-critical components with loading states
const AboutPreview = dynamic(() => import("@/components/AboutPreview"), {
  loading: () => <div className="min-h-screen py-20 flex items-center justify-center"><div className="animate-pulse text-gray-500">Loading...</div></div>
});

const EventsTimeline = dynamic(() => import("@/components/EventsTimeline"), {
  loading: () => <div className="py-20 flex items-center justify-center"><div className="animate-pulse text-gray-500">Loading events...</div></div>
});

const NewsletterSection = dynamic(() => import("@/components/NewsletterSection"), {
  loading: () => <div className="py-20 flex items-center justify-center"><div className="animate-pulse text-gray-500">Loading newsletter...</div></div>
});

export const metadata: Metadata = {
	title: "Home | Pashupatinath Norway Temple",
	description: "Welcome to Pashupatinath Norway Temple. Explore our latest news, events, and gallery showcasing our vibrant community.",
	openGraph: {
		title: "Home | Pashupatinath Norway Temple",
		description: "Welcome to Pashupatinath Norway Temple. Explore our latest news, events, and gallery showcasing our vibrant community.",
		url: "/",
		siteName: "Pashupatinath Norway Temple",
		type: "website",
	},
};

export default function LandingPage() {
	return (
		<main>
			{/* Hero Section - Critical, loaded immediately */}
			<Hero />

			{/* About Section with Statistics */}
			{/* <About /> */}

			{/* About Preview Section */}
			<AboutPreview />

			{/* Featured News/Updates Section */}
			{/* <Blogs /> */}

			{/* Events Timeline Section */}
			<EventsTimeline />

			{/* Newsletter Subscription Section */}
			<NewsletterSection />
		</main>
	);
}
