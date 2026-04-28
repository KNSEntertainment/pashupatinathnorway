"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { usePathname, Link } from "@/i18n/navigation";
import { Menu, X, ChevronDown, Heart, LogOut, UserPlus } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { motion, AnimatePresence } from "framer-motion";
import { completeSignOut } from "@/utils/authUtils";

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
	const locale = useLocale();
	const { data: session } = useSession();
	const t = useTranslations("navigation");
	const user = session?.user;

	const toggleDropdown = (title: string) => {
		setExpandedItem(expandedItem === title ? null : title);
	};

	return (
		<>
			{/* Toggle Button */}
			<button onClick={() => setIsOpen((v) => !v)} className="lg:hidden btn-glass w-10 h-10">
				{isOpen ? <X size={18} /> : <Menu size={18} />}
			</button>

			{/* Overlay */}
			<AnimatePresence>{isOpen && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsOpen(false)} className="fixed inset-0 bg-black/40 z-40 lg:hidden" />}</AnimatePresence>

			{/* SlideOut Menu */}
			<AnimatePresence>
				{isOpen && (
					<motion.div initial={{ x: 1000 }} animate={{ x: 0 }} exit={{ x: 1000 }} transition={{ type: "spring", stiffness: 300, damping: 30 }} className="fixed top-0 right-0 h-screen w-4/5 max-w-xs bg-white shadow-2xl z-50 overflow-y-auto flex flex-col">
						{/* Header Section with Gradient Background */}
						<div className="bg-gradient-to-r from-brand via-brand to-emerald-600 text-white p-6 mb-2 sticky top-0 z-10">
							<div className="flex items-center justify-between mb-4">
								<h2 className="text-xl font-bold">
									{t("pnsb")} {t("norway")}
								</h2>
								<button onClick={() => setIsOpen(false)} className="p-1 hover:bg-white/20 rounded-lg transition-colors">
									<X size={24} />
								</button>
							</div>

							{/* Action Buttons */}
							<div className="space-y-2">
								{/* Donate Button */}
								<Link href="/donate" locale={locale} onClick={() => setIsOpen(false)} className="w-full flex items-center justify-center gap-2 bg-white text-brand font-semibold py-2.5 rounded-lg hover:bg-opacity-90 transition-all duration-200 active:scale-95">
									<Heart size={18} />
									{t("donate")}
								</Link>

								{/* Membership/SignOut Button */}
								{user ? (
									<button
										onClick={() => {
											completeSignOut("/", () => setIsOpen(false));
										}}
										className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 active:scale-95"
									>
										<LogOut size={18} />
										Sign Out
									</button>
								) : (
									<Link href="/membership" locale={locale} onClick={() => setIsOpen(false)} className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-200 active:scale-95">
										<UserPlus size={18} />
										Become a Member
									</Link>
								)}
							</div>
						</div>

						{/* Divider */}
						<div className="h-1 bg-gradient-to-r from-brand via-brand to-emerald-600 opacity-20"></div>

						{/* Menu Items */}
						<div className="flex-1 flex flex-col p-4 gap-1 overflow-y-auto">
							{navItems.map((item) => {
								const isActive = pathname === item.href || pathname.endsWith(item.href);
								const hasDropdown = item.dropdown && item.dropdown.length > 0;
								const isExpanded = expandedItem === item.title;

								return (
									<div key={item.href}>
										<button
											onClick={() => {
												if (hasDropdown) {
													toggleDropdown(item.title);
												} else {
													setIsOpen(false);
												}
											}}
											className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-all duration-200 ${isActive ? "bg-brand/10 text-brand font-semibold border-l-4 border-brand" : "text-gray-700 hover:bg-gray-100"}`}
										>
											<span>{item.title}</span>

											{/* Dropdown Toggle Icon */}
											{hasDropdown && (
												<motion.div animate={{ rotate: isExpanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
													<ChevronDown size={18} />
												</motion.div>
											)}
										</button>

										{/* Dropdown Items */}
										<AnimatePresence>
											{hasDropdown && isExpanded && (
												<motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.2 }} className="bg-gray-50 overflow-hidden rounded-lg">
													{item.dropdown?.map((dropdownItem) => {
														const isDropdownActive = pathname === dropdownItem.href || pathname.endsWith(dropdownItem.href);

														return (
															<Link key={dropdownItem.href} href={dropdownItem.href} locale={locale} className={`block px-8 py-2.5 text-sm rounded transition-all duration-200 border-l-4 ${isDropdownActive ? "bg-brand/5 text-brand font-semibold border-brand" : "text-gray-700 hover:bg-gray-100/50 border-transparent"}`} onClick={() => setIsOpen(false)}>
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

						{/* Footer Info */}
						<div className="border-t border-gray-200 p-4 bg-gray-50">
							{user ? (
								<div className="text-xs text-gray-600 space-y-1">
									<p className="font-semibold text-gray-900">{user.email}</p>
									<p>{user.role === "admin" ? "Admin Account" : user.isMember ? `${user.membershipType || "Member"}` : "Regular User"}</p>
								</div>
							) : (
								<p className="text-xs text-gray-600 text-center">Sign in to access exclusive member features and dashboard</p>
							)}
						</div>
					</motion.div>
				)}
			</AnimatePresence>
		</>
	);
}
