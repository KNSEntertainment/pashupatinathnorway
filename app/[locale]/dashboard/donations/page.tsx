"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DollarSign, TrendingUp, Users, CheckCircle, Clock, XCircle, FileText, Download } from "lucide-react";
import { formatNOK } from "@/lib/norwegianCurrency";

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
	const [stats, setStats] = useState({
		total: 0,
		completed: 0,
		pending: 0,
		totalAmount: 0,
	});
	const [taxDocumentLoading, setTaxDocumentLoading] = useState(false);
	const [personalNumber, setPersonalNumber] = useState("");
	const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

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

	const generateTaxDocument = async () => {
		if (!personalNumber || !/^\d{11}$/.test(personalNumber)) {
			alert("Please enter a valid 11-digit personal number");
			return;
		}

		setTaxDocumentLoading(true);
		try {
			const response = await fetch("/api/donations/tax-report", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					personalNumber,
					year: parseInt(selectedYear),
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to generate tax document");
			}

			// Create and download PDF
			const taxReport = data.taxReport;
			const pdfContent = generateTaxPDF(taxReport);
			downloadPDF(pdfContent);
			
		} catch (error) {
			console.error("Error generating tax document:", error);
			alert((error as Error).message || "Failed to generate tax document");
		} finally {
			setTaxDocumentLoading(false);
		}
	};

const generateTaxPDF = (taxReport: {
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
        const orgName = "Pashupatinath Norway Temple";
        const orgNumber = " 926 499 211"; 
        const year = taxReport.report.year;

        const htmlContent = `
            <!DOCTYPE html>
            <html lang="no">
            <head>
                <meta charset="UTF-8">
                <title>Årsoppgave over gaver - ${year}</title>
                <style>
                    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 50px; color: #333; line-height: 1.5; }
                    .header-table { width: 100%; margin-bottom: 50px; }
                    .org-details { font-size: 14px; }
                    .document-title { text-align: right; }
                    .document-title h1 { margin: 0; color: #1a365d; font-size: 24px; }
                    
                    .donor-box { margin-bottom: 40px; border-left: 4px solid #1a365d; padding-left: 20px; }
                    .donor-box h2 { font-size: 18px; margin-bottom: 10px; text-transform: uppercase; color: #666; }
                    
                    .summary-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
                    .summary-table th, .summary-table td { padding: 15px; border-bottom: 1px solid #eee; text-align: left; }
                    .total-row { font-size: 18px; font-weight: bold; background-color: #f8fafc; }
                    
                    .statement { background: #f1f5f9; padding: 20px; border-radius: 8px; font-size: 13px; margin-top: 40px; }
                    .footer { margin-top: 60px; border-top: 1px solid #ddd; pt: 20px; font-size: 11px; color: #666; }
                    
                    @media print {
                        body { margin: 20px; }
                        .no-print { display: none; }
                    }
                </style>
            </head>
            <body>
                <table class="header-table">
                    <tr>
                        <td class="org-details">
                            <strong>${orgName}</strong><br>
                            Organisasjonsnr: ${orgNumber}<br>
                            Org. type: Frivillig organisasjon
                        </td>
                        <td class="document-title">
                            <h1>ÅRSOPPGAVE OVER GAVER</h1>
                            <p>Inntektsåret ${year}</p>
                        </td>
                    </tr>
                </table>
                
                <div class="donor-box">
                    <h2>Giverinformasjon</h2>
                    <strong>${taxReport.member.name}</strong><br>
                    ${taxReport.member.address || "Adresse ikke registrert"}<br>
                    Fødselsnummer: ${taxReport.member.personalNumber.replace(/(\d{6})(\d{5})/, '$1 *****')}<br>
                </div>

                <p>Dette er en bekreftelse på mottatte gaver som gir rett til skattefradrag etter skatteloven § 6-50.</p>

                <table class="summary-table">
                    <thead>
                        <tr>
                            <th>Beskrivelse</th>
                            <th style="text-align: right;">Beløp (NOK)</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>Totalt innberettet beløp for ${year}</td>
                            <td style="text-align: right;">${taxReport.report.totalDonated.toLocaleString('nb-NO')},00</td>
                        </tr>
                        <tr class="total-row">
                            <td>Fradragsberettiget beløp</td>
                            <td style="text-align: right;">${taxReport.report.totalDonated.toLocaleString('nb-NO')} NOK</td>
                        </tr>
                    </tbody>
                </table>

                <div class="statement">
                    <strong>Informasjon om skattefradrag:</strong><br>
                    Beløpet er innrapportert til Skatteetaten på det oppgitte fødselsnummeret. 
                    Fradraget vil normalt fremkomme ferdig utfylt i din skattemelding. 
                    Vennligst kontroller at beløpet stemmer overens med dine egne nedtegnelser.
                    <br><br>
                    <em>Merk: For at fradrag skal innvilges, må summen av gaver til organisasjonen utgjøre minst 500 kr i løpet av kalenderåret.</em>
                </div>

                <div class="footer">
                    <p>Dokumentet er elektronisk generert og gyldig uten signatur.</p>
                    <p>${orgName} | Utstedt dato: ${new Date().toLocaleDateString('nb-NO')}</p>
                </div>
            </body>
            </html>
        `;

        return htmlContent;
    };

	const downloadPDF = (htmlContent: string) => {
		const newWindow = window.open('', '_blank');
		if (newWindow) {
			newWindow.document.write(htmlContent);
			newWindow.document.close();
			newWindow.focus();
			setTimeout(() => {
				newWindow.print();
				newWindow.close();
			}, 250);
		}
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

			{/* Tax Document Generation */}
			<Card className="border-0 shadow-lg">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="w-5 h-5" />
						Generate Tax Document
					</CardTitle>
				</CardHeader>
				<CardContent>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
						<div>
							<Label htmlFor="personalNumber">Personal Number</Label>
							<Input
								id="personalNumber"
								type="text"
								placeholder="Enter 11-digit personal number"
								value={personalNumber}
								onChange={(e) => setPersonalNumber(e.target.value)}
								maxLength={11}
							/>
						</div>
						<div>
							<Label htmlFor="year">Year</Label>
							<Input
								id="year"
								type="number"
								value={selectedYear}
								onChange={(e) => setSelectedYear(e.target.value)}
								min="2000"
								max={new Date().getFullYear() + 1}
							/>
						</div>
						<div>
							<Button
								onClick={generateTaxDocument}
								disabled={taxDocumentLoading || !personalNumber}
								className="w-full"
							>
								{taxDocumentLoading ? (
									<>
										<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
										Generating...
									</>
								) : (
									<>
										<Download className="w-4 h-4 mr-2" />
										Generate Tax Document
									</>
								)}
							</Button>
						</div>
					</div>
					<p className="text-sm text-gray-500 mt-4">
						Generate official tax documents for members based on their donation history for a specific year.
					</p>
				</CardContent>
			</Card>

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
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Address</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Amount</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Status</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Date & Time</th>
									<th className="text-left py-3 px-4 text-sm font-semibold text-gray-900">Message</th>
								</tr>
							</thead>
							<tbody>
								{donations.length === 0 ? (
									<tr>
										<td colSpan={7} className="text-center py-8 text-gray-500">
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
