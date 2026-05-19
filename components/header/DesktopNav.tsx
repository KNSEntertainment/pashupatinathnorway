"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "@/i18n/navigation";
import { ChevronDown } from "lucide-react";
import { Link } from "@/i18n/navigation";

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
	const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
	const navRef = useRef<HTMLDivElement>(null);

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (navRef.current && !navRef.current.contains(event.target as Node)) {
				setActiveDropdown(null);
			}
		};

		if (activeDropdown) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [activeDropdown]);

	const toggleDropdown = (href: string) => {
		setActiveDropdown(activeDropdown === href ? null : href);
	};

	return (
		<nav ref={navRef} className="hidden lg:flex items-center gap-2 flex-1 justify-center">
			{navItems.map((item: NavItem) => {
				const isActive = pathname === item.href || pathname.endsWith(item.href);
				const hasDropdown = !!item.dropdown;
				const isOpen = activeDropdown === item.href;

				return (
					<div key={item.href} className="relative">
						{hasDropdown ? (
							<button 
								onClick={() => toggleDropdown(item.href)}
								className={`px-3 py-2 rounded-lg font-semibold flex items-center justify-center gap-1 min-w-fit ${isActive ? "bg-white text-brand_secondary" : "text-white/90 hover:bg-white hover:text-brand_secondary"}`}
								aria-expanded={isOpen}
							>
								{item.title}
								<ChevronDown size={16} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
							</button>
						) : (
							<Link href={item.href} className={`px-3 py-2 rounded-lg font-semibold flex items-center justify-center ${isActive ? "bg-white text-brand_secondary" : "text-white/90 hover:bg-white hover:text-brand_secondary"}`}>
								{item.title}
							</Link>
						)}

						{hasDropdown && isOpen && (
								<div className="absolute left-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg">
									{item.dropdown!.map((sub: NavDropdownItem) => (
										<Link 
											key={sub.href} 
											href={sub.href} 
											className="block px-4 py-2 text-sm hover:bg-brand_secondary/20"
											onClick={() => setActiveDropdown(null)}
										>
											{sub.title}
										</Link>
									))}
								</div>
							)}
					</div>
				);
			})}
		</nav>
	);
}
