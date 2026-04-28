import { BookImage, Settings, GalleryThumbnails, LayoutDashboard, Book, Newspaper, User, Download, Video, FileText, Bell, Layers, Users, Mail, DollarSign, Image, Heart, HandHelping, LucideIcon } from "lucide-react";

export interface MenuItem {
	id: string;
	label: string;
	icon: LucideIcon;
	color: string;
	href: string;
}

export const menuItems: MenuItem[] = [
	{ id: "dashboard", label: "Dashboard", icon: LayoutDashboard, color: "bg-brand", href: "/en/dashboard" },
	{ id: "blogs", label: "Blogs", icon: Newspaper, color: "bg-orange-600", href: "/en/dashboard/blogs" },
	{ id: "causes", label: "Causes", icon: Heart, color: "bg-blue-600", href: "/en/dashboard/causes" },
	{ id: "contactmessages", label: "Contact Messages", icon: Book, color: "bg-blue-600", href: "/en/dashboard/contactmessages" },
	{ id: "circulars", label: "Circulars", icon: FileText, color: "bg-teal-600", href: "/en/dashboard/circulars" },
	{ id: "departments", label: "Departments", icon: Layers, color: "bg-indigo-600", href: "/en/dashboard/departments" },
	{ id: "donations", label: "Donations", icon: DollarSign, color: "bg-green-600", href: "/en/dashboard/donations" },
	{ id: "downloads", label: "Downloads", icon: Download, color: "bg-rose-600", href: "/en/dashboard/downloads" },
	{ id: "events", label: "Events", icon: BookImage, color: "bg-pink-600", href: "/en/dashboard/events" },
	{ id: "executive-members", label: "Executive Members", icon: Users, color: "bg-cyan-600", href: "/en/dashboard/executive-members" },
	{ id: "gallery", label: "Gallery", icon: GalleryThumbnails, color: "bg-emerald-600", href: "/en/dashboard/gallery" },
	{ id: "hero", label: "Hero Section", icon: Image, color: "bg-gradient-to-r from-purple-600 to-pink-600", href: "/en/dashboard/hero" },
	{ id: "memberships", label: "Memberships", icon: Users, color: "bg-purple-600", href: "/en/dashboard/memberships" },
	{ id: "notices", label: "Notices", icon: Bell, color: "bg-amber-600", href: "/en/dashboard/notices" },
	{ id: "settings", label: "Profile Settings", icon: Settings, color: "bg-slate-600", href: "/en/dashboard/settings" },
	{ id: "subscribers", label: "Subscribers", icon: Mail, color: "bg-violet-600", href: "/en/dashboard/subscribers" },
	{ id: "users", label: "Users", icon: User, color: "bg-success", href: "/en/dashboard/users" },
	{ id: "videos", label: "Videos", icon: Video, color: "bg-red-600", href: "/en/dashboard/videos" },
	{ id: "volunteers", label: "Volunteers", icon: HandHelping, color: "bg-orange-600", href: "/en/dashboard/volunteers" },
];
