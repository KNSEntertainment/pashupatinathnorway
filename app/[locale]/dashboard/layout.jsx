"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { useSession } from "next-auth/react";
import { ActiveMenuProvider, useActiveMenu } from "@/context/ActiveMenuContext";
import { menuItems } from "@/components/DashboardMenuItems";

function DashboardLayoutContent({ children }) {
	const { activeMenu } = useActiveMenu();
	const router = useRouter();
	const [profileOpen, setProfileOpen] = useState(false);
	const { data: session, status } = useSession();

	// Protect dashboard: redirect if not authenticated or not admin
	if (status === "loading") {
		return (
			<div className="flex flex-col space-y-6 items-center justify-center min-h-screen w-full">
				<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand"></div>
				<div>Loading...</div>
			</div>
		);
	}
	if (!session) {
		router.replace("/en/login");
		return null;
	}
	// Redirect non-admin users to profile page
	if (session.user.role !== "admin") {
		router.replace("/en/profile");
		return null;
	}

	return (
		<div
			className="container mx-auto flex flex-col pl-4 md:flex-row min-h-screen"
			onClick={(e) => {
				if (profileOpen && !(e.target.closest && e.target.closest("#admin-profile-menu"))) {
					setProfileOpen(false);
				}
			}}
		>
			{/* Sidebar */}
			<div className="hidden md:flex w-64 bg-brand_primary/20 flex-col shadow-lg">
				<nav className="py-6 overflow-y-auto max-h-screen">
					{menuItems.map((item) => {
						const Icon = item.icon;
						const isActive = activeMenu === item.id;
						return (
							<Link
								key={item.id}
								href={item.href}
								className={`w-full flex items-center px-4 py-2 text-sm transition-colors duration-200
									${isActive ? "bg-brand_primary text-gray-700 font-semibold shadow border-l-2 border-black" : "text-black hover:text-brand_secondary hover:bg-light"}
								`}
								style={isActive ? { boxShadow: "0 2px 8px 0 rgba(0, 0, 0, 0.10)" } : {}}
							>
								<Icon className="w-5 h-5 mr-3 flex-shrink-0" />
								{item.label}
							</Link>
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
