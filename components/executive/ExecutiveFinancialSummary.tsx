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
  CreditCard
} from "lucide-react";
import { toast } from "react-hot-toast";

interface FinancialSummary {
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
  };
  period: string;
  generatedAt: string;
}

export default function ExecutiveFinancialSummary() {
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [period, setPeriod] = useState("all");

  const fetchSummary = useCallback(async () => {
    try {
      setLoading(true);
      const url = `/api/reports/overall${period !== "all" ? `?period=${period}` : ""}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error("Failed to fetch financial summary");
      const data = await response.json();
      setSummary(data);
    } catch (error) {
      toast.error("Failed to load financial summary");
      console.error(error);
      setSummary(null);
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
    }).format(amount);
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

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-800">Financial Summary</h1>
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
            onClick={fetchSummary}
            className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="animate-spin text-blue-500" size={48} />
        </div>
      ) : !summary ? (
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
                    {formatCurrency(summary.summary.totalBudgets)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{summary.details.budgets.budgetCount} budgets</p>
                </div>
                <Target className="text-blue-500" size={32} />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Income</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(summary.summary.totalIncome)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{summary.details.income.incomeCount} transactions</p>
                </div>
                <TrendingUp className="text-green-500" size={32} />
              </div>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Expenses</p>
                  <p className="text-3xl font-bold text-red-600">
                    {formatCurrency(summary.summary.totalExpenses)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{summary.details.expenses.expenseCount} transactions</p>
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
                    {formatCurrency(summary.summary.totalDonations)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{summary.details.donations.donationCount} donations</p>
                </div>
                <CreditCard className="text-orange-500" size={24} />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Profit/Loss</p>
                  <p className={`text-2xl font-bold ${getProfitLossColor(summary.summary.totalProfitLoss)}`}>
                    {formatCurrency(summary.summary.totalProfitLoss)}
                  </p>
                </div>
                {React.createElement(getProfitLossIcon(summary.summary.totalProfitLoss), {
                  size: 24,
                  className: getProfitLossColor(summary.summary.totalProfitLoss)
                })}
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Registrations</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {summary.summary.totalRegistrations}
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
                    {formatCurrency(summary.details.budgets.totalRemaining)}
                  </p>
                </div>
                <DollarSign className="text-teal-500" size={24} />
              </div>
            </div>
          </div>

          {/* Key Metrics Overview */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Key Metrics Overview</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2">Budget Health</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Allocated: {formatCurrency(summary.details.budgets.totalAllocated)}</p>
                  <p className="text-gray-600">Spent: {formatCurrency(summary.details.budgets.totalSpent)}</p>
                  <p className="text-gray-600">Remaining: {formatCurrency(summary.details.budgets.totalRemaining)}</p>
                </div>
              </div>
              
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-800 mb-2">Income Overview</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Total: {formatCurrency(summary.details.income.totalIncome)}</p>
                  <p className="text-gray-600">Transactions: {summary.details.income.incomeCount}</p>
                  <p className="text-gray-600">Average: {formatCurrency(summary.details.income.averageIncome)}</p>
                </div>
              </div>
              
              <div className="p-4 bg-red-50 rounded-lg">
                <h4 className="font-medium text-red-800 mb-2">Expense Overview</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Total: {formatCurrency(summary.details.expenses.totalExpenses)}</p>
                  <p className="text-gray-600">Transactions: {summary.details.expenses.expenseCount}</p>
                  <p className="text-gray-600">Average: {formatCurrency(summary.details.expenses.averageExpense)}</p>
                </div>
              </div>
              
              <div className="p-4 bg-orange-50 rounded-lg">
                <h4 className="font-medium text-orange-800 mb-2">Donation Overview</h4>
                <div className="space-y-1 text-sm">
                  <p className="text-gray-600">Total: {formatCurrency(summary.details.donations.totalDonations)}</p>
                  <p className="text-gray-600">Count: {summary.details.donations.donationCount}</p>
                  <p className="text-gray-600">Average: {formatCurrency(summary.details.donations.averageDonation)}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Report Info */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center text-sm text-gray-600">
              <span>Period: {period === "all" ? "All Time" : period}</span>
              <span>Generated: {new Date(summary.generatedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
