"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TrendingUp, TrendingDown, DollarSign, PiggyBank, Plus, BarChart3 } from "lucide-react";
import { formatNOK } from "@/lib/norwegianCurrency";

const BudgetCharts = dynamic(() => import('@/components/dashboard/BudgetCharts'), {
  ssr: false,
  loading: () => <div className="h-64 animate-pulse bg-muted rounded-lg" />
});

interface Income {
  _id: string;
  amount: number;
  source: string;
  customSource?: string;
  description?: string;
  date: string;
  reference?: string;
  createdBy: { name: string; email: string };
}

interface Expense {
  _id: string;
  amount: number;
  category: string;
  customCategory?: string;
  description?: string;
  date: string;
  reference?: string;
  createdBy: { name: string; email: string };
}

interface Budget {
  _id: string;
  name: string;
  description?: string;
  category: string;
  totalAmount: number;
  period: string;
  startDate: string;
  endDate: string;
  status: string;
  createdBy: { name: string; email: string };
}

interface BudgetUtilization {
  category: string;
  budgeted: number;
  actual: number;
  remaining: number;
  percentage: number;
}

interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  incomeBySource: Record<string, number>;
  expensesByCategory: Record<string, number>;
  incomeCount: number;
  donationCount: number;
  expenseCount: number;
  activeBudgets: number;
  totalDonations: number;
  budgetUtilization: BudgetUtilization[];
  period: string;
}

export default function BudgetManagement() {
  const { data: session } = useSession();
  const [summary, setSummary] = useState<FinancialSummary | null>(null);
  const [income, setIncome] = useState<Income[]>([]);
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [filter, setFilter] = useState("1month");
  const [showIncomeDialog, setShowIncomeDialog] = useState(false);
  const [showExpenseDialog, setShowExpenseDialog] = useState(false);
  const [showBudgetDialog, setShowBudgetDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<string | null>(null);
  const [editingIncome, setEditingIncome] = useState<string | null>(null);
  const [editingExpense, setEditingExpense] = useState<string | null>(null);

  const [incomeForm, setIncomeForm] = useState({
    amount: "", source: "", customSource: "", description: "",
    date: new Date().toISOString().split('T')[0], reference: ""
  });

  const [expenseForm, setExpenseForm] = useState({
    amount: "", category: "", customCategory: "", description: "",
    date: new Date().toISOString().split('T')[0], reference: ""
  });

  const [budgetForm, setBudgetForm] = useState({
    name: "", description: "", category: "overall", totalAmount: "", period: "monthly",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  });

  const fetchData = useCallback(async () => {
    try {
      const [summaryRes, incomeRes, expenseRes, budgetRes] = await Promise.all([
        fetch(`/api/financial-summary?filter=${filter}`),
        fetch(`/api/income?filter=${filter}`),
        fetch(`/api/expense?filter=${filter}`),
        fetch(`/api/budget`)
      ]);
      const [summaryData, incomeData, expensesData, budgetData] = await Promise.all([
        summaryRes.json(), incomeRes.json(), expenseRes.json(), budgetRes.json()
      ]);
      if (summaryData.success && incomeData.success && expensesData.success && budgetData.success) {
        setSummary(summaryData.data);
        setIncome(incomeData.data);
        setExpenses(expensesData.data);
        setBudgets(budgetData.data);
      }
    } catch (error) {
      console.error("Error fetching budget data:", error);
    }
  }, [filter]);

  useEffect(() => { fetchData(); }, [filter, fetchData]);

  const resetIncomeForm = () => setIncomeForm({
    amount: "", source: "", customSource: "", description: "",
    date: new Date().toISOString().split('T')[0], reference: ""
  });

  const resetExpenseForm = () => setExpenseForm({
    amount: "", category: "", customCategory: "", description: "",
    date: new Date().toISOString().split('T')[0], reference: ""
  });

  const resetBudgetForm = () => setBudgetForm({
    name: "", description: "", category: "overall", totalAmount: "", period: "monthly",
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(new Date().setMonth(new Date().getMonth() + 1)).toISOString().split('T')[0]
  });

  const handleIncomeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    const response = await fetch("/api/income", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...incomeForm, amount: parseFloat(incomeForm.amount), createdBy: session.user.id })
    });
    if (response.ok) { setShowIncomeDialog(false); resetIncomeForm(); fetchData(); }
  };

  const handleUpdateIncome = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !editingIncome) return;
    const response = await fetch("/api/income", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingIncome, ...incomeForm, amount: parseFloat(incomeForm.amount), createdBy: session.user.id })
    });
    if (response.ok) { setShowIncomeDialog(false); setEditingIncome(null); resetIncomeForm(); fetchData(); }
  };

  const handleDeleteIncome = async (id: string) => {
    if (!confirm("Are you sure you want to delete this income entry?")) return;
    const response = await fetch(`/api/income?id=${id}`, { method: "DELETE" });
    if (response.ok) fetchData();
  };

  const handleEditIncome = (item: Income) => {
    setEditingIncome(item._id);
    setIncomeForm({
      amount: item.amount.toString(), source: item.source,
      customSource: item.customSource || "", description: item.description || "",
      date: new Date(item.date).toISOString().split('T')[0], reference: item.reference || ""
    });
    setShowIncomeDialog(true);
  };

  const handleExpenseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    const response = await fetch("/api/expense", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...expenseForm, amount: parseFloat(expenseForm.amount), createdBy: session.user.id })
    });
    if (response.ok) { setShowExpenseDialog(false); resetExpenseForm(); fetchData(); }
  };

  const handleUpdateExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !editingExpense) return;
    const response = await fetch("/api/expense", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingExpense, ...expenseForm, amount: parseFloat(expenseForm.amount), createdBy: session.user.id })
    });
    if (response.ok) { setShowExpenseDialog(false); setEditingExpense(null); resetExpenseForm(); fetchData(); }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense entry?")) return;
    const response = await fetch(`/api/expense?id=${id}`, { method: "DELETE" });
    if (response.ok) fetchData();
  };

  const handleEditExpense = (item: Expense) => {
    setEditingExpense(item._id);
    setExpenseForm({
      amount: item.amount.toString(), category: item.category,
      customCategory: item.customCategory || "", description: item.description || "",
      date: new Date(item.date).toISOString().split('T')[0], reference: item.reference || ""
    });
    setShowExpenseDialog(true);
  };

  const handleBudgetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id) return;
    const response = await fetch("/api/budget", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...budgetForm, totalAmount: parseFloat(budgetForm.totalAmount), createdBy: session.user.id })
    });
    if (response.ok) { setShowBudgetDialog(false); resetBudgetForm(); fetchData(); }
  };

  const handleUpdateBudget = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session?.user?.id || !editingBudget) return;
    const response = await fetch("/api/budget", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: editingBudget, ...budgetForm, totalAmount: parseFloat(budgetForm.totalAmount), createdBy: session.user.id })
    });
    if (response.ok) { setShowBudgetDialog(false); setEditingBudget(null); resetBudgetForm(); fetchData(); }
  };

  const handleDeleteBudget = async (id: string) => {
    if (!confirm("Are you sure you want to delete this budget?")) return;
    const response = await fetch(`/api/budget?id=${id}`, { method: "DELETE" });
    if (response.ok) fetchData();
  };

  const handleEditBudget = (budget: Budget) => {
    setEditingBudget(budget._id);
    setBudgetForm({
      name: budget.name, description: budget.description || "",
      category: budget.category, totalAmount: budget.totalAmount.toString(),
      period: budget.period,
      startDate: new Date(budget.startDate).toISOString().split('T')[0],
      endDate: new Date(budget.endDate).toISOString().split('T')[0]
    });
    setShowBudgetDialog(true);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
          <p className="text-gray-600 mt-2">Track and manage your organization&apos;s finances</p>
        </div>
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="Filter period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1week">1 Week</SelectItem>
            <SelectItem value="1month">1 Month</SelectItem>
            <SelectItem value="3months">3 Months</SelectItem>
            <SelectItem value="6months">6 Months</SelectItem>
            <SelectItem value="1year">1 Year</SelectItem>
            <SelectItem value="all">All Time</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Income</p>
                  <p className="text-2xl font-bold text-green-600">{formatNOK(summary.totalIncome)}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Expenses</p>
                  <p className="text-2xl font-bold text-red-600">{formatNOK(summary.totalExpenses)}</p>
                </div>
                <TrendingDown className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Net Balance</p>
                  <p className={`text-2xl font-bold ${summary.netBalance >= 0 ? 'text-blue-600' : 'text-red-600'}`}>
                    {formatNOK(summary.netBalance)}
                  </p>
                </div>
                <DollarSign className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>
          <Card className="border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Budgets</p>
                  <p className="text-2xl font-bold text-purple-600">{summary.activeBudgets}</p>
                </div>
                <PiggyBank className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
          <TabsTrigger value="expenses">Expenses</TabsTrigger>
          <TabsTrigger value="budgets">Budgets</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          {summary && (
            <BudgetCharts
              incomeBySource={summary.incomeBySource}
              expensesByCategory={summary.expensesByCategory}
            />
          )}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Income Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary && Object.entries(summary.incomeBySource).map(([source, amount]) => (
                  <div key={source} className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium capitalize">{source}</span>
                    <span className="text-sm font-bold text-green-600">{formatNOK(amount)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
            <Card className="border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="w-5 h-5" />
                  Expense Details
                </CardTitle>
              </CardHeader>
              <CardContent>
                {summary && Object.entries(summary.expensesByCategory).map(([category, amount]) => (
                  <div key={category} className="flex justify-between items-center py-2 border-b">
                    <span className="text-sm font-medium capitalize">{category}</span>
                    <span className="text-sm font-bold text-red-600">{formatNOK(amount)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Income Tab */}
        <TabsContent value="income" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Income Records</h2>
            <Dialog open={showIncomeDialog} onOpenChange={setShowIncomeDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingIncome(null)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Income
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingIncome ? 'Edit Income' : 'Add New Income'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={editingIncome ? handleUpdateIncome : handleIncomeSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="amount">Amount</Label>
                    <Input id="amount" type="number" step="0.01" value={incomeForm.amount}
                      onChange={(e) => setIncomeForm({ ...incomeForm, amount: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="source">Source</Label>
                    <Select value={incomeForm.source} onValueChange={(value) => setIncomeForm({ ...incomeForm, source: value })}>
                      <SelectTrigger><SelectValue placeholder="Select source" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="donations">Donations</SelectItem>
                        <SelectItem value="membership_fees">Membership Fees</SelectItem>
                        <SelectItem value="events">Events</SelectItem>
                        <SelectItem value="sponsorships">Sponsorships</SelectItem>
                        <SelectItem value="grants">Grants</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {incomeForm.source === "other" && (
                    <div>
                      <Label htmlFor="customSource">Specify Source</Label>
                      <Input id="customSource" value={incomeForm.customSource}
                        onChange={(e) => setIncomeForm({ ...incomeForm, customSource: e.target.value })} required />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" value={incomeForm.description}
                      onChange={(e) => setIncomeForm({ ...incomeForm, description: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="date">Date</Label>
                    <Input id="date" type="date" value={incomeForm.date}
                      onChange={(e) => setIncomeForm({ ...incomeForm, date: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="reference">Reference</Label>
                    <Input id="reference" value={incomeForm.reference}
                      onChange={(e) => setIncomeForm({ ...incomeForm, reference: e.target.value })} />
                  </div>
                  <Button type="submit" className="w-full">{editingIncome ? 'Update Income' : 'Add Income'}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Card className="border-0 shadow-lg">
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Source</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {income.map((item) => (
                      <tr key={item._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{formatDate(item.date)}</td>
                        <td className="py-3 px-4 capitalize">{item.source === 'other' ? item.customSource : item.source}</td>
                        <td className="py-3 px-4 font-bold text-green-600">{formatNOK(item.amount)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleEditIncome(item)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteIncome(item._id)}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Expenses Tab */}
        <TabsContent value="expenses" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Expense Records</h2>
            <Dialog open={showExpenseDialog} onOpenChange={setShowExpenseDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingExpense(null)}>
                  <Plus className="w-4 h-4 mr-2" /> Add Expense
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingExpense ? 'Edit Expense' : 'Add New Expense'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={editingExpense ? handleUpdateExpense : handleExpenseSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="expenseAmount">Amount</Label>
                    <Input id="expenseAmount" type="number" step="0.01" value={expenseForm.amount}
                      onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={expenseForm.category} onValueChange={(value) => setExpenseForm({ ...expenseForm, category: value })}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="salaries">Salaries</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="events">Events</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="supplies">Supplies</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="taxes">Taxes</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {expenseForm.category === "other" && (
                    <div>
                      <Label htmlFor="customCategory">Specify Category</Label>
                      <Input id="customCategory" value={expenseForm.customCategory}
                        onChange={(e) => setExpenseForm({ ...expenseForm, customCategory: e.target.value })} required />
                    </div>
                  )}
                  <div>
                    <Label htmlFor="expenseDescription">Description</Label>
                    <Textarea id="expenseDescription" value={expenseForm.description}
                      onChange={(e) => setExpenseForm({ ...expenseForm, description: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="expenseDate">Date</Label>
                    <Input id="expenseDate" type="date" value={expenseForm.date}
                      onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="expenseReference">Reference</Label>
                    <Input id="expenseReference" value={expenseForm.reference}
                      onChange={(e) => setExpenseForm({ ...expenseForm, reference: e.target.value })} />
                  </div>
                  <Button type="submit" className="w-full">{editingExpense ? 'Update Expense' : 'Add Expense'}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Card className="border-0 shadow-lg">
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4">Date</th>
                      <th className="text-left py-3 px-4">Category</th>
                      <th className="text-left py-3 px-4">Amount</th>
                      <th className="text-left py-3 px-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((item) => (
                      <tr key={item._id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4">{formatDate(item.date)}</td>
                        <td className="py-3 px-4 capitalize">{item.category === 'other' ? item.customCategory : item.category}</td>
                        <td className="py-3 px-4 font-bold text-red-600">{formatNOK(item.amount)}</td>
                        <td className="py-3 px-4">
                          <div className="flex gap-1">
                            <Button size="sm" variant="outline" onClick={() => handleEditExpense(item)}>Edit</Button>
                            <Button size="sm" variant="destructive" onClick={() => handleDeleteExpense(item._id)}>Delete</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Budgets Tab */}
        <TabsContent value="budgets" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Budget Management</h2>
            <Dialog open={showBudgetDialog} onOpenChange={setShowBudgetDialog}>
              <DialogTrigger asChild>
                <Button onClick={() => setEditingBudget(null)}>
                  <Plus className="w-4 h-4 mr-2" /> Create Budget
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
                </DialogHeader>
                <form onSubmit={editingBudget ? handleUpdateBudget : handleBudgetSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="budgetName">Budget Name</Label>
                    <Input id="budgetName" value={budgetForm.name}
                      onChange={(e) => setBudgetForm({ ...budgetForm, name: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="budgetDescription">Description</Label>
                    <Textarea id="budgetDescription" value={budgetForm.description}
                      onChange={(e) => setBudgetForm({ ...budgetForm, description: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="budgetAmount">Total Amount</Label>
                    <Input id="budgetAmount" type="number" step="0.01" value={budgetForm.totalAmount}
                      onChange={(e) => setBudgetForm({ ...budgetForm, totalAmount: e.target.value })} required />
                  </div>
                  <div>
                    <Label htmlFor="budgetCategory">Category</Label>
                    <Select value={budgetForm.category} onValueChange={(value) => setBudgetForm({ ...budgetForm, category: value })}>
                      <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="overall">Overall Budget</SelectItem>
                        <SelectItem value="rent">Rent</SelectItem>
                        <SelectItem value="utilities">Utilities</SelectItem>
                        <SelectItem value="salaries">Salaries</SelectItem>
                        <SelectItem value="marketing">Marketing</SelectItem>
                        <SelectItem value="events">Events</SelectItem>
                        <SelectItem value="maintenance">Maintenance</SelectItem>
                        <SelectItem value="supplies">Supplies</SelectItem>
                        <SelectItem value="insurance">Insurance</SelectItem>
                        <SelectItem value="taxes">Taxes</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="budgetPeriod">Period</Label>
                    <Select value={budgetForm.period} onValueChange={(value) => setBudgetForm({ ...budgetForm, period: value })}>
                      <SelectTrigger><SelectValue placeholder="Select period" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="startDate">Start Date</Label>
                      <Input id="startDate" type="date" value={budgetForm.startDate}
                        onChange={(e) => setBudgetForm({ ...budgetForm, startDate: e.target.value })} required />
                    </div>
                    <div>
                      <Label htmlFor="endDate">End Date</Label>
                      <Input id="endDate" type="date" value={budgetForm.endDate}
                        onChange={(e) => setBudgetForm({ ...budgetForm, endDate: e.target.value })} required />
                    </div>
                  </div>
                  <Button type="submit" className="w-full">{editingBudget ? 'Update Budget' : 'Create Budget'}</Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {budgets.map((budget) => (
              <Card key={budget._id} className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{budget.name}</CardTitle>
                      <p className="text-sm text-gray-600">{budget.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={budget.status === 'active' ? 'default' : 'secondary'}>{budget.status}</Badge>
                      <div className="flex gap-1">
                        <Button size="sm" variant="outline" onClick={() => handleEditBudget(budget)}>Edit</Button>
                        <Button size="sm" variant="destructive" onClick={() => handleDeleteBudget(budget._id)}>Delete</Button>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Category:</span>
                      <span className="text-sm capitalize">{budget.category === 'overall' ? 'Overall Budget' : budget.category}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Budget Amount:</span>
                      <span className="text-sm font-bold">{formatNOK(budget.totalAmount)}</span>
                    </div>
                    {summary?.budgetUtilization?.filter(bu => bu.category === budget.category).map((utilization, index) => (
                      <div key={index}>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Spent:</span>
                          <span className="text-sm font-bold text-orange-600">{formatNOK(utilization.actual)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">Remaining:</span>
                          <span className={`text-sm font-bold ${utilization.remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {formatNOK(utilization.remaining)}
                          </span>
                        </div>
                        <div className="mt-2">
                          <div className="flex justify-between items-center mb-1">
                            <span className="text-xs font-medium">Utilization:</span>
                            <span className={`text-xs font-bold ${utilization.percentage >= 90 ? 'text-red-600' : utilization.percentage >= 75 ? 'text-orange-600' : 'text-green-600'}`}>
                              {utilization.percentage}%
                            </span>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${utilization.percentage >= 90 ? 'bg-red-600' : utilization.percentage >= 75 ? 'bg-orange-600' : 'bg-green-600'}`}
                              style={{ width: `${Math.min(utilization.percentage, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Period:</span>
                      <span className="text-sm capitalize">{budget.period}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm font-medium">Duration:</span>
                      <span className="text-sm">{formatDate(budget.startDate)} - {formatDate(budget.endDate)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {budgets.length === 0 && (
            <Card className="border-0 shadow-lg">
              <CardContent className="text-center py-12">
                <PiggyBank className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No budgets created</h3>
                <p className="text-gray-500 mb-6">Create your first budget to start tracking your spending limits</p>
                <Button onClick={() => { setEditingBudget(null); setShowBudgetDialog(true); }}>
                  <Plus className="w-4 h-4 mr-2" /> Create Your First Budget
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}