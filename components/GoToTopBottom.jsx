"use client";
import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

const GoToTopButton = () => {
	const [isVisible, setIsVisible] = useState(false);

	useEffect(() => {
		const toggleVisibility = () => {
			if (window.pageYOffset > 300) {
				setIsVisible(true);
			} else {
				setIsVisible(false);
			}
		};

		window.addEventListener("scroll", toggleVisibility);

		return () => {
			window.removeEventListener("scroll", toggleVisibility);
		};
	}, []);

	return (
		<>
			{isVisible && (
				<button onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })} className="fixed bottom-4 right-4 z-50 flex h-12 w-12 items-center justify-center rounded-full bg-white text-red-600 shadow-lg hover:bg-seekblue focus:outline-none focus:ring-2 focus:ring-seekblue focus:ring-offset-2">
					<ChevronUp size={20} />
				</button>
			)}
		</>
	);
};

export default GoToTopButton;
