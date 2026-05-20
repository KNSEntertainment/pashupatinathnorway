"use client";

import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, Search, Filter, ChevronDown, Palette, ArrowUpDown } from "lucide-react";

interface ReportType {
  id: string;
  name: string;
  label: string;
  description: string;
  color: string;
  isActive: boolean;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
}

const colorOptions = [
  { value: "gray", label: "Gray", className: "bg-gray-100 text-gray-800 border-gray-200" },
  { value: "green", label: "Green", className: "bg-green-100 text-green-800 border-green-200" },
  { value: "blue", label: "Blue", className: "bg-blue-100 text-blue-800 border-blue-200" },
  { value: "purple", label: "Purple", className: "bg-purple-100 text-purple-800 border-purple-200" },
  { value: "orange", label: "Orange", className: "bg-orange-100 text-orange-800 border-orange-200" },
  { value: "red", label: "Red", className: "bg-red-100 text-red-800 border-red-200" },
  { value: "yellow", label: "Yellow", className: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  { value: "pink", label: "Pink", className: "bg-pink-100 text-pink-800 border-pink-200" },
  { value: "indigo", label: "Indigo", className: "bg-indigo-100 text-indigo-800 border-indigo-200" }
];

interface ReportTypeFormProps {
  reportType?: ReportType | null;
  onSubmit: () => void;
  onCancel: () => void;
}

function ReportTypeForm({ reportType, onSubmit, onCancel }: ReportTypeFormProps) {
  const [formData, setFormData] = useState({
    name: "",
    label: "",
    description: "",
    color: "gray",
    sortOrder: 0,
    isActive: true
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (reportType) {
      setFormData({
        name: reportType.name,
        label: reportType.label,
        description: reportType.description,
        color: reportType.color,
        sortOrder: reportType.sortOrder,
        isActive: reportType.isActive
      });
    }
  }, [reportType]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = "Name is required";
    }

    if (!formData.label.trim()) {
      newErrors.label = "Label is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const url = reportType?.id 
        ? `/api/report-types/${reportType.id}` 
        : "/api/report-types";
      
      const method = reportType?.id ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onSubmit();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to save report type");
      }
    } catch (error) {
      console.error("Error saving report type:", error);
      alert("Failed to save report type");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {reportType ? "Edit Report Type" : "Add New Report Type"}
              </h1>
              <p className="text-gray-600 mt-1">
                {reportType ? "Update report type details" : "Create a new report type"}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.name ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., financial"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                )}
              </div>

              {/* Label */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Label *
                </label>
                <input
                  type="text"
                  name="label"
                  value={formData.label}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.label ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="e.g., Financial Reports"
                />
                {errors.label && (
                  <p className="mt-1 text-sm text-red-600">{errors.label}</p>
                )}
              </div>

              {/* Color */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Palette className="w-4 h-4 inline mr-1" />
                  Color
                </label>
                <select
                  name="color"
                  value={formData.color}
                  onChange={handleChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                >
                  {colorOptions.map(color => (
                    <option key={color.value} value={color.value}>
                      {color.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <ArrowUpDown className="w-4 h-4 inline mr-1" />
                  Sort Order
                </label>
                <input
                  type="number"
                  name="sortOrder"
                  value={formData.sortOrder}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                  placeholder="Optional description for this report type"
                />
              </div>

              {/* Active Status */}
              <div className="md:col-span-2">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="isActive"
                    checked={formData.isActive}
                    onChange={handleChange}
                    className="mr-2"
                  />
                  <span className="text-sm font-medium text-gray-700">Active</span>
                </label>
              </div>
            </div>

            {/* Preview */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-700 mb-2">Preview:</p>
              <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${
                colorOptions.find(c => c.value === formData.color)?.className || "bg-gray-100 text-gray-800 border-gray-200"
              }`}>
                {formData.label || "Report Type Label"}
              </span>
            </div>

            {/* Form Actions */}
            <div className="flex items-center justify-end gap-4 mt-8 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={onCancel}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                {reportType ? "Update Report Type" : "Create Report Type"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

interface ReportTypesManagementProps {
  onSubmit?: () => void;
  onCancel?: () => void;
}

export default function ReportTypesManagement({ onSubmit, onCancel }: ReportTypesManagementProps = {}) {
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [filteredReportTypes, setFilteredReportTypes] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingReportType, setEditingReportType] = useState<ReportType | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  // Fetch report types
  const fetchReportTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/report-types");
      const data = await response.json();
      setReportTypes(data.reportTypes || []);
    } catch (error) {
      console.error("Error fetching report types:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReportTypes();
  }, []);

  // Filter report types
  useEffect(() => {
    let filtered = [...reportTypes];
    
    if (searchTerm) {
      filtered = filtered.filter(type => 
        type.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (filterStatus !== "all") {
      filtered = filtered.filter(type => 
        filterStatus === "active" ? type.isActive : !type.isActive
      );
    }
    
    setFilteredReportTypes(filtered);
  }, [reportTypes, searchTerm, filterStatus]);

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this report type? This action cannot be undone.")) return;
    
    try {
      const response = await fetch(`/api/report-types/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        fetchReportTypes();
      } else {
        const errorData = await response.json();
        alert(errorData.error || "Failed to delete report type");
      }
    } catch (error) {
      console.error("Error deleting report type:", error);
      alert("Failed to delete report type");
    }
  };

  // Handle form submission
  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingReportType(null);
    fetchReportTypes();
    if (onSubmit) {
      onSubmit();
    }
  };

  const getColorClass = (color: string) => {
    const colorOption = colorOptions.find(c => c.value === color);
    return colorOption?.className || "bg-gray-100 text-gray-800 border-gray-200";
  };

  if (showForm) {
    return (
      <ReportTypeForm
        reportType={editingReportType}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingReportType(null);
          if (onCancel) {
            onCancel();
          }
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Report Types Management</h1>
              <p className="text-gray-600 mt-1">Manage report types for publications</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Report Type
            </button>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search report types..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
              />
            </div>

            {/* Filter Toggle Button */}
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Filter className="w-4 h-4" />
              Filters
              <ChevronDown className={`w-4 h-4 transform transition-transform ${showFilters ? 'rotate-180' : ''}`} />
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            {filteredReportTypes.length} of {reportTypes.length} report types
          </div>
        </div>
      </div>

      {/* Report Types List */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : filteredReportTypes.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Palette className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No report types found</h3>
            <p className="text-gray-500 mb-4">
              {reportTypes.length === 0 ? "Start by adding your first report type." : "Try adjusting your search criteria or filters."}
            </p>
            {reportTypes.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add First Report Type
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredReportTypes.map((reportType) => (
              <div key={reportType.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getColorClass(reportType.color)}`}>
                        {reportType.label}
                      </span>
                      {!reportType.isActive && (
                        <span className="ml-2 inline-block px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-600 border border-gray-200">
                          Inactive
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Name */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {reportType.name}
                  </h3>

                  {/* Description */}
                  {reportType.description && (
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {reportType.description}
                    </p>
                  )}

                  {/* Meta Information */}
                  <div className="space-y-2 mb-4 text-sm text-gray-500">
                    <div>Sort Order: {reportType.sortOrder}</div>
                    <div>Created: {new Date(reportType.createdAt).toLocaleDateString()}</div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingReportType(reportType);
                        setShowForm(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(reportType.id)}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-red-300 text-red-700 rounded-lg hover:bg-red-50 transition-colors text-sm"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
