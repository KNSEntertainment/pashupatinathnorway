import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";
import AuditLog from '@/models/AuditLog.Model';
import { decryptPersonalNumber, isEncrypted } from "@/lib/encryption";

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

		const { taxId, year } = await request.json();

		// Validate taxId
		if (!taxId || !/^TAX-\d{4}-\d{6}$/.test(taxId)) {
			return NextResponse.json({ error: "Valid tax ID required (format: TAX-YYYY-XXXXXX)" }, { status: 400 });
		}

		// Validate year
		const reportYear = year || new Date().getFullYear();
		if (!reportYear || reportYear < 2000 || reportYear > new Date().getFullYear() + 1) {
			return NextResponse.json({ error: "Invalid year provided" }, { status: 400 });
		}

		// Check for duplicate audit log within last 5 minutes to prevent duplicates from popup blockers
		const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
		const existingAuditLog = await AuditLog.findOne({
			action: 'generate_non_member_tax_document',
			'user.id': session.user.id,
			'details.taxId': taxId,
			'details.year': reportYear,
			timestamp: { $gte: fiveMinutesAgo }
		});

		// Create initial audit log entry only if no recent duplicate exists
		const userAgent = request.headers.get('user-agent') || 'Unknown';
		const ipAddress = request.headers.get('x-forwarded-for') || 
		                 request.headers.get('x-real-ip') || 
		                 'Unknown';

		if (!existingAuditLog) {
			auditLog = new AuditLog({
				action: 'generate_non_member_tax_document',
				user: {
					id: session.user.id,
					name: session.user.fullName,
					email: session.user.email,
					role: session.user.role
				},
				details: {
					taxId: taxId,
					year: reportYear
				},
				ipAddress,
				userAgent,
				status: 'initiated'
			});

			await auditLog.save();
		} else {
			// Use existing audit log to prevent duplicates
			auditLog = existingAuditLog;
		}

		// Find donations with this tax ID
		console.log("Non-Member Tax Report Debug: Searching for taxId:", taxId);
		
		const startDate = new Date(reportYear, 0, 1); // January 1st of the year
		const endDate = new Date(reportYear, 11, 31, 23, 59, 59); // December 31st of the year

		const donations = await Donation.find({ 
			taxId: taxId,
			paymentStatus: "completed",
			createdAt: { $gte: startDate, $lte: endDate }
		}).sort({ createdAt: 1 });
		
		console.log("Non-Member Tax Report Debug: Donations found:", donations.length);
		
		if (donations.length === 0) {
			// Update audit log for no donations found
			await AuditLog.findByIdAndUpdate(auditLog._id, {
				status: 'failed',
				errorMessage: 'No completed donations found for this tax ID in the specified year'
			});

			return NextResponse.json({ 
				error: "No completed donations found for this tax ID in the specified year",
				debug: {
					searchedTaxId: taxId,
					year: reportYear,
					dateRange: `${startDate.toISOString()} to ${endDate.toISOString()}`
				}
			}, { status: 404 });
		}

		// Calculate total and generate report data
		const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);
		const donationCount = donations.length;

		// Get donor information from the first donation
		const firstDonation = donations[0];
		const donorName = firstDonation.donorName === "Anonymous" ? "Anonymous Donor" : firstDonation.donorName;
		const donorEmail = firstDonation.donorEmail === "anonymous@rspnorway.org" ? "" : firstDonation.donorEmail;
		
		// Decrypt personal number for display
		let decryptedPersonalNumber = "";
		if (firstDonation.personalNumber) {
			if (isEncrypted(firstDonation.personalNumber)) {
				decryptedPersonalNumber = decryptPersonalNumber(firstDonation.personalNumber);
			} else {
				decryptedPersonalNumber = firstDonation.personalNumber;
			}
		}

		// Find the most recent donation that has a valid address
		const donationWithAddress = donations.slice().reverse().find(d => d.address && d.address.trim() !== "");
		const donorAddress = donationWithAddress?.address || "";

		const donorInfo = {
			name: donorName,
			personalNumber: decryptedPersonalNumber,
			email: donorEmail,
			address: donorAddress,
			taxId: taxId,
			isNonMember: true
		};

		const taxReport = {
			donor: donorInfo,
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
				largestDonation: donations.length > 0 ? Math.max(...donations.map(d => d.amount)) : 0,
				smallestDonation: donations.length > 0 ? Math.min(...donations.map(d => d.amount)) : 0,
				firstDonationDate: donations.length > 0 ? donations[0].createdAt : null,
				lastDonationDate: donations.length > 0 ? donations[donations.length - 1].createdAt : null
			}
		};

		// Update audit log with successful results
		const updateData = {
			status: 'completed',
			'details.taxId': taxId,
			'details.donorName': donorInfo.name,
			'details.totalDonated': totalDonated,
			'details.donationCount': donationCount
		};
		
		await AuditLog.findByIdAndUpdate(auditLog._id, updateData);

		return NextResponse.json({
			success: true,
			taxReport
		}, { status: 200 });

	} catch (error) {
		console.error("Error generating non-member tax report:", error);
		
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
		
		return NextResponse.json({ error: "Failed to generate non-member tax report" }, { status: 500 });
	}
}
