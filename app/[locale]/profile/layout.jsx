"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useParams, useRouter, usePathname } from "next/navigation";
import { PanelLeft, X } from "lucide-react";
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
			className="flex flex-col md:px-4 md:flex-row"
			onClick={(e) => {
				if (profileOpen && !(e.target.closest && e.target.closest("#member-profile-menu"))) {
					setProfileOpen(false);
				}
			}}
		>
			{/* Mobile Menu Toggle */}
			<div className="md:hidden p-4">
				<button
					onClick={() => setProfileOpen(!profileOpen)}
					className="p-2 rounded hover:bg-gray-100 transition-colors"
				>
					{profileOpen ? (
						<X className="w-6 h-6 text-gray-800" />
					) : (
						<PanelLeft className="w-6 h-6 text-gray-800" />
					)}
				</button>
			</div>

			{/* Mobile Sidebar */}
			{profileOpen && (
				<div className="md:hidden fixed inset-0 z-50 flex">
					<div className="fixed inset-0 bg-black/50" onClick={() => setProfileOpen(false)} />
					<div id="member-profile-menu" className="relative bg-red-900 text-white w-64 h-full shadow-lg">
						<div className="flex items-center justify-between p-4 border-b border-gray-600">
							<h2 className="text-lg font-semibold text-white">Menu</h2>
							<button
								onClick={() => setProfileOpen(false)}
								className="p-2 rounded-lg hover:bg-gray-700 transition-colors"
							>
								<X className="w-6 h-6 text-white" />
							</button>
						</div>
						<nav className="overflow-y-auto h-full pb-20">
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
											onClick={() => setProfileOpen(false)}
											className={`w-full flex items-center justify-between px-4 py-3 text-sm transition-colors duration-200
												${isActive ? "bg-brand_primary text-gray-700 font-semibold shadow border-l-2 border-gray-700" : "text-white hover:bg-gray-700"}
											`}
											style={isActive ? { boxShadow: "0 2px 8px 0 rgba(255, 255, 255, 0.10)" } : {}}
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
				</div>
			)}

			{/* Desktop Sidebar */}
			<div className="hidden py-6 md:flex w-64 bg-gray-800 text-white flex-col shadow-lg">
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
										${isActive ? "bg-brand_primary text-gray-700 font-semibold shadow border-l-2 border-gray-700" : "text-white hover:bg-gray-700"}
									`}
									style={isActive ? { boxShadow: "0 2px 8px 0 rgba(255, 255, 255, 0.10)" } : {}}
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
			<main className="flex-1 p-2 md:p-6 m-2 md:m-6">{children}</main>
			<Toaster />
		</div>
	</div>
	);
}

export default function ProfileLayout({ children }) {
	return <ProfileLayoutContent>{children}</ProfileLayoutContent>;
}
