"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { FileText, Download, AlertTriangle, Users } from "lucide-react";
import { useState } from "react";

export default function GenerateTaxDocument() {
    const [personalNumber, setPersonalNumber] = useState("");
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [taxDocumentLoading, setTaxDocumentLoading] = useState(false);
    const [bulkTaxDocumentLoading, setBulkTaxDocumentLoading] = useState(false);


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

	const generateBulkTaxDocument = async () => {
		setBulkTaxDocumentLoading(true);
		try {
			const response = await fetch("/api/donations/bulk-tax-report", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({
					year: parseInt(selectedYear),
				}),
			});

			const data = await response.json();

			if (!response.ok) {
				throw new Error(data.error || "Failed to generate bulk tax document");
			}

			// Create and download bulk PDF
			const bulkPDFContent = data.bulkPDFContent;
			downloadBulkPDF(bulkPDFContent, selectedYear);
			
		} catch (error) {
			console.error("Error generating bulk tax document:", error);
			alert((error as Error).message || "Failed to generate bulk tax document");
		} finally {
			setBulkTaxDocumentLoading(false);
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
		} else {
			// Handle popup blocker - provide fallback
			alert('Popup blocked! Please allow popups for this site and try again, or use the download link below.');
			// Create a downloadable file as fallback
			const blob = new Blob([htmlContent], { type: 'text/html' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `tax-document-${selectedYear}.html`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}
	};

	const downloadBulkPDF = (htmlContent: string, year: string) => {
		const newWindow = window.open('', '_blank');
		if (newWindow) {
			newWindow.document.write(htmlContent);
			newWindow.document.close();
			newWindow.focus();
			setTimeout(() => {
				newWindow.print();
				newWindow.close();
			}, 250);
		} else {
			// Handle popup blocker - provide fallback
			alert('Popup blocked! Please allow popups for this site and try again, or use the download link below.');
			// Create a downloadable file as fallback
			const blob = new Blob([htmlContent], { type: 'text/html' });
			const url = URL.createObjectURL(blob);
			const a = document.createElement('a');
			a.href = url;
			a.download = `bulk-tax-documents-${year}.html`;
			document.body.appendChild(a);
			a.click();
			document.body.removeChild(a);
			URL.revokeObjectURL(url);
		}
	};

    return (
       	<Card className="border-0 shadow-lg">
				<CardHeader>
					<CardTitle className="flex items-center gap-2">
						<FileText className="w-5 h-5" />
						Generate Tax Documents
					</CardTitle>
				</CardHeader>
				<CardContent>
					{/* Individual Tax Document Generation */}
					<div className="mb-8">
						<h3 className="text-lg font-semibold mb-4">Individual Tax Document</h3>
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
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
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
													Generate Individual
												</>
											)}
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle className="flex items-center gap-2">
												<AlertTriangle className="w-5 h-5 text-orange-600" />
												Confirm Generate Tax Document
											</AlertDialogTitle>
											<AlertDialogDescription>
												<div className="space-y-3">
													<p>
														You are about to generate a tax document for personal number ending in 
														<strong>{personalNumber.slice(-4)}</strong> for the year {selectedYear}.
													</p>
													<div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
														<p className="text-sm text-orange-800">
															<strong>Important:</strong> This action will be recorded with your user information and timestamp. 
															The system will log who generated this tax document and when it occurred.
														</p>
													</div>
													<p className="text-sm text-gray-600">
														Do you want to proceed with generating the tax document?
													</p>
												</div>
											</AlertDialogDescription>
										</AlertDialogHeader>
										<AlertDialogFooter>
											<AlertDialogCancel>Cancel</AlertDialogCancel>
											<AlertDialogAction onClick={generateTaxDocument}>
												Yes, Generate Tax Document
											</AlertDialogAction>
										</AlertDialogFooter>
									</AlertDialogContent>
								</AlertDialog>
							</div>
						</div>
					</div>

					{/* Bulk Tax Document Generation */}
					<div className="border-t pt-6">
						<h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
							<Users className="w-5 h-5" />
							Bulk Tax Documents
						</h3>
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
							<div>
								<Label htmlFor="bulkYear">Year</Label>
								<Input
									id="bulkYear"
									type="number"
									value={selectedYear}
									onChange={(e) => setSelectedYear(e.target.value)}
									min="2000"
									max={new Date().getFullYear() + 1}
								/>
							</div>
							<div>
								<AlertDialog>
									<AlertDialogTrigger asChild>
										<Button
											disabled={bulkTaxDocumentLoading}
											variant="outline"
											className="w-full"
										>
											{bulkTaxDocumentLoading ? (
												<>
													<div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
													Generating...
												</>
											) : (
												<>
													<Users className="w-4 h-4 mr-2" />
													Generate All Tax Documents
												</>
											)}
										</Button>
									</AlertDialogTrigger>
									<AlertDialogContent>
										<AlertDialogHeader>
											<AlertDialogTitle className="flex items-center gap-2">
												<AlertTriangle className="w-5 h-5 text-orange-600" />
												Confirm Generate Bulk Tax Documents
											</AlertDialogTitle>
											<AlertDialogDescription>
												<div className="space-y-3">
													<p>
														You are about to generate tax documents for <strong>all members and non-members</strong> 
														with personal numbers who have donations in the year {selectedYear}.
													</p>
													<div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
														<p className="text-sm text-orange-800">
															<strong>Important:</strong> This will generate a single PDF with multiple pages, 
															one for each donor. This action will be recorded with your user information and timestamp.
														</p>
													</div>
													<p className="text-sm text-gray-600">
														This may take some time if there are many donors. Do you want to proceed?
													</p>
												</div>
											</AlertDialogDescription>
										</AlertDialogHeader>
									<AlertDialogFooter>
										<AlertDialogCancel>Cancel</AlertDialogCancel>
										<AlertDialogAction onClick={generateBulkTaxDocument}>
											Yes, Generate All Documents
										</AlertDialogAction>
									</AlertDialogFooter>
								</AlertDialogContent>
							</AlertDialog>
							</div>
						</div>
					</div>

			
				</CardContent>
			</Card>
    );
}