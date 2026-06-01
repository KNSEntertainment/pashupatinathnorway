import { BookImage, Settings, Book, User, Bell, Users, Mail, DollarSign, Image, Heart, QrCode, Gift, LucideIcon, FileText, Shield, FolderOpen, PiggyBank, Info, Target, Sparkles, Flame, PartyPopper, Send, MessageSquare, TrendingUp, TrendingDown, ShoppingBag } from "lucide-react";

export interface MenuItem {
	id: string;
	label: string;
	icon: LucideIcon;
	color: string;
	href: string;
	role?: "admin" | "member" | "both" | "executive";
}

export interface MenuCategory {
	id: string;
	title: string;
	icon: LucideIcon;
	items: MenuItem[];
	role?: "admin" | "member" | "both" | "executive";
}

export const menuCategories: MenuCategory[] = [
	{
		id: "membership",
		title: "Membership",
		icon: Users,
		items: [
			{ id: "memberships", label: "Memberships", icon: Users, color: "bg-purple-600", href: "/en/dashboard/memberships", role: "admin" },
			{ id: "users", label: "Users", icon: User, color: "bg-success", href: "/en/dashboard/users", role: "admin" },
			{ id: "attendance", label: "Attendance", icon: QrCode, color: "bg-blue-600", href: "/en/dashboard/attendance", role: "admin" },
			{ id: "birthdays", label: "Birthdays", icon: Gift, color: "bg-pink-500", href: "/en/dashboard/birthdays", role: "admin" },
		],
		role: "admin"
	},
	{
		id: "financials",
		title: "Financials",
		icon: DollarSign,
		items: [
			{ id: "financial-dashboard", label: "Financial Dashboard", icon: DollarSign, color: "bg-blue-600", href: "/en/dashboard/financial-dashboard", role: "admin" },
			{ id: "budget", label: "Budget", icon: PiggyBank, color: "bg-emerald-600", href: "/en/dashboard/budget", role: "admin" },
			{ id: "income", label: "Income", icon: TrendingUp, color: "bg-green-600", href: "/en/dashboard/income", role: "admin" },
			{ id: "expenses", label: "Expenses", icon: TrendingDown, color: "bg-red-600", href: "/en/dashboard/expenses", role: "admin" },
			{ id: "donations", label: "Donations", icon: DollarSign, color: "bg-green-600", href: "/en/dashboard/donations", role: "admin" },
			{ id: "event-financial-dashboard", label: "Event Financials", icon: Target, color: "bg-purple-600", href: "/en/dashboard/event-financial-dashboard", role: "admin" },
			{ id: "tax-document", label: "Tax Document", icon: FileText, color: "bg-green-600", href: "/en/dashboard/tax-document", role: "admin" },
		],
		role: "admin"
	},
	{
		id: "content",
		title: "Page Contents",
		icon: BookImage,
		items: [
			{ id: "hero", label: "Hero Section", icon: Image, color: "bg-gradient-to-r from-purple-600 to-pink-600", href: "/en/dashboard/hero", role: "admin" },
			{ id: "about-us", label: "About Us", icon: Info, color: "bg-indigo-600", href: "/en/dashboard/about-us", role: "admin" },
			{ id: "mission-vision", label: "Mission & Vision", icon: Target, color: "bg-purple-600", href: "/en/dashboard/mission-vision", role: "admin" },
			{ id: "values", label: "Values", icon: Sparkles, color: "bg-pink-600", href: "/en/dashboard/values", role: "admin" },
			{ id: "publications", label: "Publications", icon: FolderOpen, color: "bg-indigo-600", href: "/en/dashboard/publications", role: "admin" },
			{ id: "products", label: "Products", icon: ShoppingBag, color: "bg-teal-600", href: "/en/dashboard/products", role: "admin" },
		],
		role: "admin"
	},
	{
		id: "events",
		title: "Events & Activities",
		icon: PartyPopper,
		items: [
			{ id: "events", label: "Events", icon: BookImage, color: "bg-pink-600", href: "/en/dashboard/events", role: "admin" },
			{ id: "festivals", label: "Festivals", icon: PartyPopper, color: "bg-pink-600", href: "/en/dashboard/festivals", role: "admin" },
			{ id: "rituals", label: "Rituals", icon: Flame, color: "bg-orange-600", href: "/en/dashboard/rituals", role: "admin" },
			{ id: "causes", label: "Causes", icon: Heart, color: "bg-blue-600", href: "/en/dashboard/causes", role: "admin" },
		],
		role: "admin"
	},
	{
		id: "communication",
		title: "Communication",
		icon: Send,
		items: [
			{ id: "broadcast", label: "Broadcast", icon: Send, color: "bg-blue-600", href: "/en/dashboard/broadcast", role: "admin" },
			{ id: "contactmessages", label: "Contact Messages", icon: Book, color: "bg-blue-600", href: "/en/dashboard/contactmessages", role: "admin" },
			{ id: "notices", label: "Notices", icon: Bell, color: "bg-amber-600", href: "/en/dashboard/notices", role: "admin" },
			{ id: "subscribers", label: "Subscribers", icon: Mail, color: "bg-violet-600", href: "/en/dashboard/subscribers", role: "admin" },
			{ id: "messages", label: "Messages", icon: MessageSquare, color: "bg-blue-600", href: "/en/profile/messages", role: "member" },
		],
		role: "both"
	},
	{
		id: "system",
		title: "System",
		icon: Settings,
		items: [
			{ id: "settings", label: "Profile Settings", icon: Settings, color: "bg-slate-600", href: "/en/dashboard/settings", role: "both" },
			{ id: "audit-logs", label: "Audit Logs", icon: Shield, color: "bg-gray-600", href: "/en/dashboard/audit-logs", role: "admin" },
		],
		role: "both"
	},
];

// Export flat menu items for backward compatibility
export const menuItems: MenuItem[] = menuCategories.flatMap(category => category.items);
