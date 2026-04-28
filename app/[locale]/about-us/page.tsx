import { Metadata } from "next";
import AboutUsClient from "./AboutUsClient";

export const metadata: Metadata = {
	title: "About Us | PNSB-Norway",
	description: "Learn more about PNSB-Norway, our mission, vision, and the community we serve. Discover our story and values.",
	openGraph: {
		title: "About Us | PNSB-Norway",
		description: "Learn more about PNSB-Norway, our mission, vision, and the community we serve. Discover our story and values.",
		url: "/about-us",
		siteName: "PNSB-Norway",
		type: "website",
	},
};

export default function AboutUs() {
	return <AboutUsClient />;
}
