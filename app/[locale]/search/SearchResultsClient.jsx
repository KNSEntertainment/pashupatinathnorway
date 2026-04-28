"use client";
import dynamic from "next/dynamic";

const SearchResultCard = dynamic(() => import("./SearchResultCard"), { ssr: false });

export default function SearchResultsClient({ results, query }) {
	return (
		<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
			{results.map((item) => (
				<SearchResultCard key={item._id} item={item} query={query} />
			))}
		</div>
	);
}
