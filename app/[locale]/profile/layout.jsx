"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter, usePathname } from "next/navigation";
import { Toaster } from "@/components/ui/toaster";
import { useSession } from "next-auth/react";
import { memberMenuItems } from "@/components/MemberMenuItems";
import { useMessageCounts } from "@/hooks/useMessageCounts";
import { useMembershipData } from "@/hooks/useMembershipData";

function ProfileLayoutContent({ children }) {
	const router = useRouter();
	const pathname = usePathname();
	const params = useParams();
	const locale = params?.locale || "en";
	const [profileOpen, setProfileOpen] = useState(false);
	const { data: session, status } = useSession();
	const messageCounts = useMessageCounts();
	const { isExecutive } = useMembershipData();

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
	<div className="container mx-auto">
			<div
			className="flex flex-col pl-4 md:flex-row"
			onClick={(e) => {
				if (profileOpen && !(e.target.closest && e.target.closest("#member-profile-menu"))) {
					setProfileOpen(false);
				}
			}}
		>
			{/* Sidebar */}
			<div className="hidden py-6 md:flex w-64 bg-brand_primary/20 text-gray-700 flex-col shadow-lg">
				<nav className="overflow-y-hidden no-scrollbar">
					{memberMenuItems
						.filter((item) => {
							if (!item.role) return true;
							if (item.role === "member") return true;
							if (item.role === "executive") return isExecutive;
							return false;
						})
						.map((item) => {
							const Icon = item.icon;
							const localizedHref = `/${locale}${item.href}`;
							const isActive = pathname === localizedHref;
							const isMessages = item.id === "messages";
							
							return (
								<Link
									key={item.id}
									href={localizedHref}
									className={`w-full flex items-center justify-between px-4 py-2 text-sm transition-colors duration-200
										${isActive ? "bg-brand_primary text-gray-700 font-semibold shadow border-l-2 border-black" : "text-gray-700 hover:bg-brand_primary/20"}
									`}
									style={isActive ? { boxShadow: "0 2px 8px 0 rgba(0, 0, 0, 0.10)" } : {}}
								>
									<div className="flex items-center">
										<Icon className="w-5 h-5 mr-3 flex-shrink-0" />
										{item.label}
									</div>
									
									{isMessages && !messageCounts.loading && (
										<div className="flex items-center space-x-1">
											{messageCounts.unread > 0 && (
												<span className="bg-red-500 text-white text-xs font-medium px-2 py-1 rounded-full min-w-[20px] text-center">
													{messageCounts.unread}
												</span>
											)}
										</div>
									)}
								</Link>
							);
						})}
				</nav>
			</div>

			{/* Content Area */}
			<main className="flex-1 p-6 m-6">{children}</main>
			<Toaster />
		</div>
	</div>
	);
}

export default function ProfileLayout({ children }) {
	return <ProfileLayoutContent>{children}</ProfileLayoutContent>;
}
