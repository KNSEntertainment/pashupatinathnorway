"use client";

import { useSession } from "next-auth/react";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { LogIn } from "lucide-react";
import LoggedInUser from "@/components/LoggedInUser";

export default function AuthSection() {
	const { data: session } = useSession();
	const user = session?.user;

	const t = useTranslations("navigation");

	if (user) return <LoggedInUser user={user} />;

	return (
		<Link href="/login" className="flex items-center gap-1 bg-brand_secondary/10 py-1 px-2 hover:bg-brand_secondary/30 rounded-md text-sm">
			<LogIn size={16} />
			{t("login")}
		</Link>
	);
}
