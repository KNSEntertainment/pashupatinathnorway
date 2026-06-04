"use client";

import { useState, useEffect, useCallback } from "react";
import { Plus, Edit, Trash2, Save, X, RefreshCw, DollarSign, TrendingUp, Calendar, FileText, Filter } from "lucide-react";
import { toast } from "react-hot-toast";

interface Event {
	_id: string;
	eventname: string;
	eventdate: string;
}

interface Budget {
	_id: string;
	name: string;
}

interface Income {
	_id?: string;
	eventId: string | Event | null;
	title: string;
	amount: number;
	sourceType: string;
	paymentMethod: string;
	referenceId: string;
	description: string;
	date: string;
	event?: Event;
	budget?: Budget;
	createdBy?: {
		_id: string;
		name: string;
		email: string;
	};
}

const sourceTypes = ["Government Grants Religious Communities Act", "Other Public Grants", "Internal Transfers", "Rental Income", "Donations From Abroad", "Donations From Norway", "Membership Fees", "Sales Income", "Financial Income", "Other Income"];
const paymentMethods = ["cash", "bank_transfer", "stripe", "vipps", "paypal", "other"];

export default function IncomeManagement() {
	const [incomes, setIncomes] = useState<Income[]>([]);
	const [events, setEvents] = useState<Event[]>([]);
	const [loading, setLoading] = useState(true);
	const [isCreating, setIsCreating] = useState(false);
	const [editingId, setEditingId] = useState<string | null>(null);
	const [filter, setFilter] = useState("all");
	const [selectedEvent, setSelectedEvent] = useState("");
	const [formData, setFormData] = useState<Partial<Income>>({
		eventId: null,
		title: "",
		amount: 0,
		sourceType: "other",
		paymentMethod: "other",
		referenceId: "",
		description: "",
		date: new Date().toISOString().split("T")[0],
	});

	const fetchIncomes = useCallback(async () => {
		try {
			setLoading(true);
			let url = "/api/income";
			const params = new URLSearchParams();

			if (filter !== "all") {
				params.append("filter", filter);
			}
			if (selectedEvent) {
				params.append("eventId", selectedEvent);
			}

			if (params.toString()) {
				url += `?${params.toString()}`;
			}

			const response = await fetch(url);
			if (!response.ok) throw new Error("Failed to fetch incomes");
			const data = await response.json();
			setIncomes(data);
		} catch (error) {
			toast.error("Failed to load incomes");
			console.error(error);
		} finally {
			setLoading(false);
		}
	}, [filter, selectedEvent]);

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
		fetchIncomes();
		fetchEvents();
	}, [fetchIncomes, fetchEvents]);

	const resetForm = () => {
		setFormData({
			eventId: null,
			title: "",
			amount: 0,
			sourceType: "other",
			paymentMethod: "other",
			referenceId: "",
			description: "",
			date: new Date().toISOString().split("T")[0],
		});
		setIsCreating(false);
		setEditingId(null);
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();

		try {
			const url = editingId ? `/api/income` : `/api/income`;
			const method = editingId ? "PUT" : "POST";
			const payload = editingId ? { ...formData, id: editingId } : formData;

			const response = await fetch(url, {
				method,
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(payload),
			});

			if (!response.ok) throw new Error("Failed to save income");

			toast.success(editingId ? "Income updated successfully" : "Income created successfully");
			resetForm();
			fetchIncomes();
		} catch (error) {
			toast.error("Failed to save income");
			console.error(error);
		}
	};

	const handleEdit = (income: Income) => {
		setFormData({
			eventId: income.eventId,
			title: income.title,
			amount: income.amount,
			sourceType: income.sourceType,
			paymentMethod: income.paymentMethod,
			referenceId: income.referenceId || "",
			description: income.description || "",
			date: income.date ? new Date(income.date).toISOString().split("T")[0] : "",
		});
		setEditingId(income._id!);
		setIsCreating(true);
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this income record?")) return;

		try {
			const response = await fetch(`/api/income?id=${id}`, {
				method: "DELETE",
			});

			if (!response.ok) throw new Error("Failed to delete income");

			toast.success("Income deleted successfully");
			fetchIncomes();
		} catch (error) {
			toast.error("Failed to delete income");
			console.error(error);
		}
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
				<h1 className="text-3xl font-bold text-gray-800">Income Management</h1>
				<button onClick={() => setIsCreating(true)} className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors">
					<Plus size={20} />
					Add Income
				</button>
			</div>

			{/* Summary Cards */}
			<div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
				<div className="bg-white p-4 rounded-lg shadow border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-500 text-sm">Total Income</p>
							<p className="text-2xl font-bold text-green-600">kr{incomes.reduce((sum, i) => sum + i.amount, 0).toLocaleString()}</p>
						</div>
						<DollarSign className="text-green-500" size={24} />
					</div>
				</div>

				<div className="bg-white p-4 rounded-lg shadow border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-500 text-sm">Total Records</p>
							<p className="text-2xl font-bold text-blue-600">{incomes.length}</p>
						</div>
						<FileText className="text-blue-500" size={24} />
					</div>
				</div>

				<div className="bg-white p-4 rounded-lg shadow border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-500 text-sm">Avg Income</p>
							<p className="text-2xl font-bold text-purple-600">kr{incomes.length > 0 ? (incomes.reduce((sum, i) => sum + i.amount, 0) / incomes.length).toFixed(2) : "0"}</p>
						</div>
						<TrendingUp className="text-purple-500" size={24} />
					</div>
				</div>

				<div className="bg-white p-4 rounded-lg shadow border border-gray-200">
					<div className="flex items-center justify-between">
						<div>
							<p className="text-gray-500 text-sm">This Month</p>
							<p className="text-2xl font-bold text-orange-600">
								kr
								{incomes
									.filter((i) => new Date(i.date).getMonth() === new Date().getMonth() && new Date(i.date).getFullYear() === new Date().getFullYear())
									.reduce((sum, i) => sum + i.amount, 0)
									.toLocaleString()}
							</p>
						</div>
						<Calendar className="text-orange-500" size={24} />
					</div>
				</div>
			</div>

			{/* Filters */}
			<div className="bg-white p-4 rounded-lg shadow mb-6 border border-gray-200">
				<div className="flex flex-wrap gap-4 items-center">
					<div className="flex items-center gap-2">
						<Filter size={20} className="text-gray-500" />
						<span className="text-sm font-medium text-gray-700">Filters:</span>
					</div>

					<select value={filter} onChange={(e) => setFilter(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
						<option value="all">All Time</option>
						<option value="1week">Last Week</option>
						<option value="1month">Last Month</option>
						<option value="3months">Last 3 Months</option>
						<option value="6months">Last 6 Months</option>
						<option value="1year">Last Year</option>
					</select>

					<select value={selectedEvent} onChange={(e) => setSelectedEvent(e.target.value)} className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
						<option value="">All Events</option>
						{events.map((event) => (
							<option key={event._id} value={event._id}>
								{event.eventname}
							</option>
						))}
					</select>
				</div>
			</div>

			{/* Create/Edit Form */}
			{(isCreating || editingId) && (
				<div className="bg-white p-6 rounded-lg shadow mb-6 border border-gray-200">
					<h2 className="text-xl font-semibold mb-4">{editingId ? "Edit Income" : "Add New Income"}</h2>
					<form onSubmit={handleSubmit} className="space-y-4">
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
								<input type="text" required value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
								<input type="number" required min="0" step="0.01" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Source Type *</label>
								<select required value={formData.sourceType} onChange={(e) => setFormData({ ...formData, sourceType: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
									{sourceTypes.map((type) => (
										<option key={type} value={type}>
											{type.charAt(0).toUpperCase() + type.slice(1)}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
								<select value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
									{paymentMethods.map((method) => (
										<option key={method} value={method}>
											{method.charAt(0).toUpperCase() + method.slice(1).replace("_", " ")}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Event</label>
								<select value={typeof formData.eventId === "string" ? formData.eventId : ""} onChange={(e) => setFormData({ ...formData, eventId: e.target.value || null })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">
									<option value="">Select Event (Optional)</option>
									{events.map((event) => (
										<option key={event._id} value={event._id}>
											{event.eventname} - {event.eventdate}
										</option>
									))}
								</select>
							</div>

							<div>
								<label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
								<input type="date" required value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
							</div>
						</div>

						<div>
							<label className="block text-sm font-medium text-gray-700 mb-1">Reference ID</label>
							<input type="text" value={formData.referenceId} onChange={(e) => setFormData({ ...formData, referenceId: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Transaction ID, Invoice number, etc." />
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

			{/* Income Table */}
			<div className="bg-white rounded-lg shadow border border-gray-200">
				<div className="p-4 border-b border-gray-200">
					<h2 className="text-xl font-semibold">Income Records</h2>
				</div>
				<div className="overflow-x-auto">
					<table className="w-full">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Title</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Event</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Source Type</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
								<th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-200">
							{incomes.map((income) => (
								<tr key={income._id} className="hover:bg-gray-50">
									<td className="px-4 py-3">
										<div>
											<p className="font-medium text-gray-900">{income.title}</p>
											{income.description && <p className="text-sm text-gray-500">{income.description}</p>}
										</div>
									</td>
									<td className="px-4 py-3">
										{income.eventId && typeof income.eventId === "object" && "eventname" in income.eventId ? (
											<div>
												<p className="font-medium text-gray-900">{income.eventId.eventname}</p>
												<p className="text-sm text-gray-500">{income.eventId.eventdate}</p>
											</div>
										) : (
											<span className="text-gray-400">No Event</span>
										)}
									</td>
									<td className="px-4 py-3">
										<span className="px-2 py-1 text-xs font-medium bg-green-100 text-green-800 rounded">{income.sourceType ? income.sourceType.charAt(0).toUpperCase() + income.sourceType.slice(1) : "N/A"}</span>
									</td>
									<td className="px-4 py-3 font-medium text-green-600">kr{income.amount.toLocaleString()}</td>
									<td className="px-4 py-3">
										<span className="text-sm text-gray-600">{new Date(income.date).toLocaleDateString()}</span>
									</td>

									<td className="px-4 py-3">
										<div className="flex gap-2">
											<button onClick={() => handleEdit(income)} className="text-blue-500 hover:text-blue-700">
												<Edit size={16} />
											</button>
											<button onClick={() => handleDelete(income._id!)} className="text-red-500 hover:text-red-700">
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
