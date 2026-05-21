import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, LogOut, User, MessageSquare } from "lucide-react";
import { completeSignOut } from "@/utils/authUtils";

interface SessionUser {
	name?: string | null;
	email?: string | null;
	image?: string | null;
	profilePhoto?: string | null;
	role?: string;
	isMember?: boolean;
	membershipType?: string;
	membershipStatus?: string;
	// [key: string]: any;
}

const LoggedInUser = ({ user }: { user: SessionUser }) => {
	const userRef = useRef<HTMLDivElement>(null);
	const avatarInitial = typeof user?.email === "string" && user.email ? user.email.charAt(0).toUpperCase() : "U";
	const [showUserDropdown, setShowUserDropdown] = useState(false);
	const [memberPhoto, setMemberPhoto] = useState<string | null>(null);
	const [unreadCount, setUnreadCount] = useState(0);
	const lastEmailRef = useRef<string | null>(null);

	// Fetch member profile photo and unread messages when user is a member
	useEffect(() => {
		if (!user?.isMember || !user?.email) return;
		
		// Only fetch if email has actually changed
		if (lastEmailRef.current === user.email) return;
		
		const fetchMemberData = async () => {
			try {
				// Only reset if we're actually fetching a different email
				if (lastEmailRef.current !== user.email) {
					setMemberPhoto(null);
					setUnreadCount(0);
				}
				
				// Fetch profile photo
				const photoResponse = await fetch(`/api/users/profile-photo?email=${encodeURIComponent(user.email!)}`);
				if (photoResponse.ok) {
					const photoData = await photoResponse.json();
					if (photoData.profilePhoto) {
						setMemberPhoto(photoData.profilePhoto);
					}
				}
				
				// Fetch unread messages count
				const messagesResponse = await fetch("/api/messages");
				if (messagesResponse.ok) {
					const messagesData = await messagesResponse.json();
					setUnreadCount(messagesData.unreadCount || 0);
				}
			} catch (error) {
				console.error("Failed to fetch member data:", error);
			}
		};

		fetchMemberData();
		lastEmailRef.current = user.email; // Update last email
	}, [user?.isMember, user?.email]);

	// Function to determine user role display
	const getUserRoleText = () => {
		if (user?.isMember) {
			// Member-specific display
			const membershipType = user.membershipType || "member";
			return `Signed in as ${membershipType.charAt(0).toUpperCase() + membershipType.slice(1)} Member`;
		} else if (user?.role) {
			// Admin or other roles
			return `Signed in as ${user.role.charAt(0).toUpperCase() + user.role.slice(1)}`;
		} else {
			// Fallback
			return "Signed in";
		}
	};

	// Close dropdown when clicking outside
	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (userRef.current && !userRef.current.contains(event.target as Node)) {
				setShowUserDropdown(false);
			}
		};

		if (showUserDropdown) {
			document.addEventListener("mousedown", handleClickOutside);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, [showUserDropdown]);

	return (
		<div ref={userRef} className="relative">
			<button onClick={() => setShowUserDropdown((v) => !v)} aria-label="User menu" aria-expanded={showUserDropdown} className="h-8 w-8 p-1 rounded-full border border-1 border-gray-600 text-gray-500 hover:text-gray-700 font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 text-sm md:text-base overflow-hidden flex items-center justify-center">
				{memberPhoto ? <Image src={memberPhoto} alt={user.name || "User avatar"} width={44} height={44} className="w-full h-full object-cover" /> : avatarInitial}
			</button>
				{showUserDropdown && (
					<div className="absolute right-0 mt-2 w-64 bg-white backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] ring-1 ring-black/5 overflow-hidden">
						<div className="px-5 py-4 border-b border-neutral-100">
							<p className="font-semibold text-gray-900 truncate">{user.email}</p>
							<p className="text-xs text-gray-900 mt-1">{getUserRoleText()}</p>
						</div>
						{user.role === "admin" || user.isMember ? (
							<>
								<Link href="/en/dashboard" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-3 px-5 py-3.5 text-gray-700 hover:bg-red-50 w-full transition-all duration-200 font-medium">
									<LayoutDashboard size={18} />
									{user.role === "admin" ? "Admin Dashboard" : "Member Dashboard"}
								</Link>
								{user.isMember && (
									<Link href="/en/profile/messages" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-3 px-5 py-3.5 text-gray-700 hover:bg-red-50 w-full transition-all duration-200 font-medium">
										<div className="relative">
											<MessageSquare size={18} />
											{unreadCount > 0 && (
												<span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center font-medium">
													{unreadCount > 9 ? "9+" : unreadCount}
												</span>
											)}
										</div>
										Messages
									</Link>
								)}
							</>
						) : (
							<Link href="/en/profile" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-3 px-5 py-3.5 text-brand_primary hover:bg-brand_primary/10 w-full transition-all duration-200 font-medium">
								<User size={18} />
								My Profile
							</Link>
						)}
				
						<button onClick={() => completeSignOut("/", () => setShowUserDropdown(false))} className="flex items-center gap-3 px-5 py-3.5 text-red-600 hover:bg-red-50 w-full transition-all duration-200 font-medium">
							<LogOut size={18} />
							Sign Out
						</button>
					</div>
				)}
		</div>
	);
};

export default LoggedInUser;
