"use client";

import useFetchData from "@/hooks/useFetchData";
import { Facebook, Instagram } from "lucide-react";
import Link from "next/link";

function SocialMediaLinks() {
	const { data: settings } = useFetchData("/api/settings", "settings");

	const facebookUrl = settings?.[0]?.facebook;
	const instagramUrl = settings?.[0]?.instagram;

	return (
		<div className="flex items-center gap-2">
			{facebookUrl && (
				<Link href={facebookUrl} target="_blank" rel="noopener noreferrer" className="w-6 h-6 flex items-center justify-center rounded-full bg-white hover:bg-[#1877F2] text-gray-900 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md group" aria-label="Facebook">
					<Facebook className="w-4 h-4" />
				</Link>
			)}
			{instagramUrl && (
				<Link href={instagramUrl} target="_blank" rel="noopener noreferrer" className="w-6 h-6 flex items-center justify-center rounded-full bg-white hover:bg-gradient-to-br hover:from-[#833AB4] hover:via-[#FD1D1D] hover:to-[#F77737] text-gray-900 hover:text-white transition-all duration-300 shadow-sm hover:shadow-md group" aria-label="Instagram">
					<Instagram className="w-4 h-4" />
				</Link>
			)}
		</div>
	);
}

export default SocialMediaLinks;
