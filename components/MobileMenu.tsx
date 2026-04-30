"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, Link } from "@/i18n/navigation";
import { Menu, X, ChevronDown, Heart, LogOut, UserPlus } from "lucide-react";
import { useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { completeSignOut } from "@/utils/authUtils";
import Image from "next/image";

type NavDropdownItem = {
	href: string;
	title: string;
};

type NavItem = {
	href: string;
	title: string;
	dropdown?: NavDropdownItem[];
};

type MobileMenuProps = {
	navItems: NavItem[];
};

export default function MobileMenu({ navItems }: MobileMenuProps) {
	const [isOpen, setIsOpen] = useState(false);
	const [expandedItem, setExpandedItem] = useState<string | null>(null);
	const pathname = usePathname();
	const { data: session } = useSession();
	const t = useTranslations("navigation");
	const user = session?.user;

	const toggleDropdown = (title: string) => {
		setExpandedItem(expandedItem === title ? null : title);
	};

	const handleMenuClose = () => {
		setIsOpen(false);
		setExpandedItem(null);
	};

	return (
		<>
			{/* Toggle Button */}
			<button onClick={() => setIsOpen((v) => !v)} className="lg:hidden btn-glass w-10 h-10">
				{isOpen ? <X size={18} /> : <Menu size={18} />}
			</button>

			{/* Overlay */}
			<AnimatePresence>{isOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleMenuClose} className="fixed inset-0 bg-black/40 z-40 lg:hidden" />}</AnimatePresence>

			{/* SlideOut Menu */}
			<AnimatePresence>
				{isOpen && (
					<motion.div initial={{ x: 1000, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 1000, opacity: 0 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed top-0 right-0 h-screen w-72 bg-white shadow-2xl z-50 overflow-y-auto flex flex-col rounded-b-2xl">
						{/* Header Section with Gradient Background */}
						<div className="bg-gradient-to-r from-brand_primary via-brand_primary to-brand_primary text-gray-700 p-6 mb-2 sticky top-0 z-10">
							<div className="relative flex items-start justify-between mb-4">
								<Image src="/pashupatinath.png" alt="Pashupatinath Norway Temple" width={100} height={100} />
								<button onClick={handleMenuClose} className="absolute top-8 right-1 p-1 text-brand_secondary hover:bg-white/20 rounded-lg transition-colors">
									<X size={24} />
								</button>
							</div>

							{/* Action Buttons */}
							<div className="space-y-2">
								{/* Donate Button */}
								<Link href="/donate" onClick={handleMenuClose} className="w-full flex items-center justify-center gap-2 bg-white text-green-700 font-semibold py-2.5 rounded-lg hover:bg-opacity-90 transition-all duration-200 active:scale-95">
									<Heart size={18} />
									{t("donate")}
								</Link>

								{/* Membership/SignOut Button */}
								{user ? (
									<button
										onClick={() => {
											completeSignOut("/", handleMenuClose);
										}}
										className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 active:scale-95"
									>
										<LogOut size={18} />
										{t("sign_out")}
									</button>
								) : (
									<Link href="/membership" onClick={handleMenuClose} className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 active:scale-95">
										<UserPlus size={18} />
										{t("become_a_member")}
									</Link>
								)}
							</div>
						</div>


						{/* Menu Items */}
						<div className="flex-1 bg-gray-50 overflow-y-auto">
							<div className="p-6 space-y-2">
								{navItems.map((item) => {
									// Better path matching for internationalized routes
									const normalizePath = (path: string) => {
										// Remove locale prefix (e.g., /en/home -> /home)
										const pathWithoutLocale = path.replace(/^\/(en|no|ne)/, '') || '/';
										return pathWithoutLocale;
									};
									
									const normalizedPathname = normalizePath(pathname);
									const normalizedItemHref = normalizePath(item.href);
									const isActive = normalizedPathname === normalizedItemHref || 
													normalizedPathname.startsWith(normalizedItemHref + '/') ||
													(item.href === '/' && normalizedPathname === '/');
									
									const hasDropdown = item.dropdown && item.dropdown.length > 0;
									const isExpanded = expandedItem === item.title;

									return (
										<div key={item.href} className="w-full">
											{hasDropdown ? (
												<button
													onClick={() => toggleDropdown(item.title)}
													className={`w-full flex items-center justify-between px-6 py-4 text-left  transition-all duration-300 text-lg font-medium ${isActive ? "bg-white text-brand_secondary shadow-md border-l-4 border-brand_secondary" : "text-gray-700 hover:bg-white hover:shadow-sm"}`}
												>
													<span>{item.title}</span>
													<motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.3 }}>
														<ChevronDown size={20} />
													</motion.div>
												</button>
											) : (
												<Link 
													href={item.href} 
													onClick={handleMenuClose}
													className={`w-full flex items-center justify-between px-6 py-4  transition-all duration-300 text-lg font-medium ${isActive ? "bg-white text-brand_secondary shadow-md border-l-4 border-brand_secondary" : "text-gray-700 hover:bg-white hover:shadow-sm"}`}
												>
													<span>{item.title}</span>
												</Link>
											)}

											{/* Dropdown Items */}
											<AnimatePresence>
												{hasDropdown && isExpanded && (
													<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="ml-4 mt-2 space-y-1 overflow-hidden">
														{item.dropdown?.map((dropdownItem) => {
															const normalizedDropdownPathname = normalizePath(pathname);
															const normalizedDropdownHref = normalizePath(dropdownItem.href);
															const isDropdownActive = normalizedDropdownPathname === normalizedDropdownHref || 
																				normalizedDropdownPathname.startsWith(normalizedDropdownHref + '/');

															return (
																<Link 
																	key={dropdownItem.href} 
																	href={dropdownItem.href} 
																	className={`block px-6 py-3 text-base rounded-lg transition-all duration-300 ${isDropdownActive ? "bg-brand_primary/10 text-brand_primary font-semibold border-l-3 border-brand_primary" : "text-gray-600 hover:bg-white hover:text-gray-800 hover:shadow-sm"}`} 
																	onClick={handleMenuClose}
																>
																	{dropdownItem.title}
																</Link>
															);
														})}
													</motion.div>
												)}
											</AnimatePresence>
										</div>
									);
								})}
							</div>
						</div>

						
						

						{/* Footer Info */}
						<div className="border-t border-gray-200 pt-6 pb-24 bg-gray-50">
							{user ? (
								<div className="text-xs px-6 text-gray-600 space-y-1">
									<p className="font-semibold text-gray-900">{user.email}</p>
									<p>{user.role === "admin" ? "Admin Account" : user.isMember ? `${user.membershipType || "Member"}` : "Regular User"}</p>
								</div>
							) : (
								<p className="text-xs px-6 text-gray-600 text-center">Sign in to access exclusive member features</p>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
