"use client";

import { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Heart, Users, Calendar, DollarSign } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Donor {
	name: string;
	amount: number;
	isAnonymous: boolean;
	date: string;
	email?: string;
	phone?: string;
	address?: string;
	message?: string;
	paymentStatus: string;
}

type SortField = "name" | "amount" | "date";
type SortDirection = "asc" | "desc";
type FilterType = "all" | "anonymous" | "named";

export default function DonorsPageClient() {
	const params = useParams();
	const locale = params.locale as string;
	const [donors, setDonors] = useState<Donor[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [sortField, setSortField] = useState<SortField>("amount");
	const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
	const [filterType, setFilterType] = useState<FilterType>("all");

	useEffect(() => {
		const fetchDonors = async () => {
			try {
				const response = await fetch("/api/donations/donors");
				if (response.ok) {
					const data = await response.json();
					setDonors(data);
				}
			} catch (error) {
				console.error("Error fetching donors:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchDonors();
	}, []);

	// Filter and sort donors
	const filteredAndSortedDonors = useMemo(() => {
		let filtered = donors;

		// Apply search filter
		if (searchTerm) {
			filtered = filtered.filter(donor =>
				donor.name.toLowerCase().includes(searchTerm.toLowerCase())
			);
		}

		// Apply type filter
		if (filterType === "anonymous") {
			filtered = filtered.filter(donor => donor.isAnonymous);
		} else if (filterType === "named") {
			filtered = filtered.filter(donor => !donor.isAnonymous);
		}

		// Apply sorting
		const sorted = [...filtered].sort((a, b) => {
			let comparison = 0;

			switch (sortField) {
				case "name":
					comparison = a.name.localeCompare(b.name);
					break;
				case "amount":
					comparison = a.amount - b.amount;
					break;
				case "date":
					comparison = new Date(a.date).getTime() - new Date(b.date).getTime();
					break;
			}

			return sortDirection === "asc" ? comparison : -comparison;
		});

		return sorted;
	}, [donors, searchTerm, sortField, sortDirection, filterType]);

	// Calculate statistics
	const stats = useMemo(() => {
		const totalDonors = donors.length;
		const anonymousDonors = donors.filter(d => d.isAnonymous).length;
		const namedDonors = totalDonors - anonymousDonors;
		const totalAmount = donors.reduce((sum, d) => sum + d.amount, 0);

		return {
			totalDonors,
			anonymousDonors,
			namedDonors,
			totalAmount
		};
	}, [donors]);

	const toggleSortDirection = () => {
		setSortDirection(prev => prev === "asc" ? "desc" : "asc");
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-12 px-4">
				<div className="max-w-6xl mx-auto">
					<div className="flex justify-center items-center py-12">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand_primary"></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-12 px-4">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<div className="text-center mb-8">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">
						All Donors
					</h1>
					<p className="text-lg text-gray-600 mb-6">
						Thank you to everyone who has contributed to building our community temple
					</p>
					<Link 
						href={`/${locale}/donate`}
						className="inline-flex items-center px-6 py-3 bg-brand_secondary/80 text-white rounded-lg hover:bg-brand_secondary transition-colors"
					>
						Make a Donation
					</Link>
				</div>

				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
					<Card className="bg-white">
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<Users className="w-8 h-8 text-brand_primary" />
								<div>
									<p className="text-sm text-gray-600">Total Donors</p>
									<p className="text-2xl font-bold text-gray-900">{stats.totalDonors}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-white">
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<Heart className="w-8 h-8 text-brand_secondary" />
								<div>
									<p className="text-sm text-gray-600">Named Donors</p>
									<p className="text-2xl font-bold text-gray-900">{stats.namedDonors}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-white">
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<Users className="w-8 h-8 text-gray-400" />
								<div>
									<p className="text-sm text-gray-600">Anonymous</p>
									<p className="text-2xl font-bold text-gray-900">{stats.anonymousDonors}</p>
								</div>
							</div>
						</CardContent>
					</Card>

					<Card className="bg-white">
						<CardContent className="p-4">
							<div className="flex items-center gap-3">
								<DollarSign className="w-8 h-8 text-green-600" />
								<div>
									<p className="text-sm text-gray-600">Total Amount</p>
									<p className="text-2xl font-bold text-gray-900">
										{stats.totalAmount.toLocaleString('nb-NO', {
											style: 'currency',
											currency: 'NOK',
											minimumFractionDigits: 0,
											maximumFractionDigits: 0
										})}
									</p>
								</div>
							</div>
						</CardContent>
					</Card>
				</div>

				{/* Filters and Search */}
				<Card className="bg-white mb-8">
					<CardHeader>
						<CardTitle className="text-xl font-semibold">Search & Filter</CardTitle>
					</CardHeader>
					<CardContent>
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4">
							{/* Search */}
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input
									placeholder="Search donors..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10"
								/>
							</div>

							{/* Filter Type */}
							<Select value={filterType} onValueChange={(value: FilterType) => setFilterType(value)}>
								<SelectTrigger>
									<SelectValue placeholder="Filter by type" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">All Donors</SelectItem>
									<SelectItem value="named">Named Donors</SelectItem>
									<SelectItem value="anonymous">Anonymous Donors</SelectItem>
								</SelectContent>
							</Select>

							{/* Sort Field */}
							<Select value={sortField} onValueChange={(value: SortField) => setSortField(value)}>
								<SelectTrigger>
									<SelectValue placeholder="Sort by" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="date">Date</SelectItem>
									<SelectItem value="amount">Amount</SelectItem>
									<SelectItem value="name">Name</SelectItem>
								</SelectContent>
							</Select>

							{/* Sort Direction */}
							<Button
								onClick={toggleSortDirection}
								variant="outline"
								className="flex items-center gap-2"
							>
								<ArrowUpDown className="w-4 h-4" />
								{sortDirection === "asc" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
								{sortDirection === "asc" ? "Ascending" : "Descending"}
							</Button>
						</div>
					</CardContent>
				</Card>

				{/* Results Count */}
				<div className="mb-4 text-gray-600">
					Showing {filteredAndSortedDonors.length} of {donors.length} donors
				</div>

				{/* Donors List */}
				<Card className="bg-white">
					<CardHeader>
						<CardTitle className="text-xl font-semibold">Donors List</CardTitle>
					</CardHeader>
					<CardContent>
						{filteredAndSortedDonors.length === 0 ? (
							<div className="text-center py-12 text-gray-500">
								<Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
								<p className="text-lg">No donors found</p>
								<p className="text-sm">Try adjusting your search or filters</p>
							</div>
						) : (
							<div className="overflow-x-auto">
								<table className="w-full">
									<thead>
										<tr className="border-b border-gray-200">
											<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Donor</th>
											<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Amount</th>
											<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Date</th>
											<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Message</th>
										</tr>
									</thead>
									<tbody>
										{filteredAndSortedDonors.map((donor, index) => (
											<tr key={index} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
												<td className="py-3 px-4">
													<div className="flex items-center gap-2">
														<Heart className="w-4 h-4 text-brand_secondary flex-shrink-0" />
														<div>
															<p className="font-medium text-gray-900">{donor.name}</p>
															{donor.isAnonymous && (
																<p className="text-xs text-gray-500">Anonymous</p>
															)}
														</div>
													</div>
												</td>
												
											
												<td className="py-3 px-4">
													<p className="font-semibold text-gray-900">
														{donor.amount.toLocaleString('nb-NO', {
															style: 'currency',
															currency: 'NOK',
															minimumFractionDigits: 0,
															maximumFractionDigits: 0
														})}
													</p>
												</td>
												<td className="py-3 px-4 text-sm text-gray-600">
													<div className="flex items-center gap-1">
														<Calendar className="w-3 h-3" />
														{new Date(donor.date).toLocaleDateString('nb-NO')}
													</div>
												</td>
												<td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">
													{donor.message || "-"}
												</td>
											
											</tr>
										))}
									</tbody>
								</table>
							</div>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
