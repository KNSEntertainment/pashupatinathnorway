import Blogs from "@/components/Blogs";
import React from "react";

export const metadata = {
	title: "Blogs | Pashupatinath Norway Temple",
	description: "Explore the latest blogs from Pashupatinath Norway Temple. Stay informed with our insights, updates, and stories. Dive into our blog section for valuable information and news.",
	openGraph: {
		title: "Blogs | Pashupatinath Norway Temple",
		description: "Explore the latest blogs from Pashupatinath Norway Temple. Stay informed with our insights, updates, and stories. Dive into our blog section for valuable information and news.",
		url: "/blogs",
		siteName: "Pashupatinath Norway Temple",
		type: "website",
	},
};

const page = () => {
	return <Blogs />;
};

export default page;
