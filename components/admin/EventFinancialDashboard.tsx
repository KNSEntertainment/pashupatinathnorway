"use client";

import React, { useState, useEffect, useCallback } from "react";
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Calendar,
  Target,
  AlertCircle,
  RefreshCw,
  BarChart3,
  PieChart,
  CreditCard,
  Receipt,
  UserCheck,
  UserPlus
} from "lucide-react";
import { toast } from "react-hot-toast";

interface Event {
  _id: string;
  eventname: string;
  eventdescription: string;
  eventvenue: string;
  eventdate: string;
  eventtime: string;
}

interface EventReport {
  event: Event;
  financialSummary: {
    allocatedBudget: number;
    totalIncome: number;
    totalExpense: number;
    totalDonation: number;
    remainingBudget: number;
    profitOrLoss: number;
    totalRegistrationFees: number;
  };
  registrationSummary: {
    totalRegistrations: number;
    memberRegistrations: number;
    guestRegistrations: number;
    registrationFeesCollected: number;
  };
  breakdowns: {
    incomeBySource: Array<{
      _id: string;
      totalAmount: number;
      count: number;
    }>;
    expensesByCategory: Array<{
      _id: string;
      totalAmount: number;
      count: number;
    }>;
  };
  recentActivity: {
    income: Array<{
      _id: string;
      title: string;
      amount: number;
      sourceType: string;
      createdAt: string;
    }>;
    expenses: Array<{
      _id: string;
      title: string;
      amount: number;
      category: string;
      createdAt: string;
    }>;
    registrations: Array<{
      _id: string;
      name: string;
      email: string;
      paymentAmount: number;
      createdAt: string;
    }>;
    donations: Array<{
      _id: string;
      donorName: string;
      donorEmail: string;
      amount: number;
      createdAt: string;
    }>;
  };
}

export default function EventFinancialDashboard() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<string>("");
  const [eventReport, setEventReport] = useState<EventReport | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    try {
      const response = await fetch("/api/events");
      if (!response.ok) throw new Error("Failed to fetch events");
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      toast.error("Failed to load events");
      console.error(error);
      setEvents([]);
    }
  }, []);

  const fetchEventReport = useCallback(async (eventId: string) => {
    if (!eventId) return;
    
    try {
      setLoading(true);
      const response = await fetch(`/api/reports/event/${eventId}`);
      if (!response.ok) throw new Error("Failed to fetch event report");
      const data = await response.json();
      setEventReport(data);
    } catch (error) {
      toast.error("Failed to load event report");
      console.error(error);
      setEventReport(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  useEffect(() => {
    if (selectedEvent) {
      fetchEventReport(selectedEvent);
    } else {
      setEventReport(null);
    }
  }, [selectedEvent, fetchEventReport]);

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
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-4">
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select Event</option>
            {events.map(event => (
              <option key={event._id} value={event._id}>
                {event.eventname} - {event.eventdate}
              </option>
            ))}
          </select>
        </div>
      </div>

      {!selectedEvent ? (
        <div className="bg-white p-12 rounded-lg shadow border border-gray-200 text-center">
          <BarChart3 className="mx-auto text-gray-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">Select an Event</h2>
          <p className="text-gray-500">Choose an event from the dropdown to view its financial dashboard</p>
        </div>
      ) : loading ? (
        <div className="flex items-center justify-center min-h-screen">
          <RefreshCw className="animate-spin text-blue-500" size={48} />
        </div>
      ) : !eventReport ? (
        <div className="bg-white p-12 rounded-lg shadow border border-gray-200 text-center">
          <AlertCircle className="mx-auto text-red-400 mb-4" size={48} />
          <h2 className="text-xl font-semibold text-gray-700 mb-2">No Data Available</h2>
          <p className="text-gray-500">No financial data found for this event</p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Event Header */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{eventReport.event.eventname}</h2>
                <p className="text-gray-600 mt-1">{eventReport.event.eventdescription}</p>
                <div className="flex items-center gap-4 mt-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={16} />
                    <span>{eventReport.event.eventdate}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Target size={16} />
                    <span>{eventReport.event.eventvenue}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Allocated Budget</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {formatCurrency(eventReport.financialSummary.allocatedBudget)}
                  </p>
                </div>
                <Target className="text-blue-500" size={24} />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">
                    {formatCurrency(eventReport.financialSummary.totalIncome)}
                  </p>
                </div>
                <TrendingUp className="text-green-500" size={24} />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">
                    {formatCurrency(eventReport.financialSummary.totalExpense)}
                  </p>
                </div>
                <TrendingDown className="text-red-500" size={24} />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Profit/Loss</p>
                  <p className={`text-2xl font-bold ${getProfitLossColor(eventReport.financialSummary.profitOrLoss)}`}>
                    {formatCurrency(eventReport.financialSummary.profitOrLoss)}
                  </p>
                </div>
                {React.createElement(getProfitLossIcon(eventReport.financialSummary.profitOrLoss), {
                  size: 24,
                  className: getProfitLossColor(eventReport.financialSummary.profitOrLoss)
                })}
              </div>
            </div>
          </div>

          {/* Additional Financial Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Remaining Budget</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {formatCurrency(eventReport.financialSummary.remainingBudget)}
                  </p>
                </div>
                <DollarSign className="text-purple-500" size={24} />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Donations</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {formatCurrency(eventReport.financialSummary.totalDonation)}
                  </p>
                </div>
                <CreditCard className="text-orange-500" size={24} />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Registration Fees</p>
                  <p className="text-2xl font-bold text-indigo-600">
                    {formatCurrency(eventReport.financialSummary.totalRegistrationFees)}
                  </p>
                </div>
                <Receipt className="text-indigo-500" size={24} />
              </div>
            </div>
            
            <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-500 text-sm">Total Registrations</p>
                  <p className="text-2xl font-bold text-teal-600">
                    {eventReport.registrationSummary.totalRegistrations}
                  </p>
                </div>
                <Users className="text-teal-500" size={24} />
              </div>
            </div>
          </div>

          {/* Registration Summary */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Registration Summary</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <UserCheck className="mx-auto text-blue-500 mb-2" size={24} />
                <p className="text-2xl font-bold text-blue-600">{eventReport.registrationSummary.memberRegistrations}</p>
                <p className="text-sm text-gray-600">Member Registrations</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <UserPlus className="mx-auto text-green-500 mb-2" size={24} />
                <p className="text-2xl font-bold text-green-600">{eventReport.registrationSummary.guestRegistrations}</p>
                <p className="text-sm text-gray-600">Guest Registrations</p>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <DollarSign className="mx-auto text-purple-500 mb-2" size={24} />
                <p className="text-2xl font-bold text-purple-600">{formatCurrency(eventReport.registrationSummary.registrationFeesCollected)}</p>
                <p className="text-sm text-gray-600">Fees Collected</p>
              </div>
            </div>
          </div>

          {/* Income and Expense Breakdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Income by Source */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Income by Source</h3>
              <div className="space-y-3">
                {eventReport.breakdowns.incomeBySource.map((source, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <PieChart className="text-green-500" size={20} />
                      <div>
                        <p className="font-medium text-gray-800">{source._id}</p>
                        <p className="text-sm text-gray-500">{source.count} transactions</p>
                      </div>
                    </div>
                    <p className="font-bold text-green-600">{formatCurrency(source.totalAmount)}</p>
                  </div>
                ))}
                {eventReport.breakdowns.incomeBySource.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No income data available</p>
                )}
              </div>
            </div>

            {/* Expenses by Category */}
            <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Expenses by Category</h3>
              <div className="space-y-3">
                {eventReport.breakdowns.expensesByCategory.map((category, index) => (
                  <div key={index} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="text-red-500" size={20} />
                      <div>
                        <p className="font-medium text-gray-800">{category._id}</p>
                        <p className="text-sm text-gray-500">{category.count} transactions</p>
                      </div>
                    </div>
                    <p className="font-bold text-red-600">{formatCurrency(category.totalAmount)}</p>
                  </div>
                ))}
                {eventReport.breakdowns.expensesByCategory.length === 0 && (
                  <p className="text-center text-gray-500 py-4">No expense data available</p>
                )}
              </div>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Recent Activity</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Recent Income */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <TrendingUp className="text-green-500" size={16} />
                  Recent Income
                </h4>
                <div className="space-y-2">
                  {eventReport.recentActivity.income.slice(0, 3).map((income, index) => (
                    <div key={index} className="p-2 bg-green-50 rounded text-sm">
                      <p className="font-medium text-gray-800">{income.title}</p>
                      <p className="text-green-600">{formatCurrency(income.amount)}</p>
                    </div>
                  ))}
                  {eventReport.recentActivity.income.length === 0 && (
                    <p className="text-sm text-gray-500">No recent income</p>
                  )}
                </div>
              </div>

              {/* Recent Expenses */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <TrendingDown className="text-red-500" size={16} />
                  Recent Expenses
                </h4>
                <div className="space-y-2">
                  {eventReport.recentActivity.expenses.slice(0, 3).map((expense, index) => (
                    <div key={index} className="p-2 bg-red-50 rounded text-sm">
                      <p className="font-medium text-gray-800">{expense.title}</p>
                      <p className="text-red-600">{formatCurrency(expense.amount)}</p>
                    </div>
                  ))}
                  {eventReport.recentActivity.expenses.length === 0 && (
                    <p className="text-sm text-gray-500">No recent expenses</p>
                  )}
                </div>
              </div>

              {/* Recent Registrations */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Users className="text-blue-500" size={16} />
                  Recent Registrations
                </h4>
                <div className="space-y-2">
                  {eventReport.recentActivity.registrations.slice(0, 3).map((reg, index) => (
                    <div key={index} className="p-2 bg-blue-50 rounded text-sm">
                      <p className="font-medium text-gray-800">{reg.name}</p>
                      <p className="text-blue-600">Payment: {reg.paymentAmount} kr</p>
                    </div>
                  ))}
                  {eventReport.recentActivity.registrations.length === 0 && (
                    <p className="text-sm text-gray-500">No recent registrations</p>
                  )}
                </div>
              </div>

              {/* Recent Donations */}
              <div>
                <h4 className="font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <CreditCard className="text-orange-500" size={16} />
                  Recent Donations
                </h4>
                <div className="space-y-2">
                  {eventReport.recentActivity.donations.slice(0, 3).map((donation, index) => (
                    <div key={index} className="p-2 bg-orange-50 rounded text-sm">
                      <p className="font-medium text-gray-800">{donation.donorName}</p>
                      <p className="text-orange-600">{formatCurrency(donation.amount)}</p>
                    </div>
                  ))}
                  {eventReport.recentActivity.donations.length === 0 && (
                    <p className="text-sm text-gray-500">No recent donations</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
