"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { useSession } from "next-auth/react";
import { memberMenuItems } from "@/components/MemberMenuItems";

function ProfileLayoutContent({ children }) {
	const router = useRouter();
	const pathname = usePathname();
	const [profileOpen, setProfileOpen] = useState(false);
	const { data: session, status } = useSession();

	// Protect profile: redirect if not authenticated
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

	return (
		<div
			className="flex flex-col pl-4 md:flex-row min-h-screen"
			onClick={(e) => {
				if (profileOpen && !(e.target.closest && e.target.closest("#member-profile-menu"))) {
					setProfileOpen(false);
				}
			}}
		>
			{/* Sidebar */}
			<div className="hidden py-6 md:flex w-64 bg-brand_primary/20 flex-col shadow-lg">
				<nav className="overflow-y-hidden no-scrollbar">
					{memberMenuItems.map((item) => {
						const Icon = item.icon;
						const isActive = pathname === item.href;
						return (
							<Link
								key={item.id}
								href={item.href}
								className={`w-full flex items-center px-4 py-2 text-sm transition-colors duration-200
									${isActive ? "bg-brand_primary text-white font-semibold shadow border-l-2 border-black" : "text-black hover:text-brand_primary hover:bg-light"}
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
			<main className="bg-brand_primary/5 flex-1 p-6 m-6">{children}</main>
			<Toaster />
		</div>
	);
}

export default function ProfileLayout({ children }) {
	return <ProfileLayoutContent>{children}</ProfileLayoutContent>;
}
