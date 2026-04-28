"use client";

import { useState } from "react";
import { usePathname } from "@/i18n/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { useLocale } from "next-intl";

type NavDropdownItem = {
	href: string;
	title: string;
};

type NavItem = {
	href: string;
	title: string;
	dropdown?: NavDropdownItem[];
};

type DesktopNavProps = {
	navItems: NavItem[];
};

export default function DesktopNav({ navItems }: DesktopNavProps) {
	const pathname = usePathname();
	const locale = useLocale();
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

	return (
		<nav className="hidden lg:flex items-center gap-2 flex-1 justify-center">
			{navItems.map((item: NavItem) => {
				const isActive = pathname === item.href || pathname.endsWith(item.href);
				const hasDropdown = !!item.dropdown;
				const isOpen = activeDropdown === item.href;

				return (
					<div key={item.href} className="relative" onMouseEnter={() => hasDropdown && setActiveDropdown(item.href)} onMouseLeave={() => setActiveDropdown(null)}>
						{hasDropdown ? (
							<button className={`px-3 py-2 rounded-lg font-semibold flex items-center gap-1 ${isActive ? "bg-white text-brand_secondary" : "text-white/90 hover:bg-white hover:text-brand_secondary"}`}>
								{item.title}
								<ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
							</button>
						) : (
							<Link href={item.href} locale={locale} className={`px-3 py-2 rounded-lg font-semibold ${isActive ? "bg-white text-brand_secondary" : "text-white/90 hover:bg-white hover:text-brand_secondary"}`}>
								{item.title}
							</Link>
						)}

						<AnimatePresence>
							{hasDropdown && isOpen && (
								<motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg">
									{item.dropdown!.map((sub: NavDropdownItem) => (
										<Link key={sub.href} href={sub.href} locale={locale} className="block px-4 py-2 text-sm hover:bg-brand_secondary/20">
											{sub.title}
										</Link>
									))}
								</motion.div>
							)}
						</AnimatePresence>
					</div>
				);
			})}
		</nav>
	);
}
