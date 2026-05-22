"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { useSession } from "next-auth/react";
import { ActiveMenuProvider, useActiveMenu } from "@/context/ActiveMenuContext";
import { menuCategories } from "@/components/DashboardMenuItems";
import { useMembershipData } from "@/hooks/useMembershipData";
import { Menu, X } from "lucide-react";

function DashboardLayoutContent({ children }) {
	const { activeMenu } = useActiveMenu();
	const router = useRouter();
	const [profileOpen, setProfileOpen] = useState(false);
	const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
	const [expandedCategories, setExpandedCategories] = useState(new Set(['membership']));
	const { data: session, status } = useSession();
	const { isExecutive, loading: membershipLoading } = useMembershipData();

	const toggleCategory = (categoryId) => {
		const newExpanded = new Set(expandedCategories);
		if (newExpanded.has(categoryId)) {
			newExpanded.delete(categoryId);
		} else {
			newExpanded.add(categoryId);
		}
		setExpandedCategories(newExpanded);
	};

	// Handle redirects in useEffect to prevent setState during render
	useEffect(() => {
		if (status === "loading" || membershipLoading) {
			return;
		}
		if (!session) {
			router.replace("/en/login");
			return;
		}
		// Redirect non-admin and non-executive users to profile page
		if (session.user.role !== "admin" && !isExecutive) {
			router.replace("/en/profile");
			return;
		}
	}, [status, session, isExecutive, membershipLoading, router]);

	// Show loading state while checking authentication and membership
	if (status === "loading" || membershipLoading) {
		return (
			<div className="flex flex-col space-y-6 items-center justify-center min-h-screen w-full">
				<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand"></div>
				<div>Loading...</div>
			</div>
		);
	}

	// Don't render content if user is not authenticated or not authorized
	if (!session || (session.user.role !== "admin" && !isExecutive)) {
		return null;
	}

	return (
		<div
			className="container mx-auto flex flex-col pl-4 md:flex-row min-h-screen relative"
			onClick={(e) => {
				if (profileOpen && !(e.target.closest && e.target.closest("#admin-profile-menu"))) {
					setProfileOpen(false);
				}
				if (mobileMenuOpen && !(e.target.closest && e.target.closest("#mobile-menu"))) {
					setMobileMenuOpen(false);
				}
			}}
		>
			{/* Mobile Menu Button */}
			<div className="md:hidden flex items-center justify-between p-4 bg-white border-b border-gray-200">
				<h1 className="text-lg font-semibold text-gray-800">Admin Dashboard</h1>
				<button
					onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
					className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
				>
					{mobileMenuOpen ? (
						<X className="w-6 h-6 text-gray-700" />
					) : (
						<Menu className="w-6 h-6 text-gray-700" />
					)}
				</button>
			</div>

			{/* Mobile Sidebar - Slide in from right */}
			{mobileMenuOpen && (
				<>
					{/* Backdrop */}
					<div className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden" />
					
					{/* Mobile Menu */}
					<div id="mobile-menu" className="fixed right-0 top-0 h-full w-[75%] max-w-sm bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out md:hidden">
						<nav className="py-6 overflow-y-auto max-h-screen">
							{/* Mobile Menu Header */}
							<div className="px-4 py-3 mb-4 border-b border-gray-200 flex items-center justify-between">
								<h2 className="text-lg font-semibold text-gray-800">Menu</h2>
								<button
									onClick={() => setMobileMenuOpen(false)}
									className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
								>
									<X className="w-5 h-5 text-gray-700" />
								</button>
							</div>
							
							{menuCategories
								.filter((category) => {
									if (!category.role) return true;
									if (category.role === "both") return true;
									if (category.role === "admin") return session.user.role === "admin";
									if (category.role === "member") return session.user.role !== "admin";
									if (category.role === "executive") return isExecutive;
									return false;
								})
								.map((category) => {
									const CategoryIcon = category.icon;
									const isExpanded = expandedCategories.has(category.id);
									const hasActiveItem = category.items.some(item => activeMenu === item.id);
									
									return (
										<div key={category.id} className="mb-2">
											{/* Category Header */}
											<button
												onClick={() => toggleCategory(category.id)}
												className={`w-full flex items-center px-4 py-2 text-sm font-medium transition-colors duration-200
													${hasActiveItem ? "bg-brand_primary/20 text-black font-semibold" : "text-gray-700 hover:text-black hover:bg-gray-100"}
												`}
											>
												<CategoryIcon className="w-5 h-5 mr-3 flex-shrink-0" />
												<span className="flex-1 text-left">{category.title}</span>
												<svg
													className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
													fill="none"
													stroke="currentColor"
													viewBox="0 0 24 24"
												>
													<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
												</svg>
											</button>
											
											{/* Category Items */}
											{isExpanded && (
												<div className="ml-2 border-l border-gray-200">
													{category.items
														.filter((item) => {
															if (!item.role) return true;
															if (item.role === "both") return true;
															if (item.role === "admin") return session.user.role === "admin";
															if (item.role === "member") return session.user.role !== "admin";
															if (item.role === "executive") return isExecutive;
															return false;
														})
														.map((item) => {
															const ItemIcon = item.icon;
															const isActive = activeMenu === item.id;
															return (
																<Link
																	key={item.id}
																	href={item.href}
																	onClick={() => setMobileMenuOpen(false)}
																	className={`w-full flex items-center px-6 py-2 text-sm transition-colors duration-200
																		${isActive ? "bg-brand_primary text-gray-700 font-semibold shadow border-l-2 border-black" : "text-gray-600 hover:text-brand_secondary hover:bg-gray-50"}
																	`}
																	style={isActive ? { boxShadow: "0 2px 8px 0 rgba(0, 0, 0, 0.10)" } : {}}
																>
																	<ItemIcon className="w-4 h-4 mr-3 flex-shrink-0" />
																	{item.label}
																</Link>
															);
														})}
												</div>
											)}
										</div>
									);
								})}
						</nav>
					</div>
				</>
			)}

			{/* Desktop Sidebar */}
			<div className="hidden md:flex w-64 bg-brand_primary/20 flex-col shadow-lg">
				<nav className="py-6 overflow-y-auto max-h-screen">
					{/* Admin Menu Header */}
					<div className="px-4 py-3 mb-4 border-b border-gray-200">
						<h2 className="text-lg font-semibold text-gray-800">Admin Menu</h2>
					</div>
					
					{menuCategories
						.filter((category) => {
							if (!category.role) return true;
							if (category.role === "both") return true;
							if (category.role === "admin") return session.user.role === "admin";
							if (category.role === "member") return session.user.role !== "admin";
							if (category.role === "executive") return isExecutive;
							return false;
						})
						.map((category) => {
							const CategoryIcon = category.icon;
							const isExpanded = expandedCategories.has(category.id);
							const hasActiveItem = category.items.some(item => activeMenu === item.id);
							
							return (
								<div key={category.id} className="mb-2">
									{/* Category Header */}
									<button
										onClick={() => toggleCategory(category.id)}
										className={`w-full flex items-center px-4 py-2 text-sm font-medium transition-colors duration-200
											${hasActiveItem ? "bg-brand_primary/20 text-black font-semibold" : "text-gray-700 hover:text-black hover:bg-gray-100"}
										`}
									>
										<CategoryIcon className="w-5 h-5 mr-3 flex-shrink-0" />
										<span className="flex-1 text-left">{category.title}</span>
										<svg
											className={`w-4 h-4 transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
										>
											<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
										</svg>
									</button>
									
									{/* Category Items */}
									{isExpanded && (
										<div className="ml-2 border-l border-gray-200">
											{category.items
												.filter((item) => {
													if (!item.role) return true;
													if (item.role === "both") return true;
													if (item.role === "admin") return session.user.role === "admin";
													if (item.role === "member") return session.user.role !== "admin";
													if (item.role === "executive") return isExecutive;
													return false;
												})
												.map((item) => {
													const ItemIcon = item.icon;
													const isActive = activeMenu === item.id;
													return (
														<Link
															key={item.id}
															href={item.href}
															className={`w-full flex items-center px-6 py-2 text-sm transition-colors duration-200
																${isActive ? "bg-brand_primary text-gray-700 font-semibold shadow border-l-2 border-black" : "text-gray-600 hover:text-brand_secondary hover:bg-gray-50"}
															`}
															style={isActive ? { boxShadow: "0 2px 8px 0 rgba(0, 0, 0, 0.10)" } : {}}
														>
															<ItemIcon className="w-4 h-4 mr-3 flex-shrink-0" />
															{item.label}
														</Link>
													);
												})}
										</div>
									)}
								</div>
							);
						})}
				</nav>
			</div>

			{/* Content Area */}
			<main className="bg-brand_primary/5 flex-1 p-6 overflow-y-auto max-h-screen">{children}</main>
			<Toaster />
		</div>
	);
}

export default function DashboardLayout({ children }) {
	return (
		<ActiveMenuProvider>
			<DashboardLayoutContent>{children}</DashboardLayoutContent>
		</ActiveMenuProvider>
	);
}
