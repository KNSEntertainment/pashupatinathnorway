"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { Search, Loader2 } from "lucide-react";

export default function SearchBar({ initialQuery }) {
	const [searchQuery, setSearchQuery] = useState(initialQuery);
	const [isSearching, setIsSearching] = useState(false);
	const router = useRouter();
	const locale = useLocale();
	const t = useTranslations("search");

	// Reset loading state when search completes (initialQuery changes)
	useEffect(() => {
		setSearchQuery(initialQuery);
		setIsSearching(false);
	}, [initialQuery]);

	const handleSearch = (e) => {
		e.preventDefault();
		if (searchQuery.trim() && searchQuery.trim() !== initialQuery) {
			setIsSearching(true);
			router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`);
		}
	};

	return (
		<form onSubmit={handleSearch} className="mb-8 max-w-6xl">
			<div className="relative flex items-center gap-2">
				<input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} placeholder={t("searchPlaceholder") || "Search..."} className="flex-1 px-4 py-3 pl-10 border border-light rounded-lg focus:ring-2 focus:ring-brand focus:border-brand outline-none transition-all" disabled={isSearching} />
				<Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-900" />
				<button type="submit" disabled={isSearching || !searchQuery.trim() || searchQuery.trim() === initialQuery} className="px-6 py-3 bg-brand text-white rounded-lg hover:bg-brand/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2">
					{isSearching ? (
						<>
							<Loader2 className="w-5 h-5 animate-spin" />
							<span>{t("searching") || "Searching..."}</span>
						</>
					) : (
						<span>{t("search") || "Search"}</span>
					)}
				</button>
			</div>
		</form>
	);
}
