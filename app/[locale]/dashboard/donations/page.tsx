"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { DollarSign, TrendingUp, Users, CheckCircle, Clock, XCircle, Search } from "lucide-react";
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
	const [donations, setDonations] = useState<Donation[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState("");
	const [stats, setStats] = useState({
		total: 0,
		completed: 0,
		pending: 0,
		totalAmount: 0,
	});
	

	useEffect(() => {
		fetchDonations();
	}, []);

	const fetchDonations = async () => {
		try {
			const response = await fetch("/api/donations");
			const data = await response.json();
			setDonations(data);

			// Calculate stats
			const completed = data.filter((d: Donation) => d.paymentStatus === "completed");
			const pending = data.filter((d: Donation) => d.paymentStatus === "pending");
			const totalAmount = completed.reduce((sum: number, d: Donation) => sum + d.amount, 0);

			setStats({
				total: data.length,
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
	});


	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-brand"></div>
			</div>
		);
	}

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Donations Management</h1>
				<p className="text-gray-600 mt-2">Track and manage all donations</p>
			</div>

			{/* Stats Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-6">
				<Card className="border-0 shadow-lg">
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500 font-medium">Total Donations</p>
								<p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
							</div>
							<div className="w-12 h-12 bg-brand_primary/10 rounded-full flex items-center justify-center">
								<DollarSign className="w-6 h-6 text-brand_primary" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 shadow-lg">
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500 font-medium">Total Amount</p>
								<p className="text-3xl font-bold text-gray-900 mt-2">{formatNOK(stats.totalAmount)}</p>
							</div>
							<div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
								<TrendingUp className="w-6 h-6 text-success" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 shadow-lg">
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500 font-medium">Completed</p>
								<p className="text-3xl font-bold text-gray-900 mt-2">{stats.completed}</p>
							</div>
							<div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
								<CheckCircle className="w-6 h-6 text-success" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 shadow-lg">
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500 font-medium">Pending</p>
								<p className="text-3xl font-bold text-gray-900 mt-2">{stats.pending}</p>
							</div>
							<div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center">
								<Clock className="w-6 h-6 text-yellow-600" />
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

			{/* Donation Patterns Chart */}
			<DonationChart className="w-full" />

			{/* Donations Table */}
			<Card className="border-0 shadow-lg">
				<CardHeader>
					<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
						<CardTitle className="flex items-center gap-2">
							<Users className="w-5 h-5" />
							Recent Donations
						</CardTitle>
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
					</div>
				</CardHeader>
				<CardContent>
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
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Address</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Amount</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Date & Time</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Message</th>
								</tr>
							</thead>
							<tbody>
								{filteredDonations.length === 0 ? (
									<tr>
										<td colSpan={7} className="text-center py-8 text-gray-500">
											{searchTerm ? "No donations found matching your search" : "No donations yet"}
										</td>
									</tr>
								) : (
									filteredDonations.map((donation) => (
										<tr key={donation._id} className="border-b border-gray-100 hover:bg-light transition-colors">
											<td className="py-3 px-4">
												<p className="font-medium text-gray-900">{donation.isAnonymous ? "Anonymous" : donation.donorName}</p>
												{donation.donorPhone && <p className="text-xs text-gray-500">{donation.donorPhone}</p>}
											</td>
											<td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">{donation.address || "-"}</td>
											<td className="py-3 px-4">
												<p className="font-bold text-gray-900">
													{formatNOK(donation.amount)}
												</p>
											</td>
											<td className="py-3 px-4">{getStatusBadge(donation.paymentStatus)}</td>
											<td className="py-3 px-4 text-sm text-gray-600">{formatDate(donation.createdAt)}</td>
											<td className="py-3 px-4 text-sm text-gray-600 max-w-xs truncate">{donation.message || "-"}</td>
										</tr>
									))
								)}
							</tbody>
						</table>
					</div>
				</CardContent>
			</Card>
		</div>
	);
}
