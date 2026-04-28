import { Metadata } from "next";
import Hero from "@/components/Hero";
import About from "@/components/About";
import AboutPreview from "@/components/AboutPreview";
import EventsTimeline from "@/components/EventsTimeline";
import NewsletterSection from "@/components/NewsletterSection";

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
			<About />

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
