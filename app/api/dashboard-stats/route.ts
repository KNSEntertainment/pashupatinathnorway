import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import User from "@/models/User.Model";
import Donation from "@/models/Donation.Model";
import Event from "@/models/Event.Model";
import Membership from "@/models/Membership.Model";
import Expense from "@/models/Expense.Model";
import Income from "@/models/Income.Model";
import Subscriber from "@/models/Subscriber.Model";
import Message from "@/models/Message.Model";
import Attendance from "@/models/Attendance.Model";

export async function GET() {
  try {
    await connectDB();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    const startOfYear = new Date(now.getFullYear(), 0, 1);

    // Get all counts
    const [
      totalUsers,
      totalMembers,
      totalDonations,
      totalEvents,
      totalSubscribers,
      totalMessages,
      totalAttendance
    ] = await Promise.all([
      User.countDocuments(),
      Membership.countDocuments(),
      Donation.countDocuments(),
      Event.countDocuments(),
      Subscriber.countDocuments(),
      Message.countDocuments(),
      Attendance.countDocuments()
    ]);

    // Financial data
    const [
      totalDonationAmount,
      currentMonthDonations,
      lastMonthDonations,
      totalExpenseAmount,
      totalIncomeAmount,
      currentYearIncome
    ] = await Promise.all([
      Donation.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Donation.aggregate([
        { $match: { createdAt: { $gte: startOfMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Donation.aggregate([
        { $match: { createdAt: { $gte: startOfLastMonth, $lte: endOfLastMonth } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Expense.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Income.aggregate([
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ]),
      Income.aggregate([
        { $match: { date: { $gte: startOfYear } } },
        { $group: { _id: null, total: { $sum: "$amount" } } }
      ])
    ]);

    // Monthly donation trends for last 6 months
    const monthlyDonations = await Donation.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth() - 6, 1)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          total: { $sum: "$amount" },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Event types distribution
    const eventTypes = await Event.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);

    // Membership status distribution
    const membershipStatus = await Membership.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);

    // Monthly membership trends for last 6 months
    const membershipTrends = await Membership.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(now.getFullYear(), now.getMonth() - 6, 1)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // Recent activity
    const [
      recentDonations,
      recentIncome,
      recentExpenses,
      recentUsers
    ] = await Promise.all([
      Donation.find().sort({ createdAt: -1 }).limit(5).populate('userId', 'fullName email'),
      Income.find().sort({ date: -1 }).limit(5),
      Expense.find().sort({ date: -1 }).limit(5),
      User.find().sort({ createdAt: -1 }).limit(5).select('fullName email role createdAt')
    ]);

    // Attendance trends
    const attendanceTrends = await Attendance.aggregate([
      {
        $match: {
          date: {
            $gte: new Date(now.getFullYear(), now.getMonth() - 3, 1)
          }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: "$date" },
            month: { $month: "$date" },
            day: { $dayOfMonth: "$date" }
          },
          present: { $sum: { $cond: ["$status", 1, 0] } },
          total: { $sum: 1 }
        }
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1 } }
    ]);

    const stats = {
      overview: {
        totalUsers,
        totalMembers,
        totalDonations,
        totalEvents,
        totalSubscribers,
        totalMessages,
        totalAttendance
      },
      financial: {
        totalDonations: totalDonationAmount[0]?.total || 0,
        currentMonthDonations: currentMonthDonations[0]?.total || 0,
        lastMonthDonations: lastMonthDonations[0]?.total || 0,
        donationGrowth: lastMonthDonations[0]?.total ? 
          ((currentMonthDonations[0]?.total || 0) - lastMonthDonations[0]?.total) / lastMonthDonations[0]?.total * 100 : 0,
        totalExpenses: totalExpenseAmount[0]?.total || 0,
        totalIncome: totalIncomeAmount[0]?.total || 0,
        currentYearIncome: currentYearIncome[0]?.total || 0
      },
      charts: {
        monthlyDonations: monthlyDonations.map(item => ({
          month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en', { month: 'short' }),
          amount: item.total,
          count: item.count
        })),
        eventTypes: eventTypes.map(item => ({
          type: item._id || 'Other',
          count: item.count
        })),
        membershipStatus: membershipStatus.map(item => ({
          status: item._id || 'Unknown',
          count: item.count
        })),
        membershipTrends: membershipTrends.map(item => ({
          month: new Date(item._id.year, item._id.month - 1).toLocaleDateString('en', { month: 'short' }),
          count: item.count
        })),
        attendanceTrends: attendanceTrends.map(item => ({
          date: new Date(item._id.year, item._id.month - 1, item._id.day).toLocaleDateString(),
          present: item.present,
          total: item.total,
          percentage: item.total > 0 ? (item.present / item.total) * 100 : 0
        }))
      },
      recentActivity: {
        donations: recentDonations.map(donation => ({
          id: donation._id,
          amount: donation.amount,
          donorName: donation.userId?.fullName || donation.donorName || 'Anonymous',
          createdAt: donation.createdAt
        })),
        transactions: [
          ...recentIncome.map(income => ({
            id: income._id,
            type: 'income',
            amount: income.amount,
            description: income.description || 'Income',
            date: income.date,
            category: income.category || 'General'
          })),
          ...recentExpenses.map(expense => ({
            id: expense._id,
            type: 'expense',
            amount: expense.amount,
            description: expense.description || 'Expense',
            date: expense.date,
            category: expense.category || 'General'
          }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 5),
        users: recentUsers.map(user => ({
          id: user._id,
          fullName: user.fullName,
          email: user.email,
          role: user.role,
          createdAt: user.createdAt
        }))
      }
    };

    return NextResponse.json(stats);
  } catch (error) {
    console.error("Dashboard stats error:", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
