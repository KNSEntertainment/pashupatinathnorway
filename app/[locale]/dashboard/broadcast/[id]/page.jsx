"use client";
import React, { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { useActiveMenu } from "@/context/ActiveMenuContext";
import { ArrowLeft, Send, Mail, MessageSquare, CheckCircle, Clock, AlertCircle, XCircle, Eye } from "lucide-react";

export default function BroadcastDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { setActiveMenu } = useActiveMenu();
  const [broadcast, setBroadcast] = useState(null);
  const [tracking, setTracking] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    setActiveMenu("broadcast");
    fetchBroadcastDetails();
  }, [id, setActiveMenu, fetchBroadcastDetails]);

  const fetchBroadcastDetails = useCallback(async () => {
    try {
      const response = await fetch(`/api/broadcast/${id}`);
      if (response.ok) {
        const data = await response.json();
        setBroadcast(data.broadcast);
        setTracking(data.tracking);
        setStats(data.stats);
      } else {
        console.error("Failed to fetch broadcast details");
      }
    } catch (error) {
      console.error("Error fetching broadcast details:", error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  const getMethodIcon = (method) => {
    switch (method) {
      case "email": return <Mail className="w-4 h-4" />;
      case "sms": return <MessageSquare className="w-4 h-4" />;
      case "message": return <Send className="w-4 h-4" />;
      default: return null;
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "sent": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "delivered": return <CheckCircle className="w-4 h-4 text-blue-500" />;
      case "read": return <Eye className="w-4 h-4 text-green-600" />;
      case "pending": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "sent": return "text-green-600 bg-green-50";
      case "delivered": return "text-blue-600 bg-blue-50";
      case "read": return "text-green-700 bg-green-50";
      case "pending": return "text-yellow-600 bg-yellow-50";
      case "failed": return "text-red-600 bg-red-50";
      default: return "text-gray-600 bg-gray-50";
    }
  };

  const filteredTracking = tracking.filter(item => 
    filter === "all" || item.status === filter
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!broadcast) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Broadcast not found</h2>
        <button
          onClick={() => router.back()}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <button
          onClick={() => router.back()}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-3xl font-bold text-gray-900">Broadcast Details</h1>
      </div>

      {/* Broadcast Info */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Message Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Subject:</span>
                <p className="text-gray-900">{broadcast.subject}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Content:</span>
                <p className="text-gray-900 whitespace-pre-wrap">{broadcast.content}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Sending Method:</span>
                <div className="flex items-center space-x-2 mt-1">
                  {getMethodIcon(broadcast.sendingMethod)}
                  <span className="capitalize">{broadcast.sendingMethod}</span>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Recipient Type:</span>
                <p className="text-gray-900 capitalize">
                  {broadcast.recipientType === "all" && "All Members"}
                  {broadcast.recipientType === "group" && `Groups: ${broadcast.recipientGroups.join(", ")}`}
                  {broadcast.recipientType === "individual" && `Individual: ${broadcast.individualRecipients.length} selected`}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h3>
            <div className="space-y-3">
              <div>
                <span className="text-sm font-medium text-gray-500">Broadcast Status:</span>
                <div className="flex items-center space-x-2 mt-1">
                  {getStatusIcon(broadcast.status)}
                  <span className="capitalize">{broadcast.status}</span>
                </div>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-500">Created:</span>
                <p className="text-gray-900">
                  {new Date(broadcast.createdAt).toLocaleString()}
                </p>
              </div>
              {broadcast.sentAt && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Sent:</span>
                  <p className="text-gray-900">
                    {new Date(broadcast.sentAt).toLocaleString()}
                  </p>
                </div>
              )}
              {broadcast.scheduledFor && (
                <div>
                  <span className="text-sm font-medium text-gray-500">Scheduled For:</span>
                  <p className="text-gray-900">
                    {new Date(broadcast.scheduledFor).toLocaleString()}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Statistics */}
      {stats && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Delivery Statistics</h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{stats.total}</div>
              <div className="text-sm text-gray-500">Total</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.sent + stats.delivered}</div>
              <div className="text-sm text-gray-500">Sent/Delivered</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.read}</div>
              <div className="text-sm text-gray-500">Read</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.failed}</div>
              <div className="text-sm text-gray-500">Failed</div>
            </div>
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm font-medium text-gray-700">Filter by status:</span>
          {["all", "pending", "sent", "delivered", "read", "failed"].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filter === status
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {status === "all" && "All"}
              {status === "pending" && "Pending"}
              {status === "sent" && "Sent"}
              {status === "delivered" && "Delivered"}
              {status === "read" && "Read"}
              {status === "failed" && "Failed"}
            </button>
          ))}
        </div>
      </div>

      {/* Tracking Details */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            Recipient Tracking ({filteredTracking.length})
          </h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Recipient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Method
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Sent At
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Read At
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredTracking.map((track, index) => (
                <tr key={`${track._id}-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {track.recipient?.firstName} {track.recipient?.lastName}
                      </div>
                      <div className="text-sm text-gray-500">{track.recipient?.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-800 rounded-full">
                      {track.recipient?.membershipType}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getMethodIcon(track.sendingMethod)}
                      <span className="text-sm text-gray-900 capitalize">{track.sendingMethod}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(track.status)}
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(track.status)}`}>
                        {track.status}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {track.sentAt ? new Date(track.sentAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {track.readAt ? new Date(track.readAt).toLocaleString() : "-"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filteredTracking.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              No tracking records found for the selected filter
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
