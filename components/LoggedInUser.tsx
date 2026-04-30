import React, { useRef, useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { LayoutDashboard, LogOut, User } from "lucide-react";
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

	// Fetch member profile photo when user is a member
	useEffect(() => {
		const fetchMemberPhoto = async () => {
			if (!user?.isMember || !user?.email) return;

			try {
				setMemberPhoto(null); // Reset photo when fetching new user
				const response = await fetch(`/api/users/profile-photo?email=${encodeURIComponent(user.email)}`);
				if (response.ok) {
					const data = await response.json();
					if (data.profilePhoto) {
						setMemberPhoto(data.profilePhoto);
					}
				}
			} catch (error) {
				console.error("Failed to fetch member profile photo:", error);
			}
		};

		fetchMemberPhoto();
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
			<button onClick={() => setShowUserDropdown((v) => !v)} aria-label="User menu" aria-expanded={showUserDropdown} className="h-10 w-11 rounded-full border border-1 border-white bg-gradient-to-br from-brand to-emerald-500 text-white font-bold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 text-sm md:text-base overflow-hidden flex items-center justify-center">
				{memberPhoto ? <Image src={memberPhoto} alt={user.name || "User avatar"} width={44} height={44} className="w-full h-full object-cover" /> : avatarInitial}
			</button>
			<AnimatePresence>
				{showUserDropdown && (
					<motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.2 }} className="absolute right-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] ring-1 ring-black/5 overflow-hidden">
						<div className="px-5 py-4 border-b border-neutral-100">
							<p className="font-semibold text-gray-900 truncate">{user.email}</p>
							<p className="text-xs text-gray-900 mt-1">{getUserRoleText()}</p>
						</div>
						{user.role === "admin" || user.isMember ? (
							<Link href="/en/dashboard" onClick={() => setShowUserDropdown(false)} className="flex items-center gap-3 px-5 py-3.5 text-gray-700 hover:bg-brand_primary/10 w-full transition-all duration-200 font-medium">
								<LayoutDashboard size={18} />
								{user.role === "admin" ? "Admin Dashboard" : "Member Dashboard"}
							</Link>
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
					</motion.div>
				)}
			</AnimatePresence>
		</div>
	);
};

export default LoggedInUser;
