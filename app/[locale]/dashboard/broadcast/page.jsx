"use client";
import React, { useState, useEffect } from "react";
import { useActiveMenu } from "@/context/ActiveMenuContext";
import { Send, Users, Mail, MessageSquare, Search, CheckCircle, Clock, AlertCircle, XCircle } from "lucide-react";

export default function BroadcastPage() {
  const { setActiveMenu } = useActiveMenu();
  // const { data: session } = useSession();
  const [activeTab, setActiveTab] = useState("create");
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [selectedRecipients, setSelectedRecipients] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  // Form state
  const [formData, setFormData] = useState({
    subject: "",
    content: "",
    sendingMethod: "email",
    recipientType: "all",
    recipientGroups: [],
    scheduledFor: undefined
  });

  useEffect(() => {
    setActiveMenu("broadcast");
    fetchBroadcasts();
  }, [setActiveMenu]);

  const fetchBroadcasts = async () => {
    try {
      const response = await fetch("/api/broadcast");
      if (response.ok) {
        const data = await response.json();
        setBroadcasts(data.broadcasts);
      }
    } catch (error) {
      console.error("Error fetching broadcasts:", error);
    }
  };

  const searchMembers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      setLoading(true);
      const response = await fetch(`/api/broadcast/members/search?query=${encodeURIComponent(query)}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.members);
      }
    } catch (error) {
      console.error("Error searching members:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleRecipientToggle = (member) => {
    setSelectedRecipients(prev => {
      const exists = prev.find(r => r._id === member._id);
      if (exists) {
        return prev.filter(r => r._id !== member._id);
      } else {
        return [...prev, member];
      }
    });
  };

  const handleGroupToggle = (group) => {
    setFormData(prev => ({
      ...prev,
      recipientGroups: prev.recipientGroups.includes(group)
        ? prev.recipientGroups.filter(g => g !== group)
        : [...prev.recipientGroups, group]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        individualRecipients: formData.recipientType === "individual" ? selectedRecipients.map(r => r._id) : []
      };

      const response = await fetch("/api/broadcast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        // Reset form
        setFormData({
          subject: "",
          content: "",
          sendingMethod: "email",
          recipientType: "all",
          recipientGroups: [],
          scheduledFor: undefined
        });
        setSelectedRecipients([]);
        setSearchResults([]);
        setSearchQuery("");
        setActiveTab("history");
        fetchBroadcasts();
        alert("Broadcast created successfully!");
      } else {
        const error = await response.json();
        alert(`Error: ${error.error}`);
      }
    } catch (error) {
      console.error("Error creating broadcast:", error);
      alert("Failed to create broadcast");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "sent": return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "pending": return <Clock className="w-4 h-4 text-yellow-500" />;
      case "failed": return <XCircle className="w-4 h-4 text-red-500" />;
      default: return <AlertCircle className="w-4 h-4 text-gray-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Broadcast Messages</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setActiveTab("create")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "create" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Create Broadcast
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              activeTab === "history" 
                ? "bg-blue-600 text-white" 
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Broadcast History
          </button>
        </div>
      </div>

      {activeTab === "create" && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Subject */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Subject
              </label>
              <input
                type="text"
                value={formData.subject}
                onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter broadcast subject"
                required
              />
            </div>

            {/* Content */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Message Content
              </label>
              <textarea
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 h-32"
                placeholder="Enter your message content"
                required
              />
            </div>

            {/* Sending Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sending Method
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {["email", "sms", "message", "all"].map((method) => (
                  <label key={method} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="sendingMethod"
                      value={method}
                      checked={formData.sendingMethod === method}
                      onChange={(e) => setFormData(prev => ({ ...prev, sendingMethod: e.target.value }))}
                      className="text-blue-600"
                    />
                    <span className="capitalize flex items-center">
                      {method === "email" && <Mail className="w-4 h-4 mr-1" />}
                      {method === "sms" && <MessageSquare className="w-4 h-4 mr-1" />}
                      {method === "message" && <Send className="w-4 h-4 mr-1" />}
                      {method === "all" && <Users className="w-4 h-4 mr-1" />}
                      {method === "all" ? "All Methods" : method}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Recipient Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Recipients
              </label>
              <div className="space-y-3">
                {["all", "group", "individual"].map((type) => (
                  <label key={type} className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="radio"
                      name="recipientType"
                      value={type}
                      checked={formData.recipientType === type}
                      onChange={(e) => setFormData(prev => ({ ...prev, recipientType: e.target.value }))}
                      className="text-blue-600"
                    />
                    <span className="capitalize">
                      {type === "all" && "All Members"}
                      {type === "group" && "Specific Groups"}
                      {type === "individual" && "Individual Members"}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {/* Group Selection */}
            {formData.recipientType === "group" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Groups
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {["General", "Active", "Executive", "Advisor"].map((group) => (
                    <label key={group} className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.recipientGroups.includes(group)}
                        onChange={() => handleGroupToggle(group)}
                        className="text-blue-600"
                      />
                      <span>{group}</span>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Individual Member Search */}
            {formData.recipientType === "individual" && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Search and Select Members
                </label>
                <div className="relative mb-3">
                  <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery || ""}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      searchMembers(e.target.value);
                    }}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Search members by name, email, or membership ID..."
                  />
                </div>

                {/* Search Results */}
                {searchQuery && (
                  <div className="border border-gray-200 rounded-lg max-h-40 overflow-y-auto mb-3">
                    {loading ? (
                      <div className="p-3 text-center text-gray-500">Searching...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((member) => (
                        <div
                          key={member._id}
                          onClick={() => handleRecipientToggle(member)}
                          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">
                                {member.firstName} {member.lastName}
                              </div>
                              <div className="text-sm text-gray-500">
                                {member.email} • {member.membershipType}
                              </div>
                            </div>
                            <input
                              type="checkbox"
                              checked={!!selectedRecipients.find(r => r._id === member._id)}
                              onChange={() => {}}
                              className="text-blue-600"
                            />
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-3 text-center text-gray-500">No members found</div>
                    )}
                  </div>
                )}

                {/* Selected Recipients */}
                {selectedRecipients.length > 0 && (
                  <div>
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Selected Recipients ({selectedRecipients.length})
                    </div>
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                      {selectedRecipients.map((member) => (
                        <div
                          key={member._id}
                          className="flex items-center justify-between p-2 bg-gray-50 rounded"
                        >
                          <div className="text-sm">
                            {member.firstName} {member.lastName} • {member.email}
                          </div>
                          <button
                            type="button"
                            onClick={() => handleRecipientToggle(member)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Schedule */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Schedule (Optional)
              </label>
              <input
                type="datetime-local"
                value={formData.scheduledFor}
                onChange={(e) => setFormData(prev => ({ ...prev, scheduledFor: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                min={new Date().toISOString().slice(0, 16)}
              />
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                {loading ? "Creating..." : "Create Broadcast"}
              </button>
            </div>
          </form>
        </div>
      )}

      {activeTab === "history" && (
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Subject
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Method
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Recipients
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {broadcasts.map((broadcast) => (
                  <tr key={broadcast._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{broadcast.subject}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500 capitalize">{broadcast.sendingMethod}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {broadcast.recipientType === "all" && "All Members"}
                        {broadcast.recipientType === "group" && broadcast.recipientGroups.join(", ")}
                        {broadcast.recipientType === "individual" && `${broadcast.individualRecipients.length} selected`}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(broadcast.status)}
                        <span className="text-sm text-gray-500 capitalize">{broadcast.status}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(broadcast.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {broadcasts.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                No broadcasts found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
