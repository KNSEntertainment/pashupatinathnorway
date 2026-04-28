import { Loader2, Search } from "lucide-react";

export default function SearchLoading() {
	return (
		<div className="min-h-screen bg-light py-12">
			<div className="container mx-auto px-4 max-w-6xl">
				<div className="flex flex-col items-center justify-center py-20">
					<div className="relative mb-6">
						<Search className="w-16 h-16 text-brand animate-pulse" />
						<Loader2 className="w-8 h-8 text-brand animate-spin absolute -bottom-2 -right-2" />
					</div>
					<h2 className="text-2xl font-semibold text-gray-900 mb-2">Searching...</h2>
					<p className="text-gray-900 animate-pulse">Please wait while we find the best results for you</p>

					{/* Skeleton cards */}
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-12 w-full">
						{[1, 2, 3, 4, 5, 6].map((i) => (
							<div key={i} className="bg-white rounded-lg shadow-md overflow-hidden animate-pulse">
								<div className="h-48 bg-light"></div>
								<div className="p-4">
									<div className="h-4 bg-light rounded mb-2 w-1/4"></div>
									<div className="h-6 bg-light rounded mb-2"></div>
									<div className="h-4 bg-light rounded mb-2 w-5/6"></div>
									<div className="h-4 bg-light rounded w-2/3"></div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
