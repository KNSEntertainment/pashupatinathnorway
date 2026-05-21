import { User, Mail, FileText, Ticket, LucideIcon, HardDrive, PiggyBank, UserPen, IdCard } from "lucide-react";

export interface MemberMenuItem {
	id: string;
	label: string;
	icon: LucideIcon;
	href: string;
}

export const memberMenuItems: MemberMenuItem[] = [
	{ id: "profile", label: "Profile", icon: User, href: "/en/profile" },
	{ id: "my-events", label: "My Events", icon: Ticket, href: "/en/profile/my-events" },
	{ id: "messages", label: "Messages", icon: Mail, href: "/en/profile/messages" },
	{ id: "publications", label: "Publications", icon: FileText, href: "/en/profile/publications" },
	{ id: "idcard", label: "ID Card", icon:IdCard, href: "/en/profile/idcard" },
	{ id: "update", label: "Update Profile", icon:UserPen, href: "/en/profile/update" },
	{ id: "data-management", label: "Data Management", icon: HardDrive, href: "/en/profile/data-management" },
	{ id: "donations", label: "Donations", icon: PiggyBank, href: "/en/profile/member-donations" },
];
