import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";
import Membership from "@/models/Membership.Model";
import AuditLog from '@/models/AuditLog.Model';
import { decryptPersonalNumber, isEncrypted } from '@/lib/encryption';

// Helper function to decrypt and mask personal number
function getDecryptedAndMaskedPersonalNumber(personalNumber: string): string {
	if (!personalNumber) return '';
	
	let decryptedNumber = personalNumber;
	
	// Check if the personal number is encrypted and decrypt it
	if (isEncrypted(personalNumber)) {
		decryptedNumber = decryptPersonalNumber(personalNumber);
	}
	
	// Mask the last 5 digits (format: 123456*****)
	if (decryptedNumber && decryptedNumber.length === 11) {
		return decryptedNumber.replace(/(\d{6})(\d{5})/, '$1*****');
	}
	
	// Fallback to original masking if format is unexpected
	return personalNumber.replace(/(\d{6})(\d{5})/, '$1*****');
}

export async function POST(request: NextRequest) {
	let auditLog = null;
	
	try {
		await connectDB();

		// Check authentication and admin role
		const session = await getServerSession(authOptions);
		if (!session?.user || session.user.role !== 'admin') {
			return NextResponse.json(
				{ error: "Unauthorized. Admin access required." },
				{ status: 401 }
			);
		}

		const { year } = await request.json();

		// Validate year
		const reportYear = year || new Date().getFullYear();
		if (!reportYear || reportYear < 2000 || reportYear > new Date().getFullYear() + 1) {
			return NextResponse.json({ error: "Invalid year provided" }, { status: 400 });
		}

		// Create audit log entry
		const userAgent = request.headers.get('user-agent') || 'Unknown';
		const ipAddress = request.headers.get('x-forwarded-for') || 
		                 request.headers.get('x-real-ip') || 
		                 'Unknown';

		auditLog = new AuditLog({
			action: 'generate_bulk_tax_documents',
			user: {
				id: session.user.id,
				name: session.user.fullName,
				email: session.user.email,
				role: session.user.role
			},
			details: {
				year: reportYear
			},
			ipAddress,
			userAgent,
			status: 'initiated'
		});

		await auditLog.save();

		// Get date range for the specified year
		const startDate = new Date(reportYear, 0, 1); // January 1st of the year
		const endDate = new Date(reportYear, 11, 31, 23, 59, 59); // December 31st of the year

		// Find all completed donations with personal numbers for the specified year
		const donationsWithPersonalNumbers = await Donation.find({
			personalNumber: { $exists: true, $nin: [null, ""] },
			paymentStatus: "completed",
			createdAt: { $gte: startDate, $lte: endDate }
		}).sort({ personalNumber: 1, createdAt: 1 });

		console.log(`Bulk Tax Report Debug: Found ${donationsWithPersonalNumbers.length} donations with personal numbers for year ${reportYear}`);

		if (donationsWithPersonalNumbers.length === 0) {
			await AuditLog.findByIdAndUpdate(auditLog._id, {
				status: 'failed',
				errorMessage: 'No completed donations found with personal numbers in the specified year'
			});

			return NextResponse.json({ 
				error: "No completed donations found with personal numbers in the specified year",
				debug: {
					year: reportYear,
					dateRange: `${startDate.toISOString()} to ${endDate.toISOString()}`
				}
			}, { status: 404 });
		}

		// Group donations by personal number (using decrypted personal numbers for grouping)
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const donationsByPersonalNumber = new Map<string, any[]>();
		
		for (const donation of donationsWithPersonalNumbers) {
			const originalPersonalNumber = donation.personalNumber;
			const decryptedPersonalNumber = getDecryptedAndMaskedPersonalNumber(originalPersonalNumber);
			
			// Use decrypted personal number for grouping
			if (!donationsByPersonalNumber.has(decryptedPersonalNumber)) {
				donationsByPersonalNumber.set(decryptedPersonalNumber, []);
			}
			// Store the original personal number with the donation for later use
			donation._decryptedPersonalNumber = decryptedPersonalNumber;
			donationsByPersonalNumber.get(decryptedPersonalNumber)!.push(donation);
		}

		console.log(`Bulk Tax Report Debug: Found ${donationsByPersonalNumber.size} unique personal numbers`);

		// Generate tax reports for each personal number
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const bulkTaxReports: any[] = [];
		let totalDonors = 0;
		let totalAmount = 0;

		for (const [maskedPersonalNumber, donations] of donationsByPersonalNumber) {
			// Get the original personal number from the first donation for membership lookup
			const originalPersonalNumber = donations[0].personalNumber;
			
			// Find membership information (if available) using original personal number
			const membership = await Membership.findOne({ personalNumber: originalPersonalNumber });
			
			// Calculate total and generate report data
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const totalDonated = donations.reduce((sum: number, donation: any) => sum + donation.amount, 0);
			const donationCount = donations.length;

			// Generate tax report data - handle both members and non-members
			const firstDonation = donations[0];
			
			// For non-members, find the most recent donation that has an address
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			const donationWithAddress = donations.find((d: any) => d.address && d.address.trim() !== "");
			
			const memberInfo = membership ? {
				name: `${membership.firstName} ${membership.lastName}`,
				personalNumber: getDecryptedAndMaskedPersonalNumber(membership.personalNumber),
				email: membership.email,
				address: `${membership.address}, ${membership.postalCode} ${membership.city}`,
				membershipStatus: membership.membershipStatus
			} : {
				name: firstDonation.donorName || "Anonymous Donor",
				personalNumber: maskedPersonalNumber,
				email: firstDonation.donorEmail || "Not provided",
				address: donationWithAddress?.address || "Not provided",
				membershipStatus: "Non-member"
			};

			const taxReport = {
				member: memberInfo,
				report: {
					year: reportYear,
					generatedAt: new Date().toISOString(),
					totalDonated,
					donationCount,
					donations: donations.map(donation => ({
						date: donation.createdAt,
						amount: donation.amount,
						currency: donation.currency,
						message: donation.message,
						isAnonymous: donation.isAnonymous,
						donationType: donation.donationType,
						causeId: donation.causeId
					}))
				},
				summary: {
					averageDonation: donationCount > 0 ? Math.round(totalDonated / donationCount) : 0,
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					largestDonation: donations.length > 0 ? Math.max(...donations.map((d: any) => d.amount)) : 0,
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					smallestDonation: donations.length > 0 ? Math.min(...donations.map((d: any) => d.amount)) : 0,
					firstDonationDate: donations.length > 0 ? donations[0].createdAt : null,
					lastDonationDate: donations.length > 0 ? donations[donations.length - 1].createdAt : null
				}
			};

			bulkTaxReports.push(taxReport);
			totalDonors++;
			totalAmount += totalDonated;
		}

		// Generate bulk PDF content
		const bulkPDFContent = generateBulkTaxPDF(bulkTaxReports, reportYear);

		// Update audit log with successful results
		await AuditLog.findByIdAndUpdate(auditLog._id, {
			status: 'completed',
			'details.totalDonors': totalDonors,
			'details.totalAmount': totalAmount,
			'details.year': reportYear
		});

		return NextResponse.json({
			success: true,
			bulkTaxReports,
			summary: {
				year: reportYear,
				totalDonors,
				totalAmount,
				generatedAt: new Date().toISOString()
			},
			bulkPDFContent
		}, { status: 200 });

	} catch (error) {
		console.error("Error generating bulk tax report:", error);
		
		// Update audit log with error details if audit log exists
		try {
			if (auditLog && auditLog._id) {
				await AuditLog.findByIdAndUpdate(auditLog._id, {
					status: 'failed',
					errorMessage: error instanceof Error ? error.message : "Unknown error"
				});
			}
		} catch (auditError) {
			console.error("Failed to update audit log:", auditError);
		}
		
		return NextResponse.json({ error: "Failed to generate bulk tax report" }, { status: 500 });
	}
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function generateBulkTaxPDF(bulkTaxReports: any[], year: number): string {
	const orgName = "Pashupatinath Norway Temple";
	const orgNumber = " 926 499 211";

	// Generate individual tax document pages
	const individualPages = bulkTaxReports.map((taxReport, index) => {
		const pageNumber = index + 1;
		const totalPages = bulkTaxReports.length;
		
		// Ensure personal number is properly masked (last 5 digits hidden)
		const maskedPersonalNumber = taxReport.member.personalNumber.length === 11 
			? taxReport.member.personalNumber.replace(/(\d{6})(\d{5})/, '$1*****')
			: taxReport.member.personalNumber;
		
		return `
			<div class="page-break">
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
							<p style="font-size: 12px; color: #666;">Side ${pageNumber} av ${totalPages}</p>
						</td>
					</tr>
				</table>
				
				<div class="donor-box">
					<h2>Giverinformasjon</h2>
					<strong>${taxReport.member.name}</strong><br>
					${taxReport.member.address || "Adresse ikke registrert"}<br>
					Fødselsnummer: ${maskedPersonalNumber}<br>
					Status: ${taxReport.member.membershipStatus}
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
			</div>
		`;
	}).join('');

	// Generate summary page
	const summaryPage = `
		<div class="page-break">
			<table class="header-table">
				<tr>
					<td class="org-details">
						<strong>${orgName}</strong><br>
						Organisasjonsnr: ${orgNumber}<br>
						Org. type: Frivillig organisasjon
					</td>
					<td class="document-title">
						<h1>OVERSIKT - ÅRSOPPGAVER</h1>
						<p>Inntektsåret ${year}</p>
					</td>
				</tr>
			</table>
			
			<div class="donor-box">
				<h2>Generell Oversikt</h2>
				<p>Antall givere med personnummer: <strong>${bulkTaxReports.length}</strong></p>
				<p>Totalt samlet beløp: <strong>${bulkTaxReports.reduce((sum, report) => sum + report.report.totalDonated, 0).toLocaleString('nb-NO')} NOK</strong></p>
				<p>Generert dato: <strong>${new Date().toLocaleDateString('nb-NO')}</strong></p>
			</div>

			<h3 style="margin-top: 30px; margin-bottom: 20px;">Detaljert oversikt per giver:</h3>
			<table class="summary-table">
				<thead>
					<tr>
						<th>Navn</th>
						<th>Personnummer</th>
						<th>Status</th>
						<th>Antall gaver</th>
						<th>Totalbeløp (NOK)</th>
					</tr>
				</thead>
				<tbody>
					${bulkTaxReports.map(report => {
						// Ensure personal number is properly masked (last 5 digits hidden)
						const maskedPersonalNumber = report.member.personalNumber.length === 11 
							? report.member.personalNumber.replace(/(\d{6})(\d{5})/, '$1*****')
							: report.member.personalNumber;
						
						return `
						<tr>
							<td>${report.member.name}</td>
							<td>${maskedPersonalNumber}</td>
							<td>${report.member.membershipStatus}</td>
							<td>${report.report.donationCount}</td>
							<td style="text-align: right;">${report.report.totalDonated.toLocaleString('nb-NO')},00</td>
						</tr>
					`;
					}).join('')}
				</tbody>
			</table>

			<div class="footer">
				<p>Dette dokumentet inneholder årsoppgaver for alle givere med registrert personnummer.</p>
				<p>${orgName} | Utstedt dato: ${new Date().toLocaleDateString('nb-NO')}</p>
			</div>
		</div>
	`;

	// Combine summary page with individual pages
	const htmlContent = `
		<!DOCTYPE html>
		<html lang="no">
		<head>
			<meta charset="UTF-8">
			<title>Bulk Årsoppgaver over gaver - ${year}</title>
			<style>
				body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 50px; color: #333; line-height: 1.5; }
				.page-break { page-break-after: always; }
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
					.page-break { page-break-after: always; }
				}
			</style>
		</head>
		<body>
			${summaryPage}
			${individualPages}
		</body>
		</html>
	`;

	return htmlContent;
}
