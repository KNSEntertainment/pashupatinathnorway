"use client";

import { useEffect, useState } from "react";

export default function HeaderScrollWrapper({ children }: { children: React.ReactNode }) {
	const [isVisible, setIsVisible] = useState(true);

	useEffect(() => {
		let lastScrollY = 0;
		let ticking = false;

		const onScroll = () => {
			if (!ticking) {
				requestAnimationFrame(() => {
					const currentScrollY = window.scrollY;

					if (currentScrollY < 150) {
						setIsVisible(true);
					} else if (currentScrollY > lastScrollY) {
						setIsVisible(false);
					} else {
						setIsVisible(true);
					}

					lastScrollY = currentScrollY;
					ticking = false;
				});

				ticking = true;
			}
		};

		window.addEventListener("scroll", onScroll, { passive: true });
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	return <div className={`fixed inset-x-0 top-0 z-40 transition-transform duration-300 ${isVisible ? "translate-y-0" : "-translate-y-full"}`}>{children}</div>;
}
