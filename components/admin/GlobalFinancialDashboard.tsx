"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Target,
  RefreshCw,
  BarChart3,
  PieChart,
  CreditCard,
  Download
} from "lucide-react";
import { toast } from "react-hot-toast";

interface OverallReport {
  summary: {
    totalBudgets: number;
    totalIncome: number;
    totalExpenses: number;
    totalDonations: number;
    totalProfitLoss: number;
    totalRegistrations: number;
  };
  details: {
    budgets: {
      totalAllocated: number;
      totalSpent: number;
      totalRemaining: number;
      budgetCount: number;
    };
    income: {
      totalIncome: number;
      incomeCount: number;
      averageIncome: number;
    };
    expenses: {
      totalExpenses: number;
      expenseCount: number;
      averageExpense: number;
    };
    donations: {
      totalDonations: number;
      donationCount: number;
      averageDonation: number;
    };
    registrations: {
      totalRegistrations: number;
      memberRegistrations: number;
      guestRegistrations: number;
      totalRegistrationFees: number;
      totalRegistrationDonations: number;
    };
  };
  trends: {
    monthlyIncome: Array<{
      _id: { year: number; month: number };
      total: number;
      count: number;
    }>;
    monthlyExpenses: Array<{
      _id: { year: number; month: number };
      total: number;
      count: number;
    }>;
    monthlyDonations: Array<{
      _id: { year: number; month: number };
      total: number;
      count: number;
    }>;
  };
  breakdowns: {
    incomeBySource: Array<{
      _id: string;
      totalAmount: number;
      count: number;
      percentage: number;
    }>;
    expensesByCategory: Array<{
      _id: string;
      totalAmount: number;
      count: number;
      percentage: number;
    }>;
  };
  eventComparison: Array<{
    eventname: string;
    eventdate: string;
    totalIncome: number;
    totalExpenses: number;
    totalRegistrations: number;
    profitOrLoss: number;
  }>;
  period: string;
  generatedAt: string;
}

export default function GlobalFinancialDashboard() {
  const [report, setReport] = useState<OverallReport | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("all");

  const fetchReport = useCallback(async () => {
    try {
      setLoading(true);
      const url = `/api/reports/overall${period !== "all" ? `?period=${period}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch report");
      const data = await response.json();
      setReport(data);
    } catch (error) {
      toast.error("Failed to load financial report");
      console.error(error);
      setReport(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchReport();
  }, [fetchReport]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatMonth = (year: number, month: number) => {
    return new Date(year, month - 1).toLocaleDateString('en-US', { 
      month: 'short', 
      year: 'numeric' 
    });
  };

  const getProfitLossColor = (amount: number) => {
    if (amount > 0) return "text-green-600";
    if (amount < 0) return "text-red-600";
    return "text-gray-600";
  };

  const getProfitLossIcon = (amount: number) => {
    if (amount > 0) return TrendingUp;
    if (amount < 0) return TrendingDown;
    return Target;
  };

  const exportReport = () => {
    if (!report) return;
    
    const dataStr = JSON.stringify(report, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `financial-report-${period}-${new Date().toISOString().split('T')[0]}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Global Financial Dashboard</h1>
        <div className="flex items-center gap-4">
          <select
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          <button
            onClick={exportReport}
            disabled={!report}
            className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300"
          >
            <Download size={20} />
            Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="animate-spin text-blue-500" size={48} />
        </div>
      ) : !report ? (
        <div className="bg-white p-12 rounded-lg shadow border border-gray-200 text-center">
          <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Data Available</h2>
          <p className="text-gray-500">No financial data found for the selected period</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Budgets</p>
                  <p className="text-3xl font-bold text-blue-600">
                    {formatCurrency(report.summary.totalBudgets)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{report.details.budgets.budgetCount} budgets</p>
                </div>
                <Target className="text-blue-500" size={32} />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Income</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(report.summary.totalIncome)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{report.details.income.incomeCount} transactions</p>
                </div>
                <TrendingUp className="text-green-500" size={32} />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Expenses</p>
                  <p className="text-3xl font-bold text-red-600">
                    {formatCurrency(report.summary.totalExpenses)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{report.details.expenses.expenseCount} transactions</p>
                </div>
                <TrendingDown className="text-red-500" size={32} />
              </div>
            </div>
          </div>

          {/* Secondary Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Donations</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(report.summary.totalDonations)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{report.details.donations.donationCount} donations</p>
                </div>
                <CreditCard className="text-orange-500" size={24} />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Profit/Loss</p>
                  <p className={`text-2xl font-bold ${getProfitLossColor(report.summary.totalProfitLoss)}`}>
                    {formatCurrency(report.summary.totalProfitLoss)}
                  </p>
                </div>
                {React.createElement(getProfitLossIcon(report.summary.totalProfitLoss), {
                  size: 24,
                  className: getProfitLossColor(report.summary.totalProfitLoss)
                })}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Registrations</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {report.summary.totalRegistrations}
                  </p>
                </div>
                <Users className="text-purple-500" size={24} />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Budget Remaining</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {formatCurrency(report.details.budgets.totalRemaining)}
                  </p>
                </div>
                <DollarSign className="text-teal-500" size={24} />
              </div>
            </div>
          </div>

          {/* Monthly Trends */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Monthly Trends</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Income Trend */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <TrendingUp className="text-green-500" size={16} />
                  Income Trend
                </h4>
                <div className="space-y-2">
                  {report.trends.monthlyIncome.slice(-6).map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{formatMonth(item._id.year, item._id.month)}</span>
                      <span className="font-medium text-green-600">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                  {report.trends.monthlyIncome.length === 0 && (
                    <p className="text-sm text-gray-500">No income data available</p>
                  )}
                </div>
              </div>

              {/* Expense Trend */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <TrendingDown className="text-red-500" size={16} />
                  Expense Trend
                </h4>
                <div className="space-y-2">
                  {report.trends.monthlyExpenses.slice(-6).map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{formatMonth(item._id.year, item._id.month)}</span>
                      <span className="font-medium text-red-600">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                  {report.trends.monthlyExpenses.length === 0 && (
                    <p className="text-sm text-gray-500">No expense data available</p>
                  )}
                </div>
              </div>

              {/* Donation Trend */}
              <div>
                <h4 className="font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <CreditCard className="text-orange-500" size={16} />
                  Donation Trend
                </h4>
                <div className="space-y-2">
                  {report.trends.monthlyDonations.slice(-6).map((item, index) => (
                    <div key={index} className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">{formatMonth(item._id.year, item._id.month)}</span>
                      <span className="font-medium text-orange-600">{formatCurrency(item.total)}</span>
                    </div>
                  ))}
                  {report.trends.monthlyDonations.length === 0 && (
                    <p className="text-sm text-gray-500">No donation data available</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income by Source */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Income by Source</h3>
              <div className="space-y-3">
                {report.breakdowns.incomeBySource.map((source, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <PieChart className="text-green-500" size={20} />
                      <div>
                        <p className="font-medium text-gray-800">{source._id}</p>
                        <p className="text-sm text-gray-500">{source.count} transactions ({source.percentage.toFixed(1)}%)</p>
                      </div>
                    </div>
                    <p className="font-bold text-green-600">{formatCurrency(source.totalAmount)}</p>
                  </div>
                ))}
                {report.breakdowns.incomeBySource.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No income data available</p>
                )}
              </div>
            </div>

            {/* Expenses by Category */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Expenses by Category</h3>
              <div className="space-y-3">
                {report.breakdowns.expensesByCategory.map((category, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="text-red-500" size={20} />
                      <div>
                        <p className="font-medium text-gray-800">{category._id}</p>
                        <p className="text-sm text-gray-500">{category.count} transactions ({category.percentage.toFixed(1)}%)</p>
                      </div>
                    </div>
                    <p className="font-bold text-red-600">{formatCurrency(category.totalAmount)}</p>
                  </div>
                ))}
                {report.breakdowns.expensesByCategory.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No expense data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Event Comparison */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Event Performance</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Event</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Income</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Expenses</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Registrations</th>
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Profit/Loss</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {report.eventComparison.map((event, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-4 py-3 font-medium text-gray-900">{event.eventname}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{event.eventdate}</td>
                      <td className="px-4 py-3 font-medium text-green-600">{formatCurrency(event.totalIncome)}</td>
                      <td className="px-4 py-3 font-medium text-red-600">{formatCurrency(event.totalExpenses)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{event.totalRegistrations}</td>
                      <td className={`px-4 py-3 font-medium ${getProfitLossColor(event.profitOrLoss)}`}>
                        {formatCurrency(event.profitOrLoss)}
                      </td>
                    </tr>
                  ))}
                  {report.eventComparison.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-4 py-8 text-center text-gray-500">
                        No event data available
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Details */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Additional Details</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Budget Details</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Allocated: {formatCurrency(report.details.budgets.totalAllocated)}</p>
                  <p className="text-gray-600">Spent: {formatCurrency(report.details.budgets.totalSpent)}</p>
                  <p className="text-gray-600">Remaining: {formatCurrency(report.details.budgets.totalRemaining)}</p>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Income Details</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Total: {formatCurrency(report.details.income.totalIncome)}</p>
                  <p className="text-gray-600">Transactions: {report.details.income.incomeCount}</p>
                  <p className="text-gray-600">Average: {formatCurrency(report.details.income.averageIncome)}</p>
                </div>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Expense Details</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Total: {formatCurrency(report.details.expenses.totalExpenses)}</p>
                  <p className="text-gray-600">Transactions: {report.details.expenses.expenseCount}</p>
                  <p className="text-gray-600">Average: {formatCurrency(report.details.expenses.averageExpense)}</p>
                </div>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">Donation Details</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Total: {formatCurrency(report.details.donations.totalDonations)}</p>
                  <p className="text-gray-600">Count: {report.details.donations.donationCount}</p>
                  <p className="text-gray-600">Average: {formatCurrency(report.details.donations.averageDonation)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Report Info */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Period: {period === "all" ? "All Time" : period}</span>
              <span>Generated: {new Date(report.generatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
