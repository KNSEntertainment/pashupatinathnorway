"use client";
import { useState, useEffect, useCallback } from "react";
import { Search, Download, Calendar, FileText, Filter, ChevronDown } from "lucide-react";
import { useSession } from "next-auth/react";
interface Publication {
  id: string;
  title: string;
  type: string;
  description: string;
  publishedDate: string;
  downloadUrl: string;
  language: "en" | "ne" | "no";
  accessLevels: string[];
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
export default function MemberPublicationsClient() {
  const { data: session } = useSession();
  const [publications, setPublications] = useState<Publication[]>([]);
  const [filteredPublications, setFilteredPublications] = useState<Publication[]>([]);
  const [reportTypes, setReportTypes] = useState<ReportType[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState("all");
  const [selectedLanguage, setSelectedLanguage] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [expandedDescriptions, setExpandedDescriptions] = useState<Set<string>>(new Set());
  // Get user access levels based on role
  const getUserAccessLevels = useCallback(() => {
    if (!session?.user?.role) return ["all"]; // Default to all if no role
    
    const userRole = session.user.role;
    const accessLevels = ["all"]; // Everyone can see "all" access level publications
    
    // Add role-specific access levels
    switch (userRole) {
      case "admin":
        accessLevels.push("executives", "advisors", "active_members", "general_members");
        break;
      case "executive":
        accessLevels.push("executives");
        break;
      case "advisor":
        accessLevels.push("advisors");
        break;
      case "member":
        // Check membership type for active vs general members
        if (session.user.membershipType === "Active") {
          accessLevels.push("active_members");
        } else {
          accessLevels.push("general_members");
        }
        break;
      default:
        // General members get general_members access
        accessLevels.push("general_members");
        break;
    }
    
    return accessLevels;
  }, [session]);
  // Fetch publications from API
  const fetchPublications = useCallback(async () => {
    try {
      setLoading(true);
      const userAccessLevels = getUserAccessLevels();
      const accessLevelsParam = userAccessLevels.join(',');
      
      const response = await fetch(`/api/publications?memberAccess=${accessLevelsParam}`);
      const data = await response.json();
      setPublications(data.publications || []);
    } catch (error) {
      console.error("Error fetching publications:", error);
    } finally {
      setLoading(false);
    }
  }, [getUserAccessLevels]);
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
  }, [session, fetchPublications]);
  // Filter publications
  useEffect(() => {
    let filtered = [...publications];
    
    if (searchTerm) {
      filtered = filtered.filter((publication: Publication) => 
        publication.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        publication.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (selectedType !== "all") {
      filtered = filtered.filter((publication: Publication) => publication.type === selectedType);
    }
    
    if (selectedLanguage !== "all") {
      filtered = filtered.filter((publication: Publication) => publication.language === selectedLanguage);
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

  const toggleDescription = (publicationId: string) => {
    setExpandedDescriptions(prev => {
      const newSet = new Set(prev);
      if (newSet.has(publicationId)) {
        newSet.delete(publicationId);
      } else {
        newSet.add(publicationId);
      }
      return newSet;
    });
  };

  const getWordCount = (text: string) => {
    return text.trim().split(/\s+/).length;
  };
  return (
    <div className="min-h-screen">
      {/* Header */}
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Member Publications</h1>
 
      {/* Search and Filters */}
      <div className="border-b sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 md:px-0 py-8">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search Bar */}
            <div className="flex max-w-lg relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search publications by title or description..."
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
                <option value="all">All Types</option>
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
            Found {filteredPublications.length} publication{filteredPublications.length !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
      {/* Publications Table */}
      <div className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-600"></div>
          </div>
        ) : filteredPublications.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">No publications found</h3>
            <p className="text-gray-500">
              {publications.length === 0 
                ? "No publications are available for your membership level." 
                : "Try adjusting your search criteria or filters."
              }
            </p>
          </div>
        ) : (
          <>
            {/* Mobile: Simple Div Layout */}
            <div className="md:hidden bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="divide-y divide-gray-200">
                {filteredPublications.map((publication: Publication) => (
                  <div key={publication.id} className="p-4 hover:bg-red-50 transition-colors">
                    <div className="space-y-3">
                      <div>
                        <h3 className="font-medium text-gray-900 md:line-clamp-2 mb-1">
                          {publication.title}
                        </h3>
                        <div className="text-sm text-gray-500">
                          {publication.description && (
                            <>
                              {getWordCount(publication.description) > 20 && !expandedDescriptions.has(publication.id) ? (
                                <>
                                  <span className="line-clamp-2">
                                    {publication.description.split(' ').slice(0, 20).join(' ')}...
                                  </span>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleDescription(publication.id);
                                    }}
                                    className="text-blue-600 hover:text-blue-700 text-xs ml-1"
                                  >
                                    See more
                                  </button>
                                </>
                              ) : (
                                <>
                                  <span className={expandedDescriptions.has(publication.id) ? '' : 'md:line-clamp-2'}>
                                    {publication.description}
                                  </span>
                                  {getWordCount(publication.description) > 20 && expandedDescriptions.has(publication.id) && (
                                    <button
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        toggleDescription(publication.id);
                                      }}
                                      className="text-blue-600 hover:text-blue-700 text-xs ml-1"
                                    >
                                      See less
                                    </button>
                                  )}
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <span>{getLanguageFlag(publication.language)}</span>
                          <span>{new Date(publication.publishedDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            day: 'numeric',
                            year: '2-digit'
                          })}</span>
                        </div>
                        <button
                          onClick={() => window.open(publication.downloadUrl, '_blank')}
                          className="flex items-center gap-1 px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-xs"
                        >
                          <Download className="w-3 h-3" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Desktop: Table Layout */}
            <div className="hidden md:block bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Publication
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Language
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Published Date
                      </th>
                      <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {filteredPublications.map((publication: Publication, index) => (
                      <tr key={publication.id} className={`${index % 2 === 0 ? 'bg-white' : 'bg-gray-50'} hover:bg-red-50 transition-colors`}>
                        <td className="px-6 py-4 md:max-w-sm">
                          <div>
                            <div className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
                              {publication.title}
                            </div>
                            <div className="text-sm text-gray-500 line-clamp-2">
                              {publication.description}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full border ${getTypeColor(publication.type)}`}>
                            {getTypeLabel(publication.type)}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <span className="text-2xl mr-2">{getLanguageFlag(publication.language)}</span>
                            <span className="text-sm text-gray-600">
                              {publication.language === 'en' ? 'English' : 
                               publication.language === 'ne' ? 'नेपाली' : 
                               publication.language === 'no' ? 'Norsk' : 'Unknown'}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          <div className="flex items-center">
                            <Calendar className="w-4 h-4 mr-2" />
                            {new Date(publication.publishedDate).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <button
                            onClick={() => window.open(publication.downloadUrl, '_blank')}
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
            </div>
          </>
        )}
      </div>
    </div>
  );
}
