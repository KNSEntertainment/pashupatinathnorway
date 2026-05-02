"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Edit, Trash2, Filter, FileText, Calendar } from "lucide-react";
import PublicationForm from "@/components/dashboard/PublicationForm";

interface Publication {
  id: string;
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
  createdAt: string;
  updatedAt: string;
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

export default function PublicationsPage() {
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingPublication, setEditingPublication] = useState<Publication | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [selectedYear, setSelectedYear] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch publications
  const fetchPublications = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/publications");
      const data = await response.json();
      setPublications(data.publications || []);
    } catch (error) {
      console.error("Error fetching publications:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPublications();
  }, []);

  // Filter publications
  useEffect(() => {
    let filtered = [...publications];
    
    if (searchTerm) {
      filtered = filtered.filter(pub => 
        pub.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        pub.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedType !== "all") {
      filtered = filtered.filter(pub => pub.type === selectedType);
    }
    
    if (selectedLanguage !== "all") {
      filtered = filtered.filter(pub => pub.language === selectedLanguage);
    }
    
    if (selectedYear !== "all") {
      filtered = filtered.filter(pub => pub.year.toString() === selectedYear);
    }
    
    setFilteredPublications(filtered);
  }, [publications, searchTerm, selectedType, selectedLanguage, selectedYear]);

  // Get available years
  const availableYears = Array.from(new Set(publications.map(pub => pub.year))).sort((a, b) => b - a);

  // Handle delete
  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this publication?")) return;
    
    try {
      const response = await fetch(`/api/publications/${id}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        fetchPublications();
      } else {
        alert("Failed to delete publication");
      }
    } catch (error) {
      console.error("Error deleting publication:", error);
      alert("Failed to delete publication");
    }
  };

  // Handle form submission
  const handleFormSubmit = () => {
    setShowForm(false);
    setEditingPublication(null);
    fetchPublications();
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "financial": return "bg-green-100 text-green-800 border-green-200";
      case "activity": return "bg-blue-100 text-blue-800 border-blue-200";
      case "membership": return "bg-purple-100 text-purple-800 border-purple-200";
      case "audit": return "bg-orange-100 text-orange-800 border-orange-200";
      default: return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getLanguageFlag = (language: string) => {
    switch (language) {
      case "en": return "🇬🇧";
      case "ne": return "🇳🇵";
      case "no": return "🇳🇴";
      default: return "🌐";
    }
  };

  if (showForm) {
    return (
      <PublicationForm
        publication={editingPublication}
        onSubmit={handleFormSubmit}
        onCancel={() => {
          setShowForm(false);
          setEditingPublication(null);
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
              <h1 className="text-2xl font-bold text-gray-900">Publications</h1>
              <p className="text-gray-600 mt-1">Manage annual reports and publications</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              <Plus className="w-4 h-4" />
              Add Publication
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
                placeholder="Search publications..."
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
              <span className="text-xs bg-gray-200 px-2 py-1 rounded-full">
                {[selectedType, selectedLanguage, selectedYear].filter(v => v !== "all").length}
              </span>
            </button>
          </div>

          {/* Filter Options */}
          {showFilters && (
            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Types</option>
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Languages</option>
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>

              <select
                value={selectedYear}
                onChange={(e) => setSelectedYear(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                <option value="all">All Years</option>
                {availableYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            {filteredPublications.length} of {publications.length} publications
          </div>
        </div>
      </div>

      {/* Publications List */}
      <div className="container mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : filteredPublications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No publications found</h3>
            <p className="text-gray-500 mb-4">
              {publications.length === 0 ? "Start by adding your first publication." : "Try adjusting your search criteria or filters."}
            </p>
            {publications.length === 0 && (
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add First Publication
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPublications.map((publication) => (
              <div key={publication.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getTypeColor(publication.type)}`}>
                        {publication.type.charAt(0).toUpperCase() + publication.type.slice(1)}
                      </span>
                    </div>
                    <span className="text-2xl">{getLanguageFlag(publication.language)}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {publication.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {publication.description}
                  </p>

                  {/* Meta Information */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      {new Date(publication.publishedDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{publication.year}</span>
                      <span>{publication.pages} pages</span>
                      <span>{publication.fileSize}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setEditingPublication(publication);
                        setShowForm(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm"
                    >
                      <Edit className="w-4 h-4" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(publication.id)}
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
