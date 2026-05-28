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
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

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
    totalDonations: number;
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
  const [showCustomDateRange, setShowCustomDateRange] = useState(false);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  const convertToISODate = (dateString: string) => {
    if (!dateString) return '';
    const parts = dateString.split('/');
    if (parts.length !== 3) {
      console.error('Invalid date format:', dateString);
      return '';
    }
    
    const day = parts[0].padStart(2, '0');
    const month = parts[1].padStart(2, '0');
    const year = parts[2];
    
    const isoDate = `${year}-${month}-${day}`;
    console.log('Converting date:', dateString, '->', isoDate);
    return isoDate;
  };

  const fetchReport = useCallback(async (customFromDate?: string, customToDate?: string) => {
    try {
      setLoading(true);
      let url = '/api/reports/overall';
      
      if (customFromDate && customToDate) {
        const isoFromDate = convertToISODate(customFromDate);
        const isoToDate = convertToISODate(customToDate);
        url += `?from=${isoFromDate}&to=${isoToDate}`;
        console.log('Custom date range URL:', url);
        console.log('Original dates:', customFromDate, customToDate);
        console.log('ISO dates:', isoFromDate, isoToDate);
      } else if (period !== "all") {
        url += `?period=${period}`;
        console.log('Period URL:', url);
      }
      
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
    if (period !== 'custom') {
      fetchReport();
    }
  }, [fetchReport, period]);

  const handleCustomDateRange = useCallback(() => {
    if (period === 'custom') {
      setShowCustomDateRange(true);
    } else {
      setShowCustomDateRange(false);
      setFromDate('');
      setToDate('');
    }
  }, [period]);

  useEffect(() => {
    handleCustomDateRange();
  }, [period, handleCustomDateRange]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nb-NO', {
      style: 'currency',
      currency: 'NOK',
    }).format(amount);
  };

  const handleDateInput = (value: string, type: 'from' | 'to') => {
    let formatted = value.replace(/\D/g, ''); // Remove non-digits
    
    if (formatted.length >= 2 && formatted.length <= 4) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2);
    } else if (formatted.length > 4) {
      formatted = formatted.slice(0, 2) + '/' + formatted.slice(2, 4) + '/' + formatted.slice(4, 8);
    }
    
    if (type === 'from') {
      setFromDate(formatted);
    } else {
      setToDate(formatted);
    }
  };

  const handleShowReport = () => {
    if (fromDate && toDate) {
      fetchReport(fromDate, toDate);
    } else {
      toast.error('Please select both from and to dates');
    }
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

  const formatNOK = (amount: number): string => {
    return amount.toLocaleString('nb-NO', {
      style: 'currency',
      currency: 'NOK',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  const exportReportPDF = () => {
    if (!report) return;
    
    // Create new PDF document
    const doc = new jsPDF();
    
    // Add custom font for better Norwegian support
    doc.setFont('helvetica');
    
    // Set up page dimensions
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    
    // Header
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('Pashupatinath Norway', pageWidth / 2, 25, { align: 'center' });
    
    doc.setFontSize(14);
    doc.text('Financial Report', pageWidth / 2, 38, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Period: ${period}`, pageWidth / 2, 48, { align: 'center' });
    doc.text(`Date: ${new Date().toLocaleDateString('en-US')}`, pageWidth / 2, 54, { align: 'center' });
    
    // Calculate total income including donations
    const totalIncomeWithDonations = report.summary.totalIncome + report.summary.totalDonations;
    const adjustedProfitLoss = totalIncomeWithDonations - report.summary.totalExpenses;
    
    // Summary Section
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Summary', 20, 68);
    
    const summaryData = [
      ['Total Income (incl. donations)', formatNOK(totalIncomeWithDonations)],
      ['Total Expenses', formatNOK(report.summary.totalExpenses)],
      ...(adjustedProfitLoss >= 0 ? [['Profit', formatNOK(adjustedProfitLoss)]] : [['Loss', formatNOK(Math.abs(adjustedProfitLoss))]])
    ];
    
    // Create summary table
    autoTable(doc, {
      startY: 75,
      head: [['Description', 'Amount']],
      body: summaryData,
      theme: 'grid',
      styles: { fontSize: 9, cellPadding: 3 },
      headStyles: { fillColor: [59, 130, 246], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 15, right: 15 }
    });
    
    // Income Section
    const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Income Details', 20, finalY);
    
    const incomeData = [
      ['Total Income (incl. donations)', formatNOK(totalIncomeWithDonations)],
      ['Income Count', report.details.income.incomeCount.toString()],
      ['Average Income', formatNOK(report.details.income.averageIncome)],
      ['Total Donations', formatNOK(report.details.donations.totalDonations)],
      ['Donation Count', report.details.donations.donationCount.toString()],
      ['Average Donation', formatNOK(report.details.donations.averageDonation)]
    ];
    
    autoTable(doc, {
      startY: finalY + 6,
      head: [['Description', 'Value']],
      body: incomeData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [34, 197, 94], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 15, right: 15 }
    });
    
    // Expenses Section
    const expensesY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 8;
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Expense Details', 20, expensesY);
    
    const expenseData = [
      ['Total Expenses', formatNOK(report.details.expenses.totalExpenses)],
      ['Expense Count', report.details.expenses.expenseCount.toString()],
      ['Average Expense', formatNOK(report.details.expenses.averageExpense)]
    ];
    
    autoTable(doc, {
      startY: expensesY + 6,
      head: [['Description', 'Value']],
      body: expenseData,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [239, 68, 68], textColor: 255 },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: 15, right: 15 }
    });
    
        
    // Footer
    const footerY = pageHeight - 30;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Generated by Pashupatinath Norway Temple', pageWidth / 2, footerY, { align: 'center' });
    doc.text('Page 1', pageWidth / 2, footerY + 7, { align: 'center' });
    
    // Save the PDF
    const fileName = `financial-report-${period}-${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(fileName);
    
    toast.success('Financial report downloaded as PDF');
  };

  const exportReportCSV = () => {
    if (!report) return;
    
    // Calculate total income including donations
    const totalIncomeWithDonations = report.summary.totalIncome + report.summary.totalDonations;
    const adjustedProfitLoss = totalIncomeWithDonations - report.summary.totalExpenses;
    
    // Create CSV content
    const csvContent = [
      ['Pashupatinath Norway - Financial Report'],
      [`Period: ${period}`],
      [`Date: ${new Date().toLocaleDateString('en-US')}`],
      [''],
      ['SUMMARY'],
      ['Description', 'Amount'],
      ['Total Income (incl. donations)', totalIncomeWithDonations.toString()],
      ['Total Expenses', report.summary.totalExpenses.toString()],
      ...(adjustedProfitLoss >= 0 ? [['Profit', adjustedProfitLoss.toString()]] : [['Loss', Math.abs(adjustedProfitLoss).toString()]]),
      [''],
      ['INCOME DETAILS'],
      ['Description', 'Value'],
      ['Total Income (incl. donations)', totalIncomeWithDonations.toString()],
      ['Income Count', report.details.income.incomeCount.toString()],
      ['Average Income', report.details.income.averageIncome.toString()],
      ['Total Donations', report.details.donations.totalDonations.toString()],
      ['Donation Count', report.details.donations.donationCount.toString()],
      ['Average Donation', report.details.donations.averageDonation.toString()],
      [''],
      ['EXPENSE DETAILS'],
      ['Description', 'Value'],
      ['Total Expenses', report.details.expenses.totalExpenses.toString()],
      ['Expense Count', report.details.expenses.expenseCount.toString()],
      ['Average Expense', report.details.expenses.averageExpense.toString()]
    ];
    
    // Convert to CSV string
    const csvString = csvContent.map(row => 
      row.map(field => {
        // Escape quotes and wrap in quotes if contains comma or quote
        if (field.toString().includes(',') || field.toString().includes('"')) {
          return `"${field.toString().replace(/"/g, '""')}"`;
        }
        return field.toString();
      }).join(',')
    ).join('\n');
    
    // Create blob and download
    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `financial-report-${period}-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast.success('Financial report downloaded as CSV');
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
            <option value="custom">Custom Date Range</option>
          </select>
          <div className="flex items-center gap-2">
            <button
              onClick={exportReportPDF}
              disabled={!report}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300"
            >
              <Download size={20} />
              Export PDF
            </button>
            <button
              onClick={exportReportCSV}
              disabled={!report}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors disabled:bg-gray-300"
            >
              <Download size={20} />
              Export CSV
            </button>
          </div>
        </div>
      </div>

      {/* Custom Date Range Inputs */}
      {showCustomDateRange && (
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">From:</label>
              <input
                type="text"
                value={fromDate}
                onChange={(e) => handleDateInput(e.target.value, 'from')}
                placeholder="DD/MM/YYYY"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                maxLength={10}
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">To:</label>
              <input
                type="text"
                value={toDate}
                onChange={(e) => handleDateInput(e.target.value, 'to')}
                placeholder="DD/MM/YYYY"
                className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-32"
                maxLength={10}
              />
            </div>
            <button
              onClick={handleShowReport}
              disabled={!fromDate || !toDate || loading}
              className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300"
            >
              {loading ? <RefreshCw className="animate-spin" size={16} /> : null}
              Show Report
            </button>
          </div>
        </div>
      )}

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
                  <p className="text-gray-500 text-sm">Total Income (incl. donations)</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(report.summary.totalIncome + report.summary.totalDonations)}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">{report.details.income.incomeCount} income + {report.details.donations.donationCount} donations</p>
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
                  <p className={`text-2xl font-bold ${getProfitLossColor((report.summary.totalIncome + report.summary.totalDonations) - report.summary.totalExpenses)}`}>
                    {formatCurrency((report.summary.totalIncome + report.summary.totalDonations) - report.summary.totalExpenses)}
                  </p>
                </div>
                {React.createElement(getProfitLossIcon((report.summary.totalIncome + report.summary.totalDonations) - report.summary.totalExpenses), {
                  size: 24,
                  className: getProfitLossColor((report.summary.totalIncome + report.summary.totalDonations) - report.summary.totalExpenses)
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
                    <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Donations</th>
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
                      <td className="px-4 py-3 font-medium text-blue-600">{formatCurrency(event.totalDonations)}</td>
                      <td className="px-4 py-3 font-medium text-red-600">{formatCurrency(event.totalExpenses)}</td>
                      <td className="px-4 py-3 text-sm text-gray-600">{event.totalRegistrations}</td>
                      <td className={`px-4 py-3 font-medium ${getProfitLossColor(event.profitOrLoss)}`}>
                        {formatCurrency(event.profitOrLoss)}
                      </td>
                    </tr>
                  ))}
                  {report.eventComparison.length === 0 && (
                    <tr>
                      <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
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
