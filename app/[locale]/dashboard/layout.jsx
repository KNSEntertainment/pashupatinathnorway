"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { useSession } from "next-auth/react";
import { ActiveMenuProvider, useActiveMenu } from "@/context/ActiveMenuContext";
import { menuItems } from "@/components/DashboardMenuItems";
import { useMembershipData } from "@/hooks/useMembershipData";

function DashboardLayoutContent({ children }) {
	const { activeMenu } = useActiveMenu();
	const router = useRouter();
	const [profileOpen, setProfileOpen] = useState(false);
	const { data: session, status } = useSession();
	const { isExecutive, loading: membershipLoading } = useMembershipData();

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
					{/* Debug info - remove after testing */}
					{process.env.NODE_ENV === 'development' && (
						<div className="px-4 py-2 text-xs text-gray-600 border-b">
							<div>Session role: {session?.user?.role}</div>
							<div>Is executive: {isExecutive ? 'true' : 'false'}</div>
							<div>Membership loading: {membershipLoading ? 'true' : 'false'}</div>
						</div>
					)}
					{menuItems
						.filter((item) => {
							// Debug logging for financials item
							if (item.id === 'financials') {
								console.log('Financials item filter check:', {
									role: item.role,
									isExecutive,
									sessionRole: session?.user?.role,
									shouldShow: item.role === "executive" ? isExecutive : true
								});
							}
							
							if (!item.role) return true;
							if (item.role === "both") return true;
							if (item.role === "admin") return session.user.role === "admin";
							if (item.role === "member") return session.user.role !== "admin";
							if (item.role === "executive") return isExecutive;
							return false;
						})
						.map((item) => {
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
