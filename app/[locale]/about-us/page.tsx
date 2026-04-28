import { Metadata } from "next";
import AboutUsClient from "./AboutUsClient";

export const metadata: Metadata = {
	title: "About Us | Pashupatinath Norway Temple",
	description: "Learn more about Pashupatinath Norway Temple, our mission, vision, and the community we serve. Discover our story and values.",
	openGraph: {
		title: "About Us | Pashupatinath Norway Temple",
		description: "Learn more about Pashupatinath Norway Temple, our mission, vision, and the community we serve. Discover our story and values.",
		url: "/about-us",
		siteName: "Pashupatinath Norway Temple",
		type: "website",
	},
};

export default function AboutUs() {
	return <AboutUsClient />;
}
