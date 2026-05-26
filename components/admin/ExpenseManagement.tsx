"use client";

import { useState, useEffect, useCallback } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Save, 
  X, 
  RefreshCw,
  DollarSign,
  TrendingDown,
  Calendar,
  FileText,
  Filter,
  Receipt,
  Upload
} from "lucide-react";
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

interface Expense {
  _id?: string;
  eventId: string | Event | null;
  title: string;
  amount: number;
  expenseCategory: string;
  paymentMethod: string;
  receiptUrl: string;
  notes: string;
  date: string;
  event?: Event;
  budget?: Budget;
  createdBy?: {
    _id: string;
    name: string;
    email: string;
  };
}

const expenseCategories = ["food", "venue", "transport", "equipment", "marketing", "maintenance", "other"];
const paymentMethods = ["cash", "bank_transfer", "stripe", "vipps", "paypal", "other"];

export default function ExpenseManagement() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [filter, setFilter] = useState("all");
  const [selectedEvent, setSelectedEvent] = useState("");
  const [uploadingReceipt, setUploadingReceipt] = useState(false);
  const [formData, setFormData] = useState<Partial<Expense>>({
    eventId: null,
    title: "",
    amount: 0,
    expenseCategory: "other",
    paymentMethod: "other",
    receiptUrl: "",
    notes: "",
    date: new Date().toISOString().split('T')[0]
  });

  const fetchExpenses = useCallback(async () => {
    try {
      setLoading(true);
      let url = "/api/expense";
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
      if (!response.ok) throw new Error("Failed to fetch expenses");
      const data = await response.json();
      setExpenses(data);
    } catch (error) {
      toast.error("Failed to load expenses");
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
    fetchExpenses();
    fetchEvents();
  }, [fetchExpenses, fetchEvents]);

  const resetForm = () => {
    setFormData({
      eventId: null,
      title: "",
      amount: 0,
      expenseCategory: "other",
      paymentMethod: "other",
      receiptUrl: "",
      notes: "",
      date: new Date().toISOString().split('T')[0]
    });
    setIsCreating(false);
    setEditingId(null);
  };

  const handleReceiptUpload = async (file: File) => {
    if (!file) return;
    
    setUploadingReceipt(true);
    const uploadFormData = new FormData();
    uploadFormData.append("file", file);
    
    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: uploadFormData,
      });
      
      if (!response.ok) throw new Error("Failed to upload receipt");
      
      const data = await response.json();
      setFormData(prev => ({ ...prev, receiptUrl: data.url }));
      toast.success("Receipt uploaded successfully");
    } catch (error) {
      toast.error("Failed to upload receipt");
      console.error(error);
    } finally {
      setUploadingReceipt(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const url = editingId ? `/api/expense` : `/api/expense`;
      const method = editingId ? "PUT" : "POST";
      const payload = editingId ? { ...formData, id: editingId } : formData;
      
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("Failed to save expense");
      
      toast.success(editingId ? "Expense updated successfully" : "Expense created successfully");
      resetForm();
      fetchExpenses();
    } catch (error) {
      toast.error("Failed to save expense");
      console.error(error);
    }
  };

  const handleEdit = (expense: Expense) => {
    setFormData({
      eventId: expense.eventId,
      title: expense.title,
      amount: expense.amount,
      expenseCategory: expense.expenseCategory,
      paymentMethod: expense.paymentMethod,
      receiptUrl: expense.receiptUrl || "",
      notes: expense.notes || "",
      date: expense.date ? new Date(expense.date).toISOString().split('T')[0] : ""
    });
    setEditingId(expense._id!);
    setIsCreating(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this expense record?")) return;
    
    try {
      const response = await fetch(`/api/expense?id=${id}`, {
        method: "DELETE",
      });
      
      if (!response.ok) throw new Error("Failed to delete expense");
      
      toast.success("Expense deleted successfully");
      fetchExpenses();
    } catch (error) {
      toast.error("Failed to delete expense");
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
        <h1 className="text-3xl font-bold text-gray-800">Expense Management</h1>
        <button
          onClick={() => setIsCreating(true)}
          className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Expenses</p>
              <p className="text-2xl font-bold text-red-600">
                kr{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}
              </p>
            </div>
            <DollarSign className="text-red-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Total Records</p>
              <p className="text-2xl font-bold text-blue-600">
                {expenses.length}
              </p>
            </div>
            <FileText className="text-blue-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">Avg Expense</p>
              <p className="text-2xl font-bold text-purple-600">
                kr{expenses.length > 0 ? (expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length).toFixed(2) : "0"}
              </p>
            </div>
            <TrendingDown className="text-purple-500" size={24} />
          </div>
        </div>
        
        <div className="bg-white p-4 rounded-lg shadow border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm">This Month</p>
              <p className="text-2xl font-bold text-orange-600">
                kr{expenses
                  .filter(e => new Date(e.date).getMonth() === new Date().getMonth() && 
                               new Date(e.date).getFullYear() === new Date().getFullYear())
                  .reduce((sum, e) => sum + e.amount, 0)
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
          
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Time</option>
            <option value="1week">Last Week</option>
            <option value="1month">Last Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
            <option value="1year">Last Year</option>
          </select>
          
          <select
            value={selectedEvent}
            onChange={(e) => setSelectedEvent(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">All Events</option>
            {events.map(event => (
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
          <h2 className="text-xl font-semibold mb-4">
            {editingId ? "Edit Expense" : "Add New Expense"}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title *
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Amount *
                </label>
                <input
                  type="number"
                  required
                  min="0"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  required
                  value={formData.expenseCategory}
                  onChange={(e) => setFormData({ ...formData, expenseCategory: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {expenseCategories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={formData.paymentMethod}
                  onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {paymentMethods.map(method => (
                    <option key={method} value={method}>
                      {method.charAt(0).toUpperCase() + method.slice(1).replace('_', ' ')}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Event
                </label>
                <select
                  value={typeof formData.eventId === 'string' ? formData.eventId : ''}
                  onChange={(e) => setFormData({ ...formData, eventId: e.target.value || null })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Event (Optional)</option>
                  {events.map(event => (
                    <option key={event._id} value={event._id}>
                      {event.eventname} - {event.eventdate}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date *
                </label>
                <input
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Receipt Upload
              </label>
              <div className="flex items-center gap-4">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleReceiptUpload(file);
                  }}
                  className="hidden"
                  id="receipt-upload"
                />
                <label
                  htmlFor="receipt-upload"
                  className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                >
                  <Upload size={16} />
                  {uploadingReceipt ? "Uploading..." : "Choose Receipt"}
                </label>
                {formData.receiptUrl && (
                  <a
                    href={formData.receiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
                  >
                    <Receipt size={16} />
                    View Receipt
                  </a>
                )}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Additional details about this expense..."
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors"
              >
                <Save size={20} />
                {editingId ? "Update" : "Create"}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="flex items-center gap-2 bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600 transition-colors"
              >
                <X size={20} />
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses Table */}
      <div className="bg-white rounded-lg shadow border border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Expense Records</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Event</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Amount</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Date</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Receipt</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map((expense) => (
                <tr key={expense._id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium text-gray-900">{expense.title}</p>
                      {expense.notes && (
                        <p className="text-sm text-gray-500">{expense.notes}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {expense.eventId && typeof expense.eventId === 'object' && 'eventname' in expense.eventId ? (
                      <div>
                        <p className="font-medium text-gray-900">{expense.eventId.eventname}</p>
                        <p className="text-sm text-gray-500">{expense.eventId.eventdate}</p>
                      </div>
                    ) : (
                      <span className="text-gray-400">No Event</span>
                    )}
                  </td>
                  <td className="px-4 py-3 font-medium text-red-600">
                    kr{expense.amount.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-sm text-gray-600">
                      {new Date(expense.date).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {expense.receiptUrl ? (
                      <a
                        href={expense.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 text-blue-500 hover:text-blue-700"
                      >
                        <Receipt size={16} />
                        View
                      </a>
                    ) : (
                      <span className="text-gray-400">No Receipt</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(expense)}
                        className="text-blue-500 hover:text-blue-700"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(expense._id!)}
                        className="text-red-500 hover:text-red-700"
                      >
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
