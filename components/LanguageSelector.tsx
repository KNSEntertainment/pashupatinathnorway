"use client";

import React from "react";
import Flag from "@/components/ui/Flag";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";

const LANGUAGES: { code: string; flag: "np" | "no" | "gb"; label: string }[] = [
	{ code: "ne", flag: "np", label: "NE" },
	{ code: "no", flag: "no", label: "NO" },
	{ code: "en", flag: "gb", label: "EN" },
];

const LanguageSelector = () => {
	const locale = useLocale();
	const router = useRouter();
	const pathname = usePathname();

	const handleLocaleChange = (code: string) => {
		if (code === locale) return;
		localStorage.setItem("locale", code);
		router.replace(pathname, { locale: code });
	};

	return (
		<div className="flex items-center gap-1">
			{LANGUAGES.map((lang, idx) => (
				<React.Fragment key={lang.code}>
					<button
						onClick={() => handleLocaleChange(lang.code)}
						aria-label={`Switch to ${lang.label}`}
						className={`
              flex items-center px-1 md:px-1.5 py-1 rounded
              transition-all duration-200 font-medium text-xs
              hover:scale-105 active:scale-95
              focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-brand/50
              ${lang.code === locale ? "bg-brand/20 text-brand scale-105" : "text-gray-900 hover:bg-brand/5"}
            `}
					>
						<Flag country={lang.flag} size={14} />

						<span className="leading-none">{lang.label}</span>
					</button>
					{idx < LANGUAGES.length - 1 && <span className="text-xs text-gray-400">|</span>}
				</React.Fragment>
			))}
		</div>
	);
};

export default LanguageSelector;
