"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, TrendingUp, Calendar, DollarSign, Search, User, FileText, Download } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { formatNOK } from "@/lib/norwegianCurrency";

interface UserDonation {
	_id: string;
	amount: number;
	currency: string;
	message?: string;
	isAnonymous: boolean;
	paymentStatus: "pending" | "completed" | "failed" | "refunded";
	createdAt: string;
	causeId?: string;
	donationType: string;
}

interface DonationStats {
	totalDonated: number;
	donationCount: number;
	thisYear: number;
	thisMonth: number;
}

interface MemberInfo {
	name: string;
	email: string;
	membershipStatus: string;
}

interface PersonalNumberLookupProps {
	onMemberFound?: (memberInfo: MemberInfo, donations: UserDonation[], stats: DonationStats) => void;
}

export default function PersonalNumberLookup({ onMemberFound }: PersonalNumberLookupProps) {
	const [personalNumber, setPersonalNumber] = useState("");
	const [lookupLoading, setLookupLoading] = useState(false);
	const [showResults, setShowResults] = useState(false);
	const [memberDonations, setMemberDonations] = useState<UserDonation[]>([]);
	const [memberStats, setMemberStats] = useState<DonationStats>({
		totalDonated: 0,
		donationCount: 0,
		thisYear: 0,
		thisMonth: 0,
	});
	const [memberInfo, setMemberInfo] = useState<MemberInfo | null>(null);
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
	const [taxReportLoading, setTaxReportLoading] = useState(false);

	const handlePersonalNumberChange = (value: string) => {
		// Only allow digits and limit to 11 characters
		const cleanValue = value.replace(/\D/g, '').slice(0, 11);
		setPersonalNumber(cleanValue);
	};

	const lookupMemberDonations = async () => {
		if (!personalNumber || personalNumber.length !== 11) {
			toast({
				title: "Invalid Input",
				description: "Please enter a valid 11-digit personal number",
				variant: "destructive",
			});
			return;
		}

		setLookupLoading(true);
		try {
			const response = await fetch("/api/donations/lookup", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ personalNumber }),
			});

			if (response.ok) {
				const data = await response.json();
				setMemberInfo(data.member);
				setMemberDonations(data.donations);
				setMemberStats(data.stats);
				setShowResults(true);
				
				// Callback to parent component if provided
				if (onMemberFound) {
					onMemberFound(data.member, data.donations, data.stats);
				}
				
				toast({
					title: "Success",
					description: `Found ${data.donations.length} donations for ${data.member.name}`,
				});
			} else {
				const errorData = await response.json();
				toast({
					title: "Lookup Failed",
					description: errorData.error || "Failed to lookup donations",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error looking up member donations:", error);
			toast({
				title: "Error",
				description: "Failed to lookup donations",
				variant: "destructive",
			});
		} finally {
			setLookupLoading(false);
		}
	};

	const generateTaxReport = async () => {
		if (!personalNumber || personalNumber.length !== 11) {
			toast({
				title: "Invalid Input",
				description: "Please enter a valid 11-digit personal number",
				variant: "destructive",
			});
			return;
		}

		setTaxReportLoading(true);
		try {
			const response = await fetch("/api/donations/tax-report", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ personalNumber, year: selectedYear }),
			});

			if (response.ok) {
				const data = await response.json();
				
				// Create and download the tax report as a text file
				const reportContent = generateTaxReportText(data.taxReport);
				const blob = new Blob([reportContent], { type: 'text/plain' });
				const url = window.URL.createObjectURL(blob);
				const a = document.createElement('a');
				a.href = url;
				a.download = `tax-donation-report-${selectedYear}-${data.taxReport.member.name.replace(/\s+/g, '-').toLowerCase()}.txt`;
				document.body.appendChild(a);
				a.click();
				window.URL.revokeObjectURL(url);
				document.body.removeChild(a);

				toast({
					title: "Tax Report Generated",
					description: `Tax report for ${selectedYear} has been downloaded`,
				});
			} else {
				const errorData = await response.json();
				toast({
					title: "Report Generation Failed",
					description: errorData.error || "Failed to generate tax report",
					variant: "destructive",
				});
			}
		} catch (error) {
			console.error("Error generating tax report:", error);
			toast({
				title: "Error",
				description: "Failed to generate tax report",
				variant: "destructive",
			});
		} finally {
			setTaxReportLoading(false);
		}
	};

	const generateTaxReportText = (taxReport: {
		member: {
			name: string;
			personalNumber: string;
			email: string;
			address: string;
			membershipStatus: string;
		};
		report: {
			year: number;
			generatedAt: string;
			totalDonated: number;
			donationCount: number;
			donations: Array<{
				date: string;
				amount: number;
				donationType: string;
				message?: string;
				isAnonymous: boolean;
			}>;
		};
		summary: {
			averageDonation: number;
			largestDonation: number;
			smallestDonation: number;
			firstDonationDate?: string;
			lastDonationDate?: string;
		};
	}) => {
		const { member, report, summary } = taxReport;
		
		let content = `TAX DONATION REPORT - ${report.year}\n`;
		content += `Generated on: ${new Date(report.generatedAt).toLocaleDateString('en-US', { 
			year: 'numeric', 
			month: 'long', 
			day: 'numeric' 
		})}\n`;
		content += `${'='.repeat(60)}\n\n`;
		
		content += `MEMBER INFORMATION:\n`;
		content += `Name: ${member.name}\n`;
		content += `Personal Number: ${member.personalNumber}\n`;
		content += `Email: ${member.email}\n`;
		content += `Address: ${member.address}\n`;
		content += `Membership Status: ${member.membershipStatus}\n\n`;
		
		content += `DONATION SUMMARY:\n`;
		content += `Total Donated: ${formatNOK(report.totalDonated)}\n`;
		content += `Number of Donations: ${report.donationCount}\n`;
		content += `Average Donation: ${formatNOK(summary.averageDonation)}\n`;
		content += `Largest Donation: ${formatNOK(summary.largestDonation)}\n`;
		content += `Smallest Donation: ${formatNOK(summary.smallestDonation)}\n`;
		if (summary.firstDonationDate) {
			content += `First Donation: ${new Date(summary.firstDonationDate).toLocaleDateString('en-US')}\n`;
		}
		if (summary.lastDonationDate) {
			content += `Last Donation: ${new Date(summary.lastDonationDate).toLocaleDateString('en-US')}\n`;
		}
		content += `\n`;
		
		if (report.donations.length > 0) {
			content += `DETAILED DONATION HISTORY:\n`;
			content += `${'-'.repeat(60)}\n`;
			report.donations.forEach((donation: {
				date: string;
				amount: number;
				donationType: string;
				message?: string;
				isAnonymous: boolean;
			}, index: number) => {
				content += `${index + 1}. Date: ${new Date(donation.date).toLocaleDateString('en-US')}\n`;
				content += `   Amount: ${formatNOK(donation.amount)}\n`;
				content += `   Type: ${donation.donationType}\n`;
				if (donation.message) {
					content += `   Message: "${donation.message}"\n`;
				}
				content += `   Anonymous: ${donation.isAnonymous ? 'Yes' : 'No'}\n\n`;
			});
		}
		
		content += `\n${'='.repeat(60)}\n`;
		content += `This report is generated for tax purposes and contains all completed\n`;
		content += `donations made by ${member.name} during the year ${report.year}.\n`;
		content += `For any questions, please contact Pashupatinath Norway Temple administration.\n`;
		
		return content;
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

	return (
		<div className="space-y-6">
			{/* Personal Number Lookup Section */}
			<Card>
				<CardHeader>
					<CardTitle className="flex items-center">
						<Search className="mr-2 h-5 w-5 text-blue-600" />
						Lookup Member Donations
					</CardTitle>
					<CardDescription>
						Search for donations made by a member using their personal identification number
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="space-y-4">
						<div className="flex gap-4">
							<div className="flex-1">
								<input
									type="text"
									value={personalNumber}
									onChange={(e) => handlePersonalNumberChange(e.target.value)}
									maxLength={11}
									placeholder="Enter 11-digit personal number"
									className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-blue-600 focus:outline-none"
								/>
								<p className="text-xs text-gray-500 mt-1">
									Enter the member&apos;s 11-digit personal identification number to view their donation history
								</p>
							</div>
							<Button 
								onClick={lookupMemberDonations} 
								disabled={lookupLoading || personalNumber.length !== 11}
								className="bg-blue-600 hover:bg-blue-700"
							>
								{lookupLoading ? (
									<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
								) : (
									<Search className="mr-2 h-4 w-4" />
								)}
								Search
							</Button>
						</div>
					</div>
				</CardContent>
			</Card>

			{/* Member Lookup Results */}
			{showResults && memberInfo && (
				<Card>
					<CardHeader>
						<CardTitle className="flex items-center">
							<User className="mr-2 h-5 w-5 text-green-600" />
							Donation Summary for {memberInfo.name}
						</CardTitle>
						<CardDescription>
							{memberInfo.email} • Status: <Badge variant="outline">{memberInfo.membershipStatus}</Badge>
						</CardDescription>
					</CardHeader>
					<CardContent>
						{/* Member Stats */}
						<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
							<Card>
								<CardContent className="p-4">
									<div className="flex items-center">
										<DollarSign className="h-6 w-6 text-blue-600" />
										<div className="ml-3">
											<p className="text-xs font-medium text-gray-600">Total Donated</p>
											<p className="text-xl font-bold text-gray-900">{formatNOK(memberStats.totalDonated)}</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-4">
									<div className="flex items-center">
										<Heart className="h-6 w-6 text-red-600" />
										<div className="ml-3">
											<p className="text-xs font-medium text-gray-600">Donations</p>
											<p className="text-xl font-bold text-gray-900">{memberStats.donationCount}</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-4">
									<div className="flex items-center">
										<TrendingUp className="h-6 w-6 text-green-600" />
										<div className="ml-3">
											<p className="text-xs font-medium text-gray-600">This Year</p>
											<p className="text-xl font-bold text-gray-900">{formatNOK(memberStats.thisYear)}</p>
										</div>
									</div>
								</CardContent>
							</Card>

							<Card>
								<CardContent className="p-4">
									<div className="flex items-center">
										<Calendar className="h-6 w-6 text-purple-600" />
										<div className="ml-3">
											<p className="text-xs font-medium text-gray-600">This Month</p>
											<p className="text-xl font-bold text-gray-900">{formatNOK(memberStats.thisMonth)}</p>
										</div>
									</div>
								</CardContent>
							</Card>
						</div>

						{/* Tax Report Generation */}
						<div className="border-t pt-4 mt-6">
							<div className="flex items-center justify-between mb-4">
								<div>
									<h4 className="font-semibold text-gray-900 flex items-center">
										<FileText className="mr-2 h-4 w-4 text-green-600" />
										Tax Report
									</h4>
									<p className="text-sm text-gray-600">Generate annual donation summary for tax purposes</p>
								</div>
								<div className="flex items-center gap-3">
									<select
										value={selectedYear}
										onChange={(e) => setSelectedYear(parseInt(e.target.value))}
										className="px-3 py-2 border border-gray-300 rounded-lg focus:border-green-600 focus:outline-none"
									>
										{Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i).map(year => (
											<option key={year} value={year}>{year}</option>
										))}
									</select>
									<Button 
										onClick={generateTaxReport} 
										disabled={taxReportLoading}
										className="bg-green-600 hover:bg-green-700"
									>
										{taxReportLoading ? (
											<div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
										) : (
											<Download className="mr-2 h-4 w-4" />
										)}
										Download Report
									</Button>
								</div>
							</div>
						</div>

						{/* Member Donation History */}
						<div className="space-y-3">
							<h4 className="font-semibold text-gray-900">Donation History</h4>
							{memberDonations.length === 0 ? (
								<div className="text-center py-6 border rounded-lg">
									<Heart className="mx-auto h-8 w-8 text-gray-400 mb-2" />
									<p className="text-gray-600">No donations found for this member</p>
								</div>
							) : (
								memberDonations.map((donation) => (
									<div key={donation._id} className="border rounded-lg p-3">
										<div className="flex items-center justify-between mb-2">
											<div className="flex items-center space-x-3">
												<Heart className="h-4 w-4 text-red-600" />
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
								))
							)}
						</div>
					</CardContent>
				</Card>
			)}
		</div>
	);
}
