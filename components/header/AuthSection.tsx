"use client";

import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";

const LoggedInUser = dynamic(() => import("@/components/LoggedInUser"), {
	ssr: false,
	loading: () => null,
});

export default function AuthSection() {
	const { data: session } = useSession();
	const user = session?.user;

	const t = useTranslations("navigation");
	const locale = useLocale();

	if (user) return <LoggedInUser user={user} />;

	return (
		<Link href="/login" locale={locale} className="flex btn-white">
			{t("login")}
		</Link>
	);
}
