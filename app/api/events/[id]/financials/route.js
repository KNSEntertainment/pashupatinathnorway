import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Event from "@/models/Event.Model";
import Income from "@/models/Income.Model";
import Expense from "@/models/Expense.Model";
import Donation from "@/models/Donation.Model";

// GET API to fetch financial data for a specific event
export async function GET(request, { params }) {
  const { id } = await params;

  try {
    await connectDB();

    // Verify event exists
    const event = await Event.findById(id);
    if (!event) {
      return NextResponse.json({ success: false, error: "Event not found" }, { status: 404 });
    }

    // Calculate total income for this event
    const incomeAggregation = await Income.aggregate([
      {
        $match: {
          eventId: event._id,
        },
      },
      {
        $group: {
          _id: null,
          totalIncome: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Calculate donations for this event from Donation model
    const donationsAggregation = await Donation.aggregate([
      {
        $match: {
          eventId: event._id,
          paymentStatus: "completed",
        },
      },
      {
        $group: {
          _id: null,
          totalDonations: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Calculate total expenses for this event
    const expenseAggregation = await Expense.aggregate([
      {
        $match: {
          eventId: event._id,
        },
      },
      {
        $group: {
          _id: null,
          totalExpenses: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);

    // Extract totals from aggregation results
    const totalIncome = incomeAggregation.length > 0 ? incomeAggregation[0].totalIncome : 0;
    const totalDonations = donationsAggregation.length > 0 ? donationsAggregation[0].totalDonations : 0;
    const totalExpenses = expenseAggregation.length > 0 ? expenseAggregation[0].totalExpenses : 0;

    const financials = {
      totalIncome,
      totalDonations,
      totalExpenses,
      netResult: totalIncome - totalExpenses,
      incomeCount: incomeAggregation.length > 0 ? incomeAggregation[0].count : 0,
      donationsCount: donationsAggregation.length > 0 ? donationsAggregation[0].count : 0,
      expenseCount: expenseAggregation.length > 0 ? expenseAggregation[0].count : 0,
    };

    return NextResponse.json({ 
      success: true, 
      financials,
      event: {
        id: event._id,
        name: event.eventname,
        date: event.eventdate,
      }
    }, { status: 200 });
  } catch (error) {
    console.error("Error fetching event financials:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
