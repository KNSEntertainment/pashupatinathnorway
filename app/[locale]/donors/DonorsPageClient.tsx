"use client";

import React, { useState, useEffect, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, ArrowUpDown, ArrowUp, ArrowDown, Heart, Users, Calendar, DollarSign, ChevronLeft, ChevronRight } from "lucide-react";
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

interface PaginationData {
	page: number;
	limit: number;
	total: number;
	pages: number;
	hasNextPage: boolean;
	hasPrevPage: boolean;
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
	
	// Pagination state
	const [currentPage, setCurrentPage] = useState(1);
	const [pagination, setPagination] = useState<PaginationData>({
		page: 1,
		limit: 10,
		total: 0,
		pages: 0,
		hasNextPage: false,
		hasPrevPage: false
	});

	useEffect(() => {
		const fetchDonors = async () => {
			try {
				// Build query parameters
				const params = new URLSearchParams({
					page: currentPage.toString(),
					limit: pagination.limit.toString(),
					sortBy: sortField,
					sortOrder: sortDirection,
					filter: filterType,
					search: searchTerm
				});
				
				const response = await fetch(`/api/donations/donors?${params}`);
				if (response.ok) {
					const data = await response.json();
					setDonors(data.donors);
					setPagination(data.pagination);
				}
			} catch (error) {
				console.error("Error fetching donors:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchDonors();
	}, [currentPage, sortField, sortDirection, filterType, searchTerm, pagination.limit]);

	// Reset to first page when filters or search changes
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm, sortField, sortDirection, filterType]);

	// Calculate statistics
	const stats = useMemo(() => {
		const totalDonors = pagination.total;
		const anonymousDonors = donors.filter(d => d.isAnonymous).length;
		const namedDonors = totalDonors - anonymousDonors;
		const totalAmount = donors.reduce((sum, d) => sum + d.amount, 0);

		return {
			totalDonors,
			anonymousDonors,
			namedDonors,
			totalAmount
		};
	}, [pagination.total, donors]);

	const toggleSortDirection = () => {
		setSortDirection(sortDirection === "asc" ? "desc" : "asc");
	};

	const handlePageChange = (page: number) => {
		if (page >= 1 && page <= pagination.pages) {
			setCurrentPage(page);
		}
	};

	if (loading) {
		return (
			<div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-12 px-4">
				<div className="max-w-7xl mx-auto">
					<div className="flex justify-center items-center h-64">
						<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand_primary"></div>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="min-h-screen bg-gradient-to-b from-amber-50 to-orange-50 py-12 px-4">
			<div className="max-w-7xl mx-auto">
				{/* Header */}
				<div className="text-center mb-12">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">All Donors</h1>
					<p className="text-lg text-gray-600">
						View all donors who have contributed to building the Pashupatinath Temple in Norway
					</p>
				</div>
				<Link href={`/${locale}/donate`} className="text-brand_secondary/80 hover:text-brand_secondary font-medium mb-6 inline-block">
					← Back to Donate Form
				</Link>

				{/* Statistics Cards */}
				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
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
					Showing {donors.length} of {pagination.total} donors (Page {currentPage} of {pagination.pages})
				</div>

				{/* Donors List */}
				<Card className="bg-white">
					<CardHeader>
						<div className="flex justify-between items-center">
							<CardTitle className="text-xl font-semibold">Donors List</CardTitle>
							
							{/* Top Pagination */}
							{pagination.pages > 1 && (
								<div className="flex items-center justify-between">
									<Button
										onClick={() => handlePageChange(currentPage - 1)}
										disabled={!pagination.hasPrevPage}
										variant="outline"
										size="sm"
									>
										<ChevronLeft className="w-4 h-4" />
										<span className="hidden sm:inline">Previous</span>
									</Button>
									
									<div className="flex items-center gap-1 hidden sm:flex">
										{Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
											let pageNum;
											if (pagination.pages <= 5) {
												pageNum = i + 1;
											} else if (currentPage <= 3) {
												pageNum = i + 1;
											} else if (currentPage >= pagination.pages - 2) {
												pageNum = pagination.pages - 4 + i;
											} else {
												pageNum = currentPage - 2 + i;
											}
											
											return (
												<Button
													key={pageNum}
													onClick={() => handlePageChange(pageNum)}
													variant={currentPage === pageNum ? "default" : "outline"}
													size="sm"
													className="w-8 h-8 p-0"
												>
													{pageNum}
												</Button>
											);
										})}
									</div>
									
									<Button
										onClick={() => handlePageChange(currentPage + 1)}
										disabled={!pagination.hasNextPage}
										variant="outline"
										size="sm"
									>
										<span className="hidden sm:inline">Next</span>
										<ChevronRight className="w-4 h-4" />
									</Button>
								</div>
							)}
						</div>
					</CardHeader>
					<CardContent>
						{donors.length === 0 ? (
							<div className="text-center py-12 text-gray-500">
								<Heart className="w-12 h-12 mx-auto mb-4 text-gray-300" />
								<p className="text-lg">No donors found</p>
								<p className="text-sm">Try adjusting your search or filters</p>
							</div>
						) : (
							<>
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead>
											<tr className="border-b border-gray-200">
												<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Donor</th>
												<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Amount</th>
												<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 hidden sm:table-cell">Date</th>
												<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900 hidden sm:table-cell">Message</th>
											</tr>
										</thead>
										<tbody>
											{donors.map((donor: Donor, index: number) => (
												<React.Fragment key={index}>
													<tr className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
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
														<td className="py-3 px-4 text-sm text-gray-600 hidden sm:table-cell">
															<div className="flex items-center gap-1">
																<Calendar className="w-3 h-3" />
																{new Date(donor.date).toLocaleDateString('nb-NO')}
															</div>
														</td>
														<td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate hidden sm:table-cell">
															{donor.message || "-"}
														</td>
													</tr>
													{/* Mobile-only message row */}
													{donor.message && (
														<tr className="sm:hidden">
															<td colSpan={2} className="py-3 px-4 pt-0 text-sm text-gray-600">
																<div className="pl-6 border-l-2 border-gray-200 ml-4">
																	<div className="bg-gray-50 rounded-r p-3 -ml-px">
																		<span className="font-medium text-gray-700 text-xs block mb-1">Message:</span>
																		<div className="text-gray-600">{donor.message}</div>
																	</div>
																</div>
															</td>
														</tr>
													)}
												</React.Fragment>
											))}
										</tbody>
									</table>
								</div>

								{/* Pagination */}
								{pagination.pages > 1 && (
									<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mt-6 pt-6 border-t border-gray-200">
										<div className="text-sm text-gray-600 text-center sm:text-left">
											Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} donors
										</div>
										<div className="flex items-center justify-between sm:justify-end gap-2">
											<Button
												onClick={() => handlePageChange(currentPage - 1)}
												disabled={!pagination.hasPrevPage}
												variant="outline"
												size="sm"
											>
												<ChevronLeft className="w-4 h-4" />
												<span className="hidden sm:inline">Previous</span>
											</Button>
											
											<div className="flex items-center gap-1 hidden sm:flex">
												{Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
													let pageNum;
													if (pagination.pages <= 5) {
														pageNum = i + 1;
													} else if (currentPage <= 3) {
														pageNum = i + 1;
													} else if (currentPage >= pagination.pages - 2) {
														pageNum = pagination.pages - 4 + i;
													} else {
														pageNum = currentPage - 2 + i;
													}
													
													return (
														<Button
															key={pageNum}
															onClick={() => handlePageChange(pageNum)}
															variant={currentPage === pageNum ? "default" : "outline"}
															size="sm"
															className="w-8 h-8 p-0"
														>
															{pageNum}
														</Button>
													);
												})}
											</div>
											
											<Button
												onClick={() => handlePageChange(currentPage + 1)}
												disabled={!pagination.hasNextPage}
												variant="outline"
												size="sm"
											>
												<span className="hidden sm:inline">Next</span>
												<ChevronRight className="w-4 h-4" />
											</Button>
										</div>
									</div>
								)}
							</>
						)}
					</CardContent>
				</Card>
			</div>
		</div>
	);
}
