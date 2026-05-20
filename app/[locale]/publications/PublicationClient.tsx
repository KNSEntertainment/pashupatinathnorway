"use client";

import { useState, useEffect } from "react";
import { Search, Download, Calendar, FileText, Filter, ChevronDown } from "lucide-react";
import SectionHeader from "@/components/SectionHeader";

interface AnnualReport {
  id: string;
  title: string;
  type: string;
  description: string;
  publishedDate: string;
  downloadUrl: string;
  language: "en" | "ne" | "no";
}

interface ReportType {
  id: string;
  name: string;
  label: string;
  color: string;
  isActive: boolean;
}


const languages = [
  { value: "all", label: "All Languages" },
  { value: "en", label: "English" },
  { value: "ne", label: "नेपाली" },
  { value: "no", label: "Norsk" }
];


export default function PublicationClient() {
  const [publications, setPublications] = useState<AnnualReport[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<AnnualReport[]>([]);
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
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

  // Fetch report types
  const fetchReportTypes = async () => {
    try {
      const response = await fetch("/api/report-types");
      const data = await response.json();
      setReportTypes(data.reportTypes || []);
    } catch (error) {
      console.error("Error fetching report types:", error);
    }
  };

  useEffect(() => {
    fetchPublications();
    fetchReportTypes();
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
    const reportType = reportTypes.find(rt => rt.name === type);
    if (reportType) {
      switch (reportType.color) {
        case "green": return "bg-green-100 text-green-800 border-green-200";
        case "blue": return "bg-blue-100 text-blue-800 border-blue-200";
        case "purple": return "bg-purple-100 text-purple-800 border-purple-200";
        case "orange": return "bg-orange-100 text-orange-800 border-orange-200";
        case "red": return "bg-red-100 text-red-800 border-red-200";
        case "yellow": return "bg-yellow-100 text-yellow-800 border-yellow-200";
        case "pink": return "bg-pink-100 text-pink-800 border-pink-200";
        case "indigo": return "bg-indigo-100 text-indigo-800 border-indigo-200";
        default: return "bg-gray-100 text-gray-800 border-gray-200";
      }
    }
    return "bg-gray-100 text-gray-800 border-gray-200";
  };

  const getTypeLabel = (type: string) => {
    const reportType = reportTypes.find(rt => rt.name === type);
    return reportType ? reportType.label : type;
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
                  <option key={type.id} value={type.name}>{type.label}</option>
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
          <div className="overflow-x-auto">
            <table className="w-full bg-white border border-gray-200">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Language
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Published Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredPublications.map((report: AnnualReport) => (
                  <tr key={report.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900 line-clamp-2">
                          {report.title}
                        </div>
                        <div className="text-sm text-gray-500 line-clamp-2 mt-1">
                          {report.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getTypeColor(report.type)}`}>
                        {getTypeLabel(report.type)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-2xl mr-2">{getLanguageFlag(report.language)}</span>
                        <span className="text-sm text-gray-600">
                          {report.language === 'en' ? 'English' : 
                           report.language === 'ne' ? 'नेपाली' : 
                           report.language === 'no' ? 'Norsk' : 'Unknown'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        {new Date(report.publishedDate).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <button
                        onClick={() => window.open(report.downloadUrl, '_blank')}
                        className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm"
                      >
                        <Download className="w-4 h-4" />
                        Download
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}