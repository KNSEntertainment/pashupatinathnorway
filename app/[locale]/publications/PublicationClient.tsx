"use client";

import { useState, useEffect } from "react";
import { Search, Download, Calendar, FileText, Filter, ChevronDown } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

interface AnnualReport {
  id: string;
  title: string;
  type: "financial" | "activity" | "membership" | "audit";
  description: string;
  publishedDate: string;
  downloadUrl: string;
  language: "en" | "ne" | "no";
}


const reportTypes = [
  { value: "all", label: "All Reports" },
  { value: "financial", label: "Financial Reports" },
  { value: "activity", label: "Activity Reports" },
  { value: "membership", label: "Membership Reports" },
  { value: "audit", label: "Audit Reports" }
];

const languages = [
  { value: "all", label: "All Languages" },
  { value: "en", label: "English" },
  { value: "ne", label: "नेपाली" },
  { value: "no", label: "Norsk" }
];


export default function PublicationClient() {
  const [publications, setPublications] = useState<AnnualReport[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<AnnualReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  // Fetch publications from API
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
      filtered = filtered.filter((report: AnnualReport) => 
        report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        report.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedType !== "all") {
      filtered = filtered.filter((report: AnnualReport) => report.type === selectedType);
    }
    
    if (selectedLanguage !== "all") {
      filtered = filtered.filter((report: AnnualReport) => report.language === selectedLanguage);
    }
    
    setFilteredPublications(filtered);
  }, [publications, searchTerm, selectedType, selectedLanguage]);


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

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-b from-red-50 to-red-100 text-gray-700">
        
        <div className="container mx-auto px-4 pt-12 pb-1">
            <SectionHeader 
              heading="Annual Reports"
              subtitle="Access our comprehensive collection of annual reports, including financial statements, activity summaries, membership statistics, and audit reports."
            />
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex max-w-md relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search reports by title or description..."
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
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {reportTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>

              <select
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              >
                {languages.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
          )}

          {/* Results Count */}
          <div className="mt-4 text-sm text-gray-600">
            Found {filteredPublications.length} report{filteredPublications.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>

      {/* Reports Grid */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : filteredPublications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No reports found</h3>
            <p className="text-gray-500">Try adjusting your search criteria or filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPublications.map((report: AnnualReport) => (
              <div key={report.id} className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200">
                <div className="p-6">
                  {/* Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getTypeColor(report.type)}`}>
                        {report.type.charAt(0).toUpperCase() + report.type.slice(1)}
                      </span>
                    </div>
                    <span className="text-2xl">{getLanguageFlag(report.language)}</span>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {report.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                    {report.description}
                  </p>

                  {/* Meta Information */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-500">
                      <Calendar className="w-4 h-4 mr-2" />
                      Published: {new Date(report.publishedDate).toLocaleDateString()}
                    </div>
                
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(report.downloadUrl, '_blank')}
                      className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                    >
                      <Download className="w-4 h-4" />
                      Download
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