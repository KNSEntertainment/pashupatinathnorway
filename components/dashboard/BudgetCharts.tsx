"use client";

import { PieChart as RechartsPieChart, Cell, ResponsiveContainer, Legend, Tooltip, Pie } from 'recharts';
import { BarChart as RechartsBarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, BarChart } from "lucide-react";
import { formatNOK } from "@/lib/norwegianCurrency";

interface Props {
  incomeBySource: Record<string, number>;
  expensesByCategory: Record<string, number>;
}

const COLORS = ["#10b981", "#3b82f6", "#f59e0b", "#8b5cf6", "#ef4444", "#06b6d4"];

export default function BudgetCharts({ incomeBySource, expensesByCategory }: Props) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Income by Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(incomeBySource).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsPieChart>
                <Pie
                  data={Object.entries(incomeBySource).map(([source, amount]) => ({
                    name: source.charAt(0).toUpperCase() + source.slice(1),
                    value: amount
                  }))}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={(entry) => entry?.name && entry?.value ? `${entry.name}: ${formatNOK(entry.value)}` : ''}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {Object.keys(incomeBySource).map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => value ? formatNOK(Number(value)) : ''} />
                <Legend />
              </RechartsPieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">No income data available</div>
          )}
        </CardContent>
      </Card>

      <Card className="border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart className="w-5 h-5" />
            Expenses by Category
          </CardTitle>
        </CardHeader>
        <CardContent>
          {Object.keys(expensesByCategory).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <RechartsBarChart
                data={Object.entries(expensesByCategory).map(([category, amount]) => ({
                  category: category.charAt(0).toUpperCase() + category.slice(1),
                  amount
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="category" angle={-45} textAnchor="end" height={80} />
                <YAxis />
                <RechartsTooltip formatter={(value) => value ? formatNOK(Number(value)) : ''} />
                <Bar dataKey="amount" fill="#ef4444" />
              </RechartsBarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8 text-gray-500">No expense data available</div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}