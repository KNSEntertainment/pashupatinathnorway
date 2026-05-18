"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Users, CheckCircle, Clock, XCircle, Search, Upload, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import { formatNOK } from "@/lib/norwegianCurrency";
import DonationChart from "@/components/DonationChart";

interface Donation {
	_id: string;
	donorName: string;
	donorEmail: string;
	donorPhone?: string;
	amount: number;
	currency: string;
	message?: string;
	address?:string;
	isAnonymous: boolean;
	paymentStatus: "pending" | "completed" | "failed" | "refunded";
	createdAt: string;
}

export default function DonationsManagement() {
	const router = useRouter();
	const [donations, setDonations] = useState<Donation[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [currentPage, setCurrentPage] = useState(1);
	const itemsPerPage = 10;
	const [editingDonation, setEditingDonation] = useState<Donation | null>(null);
	const [isEditModalOpen, setIsEditModalOpen] = useState(false);
	const [stats, setStats] = useState({
		total: 0,
		completed: 0,
		pending: 0,
		totalAmount: 0,
	});
	

	useEffect(() => {
		fetchDonations(currentPage, itemsPerPage);
	}, [currentPage, itemsPerPage]);

	const fetchDonations = async (page: number = 1, limit: number = 10) => {
		try {
			const response = await fetch(`/api/donations?page=${page}&limit=${limit}`);
			const data = await response.json();
			setDonations(data.donations || data);

			// Calculate stats from all donations
			const allDonations = data.donations || data;
			const completed = allDonations.filter((d: Donation) => d.paymentStatus === "completed");
			const pending = allDonations.filter((d: Donation) => d.paymentStatus === "pending");
			const totalAmount = completed.reduce((sum: number, d: Donation) => sum + d.amount, 0);

			setStats({
				total: allDonations.length,
				completed: completed.length,
				pending: pending.length,
				totalAmount,
			});
		} catch (error) {
			console.error("Error fetching donations:", error);
		} finally {
			setLoading(false);
		}
	};

	const getStatusBadge = (status: string) => {
		switch (status) {
			case "completed":
				return (
					<Badge className="bg-success text-white">
						<CheckCircle className="w-3 h-3 mr-1" />
						Completed
					</Badge>
				);
			case "pending":
				return (
					<Badge className="bg-yellow-500 text-white">
						<Clock className="w-3 h-3 mr-1" />
						Pending
					</Badge>
				);
			case "failed":
				return (
					<Badge className="bg-red-500 text-white">
						<XCircle className="w-3 h-3 mr-1" />
						Failed
					</Badge>
				);
			case "refunded":
				return (
					<Badge className="bg-gray-500 text-white">
						<XCircle className="w-3 h-3 mr-1" />
						Refunded
					</Badge>
				);
			default:
				return <Badge>{status}</Badge>;
		}
	};

	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const handleEditDonation = (donation: Donation) => {
		setEditingDonation(donation);
		setIsEditModalOpen(true);
	};

	const handleCloseEditModal = () => {
		setIsEditModalOpen(false);
		setEditingDonation(null);
	};

	const handleSaveDonation = async (updatedDonation: Partial<Donation>) => {
		if (!editingDonation) return;

		try {
			const response = await fetch(`/api/donations/${editingDonation._id}`, {
				method: 'PUT',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify(updatedDonation),
			});

			if (response.ok) {
				// Refresh donations list
				fetchDonations(currentPage, itemsPerPage);
				handleCloseEditModal();
			} else {
				console.error('Failed to update donation');
			}
		} catch (error) {
			console.error('Error updating donation:', error);
		}
	};

	// Filter donations based on search term
	const filteredDonations = donations.filter((donation) => {
		const searchLower = searchTerm.toLowerCase();
		const donorName = donation.isAnonymous ? "anonymous" : donation.donorName.toLowerCase();
		const donorEmail = donation.donorEmail.toLowerCase();
		const message = donation.message?.toLowerCase() || "";
		const donorPhone = donation.donorPhone?.toLowerCase() || "";
		const address = donation.address?.toLowerCase() || "";

		return (
			donorName.includes(searchLower) ||
			donorEmail.includes(searchLower) ||
			message.includes(searchLower) ||
			donorPhone.includes(searchLower) ||
			address.includes(searchLower)
		);
	}).sort((a, b) => b.amount - a.amount); // Sort by highest amount first

	// Pagination logic
	const totalPages = Math.ceil(filteredDonations.length / itemsPerPage);
	const startIndex = (currentPage - 1) * itemsPerPage;
	const endIndex = startIndex + itemsPerPage;
	const paginatedDonations = filteredDonations.slice(startIndex, endIndex);

	// Reset to page 1 when search term changes
	useEffect(() => {
		setCurrentPage(1);
	}, [searchTerm]);


	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			{/* Header with Total Donation */}
			<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Donations Management</h1>
					<p className="text-gray-600 mt-2">Track and manage all donations</p>
				</div>
				{/* Total Donation Display */}
				<div className="text-right">
					<p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Total Donations till Date</p>
					<p className="text-4xl md:text-5xl font-bold text-green-700 mt-1">{formatNOK(stats.totalAmount)}</p>
					<p className="text-sm text-gray-600 mt-1">From {stats.total} donors</p>
				</div>
			</div>


		
			{/* Donations Table */}
			<Card className="border-0 shadow-lg">
				<CardHeader>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<CardTitle className="flex items-center gap-2">
							<Users className="w-5 h-5" />
							 Donations Record
						</CardTitle>
						<div className="flex flex-col sm:flex-row gap-4">
							<div className="relative">
								<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
								<Input
									type="text"
									placeholder="Search donations..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									className="pl-10 w-full sm:w-64"
								/>
							</div>
							<Button
								onClick={() => router.push('donations/bulk-upload')}
								variant="outline"
								size="sm"
								className="whitespace-nowrap"
							>
								<Upload className="w-4 h-4 mr-1" />
								Bulk Upload
							</Button>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{/* Pagination Controls - Top */}
					{totalPages > 1 && (
						<div className="flex items-center justify-between mb-4">
							<div className="text-sm text-gray-600">
								Showing {startIndex + 1} to {Math.min(endIndex, filteredDonations.length)} of {filteredDonations.length} donations
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
									disabled={currentPage === 1}
								>
									<ChevronLeft className="w-4 h-4" />
									Previous
								</Button>
								
								<div className="flex items-center gap-1">
									{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
										<Button
											key={page}
											variant={currentPage === page ? "default" : "outline"}
											size="sm"
											onClick={() => setCurrentPage(page)}
											className="w-8 h-8 p-0"
										>
											{page}
										</Button>
									))}
								</div>
								
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
									disabled={currentPage === totalPages}
								>
									Next
									<ChevronRight className="w-4 h-4" />
								</Button>
							</div>
						</div>
					)}
					{searchTerm && (
						<div className="mb-4 text-sm text-gray-600">
							Found {filteredDonations.length} donation{filteredDonations.length !== 1 ? 's' : ''} matching &quot;{searchTerm}&quot;
						</div>
					)}
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-gray-200">
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Donor</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Amount ↓</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Message</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Actions</th>
								</tr>
							</thead>
							<tbody>
								{paginatedDonations.length === 0 ? (
									<tr>
										<td colSpan={5} className="text-center py-8 text-gray-500">
											{searchTerm ? "No donations found matching your search" : "No donations yet"}
										</td>
									</tr>
								) : (
									paginatedDonations.map((donation) => (
										<tr key={donation._id} className="border-b border-gray-100 hover:bg-light transition-colors">
											<td className="py-3 px-4">
												<div className="space-y-1">
													<p className="font-medium text-gray-900">{donation.isAnonymous ? "Anonymous" : donation.donorName}</p>
													<div className="text-xs text-gray-500 space-y-1">
														{donation.donorPhone && <p>📱 {donation.donorPhone}</p>}
														{donation.address && <p>📍 {donation.address}</p>}
														<p>🕒 {formatDate(donation.createdAt)}</p>
														{donation.donorEmail && <p>✉️ {donation.donorEmail}</p>}
													</div>
												</div>
											</td>
											<td className="py-3 px-4">
												<p className="font-bold text-gray-900">
													{formatNOK(donation.amount)}
												</p>
											</td>
											<td className="py-3 px-4">{getStatusBadge(donation.paymentStatus)}</td>
											<td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">{donation.message || "-"}</td>
											<td className="py-3 px-4">
												<Button
													variant="outline"
													size="sm"
													onClick={() => handleEditDonation(donation)}
													className="flex items-center gap-1"
												>
													<Edit className="w-4 h-4" />
													Edit
												</Button>
											</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
					
					{/* Pagination Controls */}
					{totalPages > 1 && (
						<div className="flex items-center justify-between mt-4">
							<div className="text-sm text-gray-600">
								Showing {startIndex + 1} to {Math.min(endIndex, filteredDonations.length)} of {filteredDonations.length} donations
							</div>
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
									disabled={currentPage === 1}
								>
									<ChevronLeft className="w-4 h-4" />
									Previous
								</Button>
								
								<div className="flex items-center gap-1">
									{Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
										<Button
											key={page}
											variant={currentPage === page ? "default" : "outline"}
											size="sm"
											onClick={() => setCurrentPage(page)}
											className="w-8 h-8 p-0"
										>
											{page}
										</Button>
									))}
								</div>
								
								<Button
									variant="outline"
									size="sm"
									onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
									disabled={currentPage === totalPages}
								>
									Next
									<ChevronRight className="w-4 h-4" />
								</Button>
							</div>
						</div>
					)}
				</CardContent>
			</Card>
				{/* Donation Patterns Chart */}
			<DonationChart className="w-full" />

			{/* Edit Donation Modal */}
			{isEditModalOpen && editingDonation && (
				<div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
					<div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
						<div className="flex justify-between items-center mb-6">
							<h2 className="text-xl font-bold text-gray-900">Edit Donation</h2>
							<Button
								variant="ghost"
								size="sm"
								onClick={handleCloseEditModal}
							>
								✕
							</Button>
						</div>

						<div className="space-y-4">
							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Donor Name</label>
									<Input
										defaultValue={editingDonation.donorName}
										onChange={(e) => setEditingDonation({...editingDonation, donorName: e.target.value})}
										placeholder="Enter donor name"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Donor Email</label>
									<Input
										defaultValue={editingDonation.donorEmail}
										onChange={(e) => setEditingDonation({...editingDonation, donorEmail: e.target.value})}
										placeholder="Enter donor email"
									/>
								</div>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Donor Phone</label>
									<Input
										defaultValue={editingDonation.donorPhone || ""}
										onChange={(e) => setEditingDonation({...editingDonation, donorPhone: e.target.value})}
										placeholder="Enter donor phone"
									/>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Amount (NOK)</label>
									<Input
										type="number"
										defaultValue={editingDonation.amount}
										onChange={(e) => setEditingDonation({...editingDonation, amount: parseInt(e.target.value) || 0})}
										placeholder="Enter amount"
									/>
								</div>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
								<Input
									defaultValue={editingDonation.address || ""}
									onChange={(e) => setEditingDonation({...editingDonation, address: e.target.value})}
									placeholder="Enter donor address"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
								<textarea
									defaultValue={editingDonation.message || ""}
									onChange={(e) => setEditingDonation({...editingDonation, message: e.target.value})}
									placeholder="Enter donation message"
									className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand_primary"
									rows={3}
								/>
							</div>

							<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Payment Status</label>
									<select
										defaultValue={editingDonation.paymentStatus}
										onChange={(e) => setEditingDonation({...editingDonation, paymentStatus: e.target.value as 'pending' | 'completed' | 'failed' | 'refunded'})}
										className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand_primary"
									>
										<option value="pending">Pending</option>
										<option value="completed">Completed</option>
										<option value="failed">Failed</option>
										<option value="refunded">Refunded</option>
									</select>
								</div>
								<div>
									<label className="block text-sm font-medium text-gray-700 mb-1">Anonymous</label>
									<div className="flex items-center gap-2 mt-3">
										<input
											type="checkbox"
											defaultChecked={editingDonation.isAnonymous}
											onChange={(e) => setEditingDonation({...editingDonation, isAnonymous: e.target.checked})}
											className="w-4 h-4 text-brand_primary border-gray-300 rounded focus:ring-brand_primary"
										/>
										<label className="text-sm text-gray-700">Hide donor name</label>
									</div>
								</div>
							</div>
						</div>

						<div className="flex justify-end gap-3 mt-6">
							<Button
								variant="outline"
								onClick={handleCloseEditModal}
							>
								Cancel
							</Button>
							<Button
								onClick={() => handleSaveDonation(editingDonation)}
								className="bg-brand_secondary/80 text-white hover:bg-brand_secondary"
							>
								Save Changes
							</Button>
						</div>
					</div>
				</div>
			)}

		</div>
	);
}
