import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Loader2 } from "lucide-react";
import { useLocale } from "next-intl";

export default function SearchModal({ closeModal, placeholder }) {
	const [searchQuery, setSearchQuery] = useState("");
	const [isSearching, setIsSearching] = useState(false);
	const searchInputRef = useRef(null);
	const router = useRouter();
	const locale = useLocale();

	useEffect(() => {
		if (searchInputRef.current) {
			searchInputRef.current.focus();
		}
	}, []);

	useEffect(() => {
		const handleKeyDown = (e) => {
			if (e.key === "Escape" && !isSearching) {
				closeModal();
			}
		};
		window.addEventListener("keydown", handleKeyDown);
		return () => window.removeEventListener("keydown", handleKeyDown);
	}, [isSearching, closeModal]);

	const handleSearch = (e) => {
		e.preventDefault();
		if (searchQuery.trim() && !isSearching) {
			setIsSearching(true);
			// Don't close modal immediately - show loading state
			setTimeout(() => {
				router.push(`/${locale}/search?q=${encodeURIComponent(searchQuery.trim())}`);
				closeModal();
			}, 300);
		}
	};

	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-lg transition-all duration-300" onClick={() => !isSearching && closeModal()}>
			<form onSubmit={handleSearch} onClick={(e) => e.stopPropagation()} className="flex flex-col items-center max-w-2xl w-full gap-2 md:gap-4 rounded-xl shadow-xl px-4 py-4 md:py-6 mx-4">
				<div className="flex items-center w-full gap-2 md:gap-4">
					<input type="text" ref={searchInputRef} className="flex-1 border-b-2 text-white text-2xl border-brand px-4 py-2 md:py-3 md:text-4xl focus:outline-none  bg-transparent" placeholder={placeholder} value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} required disabled={isSearching} />
					<button type="submit" className="bg-brand_primary rounded-md p-2 md:p-4 flex items-center justify-center hover:bg-brand_primary transition-colors disabled:opacity-50 disabled:cursor-not-allowed" disabled={isSearching}>
						{isSearching ? <Loader2 className="text-white w-6 h-6 md:w-8 md:h-8 animate-spin" /> : <Search className="text-white w-6 h-6 md:w-8 md:h-8" />}
					</button>
				</div>
				{isSearching && (
					<div className="text-white text-center animate-pulse mt-2">
						<p className="text-lg md:text-xl">Searching...</p>
					</div>
				)}
				{/* Close icon at top right */}
				<button type="button" onClick={closeModal} className="absolute top-2 md:top-6 right-2 md:right-6 text-gray-900 hover:text-brand_primary transition-colors" disabled={isSearching}>
					<X className="w-6 h-6 md:w-8 md:h-8" />
				</button>
			</form>
		</div>
	);
}
