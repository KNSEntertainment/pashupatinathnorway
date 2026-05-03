import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/mongodb";
import Donation from "@/models/Donation.Model";
import Membership from "@/models/Membership.Model";
import AuditLog from '@/models/AuditLog.Model';

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

		const { membershipId, year } = await request.json();

		// Validate membershipId
		if (!membershipId || !/^MEM-\d{4}-\d{6}$/.test(membershipId)) {
			return NextResponse.json({ error: "Valid membership ID required (format: MEM-YYYY-XXXXXX)" }, { status: 400 });
		}

		// Validate year
		const reportYear = year || new Date().getFullYear();
		if (!reportYear || reportYear < 2000 || reportYear > new Date().getFullYear() + 1) {
			return NextResponse.json({ error: "Invalid year provided" }, { status: 400 });
		}

		// Check for duplicate audit log within last 5 minutes to prevent duplicates from popup blockers
		const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
		const existingAuditLog = await AuditLog.findOne({
			action: 'generate_tax_document',
			'user.id': session.user.id,
			'details.membershipId': membershipId,
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
				action: 'generate_tax_document',
				user: {
					id: session.user.id,
					name: session.user.fullName,
					email: session.user.email,
					role: session.user.role
				},
				details: {
					membershipId: membershipId,
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

		// First find the membership by membershipId
		console.log("Tax Report Debug: Searching for membershipId:", membershipId);
		
		const membership = await Membership.findOne({ membershipId });
		if (!membership) {
			// Update audit log for no membership found
			await AuditLog.findByIdAndUpdate(auditLog._id, {
				status: 'failed',
				errorMessage: 'No membership found with this membership ID'
			});

			return NextResponse.json({ 
				error: "No membership found with this membership ID",
				debug: {
					searchedMembershipId: membershipId
				}
			}, { status: 404 });
		}

		console.log("Tax Report Debug: Membership found:", !!membership);
		console.log("Tax Report Debug: Member personalNumber:", membership.personalNumber.replace(/(\d{6})(\d{5})/, '$1*****'));
		
		// Now check if there are any donations with this member's personal number
		const startDate = new Date(reportYear, 0, 1); // January 1st of the year
		const endDate = new Date(reportYear, 11, 31, 23, 59, 59); // December 31st of the year

		const donations = await Donation.find({ 
			personalNumber: membership.personalNumber,
			paymentStatus: "completed",
			createdAt: { $gte: startDate, $lte: endDate }
		}).sort({ createdAt: 1 });
		
		console.log("Tax Report Debug: Donations found:", donations.length);
		
		if (donations.length === 0) {
			// Update audit log for no donations found
			await AuditLog.findByIdAndUpdate(auditLog._id, {
				status: 'failed',
				errorMessage: 'No completed donations found for this member in the specified year'
			});

			return NextResponse.json({ 
				error: "No completed donations found for this member in the specified year",
				debug: {
					searchedMembershipId: membershipId,
					memberName: `${membership.firstName} ${membership.lastName}`,
					year: reportYear,
					dateRange: `${startDate.toISOString()} to ${endDate.toISOString()}`
				}
			}, { status: 404 });
		}

		// Calculate total and generate report data
		const totalDonated = donations.reduce((sum, donation) => sum + donation.amount, 0);
		const donationCount = donations.length;

		// Generate tax report data - handle both members and non-members
		// const firstDonation = donations[0];
		
		// For non-members, find the most recent donation that has an address
		// const donationWithAddress = donations.find(d => d.address && d.address.trim() !== "");
		
		const memberInfo = {
			name: `${membership.firstName} ${membership.lastName}`,
			personalNumber: membership.personalNumber,
			email: membership.email,
			address: `${membership.address}, ${membership.postalCode} ${membership.city}`,
			membershipStatus: membership.membershipStatus,
			membershipId: membership.membershipId
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
				largestDonation: donations.length > 0 ? Math.max(...donations.map(d => d.amount)) : 0,
				smallestDonation: donations.length > 0 ? Math.min(...donations.map(d => d.amount)) : 0,
				firstDonationDate: donations.length > 0 ? donations[0].createdAt : null,
				lastDonationDate: donations.length > 0 ? donations[donations.length - 1].createdAt : null
			}
		};

		// Update audit log with successful results
		const updateData = {
			status: 'completed',
			'details.membershipId': membershipId,
			'details.memberName': memberInfo.name,
			'details.totalDonated': totalDonated,
			'details.donationCount': donationCount,
			'details.membershipStatus': memberInfo.membershipStatus
		};
		
		await AuditLog.findByIdAndUpdate(auditLog._id, updateData);

		return NextResponse.json({
			success: true,
			taxReport
		}, { status: 200 });

	} catch (error) {
		console.error("Error generating tax report:", error);
		
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
		
		return NextResponse.json({ error: "Failed to generate tax report" }, { status: 500 });
	}
}
