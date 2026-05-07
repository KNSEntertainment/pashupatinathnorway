import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Income from "@/models/Income.Model";
import Expense from "@/models/Expense.Model";
import Budget from "@/models/Budget.Model";
import Donation from "@/models/Donation.Model";

export async function GET(request: Request) {
	try {
		await connectDB();
		const { searchParams } = new URL(request.url);
		const filter = searchParams.get('filter') || '1month';
		
		let dateFilter: Record<string, unknown> = {};
		const now = new Date();
		
		switch (filter) {
			case '1week':
				dateFilter = { date: { $gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) } };
				break;
			case '1month':
				dateFilter = { date: { $gte: new Date(now.getFullYear(), now.getMonth(), 1) } };
				break;
			case '3months':
				dateFilter = { date: { $gte: new Date(now.getFullYear(), now.getMonth() - 3, 1) } };
				break;
			case '6months':
				dateFilter = { date: { $gte: new Date(now.getFullYear(), now.getMonth() - 6, 1) } };
				break;
			case '1year':
				dateFilter = { date: { $gte: new Date(now.getFullYear(), 0, 1) } };
				break;
			case 'all':
				dateFilter = {};
				break;
		}
		
		const [incomeData, expenseData, activeBudgets, donationData] = await Promise.all([
			Income.find(dateFilter).sort({ date: -1 }),
			Expense.find(dateFilter).sort({ date: -1 }),
			Budget.find({ status: 'active' }).sort({ createdAt: -1 }),
			Donation.find({ 
				...dateFilter, 
				paymentStatus: 'completed' 
			}).sort({ createdAt: -1 })
		]);

		// Calculate budget vs actual spending by category
		const budgetByCategory = activeBudgets.reduce((acc, budget) => {
			acc[budget.category] = (acc[budget.category] || 0) + budget.totalAmount;
			return acc;
		}, {} as Record<string, number>);

		const actualSpendingByCategory = expenseData.reduce((acc, expense) => {
			const category = expense.category === 'other' ? expense.customCategory : expense.category;
			acc[category] = (acc[category] || 0) + expense.amount;
			return acc;
		}, {} as Record<string, number>);

		const budgetUtilization = Object.keys(budgetByCategory).map(category => ({
			category,
			budgeted: budgetByCategory[category],
			actual: actualSpendingByCategory[category] || 0,
			remaining: budgetByCategory[category] - (actualSpendingByCategory[category] || 0),
			percentage: Math.round(((actualSpendingByCategory[category] || 0) / budgetByCategory[category]) * 100)
		}));
		
		const totalIncome = incomeData.reduce((sum, item) => sum + item.amount, 0);
		const totalDonations = donationData.reduce((sum, item) => sum + item.amount, 0);
		const totalExpenses = expenseData.reduce((sum, item) => sum + item.amount, 0);
		const netBalance = totalIncome + totalDonations - totalExpenses;
		
		const incomeBySource = incomeData.reduce((acc, item) => {
			const source = item.source === 'other' ? item.customSource : item.source;
			acc[source] = (acc[source] || 0) + item.amount;
			return acc;
		}, {} as Record<string, number>);
		
		// Add donations to income sources
		donationData.forEach(donation => {
			const source = donation.donationType === 'cause_specific' ? 'cause_donations' : 'donations';
			incomeBySource[source] = (incomeBySource[source] || 0) + donation.amount;
		});
		
		const expensesByCategory = expenseData.reduce((acc, item) => {
			const category = item.category === 'other' ? item.customCategory : item.category;
			acc[category] = (acc[category] || 0) + item.amount;
			return acc;
		}, {} as Record<string, number>);
		
		return NextResponse.json({
			totalIncome: totalIncome + totalDonations,
			totalExpenses,
			netBalance,
			incomeBySource,
			expensesByCategory,
			incomeCount: incomeData.length,
			donationCount: donationData.length,
			expenseCount: expenseData.length,
			activeBudgets: activeBudgets.length,
			totalDonations,
			budgetUtilization,
			period: filter
		}, { status: 200 });
	} catch (error) {
		console.error("Error fetching financial summary:", error);
		return NextResponse.json({ error: "Failed to fetch financial summary" }, { status: 500 });
	}
}
