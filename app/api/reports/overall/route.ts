import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Budget from "@/models/Budget.Model";
import Income from "@/models/Income.Model";
import Expense from "@/models/Expense.Model";
import Donation from "@/models/Donation.Model";
import EventRegistration from "@/models/EventRegistration.Model";
import Event from "@/models/Event.Model";
import { requireAdminOrExecutive } from "@/lib/apiAuth";

export async function GET(request: Request) {
	try {
		const auth = await requireAdminOrExecutive();
		if (auth.response) return auth.response;

		await connectDB();
		const { searchParams } = new URL(request.url);
		const period = searchParams.get("period") || "all"; // all, 1month, 3months, 6months, 1year
		const fromDate = searchParams.get("from");
		const toDate = searchParams.get("to");

		// Build date filter based on period or custom dates
		let dateFilter = {};
		const now = new Date();

		if (fromDate && toDate) {
			// Handle custom date range
			const from = new Date(fromDate);
			const to = new Date(toDate);
			
			// Validate dates
			if (isNaN(from.getTime()) || isNaN(to.getTime())) {
				return NextResponse.json({ error: "Invalid date format" }, { status: 400 });
			}
			
			// Set end of day for to date
			to.setHours(23, 59, 59, 999);
			
			dateFilter = { $gte: from, $lte: to };
		} else if (period !== "all") {
			// Handle preset periods
			switch (period) {
				case "1month":
					dateFilter = { $gte: new Date(now.getFullYear(), now.getMonth(), 1) };
					break;
				case "3months":
					dateFilter = { $gte: new Date(now.getFullYear(), now.getMonth() - 3, 1) };
					break;
				case "6months":
					dateFilter = { $gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) };
					break;
				case "1year":
					dateFilter = { $gte: new Date(now.getFullYear(), 0, 1) };
					break;
			}
		}

		// Get overall budget summary
		const budgetAggregation = await Budget.aggregate([
			...(dateFilter && Object.keys(dateFilter).length > 0 ? [{ $match: { createdAt: dateFilter } }] : []),
			{
				$group: {
					_id: null,
					totalBudgets: { $sum: "$allocatedAmount" },
					totalSpent: { $sum: "$spentAmount" },
					totalRemaining: { $sum: "$remainingAmount" },
					budgetCount: { $sum: 1 },
				},
			},
		]);

		const budgetData = budgetAggregation[0] || {
			totalBudgets: 0,
			totalSpent: 0,
			totalRemaining: 0,
			budgetCount: 0,
		};

		// Get overall income summary
		const incomeAggregation = await Income.aggregate([
			...(Object.keys(dateFilter).length > 0 ? [{ $match: { date: dateFilter } }] : []),
			{
				$group: {
					_id: null,
					totalIncome: { $sum: "$amount" },
					incomeCount: { $sum: 1 },
					incomeBySource: {
						$push: {
							sourceType: "$sourceType",
							amount: "$amount",
							title: "$title",
						},
					},
				},
			},
		]);

		const incomeData = incomeAggregation[0] || {
			totalIncome: 0,
			incomeCount: 0,
			incomeBySource: [],
		};

		// Get overall expense summary
		const expenseAggregation = await Expense.aggregate([
			...(Object.keys(dateFilter).length > 0 ? [{ $match: { date: dateFilter } }] : []),
			{
				$group: {
					_id: null,
					totalExpenses: { $sum: "$amount" },
					expenseCount: { $sum: 1 },
					expensesByCategory: {
						$push: {
							expenseCategory: "$expenseCategory",
							amount: "$amount",
							title: "$title",
						},
					},
				},
			},
		]);

		const expenseData = expenseAggregation[0] || {
			totalExpenses: 0,
			expenseCount: 0,
			expensesByCategory: [],
		};

		// Get overall donation summary
		const donationAggregation = await Donation.aggregate([
			...(Object.keys(dateFilter).length > 0 ? [{ $match: { createdAt: dateFilter } }] : []),
			{
				$group: {
					_id: null,
					totalDonations: { $sum: "$amount" },
					donationCount: { $sum: 1 },
					averageDonation: { $avg: "$amount" },
				},
			},
		]);

		const donationData = donationAggregation[0] || {
			totalDonations: 0,
			donationCount: 0,
			averageDonation: 0,
		};

		// Get overall registration summary
		const registrationAggregation = await EventRegistration.aggregate([
			...(Object.keys(dateFilter).length > 0 ? [{ $match: { createdAt: dateFilter } }] : []),
			{ $match: { registrationStatus: "registered" } },
			{
				$group: {
					_id: null,
					totalRegistrations: { $sum: "$attendeeCount" },
					memberRegistrations: {
						$sum: {
							$cond: [{ $eq: ["$registrationType", "member"] }, "$attendeeCount", 0],
						},
					},
					guestRegistrations: {
						$sum: {
							$cond: [{ $eq: ["$registrationType", "guest"] }, "$attendeeCount", 0],
						},
					},
					totalRegistrationFees: { $sum: "$paymentAmount" },
					totalRegistrationDonations: { $sum: "$donationAmount" },
				},
			},
		]);

		const registrationData = registrationAggregation[0] || {
			totalRegistrations: 0,
			memberRegistrations: 0,
			guestRegistrations: 0,
			totalRegistrationFees: 0,
			totalRegistrationDonations: 0,
		};

		// Calculate totals
		const totalProfitLoss = incomeData.totalIncome - expenseData.totalExpenses;

		// Get monthly trends for charts
		const monthlyIncomeTrend = await Income.aggregate([
			...(Object.keys(dateFilter).length > 0 ? [{ $match: { date: dateFilter } }] : []),
			{
				$group: {
					_id: {
						year: { $year: "$date" },
						month: { $month: "$date" },
					},
					total: { $sum: "$amount" },
					count: { $sum: 1 },
				},
			},
			{ $sort: { "_id.year": 1, "_id.month": 1 } },
		]);

		const monthlyExpenseTrend = await Expense.aggregate([
			...(Object.keys(dateFilter).length > 0 ? [{ $match: { date: dateFilter } }] : []),
			{
				$group: {
					_id: {
						year: { $year: "$date" },
						month: { $month: "$date" },
					},
					total: { $sum: "$amount" },
					count: { $sum: 1 },
				},
			},
			{ $sort: { "_id.year": 1, "_id.month": 1 } },
		]);

		const monthlyDonationTrend = await Donation.aggregate([
			...(Object.keys(dateFilter).length > 0 ? [{ $match: { createdAt: dateFilter } }] : []),
			{
				$group: {
					_id: {
						year: { $year: "$createdAt" },
						month: { $month: "$createdAt" },
					},
					total: { $sum: "$amount" },
					count: { $sum: 1 },
				},
			},
			{ $sort: { "_id.year": 1, "_id.month": 1 } },
		]);

		// Get event comparison data
		const eventComparison = await Event.aggregate([
			{
				$lookup: {
					from: "incomes",
					localField: "_id",
					foreignField: "eventId",
					as: "eventIncome",
				},
			},
			{
				$lookup: {
					from: "expenses",
					localField: "_id",
					foreignField: "eventId",
					as: "eventExpenses",
				},
			},
			{
				$lookup: {
					from: "eventregistrations",
					localField: "_id",
					foreignField: "eventId",
					as: "eventRegistrations",
				},
			},
			{
				$project: {
					eventname: 1,
					eventdate: 1,
					totalIncome: { $sum: "$eventIncome.amount" },
					totalExpenses: { $sum: "$eventExpenses.amount" },
					totalRegistrations: {
						$sum: {
							$filter: {
								input: "$eventRegistrations",
								cond: { $eq: ["$$this.registrationStatus", "registered"] },
							},
						},
					},
					profitOrLoss: {
						$subtract: [{ $sum: "$eventIncome.amount" }, { $sum: "$eventExpenses.amount" }],
					},
				},
			},
			{ $sort: { profitOrLoss: -1 } },
			{ $limit: 10 },
		]);

		// Get source breakdowns
		const incomeSourceBreakdownRaw = await Income.aggregate([
			...(Object.keys(dateFilter).length > 0 ? [{ $match: { date: dateFilter } }] : []),
			{
				$group: {
					_id: "$sourceType",
					totalAmount: { $sum: "$amount" },
					count: { $sum: 1 },
				},
			},
			{ $sort: { totalAmount: -1 } },
		]);

		const expenseCategoryBreakdownRaw = await Expense.aggregate([
			...(Object.keys(dateFilter).length > 0 ? [{ $match: { date: dateFilter } }] : []),
			{
				$group: {
					_id: "$expenseCategory",
					totalAmount: { $sum: "$amount" },
					count: { $sum: 1 },
				},
			},
			{ $sort: { totalAmount: -1 } },
		]);

		// Calculate percentages
		const incomeSourceBreakdown = incomeSourceBreakdownRaw.map((source) => ({
			...source,
			percentage: incomeData.totalIncome > 0 ? (source.totalAmount / incomeData.totalIncome) * 100 : 0,
		}));

		const expenseCategoryBreakdown = expenseCategoryBreakdownRaw.map((category) => ({
			...category,
			percentage: expenseData.totalExpenses > 0 ? (category.totalAmount / expenseData.totalExpenses) * 100 : 0,
		}));

		// Compile the comprehensive report
		const report = {
			summary: {
				totalBudgets: budgetData.totalBudgets,
				totalIncome: incomeData.totalIncome,
				totalExpenses: expenseData.totalExpenses,
				totalDonations: donationData.totalDonations,
				totalProfitLoss: totalProfitLoss,
				totalRegistrations: registrationData.totalRegistrations,
			},
			details: {
				budgets: {
					totalAllocated: budgetData.totalBudgets,
					totalSpent: budgetData.totalSpent,
					totalRemaining: budgetData.totalRemaining,
					budgetCount: budgetData.budgetCount,
				},
				income: {
					totalIncome: incomeData.totalIncome,
					incomeCount: incomeData.incomeCount,
					averageIncome: incomeData.incomeCount > 0 ? incomeData.totalIncome / incomeData.incomeCount : 0,
				},
				expenses: {
					totalExpenses: expenseData.totalExpenses,
					expenseCount: expenseData.expenseCount,
					averageExpense: expenseData.expenseCount > 0 ? expenseData.totalExpenses / expenseData.expenseCount : 0,
				},
				donations: {
					totalDonations: donationData.totalDonations,
					donationCount: donationData.donationCount,
					averageDonation: donationData.averageDonation,
				},
				registrations: {
					totalRegistrations: registrationData.totalRegistrations,
					memberRegistrations: registrationData.memberRegistrations,
					guestRegistrations: registrationData.guestRegistrations,
					totalRegistrationFees: registrationData.totalRegistrationFees,
					totalRegistrationDonations: registrationData.totalRegistrationDonations,
				},
			},
			trends: {
				monthlyIncome: monthlyIncomeTrend,
				monthlyExpenses: monthlyExpenseTrend,
				monthlyDonations: monthlyDonationTrend,
			},
			breakdowns: {
				incomeBySource: incomeSourceBreakdown,
				expensesByCategory: expenseCategoryBreakdown,
			},
			eventComparison: eventComparison,
			period: period,
			generatedAt: new Date(),
		};

		return NextResponse.json(report, { status: 200 });
	} catch (error) {
		console.error("Error generating overall report:", error);
		return NextResponse.json({ error: "Failed to generate overall report" }, { status: 500 });
	}
}
