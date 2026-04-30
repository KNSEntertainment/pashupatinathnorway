import { User, Settings, Mail, LucideIcon } from "lucide-react";

export interface MemberMenuItem {
	id: string;
	label: string;
	icon: LucideIcon;
	href: string;
}

export const memberMenuItems: MemberMenuItem[] = [
	{ id: "profile", label: "Profile", icon: User, href: "/en/profile" },
	{ id: "messages", label: "Messages", icon: Mail, href: "/en/profile/messages" },
	{ id: "idcard", label: "ID Card", icon: Mail, href: "/en/profile/idcard" },
	{ id: "update", label: "Update Profile", icon: Settings, href: "/en/profile/update" },
];
