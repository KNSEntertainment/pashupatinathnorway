"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, TrendingUp, Users, CheckCircle, Clock, XCircle } from "lucide-react";

interface Donation {
	_id: string;
	donorName: string;
	donorEmail: string;
	donorPhone?: string;
	amount: number;
	currency: string;
	message?: string;
	isAnonymous: boolean;
	paymentStatus: "pending" | "completed" | "failed" | "refunded";
	createdAt: string;
}

export default function DonationsManagement() {
	const [donations, setDonations] = useState<Donation[]>([]);
	const [loading, setLoading] = useState(true);
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
							<div className="w-12 h-12 bg-brand/10 rounded-full flex items-center justify-center">
								<DollarSign className="w-6 h-6 text-brand" />
							</div>
						</div>
					</CardContent>
				</Card>

				<Card className="border-0 shadow-lg">
					<CardContent className="pt-6">
						<div className="flex items-center justify-between">
							<div>
								<p className="text-sm text-gray-500 font-medium">Total Amount</p>
								<p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalAmount.toLocaleString()} NOK</p>
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

			{/* Donations Table */}
			<Card className="border-0 shadow-lg">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<Users className="w-5 h-5" />
						Recent Donations
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="overflow-x-auto">
						<table className="w-full">
							<thead>
								<tr className="border-b border-gray-200">
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Donor</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Email</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Amount</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Date</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Message</th>
								</tr>
							</thead>
							<tbody>
								{donations.length === 0 ? (
									<tr>
										<td colSpan={6} className="text-center py-8 text-gray-500">
											No donations yet
										</td>
									</tr>
								) : (
									donations.map((donation) => (
										<tr key={donation._id} className="border-b border-gray-100 hover:bg-light transition-colors">
											<td className="py-3 px-4">
												<p className="font-medium text-gray-900">{donation.isAnonymous ? "Anonymous" : donation.donorName}</p>
												{donation.donorPhone && <p className="text-xs text-gray-500">{donation.donorPhone}</p>}
											</td>
											<td className="py-3 px-4 text-sm text-gray-600">{donation.isAnonymous ? "Hidden" : donation.donorEmail}</td>
											<td className="py-3 px-4">
												<p className="font-bold text-gray-900">
													{donation.amount} {donation.currency}
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
