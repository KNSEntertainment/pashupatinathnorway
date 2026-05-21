import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/models/Event.Model";
import Budget from "@/models/Budget.Model";
import Income from "@/models/Income.Model";
import Expense from "@/models/Expense.Model";
import Donation from "@/models/Donation.Model";
import EventRegistration from "@/models/EventRegistration.Model";
import mongoose from "mongoose";

export async function GET(
	request: Request,
	{ params }: { params: Promise<{ eventId: string }> }
) {
	const { eventId } = await params;
	try {
		await connectDB();

		if (!eventId) {
			return NextResponse.json({ error: "Event ID is required" }, { status: 400 });
		}

		const eventObjectId = new mongoose.Types.ObjectId(eventId);

		// Get event details
		const event = await Event.findById(eventObjectId);
		if (!event) {
			return NextResponse.json({ error: "Event not found" }, { status: 404 });
		}

		// Get budget information for the event
		const budgetAggregation = await Budget.aggregate([
			{ $match: { eventId: eventObjectId } },
			{
				$group: {
					_id: null,
					allocatedBudget: { $sum: "$allocatedAmount" },
					spentBudget: { $sum: "$spentAmount" },
					remainingBudget: { $sum: "$remainingAmount" },
				},
			},
		]);

		const budgetData = budgetAggregation[0] || {
			allocatedBudget: 0,
			spentBudget: 0,
			remainingBudget: 0,
		};

		// Get income information for the event
		const incomeAggregation = await Income.aggregate([
			{ $match: { eventId: eventObjectId } },
			{
				$group: {
					_id: null,
					totalIncome: { $sum: "$amount" },
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
			incomeBySource: [],
		};

		// Get expense information for the event
		const expenseAggregation = await Expense.aggregate([
			{ $match: { eventId: eventObjectId } },
			{
				$group: {
					_id: null,
					totalExpense: { $sum: "$amount" },
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
			totalExpense: 0,
			expensesByCategory: [],
		};

		// Get donation information for the event
		const donationAggregation = await Donation.aggregate([
			{ $match: { eventId: eventObjectId } },
			{
				$group: {
					_id: null,
					totalDonation: { $sum: "$amount" },
					donationCount: { $sum: 1 },
				},
			},
		]);

		const donationData = donationAggregation[0] || {
			totalDonation: 0,
			donationCount: 0,
		};

		// Get registration information for the event
		const registrationAggregation = await EventRegistration.aggregate([
			{ $match: { eventId: eventObjectId, registrationStatus: "registered" } },
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
					totalDonations: { $sum: "$donationAmount" },
				},
			},
		]);

		const registrationData = registrationAggregation[0] || {
			totalRegistrations: 0,
			memberRegistrations: 0,
			guestRegistrations: 0,
			totalRegistrationFees: 0,
			totalDonations: 0,
		};

		// Calculate profit/loss
		const profitOrLoss = incomeData.totalIncome - expenseData.totalExpense;

		// Get detailed breakdowns
		const incomeBreakdown = await Income.aggregate([
			{ $match: { eventId: eventObjectId } },
			{
				$group: {
					_id: "$sourceType",
					totalAmount: { $sum: "$amount" },
					count: { $sum: 1 },
				},
			},
		]);

		const expenseBreakdown = await Expense.aggregate([
			{ $match: { eventId: eventObjectId } },
			{
				$group: {
					_id: "$expenseCategory",
					totalAmount: { $sum: "$amount" },
					count: { $sum: 1 },
				},
			},
		]);

		// Get recent activities
		const recentIncome = await Income.find({ eventId: eventObjectId })
			.sort({ createdAt: -1 })
			.limit(5)
			.populate('createdBy', 'name email');

		const recentExpenses = await Expense.find({ eventId: eventObjectId })
			.sort({ createdAt: -1 })
			.limit(5)
			.populate('createdBy', 'name email');

		const recentRegistrations = await EventRegistration.find({ eventId: eventObjectId })
			.sort({ createdAt: -1 })
			.limit(5)
			.populate('membershipRef', 'firstName lastName membershipId');

		const recentDonations = await Donation.find({ eventId: eventObjectId })
			.sort({ createdAt: -1 })
			.limit(5);

		// Compile the comprehensive report
		const report = {
			event: {
				id: event._id,
				name: event.eventname,
				description: event.eventdescription,
				venue: event.eventvenue,
				date: event.eventdate,
				time: event.eventtime,
			},
			financialSummary: {
				allocatedBudget: budgetData.allocatedBudget,
				totalIncome: incomeData.totalIncome,
				totalExpense: expenseData.totalExpense,
				totalDonation: donationData.totalDonation,
				remainingBudget: budgetData.remainingBudget,
				profitOrLoss: profitOrLoss,
				totalRegistrationFees: registrationData.totalRegistrationFees,
			},
			registrationSummary: {
				totalRegistrations: registrationData.totalRegistrations,
				memberRegistrations: registrationData.memberRegistrations,
				guestRegistrations: registrationData.guestRegistrations,
				registrationFeesCollected: registrationData.totalRegistrationFees,
			},
			breakdowns: {
				incomeBySource: incomeBreakdown,
				expensesByCategory: expenseBreakdown,
			},
			recentActivity: {
				income: recentIncome,
				expenses: recentExpenses,
				registrations: recentRegistrations,
				donations: recentDonations,
			},
		};

		return NextResponse.json(report, { status: 200 });
	} catch (error) {
		console.error("Error generating event report:", error);
		return NextResponse.json({ error: "Failed to generate event report" }, { status: 500 });
	}
}
