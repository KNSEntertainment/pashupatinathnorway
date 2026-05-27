"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import UniversalLoader from "@/components/ui/UniversalLoader";

// const MessageCompose = dynamic(() => import("@/components/messages/MessageCompose"), { ssr: false });

// Import Message type from components to ensure consistency
type Message = import("@/components/messages/MessageInboxNew").Message;

// interface Recipient {
//   _id: string;
//   firstName: string;
//   lastName: string;
//   email: string;
//   membershipType: string;
// }


export default function MessagesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  // const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [expandedMessage, setExpandedMessage] = useState<string | null>(null);
    // const [showCompose, setShowCompose] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");

  // Redirect if not authenticated
  useEffect(() => {
    if (status === "loading") return;
    if (!session) {
      router.push("/en/login");
      return;
    }
    
    // Check if user is a member
    if (!session.user.isMember && session.user.role !== "admin") {
      router.push("/en/profile");
      return;
    }
  }, [session, status, router]);

  // Fetch messages
  const fetchMessages = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data = await response.json();
        setMessages(data.messages || []);
        setUnreadCount(data.unreadCount || 0);
      } else {
        console.error("Failed to fetch messages");
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch recipients for compose
  // const fetchRecipients = async () => {
  //   try {
  //     const response = await fetch("/api/messages/recipients");
  //     if (response.ok) {
  //       const data = await response.json();
  //       setRecipients(data.recipients || []);
  //     }
  //   } catch (error) {
  //     console.error("Error fetching recipients:", error);
  //   }
  // };

  useEffect(() => {
    if (session) {
      fetchMessages();
      // fetchRecipients();
    }
  }, [session]);

  const handleMarkAsRead = useCallback(async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "markAsRead" }),
      });
      
      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, status: "read" as const, readAt: new Date().toISOString() }
            : msg
        ));
        
        setUnreadCount(prev => Math.max(0, prev - 1));

        // Dispatch event to notify other components of message status change
        window.dispatchEvent(new CustomEvent('messageStatusChanged'));
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  }, []);

  const handleMessageDelete = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        setExpandedMessage(null);
      } else {
        console.error("Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const toggleMessageExpand = (messageId: string) => {
    setExpandedMessage(prev => prev === messageId ? null : messageId);
    
    // Mark as read when expanded
    const message = messages.find(msg => msg._id === messageId);
    if (message && message.status !== "read") {
      handleMarkAsRead(messageId);
    }
  };

  // Simple search filtering
  const filteredMessages = (messages || []).filter((message: Message) => {
    if (!message) return false;
    
    const matchesSearch = (message.subject && message.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (message.content && message.content.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (message.sender && message.sender.firstName && message.sender.firstName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (message.sender && message.sender.lastName && message.sender.lastName.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (message.sender && message.sender.email && message.sender.email.toLowerCase().includes(searchQuery.toLowerCase())) ||
                         (message.type === "broadcast" && "admin".includes(searchQuery.toLowerCase()));
    
    return matchesSearch;
  });

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <UniversalLoader size="lg" variant="spinner" text="Loading messages..." />
      </div>
    );
  }

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-0 md:p-4 bg-white">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>

        {/* Search Only */}
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Search messages..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Simple Message List */}
      <div className="py-4 md:p-4 space-y-2">
        {filteredMessages.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p>No messages found</p>
          </div>
        ) : (
          filteredMessages.map((message) => (
            <div
              key={message._id}
              className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                message.status !== "read" ? "bg-blue-50 border-blue-200" : "bg-white border-gray-200"
              } ${expandedMessage === message._id ? "shadow-md" : "hover:shadow-sm"}`}
              onClick={() => toggleMessageExpand(message._id)}
            >
              {/* Message Header */}
              <div className="flex items-start justify-between mb-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium ${
                      message.status !== "read" ? "text-blue-900" : "text-gray-900"
                    }`}>
                      {message.sender ? 
                        `${message.sender.firstName} ${message.sender.lastName}` : 
                        (message.type === "broadcast" ? "Temple Admin" : "Unknown Sender")
                      }
                    </span>
                    {message.status !== "read" && (
                      <span className="bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">New</span>
                    )}
                  </div>
                  <h3 className={`font-medium mb-1 ${
                    message.status !== "read" ? "text-blue-900 font-semibold" : "text-gray-900"
                  }`}>
                    {message.subject || "No Subject"}
                  </h3>
                </div>
                <div className="text-xs text-gray-500 ml-4">
                  {new Date(message.createdAt).toLocaleDateString()}
                </div>
              </div>

              {/* Message Content - Show preview or full content */}
              <div className="text-sm text-gray-600">
                {expandedMessage === message._id ? (
                  <div className="space-y-3">
                    {/* Full Content */}
                    <div className="prose prose-sm max-w-none">
                      <p className="text-gray-700 whitespace-pre-wrap">
                        {message.content || "No content"}
                      </p>
                    </div>
                    
                    {/* Action Buttons */}
                    <div className="flex items-center justify-between pt-3 border-t border-gray-200">
                      <div className="text-xs text-gray-500">
                        {new Date(message.createdAt).toLocaleString()}
                      </div>
                      <div className="flex gap-3">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleMessageExpand(message._id);
                          }}
                          className="text-blue-600 hover:text-blue-700 text-sm"
                        >
                          Collapse
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMessageDelete(message._id);
                          }}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Preview with expand button */
                  <div>
                    <p className="line-clamp-2">
                      {message.content || "No content"}
                    </p>
                    {(message.content && message.content.length > 100) && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleMessageExpand(message._id);
                        }}
                        className="text-blue-600 hover:text-blue-700 text-sm mt-1"
                      >
                        Read more
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
