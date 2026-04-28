"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Search } from "lucide-react";
import { useTranslations } from "next-intl";

const SearchModal = dynamic(() => import("@/components/SearchModal"), {
	ssr: false,
	loading: () => null,
});

export default function SearchButton() {
	const [open, setOpen] = useState(false);
	const t = useTranslations("navigation");

	return (
		<>
			<button onClick={() => setOpen(true)} className="btn-glass">
				<Search size={24} />
			</button>

			{open && <SearchModal placeholder={t("search_placeholder")} closeModal={() => setOpen(false)} />}
		</>
	);
}
