import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "../../../../components/ui/progress";
import Link from "next/link";


interface Cause {
	_id: string;
	title: string;
	description: string;
	category: string;
	status: string;
	goalAmount: number;
	currentAmount: number;
	donationCount: number;
	featured: boolean;
	endDate?: string;
}

interface Donation {
	_id: string;
	createdAt: string;
	donorName: string;
	amount: number;
	isAnonymous: boolean;
	donationType: string;
	causeId?: {
		title?: string;
	};
}

interface ReportsData {
	causes: Cause[];
	donations: Donation[];
	totals: {
		totalAmount: number;
		totalDonations: number;
		causeTotals: Array<{
			causeId: string;
			title: string;
			amount: number;
			count: number;
		}>;
	};
}

export const metadata = {
	title: "Donation Reports - PNSB-Norway",
	description: "View donation reports and impact statistics",
};

async function getDonationReports(): Promise<ReportsData> {
	try {
		// Fetch causes with their current amounts
		const causesResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/causes?locale=en`, {
			cache: 'no-store'
		});
		const causesData = await causesResponse.json();
		
		// Fetch donations (we'll need to create this API endpoint)
		const donationsResponse = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/donations/reports`, {
			cache: 'no-store'
		});
		
		const defaultTotals = {
			totalAmount: 0,
			totalDonations: 0,
			causeTotals: []
		};
		
		let donationsData = { donations: [], totals: defaultTotals };
		if (donationsResponse.ok) {
			const responseData = await donationsResponse.json();
			donationsData = {
				donations: responseData.donations || [],
				totals: responseData.totals || defaultTotals
			};
		}

		return {
			causes: causesData.causes || [],
			donations: donationsData.donations || [],
			totals: donationsData.totals
		};
	} catch (error) {
		console.error("Error fetching donation reports:", error);
		return {
			causes: [],
			donations: [],
			totals: {
				totalAmount: 0,
				totalDonations: 0,
				causeTotals: []
			}
		};
	}
}

export default async function DonationReportsPage({ params }: { params: Promise<{ locale: string }> }) {
	const { locale } = await params;
	const { causes, donations } = await getDonationReports();

	// Calculate totals from causes
	const totalGoalAmount = causes.reduce((sum: number, cause: Cause) => sum + (cause.goalAmount || 0), 0);
	const totalCurrentAmount = causes.reduce((sum: number, cause: Cause) => sum + (cause.currentAmount || 0), 0);
	const totalDonations = donations.length;

	return (
		<div className="min-h-screen py-12 px-4">
			<div className="max-w-6xl mx-auto">
				{/* Header */}
				<header className="text-center mb-12">
					<h1 className="text-4xl font-bold text-gray-900 mb-4">Donation Reports</h1>
					<p className="text-lg text-gray-600 max-w-2xl mx-auto">
						Transparency in action - See how your generous donations are making a difference in our community
					</p>
				</header>

				{/* Overall Statistics */}
				<div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-gray-600">Total Raised</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-brand">
								{totalCurrentAmount.toLocaleString()} NOK
							</div>
							<p className="text-xs text-gray-500 mt-1">Across all causes</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-gray-600">Total Goal</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-gray-900">
								{totalGoalAmount.toLocaleString()} NOK
							</div>
							<p className="text-xs text-gray-500 mt-1">Combined target</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-gray-600">Total Donations</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-gray-900">
								{totalDonations}
							</div>
							<p className="text-xs text-gray-500 mt-1">Generous contributions</p>
						</CardContent>
					</Card>

					<Card>
						<CardHeader className="pb-3">
							<CardTitle className="text-sm font-medium text-gray-600">Active Causes</CardTitle>
						</CardHeader>
						<CardContent>
							<div className="text-2xl font-bold text-gray-900">
								{causes.filter(cause => cause.status === 'active').length}
							</div>
							<p className="text-xs text-gray-500 mt-1">Currently running</p>
						</CardContent>
					</Card>
				</div>

				{/* Cause-wise Reports */}
				<div className="mb-12">
					<h2 className="text-2xl font-bold text-gray-900 mb-6">Cause-wise Donations</h2>
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
						{causes.length === 0 ? (
							<Card>
								<CardContent className="text-center py-8">
									<p className="text-gray-500">No active causes at the moment</p>
								</CardContent>
							</Card>
						) : (
							causes.map((cause: Cause) => {
								const progressPercentage = cause.goalAmount > 0 
									? Math.min((cause.currentAmount / cause.goalAmount) * 100, 100) 
									: 0;
								
								return (
									<Card key={cause._id}>
										<CardHeader>
											<div className="flex justify-between items-start">
												<div>
													<CardTitle className="text-lg">{cause.title}</CardTitle>
													<div className="flex gap-2 mt-2">
														<Badge className={
															cause.status === 'active' ? 'bg-green-500' :
															cause.status === 'completed' ? 'bg-blue-500' :
															cause.status === 'paused' ? 'bg-yellow-500' :
															'bg-red-500'
														}>
															{cause.status}
														</Badge>
														<Badge variant="outline">{cause.category}</Badge>
														{cause.featured && (
															<Badge className="bg-purple-500 text-white">Featured</Badge>
														)}
													</div>
												</div>
											</div>
										</CardHeader>
										<CardContent>
											<p className="text-gray-600 mb-4 line-clamp-2">{cause.description}</p>
											
											<div className="space-y-3">
												<div className="flex justify-between text-sm">
													<span>Progress:</span>
													<span className="font-semibold">
														{cause.currentAmount?.toLocaleString() || 0} / {cause.goalAmount?.toLocaleString() || 0} NOK
													</span>
												</div>
												<Progress value={progressPercentage} className="h-2" />
												<div className="flex justify-between text-sm text-gray-500">
													<span>{progressPercentage.toFixed(1)}% complete</span>
													<span>{cause.donationCount || 0} donations</span>
												</div>
											</div>
											
											{cause.endDate && (
												<p className="text-sm text-gray-500 mt-3">
													Ends: {new Date(cause.endDate).toLocaleDateString('en-US')}
												</p>
											)}
										</CardContent>
									</Card>
								);
							})
						)}
					</div>
				</div>

				{/* Recent Donations */}
				<div className="mb-12">
					<h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Donations</h2>
					<Card>
						<CardContent className="p-0">
							{donations.length === 0 ? (
								<div className="text-center py-8">
									<p className="text-gray-500">No donations recorded yet</p>
								</div>
							) : (
								<div className="overflow-x-auto">
									<table className="w-full">
										<thead className="bg-gray-50 border-b">
											<tr>
												<th className="text-left p-4 font-medium text-gray-900">Date</th>
												<th className="text-left p-4 font-medium text-gray-900">Donor</th>
												<th className="text-left p-4 font-medium text-gray-900">Amount</th>
												<th className="text-left p-4 font-medium text-gray-900">Type</th>
												<th className="text-left p-4 font-medium text-gray-900">Cause</th>
											</tr>
										</thead>
										<tbody>
											{donations.slice(0, 10).map((donation: Donation, index: number) => (
												<tr key={donation._id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
													<td className="p-4 text-sm text-gray-900">
														{new Date(donation.createdAt).toLocaleDateString('en-US')}
													</td>
													<td className="p-4 text-sm text-gray-900">
														{donation.isAnonymous ? 'Anonymous' : donation.donorName}
													</td>
													<td className="p-4 text-sm font-medium text-gray-900">
														{donation.amount?.toLocaleString()} NOK
													</td>
													<td className="p-4 text-sm text-gray-900">
														<Badge variant={donation.donationType === 'general' ? 'default' : 'secondary'}>
															{donation.donationType === 'general' ? 'General' : 'Cause-specific'}
														</Badge>
													</td>
													<td className="p-4 text-sm text-gray-900">
														{donation.causeId ? donation.causeId?.title || 'Cause' : 'General'}
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

				{/* Call to Action */}
				<div className="text-center bg-gradient-to-r from-brand to-blue-700 rounded-lg p-8 text-white">
					<h2 className="text-2xl font-bold mb-4">Make a Difference Today</h2>
					<p className="text-white/90 mb-6 max-w-2xl mx-auto">
						Your generous donation helps us continue supporting those in need in both Norway and Nepal. 
						Every contribution, no matter the size, makes a meaningful impact.
					</p>
					<Link href={`/${locale}/donate`}>
						<button className="bg-white text-brand px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
							Donate Now
						</button>
					</Link>
				</div>
			</div>
		</div>
	);
}
