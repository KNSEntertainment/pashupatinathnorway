"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer 
} from "recharts";
import { 
  Users, 
  DollarSign, 
  Calendar, 
  TrendingUp, 
  TrendingDown, 
  Activity,
  UserCheck,
  CreditCard,
  Target,
  
} from "lucide-react";

interface DashboardStats {
  overview: {
    totalUsers: number;
    totalMembers: number;
    totalDonations: number;
    totalEvents: number;
    totalSubscribers: number;
    totalMessages: number;
    totalAttendance: number;
  };
  financial: {
    totalDonations: number;
    currentMonthDonations: number;
    lastMonthDonations: number;
    donationGrowth: number;
    totalExpenses: number;
    totalIncome: number;
    currentYearIncome: number;
  };
  charts: {
    monthlyDonations: Array<{ month: string; amount: number; count: number }>;
    eventTypes: Array<{ type: string; count: number }>;
    membershipStatus: Array<{ status: string; count: number }>;
    membershipTrends: Array<{ month: string; count: number }>;
    attendanceTrends: Array<{ date: string; present: number; total: number; percentage: number }>;
  };
  recentActivity: {
    donations: Array<{ id: string; amount: number; donorName: string; createdAt: string }>;
    transactions: Array<{ id: string; type: 'income' | 'expense'; amount: number; description: string; date: string; category: string }>;
    users: Array<{ id: string; fullName: string; email: string; role: string; createdAt: string }>;
  };
}

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({ title, value, change, icon: Icon, color, bgColor }) => (
  <Card className="hover:shadow-lg transition-shadow">
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-2">{value || 0}</p>
          {change !== undefined && (
            <div className="flex items-center mt-2">
              {change >= 0 ? (
                <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500 mr-1" />
              )}
              <span className={`text-sm ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {Math.abs(change).toFixed(1)}%
              </span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${bgColor}`}>
          <Icon className={`w-6 h-6 ${color}`} />
        </div>
      </div>
    </CardContent>
  </Card>
);

export default function AnalyticsDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/dashboard-stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="w-8 h-8 animate-spin text-brand_primary" />
      </div>
    );
  }

  if (!stats) {
    return <div className="text-center text-gray-500">Failed to load dashboard data</div>;
  }

  return (
    <div className="space-y-6">
      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  
        <MetricCard
          title="Total Members"
          value={stats.overview.totalMembers.toLocaleString()}
          icon={UserCheck}
          color="text-orange-600"
          bgColor="bg-orange-100"
        />
        <MetricCard
          title="Total Donations"
          value={`NOK ${stats.financial.totalDonations.toLocaleString()}`}
          change={stats.financial.donationGrowth}
          icon={DollarSign}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <MetricCard
          title="Total Events"
          value={stats.overview.totalEvents.toLocaleString()}
          icon={Calendar}
          color="text-purple-600"
          bgColor="bg-purple-100"
        />
        <MetricCard
          title="Total Income"
          value={`NOK ${stats.financial.totalIncome.toLocaleString()}`}
          icon={TrendingUp}
          color="text-green-600"
          bgColor="bg-green-100"
        />
        <MetricCard
          title="Total Expenses"
          value={`NOK ${stats.financial.totalExpenses.toLocaleString()}`}
          icon={TrendingDown}
          color="text-red-600"
          bgColor="bg-red-100"
        />
        <MetricCard
          title="Net Balance"
          value={`NOK ${(stats.financial.totalIncome - stats.financial.totalExpenses).toLocaleString()}`}
          icon={Target}
          color={(stats.financial.totalIncome - stats.financial.totalExpenses) >= 0 ? "text-green-600" : "text-red-600"}
          bgColor={(stats.financial.totalIncome - stats.financial.totalExpenses) >= 0 ? "bg-green-100" : "bg-red-100"}
        />
      </div>

      {/* Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Donation Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Monthly Donation Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={stats.charts.monthlyDonations}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`NOK ${value ? value.toLocaleString() : '0'}`, 'Amount']} />
                <Area type="monotone" dataKey="amount" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Monthly Membership Trends */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="w-5 h-5" />
              Monthly Membership Trends
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={stats.charts.membershipTrends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="count" 
                  stroke="#8884d8" 
                  strokeWidth={2}
                  name="New Members"
                  dot={{ fill: '#8884d8', r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      
      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Donations */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Recent Donations
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.donations.map((donation) => (
                <div key={donation.id} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <div>
                    <p className="font-medium text-sm">{donation.donorName}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(donation.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <span className="font-semibold text-green-600">
                    NOK {donation.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Transactions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="w-5 h-5" />
              Recent Transactions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.transactions.map((transaction) => (
                <div key={transaction.id} className={`p-2 rounded ${
                  transaction.type === 'income' ? 'bg-green-50 border-l-4 border-green-500' : 'bg-red-50 border-l-4 border-red-500'
                }`}>
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-medium text-sm">{transaction.description}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        {new Date(transaction.date).toLocaleDateString()} • {transaction.category}
                      </p>
                    </div>
                    <span className={`font-semibold text-sm ${
                      transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'} NOK {transaction.amount.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Recent Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.users.map((user) => (
                <div key={user.id} className="p-2 bg-gray-50 rounded">
                  <p className="font-medium text-sm">{user.fullName}</p>
                  <div className="flex justify-between items-center mt-1">
                    <span className="text-xs text-gray-500">{user.email}</span>
                    <span className={`text-xs px-2 py-1 rounded ${
                      user.role === 'admin' 
                        ? 'bg-red-100 text-red-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}>
                      {user.role}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
