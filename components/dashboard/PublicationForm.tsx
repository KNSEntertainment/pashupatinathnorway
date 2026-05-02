"use client";

import { useState, useEffect } from "react";
import { X, Save } from "lucide-react";

interface Publication {
  id?: string;
  title: string;
  year: number;
  type: "financial" | "activity" | "membership" | "audit";
  description: string;
  fileSize: string;
  pages: number;
  publishedDate: string;
  downloadUrl: string;
  previewUrl: string;
  language: "en" | "ne" | "no";
}

interface PublicationFormProps {
  publication?: Publication | null;
  onSubmit: () => void;
  onCancel: () => void;
}

const reportTypes = [
  { value: "financial", label: "Financial Reports" },
  { value: "activity", label: "Activity Reports" },
  { value: "membership", label: "Membership Reports" },
  { value: "audit", label: "Audit Reports" }
];

const languages = [
  { value: "en", label: "English" },
  { value: "ne", label: "नेपाली" },
  { value: "no", label: "Norsk" }
];

export default function PublicationForm({ publication, onSubmit, onCancel }: PublicationFormProps) {
  const [formData, setFormData] = useState<Publication>({
    title: "",
    year: new Date().getFullYear(),
    type: "financial",
    description: "",
    fileSize: "",
    pages: 0,
    publishedDate: new Date().toISOString().split('T')[0],
    downloadUrl: "",
    previewUrl: "",
    language: "en"
  });

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (publication) {
      setFormData(publication);
    }
  }, [publication]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === "year" || name === "pages" ? parseInt(value) || 0 : value
    }));
    
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.year || formData.year < 2000 || formData.year > new Date().getFullYear() + 1) {
      newErrors.year = "Please enter a valid year";
    }

    if (!formData.type) {
      newErrors.type = "Report type is required";
    }

    if (!formData.description.trim()) {
      newErrors.description = "Description is required";
    }

    if (!formData.language) {
      newErrors.language = "Language is required";
    }

    if (!formData.publishedDate) {
      newErrors.publishedDate = "Published date is required";
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
      const url = publication?.id 
        ? `/api/publications/${publication.id}` 
        : "/api/publications";
      
      const method = publication?.id ? "PUT" : "POST";

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
        alert(errorData.error || "Failed to save publication");
      }
    } catch (error) {
      console.error("Error saving publication:", error);
      alert("Failed to save publication");
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
                {publication ? "Edit Publication" : "Add New Publication"}
              </h1>
              <p className="text-gray-600 mt-1">
                {publication ? "Update publication details" : "Create a new publication"}
              </p>
            </div>
            <button
              onClick={onCancel}
              className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <X className="w-4 h-4" />
              Cancel
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-6">
        <div className="max-w-4xl mx-auto">
          <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Title */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.title ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter publication title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              {/* Year */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year *
                </label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleChange}
                  min="2000"
                  max={new Date().getFullYear() + 1}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.year ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.year && (
                  <p className="mt-1 text-sm text-red-600">{errors.year}</p>
                )}
              </div>

              {/* Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Report Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.type ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  {reportTypes.map(type => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
                {errors.type && (
                  <p className="mt-1 text-sm text-red-600">{errors.type}</p>
                )}
              </div>

              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Language *
                </label>
                <select
                  name="language"
                  value={formData.language}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.language ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  {languages.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.label}
                    </option>
                  ))}
                </select>
                {errors.language && (
                  <p className="mt-1 text-sm text-red-600">{errors.language}</p>
                )}
              </div>

              {/* Published Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Published Date *
                </label>
                <input
                  type="date"
                  name="publishedDate"
                  value={formData.publishedDate}
                  onChange={handleChange}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.publishedDate ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {errors.publishedDate && (
                  <p className="mt-1 text-sm text-red-600">{errors.publishedDate}</p>
                )}
              </div>

              {/* Description */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={4}
                  className={`w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 ${
                    errors.description ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Enter publication description"
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              {/* Pages */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pages
                </label>
                <input
                  type="number"
                  name="pages"
                  value={formData.pages}
                  onChange={handleChange}
                  min="0"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* File Size */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File Size
                </label>
                <input
                  type="text"
                  name="fileSize"
                  value={formData.fileSize}
                  onChange={handleChange}
                  placeholder="e.g., 2.4 MB"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Download URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Download URL
                </label>
                <input
                  type="url"
                  name="downloadUrl"
                  value={formData.downloadUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/file.pdf"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>

              {/* Preview URL */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Preview URL
                </label>
                <input
                  type="url"
                  name="previewUrl"
                  value={formData.previewUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/preview.pdf"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                />
              </div>
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
                  <Save className="w-4 h-4" />
                )}
                {publication ? "Update Publication" : "Create Publication"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
