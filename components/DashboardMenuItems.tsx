import { BookImage, Settings, LayoutDashboard, Book, Newspaper, User, Download, Bell, Users, Mail, DollarSign, Image, Heart, QrCode, Gift, LucideIcon } from "lucide-react";

export interface MenuItem {
	id: string;
	label: string;
	icon: LucideIcon;
	color: string;
	href: string;
	role?: "admin" | "member" | "both";
}

export const menuItems: MenuItem[] = [
	{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "bg-yellow-800", href: "/en/dashboard", role: "both" },
	{ id: "member-donations", label: "My Donations", icon: Heart, color: "bg-red-600", href: "/en/dashboard/member-donations", role: "member" },
	{ id: "attendance", label: "Attendance", icon: QrCode, color: "bg-blue-600", href: "/en/dashboard/attendance", role: "admin" },
	{ id: "birthdays", label: "Birthdays", icon: Gift, color: "bg-pink-500", href: "/en/dashboard/birthdays", role: "admin" },
	{ id: "blogs", label: "Blogs", icon: Newspaper, color: "bg-orange-600", href: "/en/dashboard/blogs", role: "admin" },
	{ id: "causes", label: "Causes", icon: Heart, color: "bg-blue-600", href: "/en/dashboard/causes", role: "admin" },
	{ id: "contactmessages", label: "Contact Messages", icon: Book, color: "bg-blue-600", href: "/en/dashboard/contactmessages", role: "admin" },
	{ id: "donations", label: "Donations", icon: DollarSign, color: "bg-green-600", href: "/en/dashboard/donations", role: "admin" },
	{ id: "downloads", label: "Downloads", icon: Download, color: "bg-rose-600", href: "/en/dashboard/downloads", role: "admin" },
	{ id: "events", label: "Events", icon: BookImage, color: "bg-pink-600", href: "/en/dashboard/events", role: "admin" },
	{ id: "hero", label: "Hero Section", icon: Image, color: "bg-gradient-to-r from-purple-600 to-pink-600", href: "/en/dashboard/hero", role: "admin" },
	{ id: "memberships", label: "Memberships", icon: Users, color: "bg-purple-600", href: "/en/dashboard/memberships", role: "admin" },
	{ id: "notices", label: "Notices", icon: Bell, color: "bg-amber-600", href: "/en/dashboard/notices", role: "admin" },
	{ id: "settings", label: "Profile Settings", icon: Settings, color: "bg-slate-600", href: "/en/dashboard/settings", role: "both" },
	{ id: "subscribers", label: "Subscribers", icon: Mail, color: "bg-violet-600", href: "/en/dashboard/subscribers", role: "admin" },
	{ id: "users", label: "Users", icon: User, color: "bg-success", href: "/en/dashboard/users", role: "admin" },
];
