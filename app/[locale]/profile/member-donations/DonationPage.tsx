"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { useParams } from "next/navigation";
import { toast } from "@/hooks/use-toast";
import DonationForm from "@/components/DonationForm";
import { formatNOK } from "@/lib/norwegianCurrency";

interface UserDonation {
	_id: string;
	amount: number;
	currency: string;
	message?: string;
	isAnonymous: boolean;
	paymentStatus: "pending" | "completed" | "failed" | "refunded";
	createdAt: string;
	causeId?: string; // Just the ObjectId since populate is removed
}

interface DonationStats {
	totalDonated: number;
	donationCount: number;
	thisYear: number;
	thisMonth: number;
}


export default function MemberDonationPage() {
	const params = useParams();
	const locale = params.locale as string;
	const [userDonations, setUserDonations] = useState<UserDonation[]>([]);
	const [stats, setStats] = useState<DonationStats>({
		totalDonated: 0,
		donationCount: 0,
		thisYear: 0,
		thisMonth: 0,
	});
	const [loading, setLoading] = useState(true);
	const [showDonationForm, setShowDonationForm] = useState(false);
	const [, setUserPersonalNumber] = useState<string | null>(null);

	useEffect(() => {
		fetchUserDonations();
	}, []);

	const fetchUserDonations = async () => {
		try {
			console.log("=== FRONTEND: FETCHING USER DONATIONS ===");
			const response = await fetch(`/api/donations/user`);
			console.log("Response status:", response.status);
			
			if (response.ok) {
				const data = await response.json();
				console.log("=== FRONTEND: API RESPONSE ===");
				console.log("Full data:", data);
				console.log("Donations array:", data.donations);
				console.log("Donations length:", data.donations?.length);
				console.log("Stats:", data.stats);
				console.log("Personal number:", data.personalNumber);
				
				setUserDonations(data.donations || []);
				setStats(data.stats || {
					totalDonated: 0,
					donationCount: 0,
					thisYear: 0,
					thisMonth: 0,
				});
				setUserPersonalNumber(data.personalNumber || null);
			} else {
				console.log("Response not ok:", response.status);
			}
		} catch (error) {
			console.error("Error fetching user donations:", error);
			toast({
				title: "Error",
				description: "Failed to load donation history",
				variant: "destructive",
			});
		} finally {
			setLoading(false);
		}
	};

	const handleDonationSuccess = () => {
		setShowDonationForm(false);
		fetchUserDonations();
		toast({
			title: "Thank You!",
			description: "Your donation has been processed successfully.",
		});
	};


	const formatDate = (dateString: string) => {
		return new Date(dateString).toLocaleDateString("en-US", {
			year: "numeric",
			month: "short",
			day: "numeric",
		});
	};

	const getStatusColor = (status: string) => {
		switch (status) {
			case "completed":
				return "bg-green-100 text-green-800";
			case "pending":
				return "bg-yellow-100 text-yellow-800";
			case "failed":
				return "bg-red-100 text-red-800";
			case "refunded":
				return "bg-gray-100 text-gray-800";
			default:
				return "bg-gray-100 text-gray-800";
		}
	};

	// Debug: Log donations state changes
	useEffect(() => {
		console.log("=== DONATIONS STATE CHANGED ===");
		console.log("Current userDonations:", userDonations);
		console.log("Donations length:", userDonations.length);
		console.log("Current stats:", stats);
	}, [userDonations, stats]);

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-64">
				<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
			</div>
		);
	}

	console.log("=== RENDERING DONATION PAGE ===");
	console.log("Loading:", loading);
	console.log("User donations length:", userDonations.length);
	console.log("Stats:", stats);

	return (
		<div className="space-y-6">
			{/* Header */}
			<div className="mb-8">
				<h1 className="text-3xl font-bold text-gray-900 mb-2">Donations</h1>
				<p className="text-gray-600">Support our temple and community initiatives</p>
			</div>


			{/* Donation Stats */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
				<Card>
					<CardContent className="p-6">
						<div className="flex items-center">
							<DollarSign className="h-8 w-8 text-blue-600" />
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Total Donated</p>
								<p className="text-2xl font-bold text-gray-900">{formatNOK(stats.totalDonated)}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center">
							<Heart className="h-8 w-8 text-red-600" />
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">Donations</p>
								<p className="text-2xl font-bold text-gray-900">{stats.donationCount}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center">
							<TrendingUp className="h-8 w-8 text-green-600" />
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">This Year</p>
								<p className="text-2xl font-bold text-gray-900">{formatNOK(stats.thisYear)}</p>
							</div>
						</div>
					</CardContent>
				</Card>

				<Card>
					<CardContent className="p-6">
						<div className="flex items-center">
							<Calendar className="h-8 w-8 text-purple-600" />
							<div className="ml-4">
								<p className="text-sm font-medium text-gray-600">This Month</p>
								<p className="text-2xl font-bold text-gray-900">{formatNOK(stats.thisMonth)}</p>
							</div>
						</div>
					</CardContent>
				</Card>
			</div>

		<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
				
			{/* Make a Donation Section */}
			<Card className="col-span-2">
				<CardHeader>
					<CardTitle className="flex items-center">
						<Heart className="mr-2 h-5 w-5 text-red-600" />
						Make a Donation
					</CardTitle>
					<CardDescription>
						Support our temple&apos;s activities and community services
					</CardDescription>
				</CardHeader>
				<CardContent>
					{!showDonationForm ? (
						<div className="text-center py-8">
							<Heart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
							<h3 className="text-lg font-semibold text-gray-900 mb-2">Ready to Make a Difference?</h3>
							<p className="text-gray-600 mb-4">
								Your generous contributions help us maintain our temple and serve the community.
							</p>
							<Button onClick={() => setShowDonationForm(true)} className="bg-red-600 hover:bg-red-700">
								<Heart className="mr-2 h-4 w-4" />
								Make a Donation
							</Button>
						</div>
					) : (
						<DonationForm onDonationSuccess={handleDonationSuccess} locale={locale} />
					)}
				</CardContent>
			</Card>

			{/* Donation History */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<Calendar className="mr-2 h-5 w-5 text-blue-600" />
						Donation History
					</CardTitle>
					<CardDescription>
						Your previous donations and their status
					</CardDescription>
				</CardHeader>
				<CardContent>
					{userDonations.length === 0 ? (
						<div className="text-center py-8">
							<Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
							<h3 className="text-lg font-semibold text-gray-900 mb-2">No Donations Yet</h3>
							<p className="text-gray-600">
								Your donation history will appear here once you make your first donation.
							</p>
						</div>
					) : (
						<div className="space-y-4">
							{userDonations.map((donation) => (
								<div key={donation._id} className="border rounded-lg p-4">
									<div className="flex items-center justify-between mb-2">
										<div className="flex items-center space-x-3">
											<Heart className="h-5 w-5 text-red-600" />
											<div>
												<p className="font-semibold text-gray-900">
													{formatNOK(donation.amount)}
												</p>
											</div>
										</div>
										<Badge className={getStatusColor(donation.paymentStatus)}>
											{donation.paymentStatus.charAt(0).toUpperCase() + donation.paymentStatus.slice(1)}
										</Badge>
									</div>
									<div className="flex items-center justify-between text-sm text-gray-600">
										<p>{formatDate(donation.createdAt)}</p>
										{donation.isAnonymous && <Badge variant="outline">Anonymous</Badge>}
									</div>
									{donation.message && (
										<p className="mt-2 text-sm text-gray-700 italic">{donation.message}</p>
									)}
								</div>
							))}
						</div>
					)}
				</CardContent>
			</Card>
		</div>
		</div>
	);
}
