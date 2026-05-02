"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Search, 
  Filter, 
  Calendar, 
  User, 
  FileText, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertTriangle,
  ChevronLeft, 
  ChevronRight,
  Download,
  RefreshCw
} from "lucide-react";

interface AuditLog {
  id: string;
  action: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
  details: {
    totalRows?: number;
    validRows?: number;
    insertedRows?: number;
    skippedRows?: number;
    fileName?: string;
    fileSize?: number;
    validationErrors?: Array<{ row: number; errors: string[] }>;
    verifiedCount?: number;
    unverifiedCount?: number;
    verificationFileRows?: number;
    filters?: {
      search?: string;
      statusFilter?: string;
      typeFilter?: string;
    };
    personalNumber?: string;
    year?: number;
    memberName?: string;
    totalDonated?: number;
    donationCount?: number;
    membershipStatus?: string;
    eventId?: string;
    eventName?: string;
    eventDate?: string;
    recordCount?: number;
  };
  ipAddress: string;
  userAgent: string;
  timestamp: string;
  status: "initiated" | "completed" | "failed" | "partial_success";
  errorMessage?: string;
  createdAt: string;
  updatedAt: string;
}

interface PaginatedResponse {
  success: boolean;
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  error?: string;
}

export default function AuditLogsManagement() {
  const router = useRouter();
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    action: "",
    status: "",
    startDate: "",
    endDate: ""
  });
  const [showFilters, setShowFilters] = useState(false);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  useEffect(() => {
    fetchAuditLogs();
  }, [currentPage, filters]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: "20"
      });

      // Add filters to params
      if (filters.action) params.append("action", filters.action);
      if (filters.status) params.append("status", filters.status);
      if (filters.startDate) params.append("startDate", filters.startDate);
      if (filters.endDate) params.append("endDate", filters.endDate);

      const response = await fetch(`/api/audit-logs?${params}`);
      const data: PaginatedResponse = await response.json();

      if (data.success) {
        setAuditLogs(data.data);
        setPagination(data.pagination);
      } else {
        console.error("Failed to fetch audit logs:", data.error);
      }
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      completed: "bg-green-100 text-green-800 border-green-200",
      failed: "bg-red-100 text-red-800 border-red-200",
      partial_success: "bg-yellow-100 text-yellow-800 border-yellow-200",
      initiated: "bg-blue-100 text-blue-800 border-blue-200"
    };

    const icons = {
      completed: <CheckCircle className="w-3 h-3 mr-1" />,
      failed: <XCircle className="w-3 h-3 mr-1" />,
      partial_success: <AlertTriangle className="w-3 h-3 mr-1" />,
      initiated: <Clock className="w-3 h-3 mr-1" />
    };

    return (
      <Badge className={`flex items-center ${variants[status as keyof typeof variants]}`}>
        {icons[status as keyof typeof icons]}
        {status.replace('_', ' ').toUpperCase()}
      </Badge>
    );
  };

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return "N/A";
    return (bytes / 1024).toFixed(1) + " KB";
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActionDisplayName = (action: string) => {
    const names: { [key: string]: string } = {
      "bulk_upload_donations": "Bulk Upload Donations",
      "bulk_upload_memberships": "Bulk Upload Memberships",
      "crosscheck_personal_numbers": "Crosscheck Personal Numbers",
      "download_members_excel": "Download Members Excel",
      "download_members_csv": "Download Members CSV",
      "generate_tax_document": "Generate Tax Document"
    };
    return names[action] || action.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  const resetFilters = () => {
    setFilters({
      action: "",
      status: "",
      startDate: "",
      endDate: ""
    });
    setCurrentPage(1);
  };

  const filteredLogs = auditLogs.filter(log =>
    log.user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.action.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Audit Logs</h1>
              <p className="text-gray-600">
                Monitor and track all administrative actions and system events
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center gap-2"
              >
                <Filter className="w-4 h-4" />
                Filters
              </Button>
              <Button
                variant="outline"
                onClick={fetchAuditLogs}
                className="flex items-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </Button>
            </div>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="text-lg">Filter Options</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Action
                  </label>
                  <Select value={filters.action} onValueChange={(value) => setFilters({...filters, action: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Actions" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Actions</SelectItem>
                      <SelectItem value="bulk_upload_donations">Bulk Upload Donations</SelectItem>
                      <SelectItem value="bulk_upload_memberships">Bulk Upload Memberships</SelectItem>
                      <SelectItem value="crosscheck_personal_numbers">Crosscheck Personal Numbers</SelectItem>
                      <SelectItem value="download_members_excel">Download Members Excel</SelectItem>
                      <SelectItem value="download_members_csv">Download Members CSV</SelectItem>
                      <SelectItem value="generate_tax_document">Generate Tax Document</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Status
                  </label>
                  <Select value={filters.status} onValueChange={(value) => setFilters({...filters, status: value})}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Statuses" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">All Statuses</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="failed">Failed</SelectItem>
                      <SelectItem value="partial_success">Partial Success</SelectItem>
                      <SelectItem value="initiated">Initiated</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Date
                  </label>
                  <Input
                    type="date"
                    value={filters.startDate}
                    onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Date
                  </label>
                  <Input
                    type="date"
                    value={filters.endDate}
                    onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button variant="outline" onClick={resetFilters}>
                  Reset Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Search Bar */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search by user name, email, or action..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        {/* Audit Logs Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Audit Log Entries
              </span>
              <span className="text-sm font-normal text-gray-500">
                {pagination.total} total entries
              </span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex justify-center py-8">
                <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Timestamp</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">User</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Action</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                      <th className="text-left py-3 px-4 font-medium text-gray-700">Details</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredLogs.map((log) => (
                      <tr key={log.id} className="border-b hover:bg-gray-50">
                        <td className="py-3 px-4 text-sm">
                          {formatDate(log.timestamp)}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <User className="w-4 h-4 text-gray-400" />
                            <div>
                              <div className="font-medium text-sm">{log.user.name}</div>
                              <div className="text-xs text-gray-500">{log.user.email}</div>
                              <Badge variant="outline" className="text-xs mt-1">
                                {log.user.role}
                              </Badge>
                            </div>
                          </div>
                        </td>
                        <td className="py-3 px-4 text-sm">
                          {getActionDisplayName(log.action)}
                        </td>
                        <td className="py-3 px-4">
                          {getStatusBadge(log.status)}
                        </td>
                        <td className="py-3 px-4 text-sm">
                          <div className="space-y-1">
                            {log.details.fileName && (
                              <div className="flex items-center gap-1">
                                <FileText className="w-3 h-3 text-gray-400" />
                                <span className="text-xs">{log.details.fileName}</span>
                                <span className="text-xs text-gray-500">({formatFileSize(log.details.fileSize)})</span>
                              </div>
                            )}
                            {log.action === 'crosscheck_personal_numbers' ? (
                              <>
                                {log.details.verifiedCount !== undefined && (
                                  <div className="text-xs text-green-600">
                                    ✅ {log.details.verifiedCount} verified
                                  </div>
                                )}
                                {log.details.unverifiedCount !== undefined && (
                                  <div className="text-xs text-red-600">
                                    ❌ {log.details.unverifiedCount} unverified
                                  </div>
                                )}
                                {log.details.totalRows !== undefined && (
                                  <div className="text-xs text-gray-600">
                                    Total: {log.details.totalRows} members checked
                                  </div>
                                )}
                                {log.details.verificationFileRows !== undefined && (
                                  <div className="text-xs text-gray-500">
                                    Verification file: {log.details.verificationFileRows} rows
                                  </div>
                                )}
                              </>
                            ) : (log.action === 'download_members_excel' || log.action === 'download_members_csv') ? (
                              <>
                                {log.details.totalRows !== undefined && (
                                  <div className="text-xs text-blue-600">
                                    📊 {log.details.totalRows} members downloaded
                                  </div>
                                )}
                                {log.details.filters && (
                                  <div className="text-xs text-gray-500">
                                    Filters: {Object.entries(log.details.filters).filter(([_, v]) => v).map(([k, v]) => `${k}: ${v}`).join(', ') || 'None'}
                                  </div>
                                )}
                              </>
                            ) : log.action === 'generate_tax_document' ? (
                              <>
                                {log.details.memberName && (
                                  <div className="text-xs text-green-600">
                                    📄 {log.details.memberName}
                                  </div>
                                )}
                                {log.details.personalNumber && (
                                  <div className="text-xs text-gray-600">
                                    PN: {log.details.personalNumber}
                                  </div>
                                )}
                                {log.details.year && (
                                  <div className="text-xs text-gray-600">
                                    Year: {log.details.year}
                                  </div>
                                )}
                                {log.details.totalDonated !== undefined && (
                                  <div className="text-xs text-blue-600">
                                    Total: {log.details.totalDonated.toLocaleString('nb-NO')} NOK
                                  </div>
                                )}
                                {log.details.donationCount !== undefined && (
                                  <div className="text-xs text-gray-500">
                                    {log.details.donationCount} donations
                                  </div>
                                )}
                                {log.details.membershipStatus && (
                                  <div className="text-xs text-gray-500">
                                    Status: {log.details.membershipStatus}
                                  </div>
                                )}
                              </>
                            ) : log.action === 'export_attendance' ? (
                              <>
                                {log.details.eventName && (
                                  <div className="text-xs text-green-600">
                                    📅 {log.details.eventName}
                                  </div>
                                )}
                                {log.details.recordCount !== undefined && (
                                  <div className="text-xs text-blue-600">
                                    👥 {log.details.recordCount} attendance records exported
                                  </div>
                                )}
                                {log.details.eventDate && (
                                  <div className="text-xs text-gray-600">
                                    Date: {log.details.eventDate}
                                  </div>
                                )}
                              </>
                            ) : (
                              <>
                                {log.details.totalRows !== undefined && (
                                  <div className="text-xs text-gray-600">
                                    {log.details.insertedRows || 0} / {log.details.totalRows} rows processed
                                  </div>
                                )}
                              </>
                            )}
                            {log.errorMessage && (
                              <div className="text-xs text-red-600 truncate" title={log.errorMessage}>
                                {log.errorMessage}
                              </div>
                            )}
                          </div>
                        </td>
                
                      </tr>
                    ))}
                  </tbody>
                </table>
                
                {filteredLogs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    No audit logs found matching your criteria
                  </div>
                )}
              </div>
            )}

            {/* Pagination */}
            {pagination.pages > 1 && (
              <div className="flex items-center justify-between mt-6">
                <div className="text-sm text-gray-600">
                  Showing {((currentPage - 1) * pagination.limit) + 1} to {Math.min(currentPage * pagination.limit, pagination.total)} of {pagination.total} entries
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Previous
                  </Button>
                  <span className="flex items-center px-3 text-sm">
                    Page {currentPage} of {pagination.pages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage(Math.min(pagination.pages, currentPage + 1))}
                    disabled={currentPage === pagination.pages}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
