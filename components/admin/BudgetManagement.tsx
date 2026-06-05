"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Save, X, RefreshCw, TrendingUp, TrendingDown, Target, AlertCircle, Coins } from "lucide-react";
import { toast } from "react-hot-toast";

interface Event {
	_id: string;
	eventname: string;
	eventdate: string;
}

interface Budget {
	_id?: string;
	name: string;
	description: string;
	eventId: string | null;
	category: string;
	allocatedAmount: number;
	spentAmount: number;
	remainingAmount: number;
	period: string;
	startDate: string;
	endDate: string;
	status: string;
	createdBy?: string;
	event?: Event;
	expenses?: Expense[];
	expenseCount?: number;
}

interface Expense {
	_id: string;
	title: string;
	amount: number;
	budgetId: string;
	date: string;
}

const categories = ["rent", "utilities", "salaries", "marketing", "events", "maintenance", "supplies", "insurance", "taxes", "other", "overall"];

const periods = ["monthly", "quarterly", "yearly"];
const statuses = ["active", "inactive", "completed"];

export default function BudgetManagement() {
	const [rawBudgets, setRawBudgets] = useState<Budget[]>([]);
	const [budgets, setBudgets] = useState<Budget[]>([]);
	const [events, setEvents] = useState<Event[]>([]);
	const [expenses, setExpenses] = useState<Expense[]>([]);
	const [loading, setLoading] = useState(true);
	const [isCreating, setIsCreating] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [formData, setFormData] = useState<Partial<Budget>>({
		name: "",
		description: "",
		eventId: null,
		category: "other",
		allocatedAmount: 0,
		spentAmount: 0,
		period: "monthly",
		startDate: "",
		endDate: "",
		status: "active",
	});

	const fetchExpenses = useCallback(async () => {
		try {
			const response = await fetch("/api/expense");
			if (!response.ok) throw new Error("Failed to fetch expenses");
			const data = await response.json();
			setExpenses(data);
		} catch (error) {
			console.error("Failed to load expenses:", error);
			setExpenses([]);
		}
	}, []);

	const fetchBudgets = useCallback(async () => {
		try {
			setLoading(true);
			const response = await fetch("/api/budget");
			if (!response.ok) throw new Error("Failed to fetch budgets");
			const data = await response.json();
			setRawBudgets(data);
		} catch (error) {
			toast.error("Failed to load budgets");
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, []);

	const fetchEvents = useCallback(async () => {
		try {
			const response = await fetch("/api/events");
			if (!response.ok) throw new Error("Failed to fetch events");
			const data = await response.json();
			setEvents(data.events || []);
		} catch (error) {
			console.error("Failed to load events:", error);
			setEvents([]);
		}
	}, []);

	useEffect(() => {
		fetchExpenses();
		fetchBudgets();
		fetchEvents();
	}, [fetchExpenses, fetchBudgets, fetchEvents]);

	// Calculate budget expenses separately to avoid re-renders
	useEffect(() => {
		if (rawBudgets.length > 0) {
			const budgetsWithExpenses = rawBudgets.map((budget: Budget) => {
				const budgetExpenses = expenses.filter((expense) => {
					// Handle both string and ObjectId comparison
					if (!expense.budgetId) return false;

					const expenseBudgetId = typeof expense.budgetId === "string" ? expense.budgetId : String(expense.budgetId);
					return expenseBudgetId === budget._id;
				});
				const totalSpent = budgetExpenses.reduce((sum, expense) => sum + expense.amount, 0);

				return {
					...budget,
					spentAmount: totalSpent,
					remainingAmount: budget.allocatedAmount - totalSpent,
					expenses: budgetExpenses,
					expenseCount: budgetExpenses.length,
				};
			});

			setBudgets(budgetsWithExpenses);
		}
	}, [rawBudgets, expenses]);

	const resetForm = () => {
		setFormData({
			name: "",
			description: "",
			eventId: null,
			category: "other",
			allocatedAmount: 0,
			spentAmount: 0,
			period: "monthly",
			startDate: "",
			endDate: "",
			status: "active",
		});
		setIsCreating(false);
		setEditingId(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const url = editingId ? `/api/budget` : `/api/budget`;
			const method = editingId ? "PUT" : "POST";
			const payload = editingId ? { ...formData, id: editingId } : formData;

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) throw new Error("Failed to save budget");

			toast.success(editingId ? "Budget updated successfully" : "Budget created successfully");
			resetForm();
			fetchBudgets();
		} catch (error) {
			toast.error("Failed to save budget");
			console.error(error);
		}
	};

	const handleEdit = (budget: Budget) => {
		setFormData({
			name: budget.name,
			description: budget.description,
			eventId: budget.eventId,
			category: budget.category,
			allocatedAmount: budget.allocatedAmount,
			spentAmount: budget.spentAmount,
			period: budget.period,
			startDate: budget.startDate ? new Date(budget.startDate).toISOString().split("T")[0] : "",
			endDate: budget.endDate ? new Date(budget.endDate).toISOString().split("T")[0] : "",
			status: budget.status,
		});
		setEditingId(budget._id!);
		setIsCreating(true);
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this budget?")) return;

		try {
			const response = await fetch(`/api/budget?id=${id}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to delete budget");

			toast.success("Budget deleted successfully");
			fetchBudgets();
		} catch (error) {
			toast.error("Failed to delete budget");
			console.error(error);
		}
	};

	const calculateRemaining = (allocated: number, spent: number) => {
		return allocated - spent;
	};

	if (loading) {
		return (
			<div className="flex items-center justify-center min-h-screen">
				<RefreshCw className="animate-spin text-blue-500" size={48} />
			</div>
		);
	}

	return (
		<div className="p-6 max-w-7xl mx-auto">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold text-gray-800">Budget Management</h1>
				<button onClick={() => setIsCreating(true)} className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors">
					<Plus size={20} />
					Add Budget
				</button>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<div className="bg-white p-4 rounded-lg shadow border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-500 text-sm">Total Allocated</p>
							<p className="text-2xl font-bold text-blue-600">kr{budgets.reduce((sum, b) => sum + (b.allocatedAmount || 0), 0).toLocaleString()}</p>
						</div>
						<Target className="text-blue-500" size={24} />
					</div>
				</div>

				<div className="bg-white p-4 rounded-lg shadow border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-500 text-sm">Total Spent</p>
							<p className="text-2xl font-bold text-red-600">kr{budgets.reduce((sum, b) => sum + (b.spentAmount || 0), 0).toLocaleString()}</p>
						</div>
						<TrendingDown className="text-red-500" size={24} />
					</div>
				</div>

				<div className="bg-white p-4 rounded-lg shadow border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-500 text-sm">Total Remaining</p>
							<p className="text-2xl font-bold text-green-600">kr{budgets.reduce((sum, b) => sum + (b.remainingAmount || 0), 0).toLocaleString()}</p>
						</div>
						<TrendingUp className="text-green-500" size={24} />
					</div>
				</div>

				<div className="bg-white p-4 rounded-lg shadow border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-500 text-sm">Active Budgets</p>
							<p className="text-2xl font-bold text-purple-600">{budgets.filter((b) => b.status === "active").length}</p>
						</div>
						<Coins className="text-purple-500" size={24} />
					</div>
				</div>
			</div>

			{/* Create/Edit Form */}
			{(isCreating || editingId) && (
				<div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-200">
					<h2 className="text-xl font-semibold mb-4">{editingId ? "Edit Budget" : "Create New Budget"}</h2>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Budget Name *</label>
								<input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Category *</label>
								<select required value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
									{categories.map((cat) => (
										<option key={cat} value={cat}>
											{cat.charAt(0).toUpperCase() + cat.slice(1)}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
								<select value={formData.eventId || ""} onChange={(e) => setFormData({ ...formData, eventId: e.target.value || null })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
									<option value="">Select Event (Optional)</option>
									{events.map((event) => (
										<option key={event._id} value={event._id}>
											{event.eventname} - {event.eventdate}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Period *</label>
								<select required value={formData.period} onChange={(e) => setFormData({ ...formData, period: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
									{periods.map((period) => (
										<option key={period} value={period}>
											{period.charAt(0).toUpperCase() + period.slice(1)}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Allocated Amount *</label>
								<input
									type="number"
									required
									min="0"
									step="0.01"
									value={formData.allocatedAmount}
									onChange={(e) =>
										setFormData({
											...formData,
											allocatedAmount: parseFloat(e.target.value) || 0,
											remainingAmount: calculateRemaining(parseFloat(e.target.value) || 0, formData.spentAmount || 0),
										})
									}
									className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
								/>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
								<input type="date" required value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">End Date *</label>
								<input type="date" required value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Status *</label>
								<select required value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
									{statuses.map((status) => (
										<option key={status} value={status}>
											{status.charAt(0).toUpperCase() + status.slice(1)}
										</option>
									))}
								</select>
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
							<textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={3} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
						</div>

						<div className="flex gap-2">
							<button type="submit" className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
								<Save size={20} />
								{editingId ? "Update" : "Create"}
							</button>
							<button type="button" onClick={resetForm} className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors">
								<X size={20} />
								Cancel
							</button>
						</div>
					</form>
				</div>
			)}

			{/* Budgets Table */}
			<div className="bg-white rounded-lg shadow border border-gray-200">
				<div className="p-4 border-b border-gray-200">
					<h2 className="text-xl font-semibold">Budgets</h2>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Name</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Event</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Category</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Allocated</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Spent</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Expenses</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Remaining</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Period</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Status</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{budgets.map((budget) => (
								<tr key={budget._id} className="hover:bg-gray-50">
									<td className="px-4 py-3">
										<div>
											<p className="font-medium text-gray-900">{budget.name}</p>
											{budget.description && <p className="text-sm text-gray-500">{budget.description}</p>}
										</div>
									</td>
									<td className="px-4 py-3">
										{budget.eventId ? (
											<div>
												<p className="font-medium text-gray-900">{budget.event?.eventname || "Unknown Event"}</p>
												<p className="text-sm text-gray-500">{budget.event?.eventdate || "No Date"}</p>
											</div>
										) : (
											<span className="text-gray-400">No Event</span>
										)}
									</td>
									<td className="px-4 py-3">
										<span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded">{budget.category}</span>
									</td>
									<td className="px-4 py-3 font-medium text-blue-600">kr{(budget.allocatedAmount || 0).toLocaleString()}</td>
									<td className="px-4 py-3 font-medium text-red-600">kr{(budget.spentAmount || 0).toLocaleString()}</td>
									<td className="px-4 py-3">
										<div className="flex items-center gap-2">
											<span className="px-2 py-1 text-xs font-medium bg-orange-100 text-orange-800 rounded">{budget.expenseCount || 0} expenses</span>
											{budget.expenseCount && budget.expenseCount > 0 && (
												<button
													onClick={() => {
														// TODO: Add functionality to show expense details
														toast(`View ${budget.expenseCount} expense(s) for ${budget.name}`);
													}}
													className="text-blue-500 hover:text-blue-700 text-sm"
												>
													View
												</button>
											)}
										</div>
									</td>
									<td className="px-4 py-3">
										<span className={`font-medium ${(budget.remainingAmount || 0) >= 0 ? "text-green-600" : "text-red-600"}`}>kr{(budget.remainingAmount || 0).toLocaleString()}</span>
										{(budget.remainingAmount || 0) < 0 && (
											<div className="flex items-center text-xs text-red-500 mt-1">
												<AlertCircle size={12} className="mr-1" />
												Over Budget
											</div>
										)}
									</td>
									<td className="px-4 py-3">
										<span className="text-sm text-gray-600">{budget.period}</span>
									</td>
									<td className="px-4 py-3">
										<span className={`px-2 py-1 text-xs font-medium rounded ${budget.status === "active" ? "bg-green-100 text-green-800" : budget.status === "inactive" ? "bg-yellow-100 text-brand_primary" : "bg-gray-100 text-gray-800"}`}>{budget.status}</span>
									</td>
									<td className="px-4 py-3">
										<div className="flex gap-2">
											<button onClick={() => handleEdit(budget)} className="text-blue-500 hover:text-blue-700">
												<Edit size={16} />
											</button>
											<button onClick={() => handleDelete(budget._id!)} className="text-red-500 hover:text-brand_secondary">
												<Trash2 size={16} />
											</button>
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</div>
	);
}
