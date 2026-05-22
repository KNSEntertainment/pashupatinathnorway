import { User, Mail, FileText, Ticket, LucideIcon, HardDrive, PiggyBank, UserPen, IdCard, BarChart3 } from "lucide-react";

export interface MemberMenuItem {
	id: string;
	label: string;
	icon: LucideIcon;
	href: string;
	role?: "member" | "executive";
}

export const memberMenuItems: MemberMenuItem[] = [
	{ id: "profile", label: "Profile", icon: User, href: "/profile" },
	{ id: "my-events", label: "My Events", icon: Ticket, href: "/profile/my-events" },
	{ id: "messages", label: "Messages", icon: Mail, href: "/profile/messages" },
	{ id: "publications", label: "Publications", icon: FileText, href: "/profile/publications" },
	{ id: "idcard", label: "ID Card", icon:IdCard, href: "/profile/idcard" },
	{ id: "update", label: "Update Profile", icon:UserPen, href: "/profile/update" },
	{ id: "data-management", label: "Data Management", icon: HardDrive, href: "/profile/data-management" },
	{ id: "donations", label: "Donations", icon: PiggyBank, href: "/profile/member-donations" },
	{ id: "financials", label: "Financials", icon: BarChart3, href: "/profile/financials", role: "executive" },
];
