import { Metadata } from "next";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Blogs from "@/components/Blogs";
import AboutPreview from "@/components/AboutPreview";
import EventsTimeline from "@/components/EventsTimeline";
import NewsletterSection from "@/components/NewsletterSection";

export const metadata: Metadata = {
	title: "Home | PNSB-Norway",
	description: "Welcome to PNSB-Norway. Explore our latest news, events, and gallery showcasing our vibrant community.",
	openGraph: {
		title: "Home | PNSB-Norway",
		description: "Welcome to PNSB-Norway. Explore our latest news, events, and gallery showcasing our vibrant community.",
		url: "/",
		siteName: "PNSB-Norway",
		type: "website",
	},
};

export default function LandingPage() {
	return (
		<main>
			{/* Hero Section - Critical, loaded immediately */}
			<Hero />

			{/* About Section with Statistics */}
			<About />

			{/* About Preview Section */}
			<AboutPreview />

			{/* Featured News/Updates Section */}
			<Blogs />

			{/* Events Timeline Section */}
			<EventsTimeline />

			{/* Newsletter Subscription Section */}
			<NewsletterSection />
		</main>
	);
}
