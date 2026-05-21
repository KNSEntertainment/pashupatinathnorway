
"use client";
import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";

// Dynamically import the message components to avoid SSR issues
const MessageInbox = dynamic(() => import("@/components/messages/MessageInboxNew"), { ssr: false });
const MessageDetail = dynamic(() => import("@/components/messages/MessageDetail"), { ssr: false });
// const MessageCompose = dynamic(() => import("@/components/messages/MessageCompose"), { ssr: false });

interface Message {
  _id: string;
  subject: string;
  content: string;
  sender: {
    firstName: string;
    lastName: string;
    email: string;
  };
  type: "broadcast" | "personal" | "system" | "reply";
  status: "sent" | "delivered" | "read";
  readAt?: string;
  createdAt: string;
  isImportant: boolean;
  isStarred: boolean;
  attachments?: Array<{
    filename: string;
    url: string;
    size: number;
  }>;
  threadMessages?: Message[];
  parentMessage?: Message;
}

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
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    // const [showCompose, setShowCompose] = useState(false);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "unread" | "starred" | "important">("all");

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
        
        if (selectedMessage && selectedMessage._id === messageId) {
          setSelectedMessage(prev => prev ? ({
            ...prev,
            status: "read" as const,
            readAt: new Date().toISOString()
          }) : null);
        }

        // Dispatch event to notify other components of message status change
        window.dispatchEvent(new CustomEvent('messageStatusChanged'));
      }
    } catch (error) {
      console.error("Error marking message as read:", error);
    }
  }, [selectedMessage]);

  // Auto-select first message when messages are loaded
  useEffect(() => {
    if (messages.length > 0 && !selectedMessage) {
      const firstMessage = messages[0];
      setSelectedMessage(firstMessage);
      
      // Mark the first message as read if it's unread
      if (firstMessage.status !== "read") {
        handleMarkAsRead(firstMessage._id);
      }
    }
  }, [messages, selectedMessage, handleMarkAsRead]);

  
  const handleMessageDelete = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "DELETE",
      });
      
      if (response.ok) {
        setMessages(prev => prev.filter(msg => msg._id !== messageId));
        setSelectedMessage(null);
      } else {
        console.error("Failed to delete message");
      }
    } catch (error) {
      console.error("Error deleting message:", error);
    }
  };

  const handleMessageStar = async (messageId: string) => {
    try {
      const message = messages.find(msg => msg._id === messageId);
      const action = message?.isStarred ? "unstar" : "star";
      
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });
      
      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, isStarred: !msg.isStarred }
            : msg
        ));
        
        if (selectedMessage && selectedMessage._id === messageId) {
          setSelectedMessage(prev => prev ? ({
            ...prev,
            isStarred: !prev.isStarred
          }) : null);
        }
      }
    } catch (error) {
      console.error("Error updating message:", error);
    }
  };

  
  const handleMarkAsUnread = async (messageId: string) => {
    try {
      const response = await fetch(`/api/messages/${messageId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action: "markAsUnread" }),
      });
      
      if (response.ok) {
        setMessages(prev => prev.map(msg => 
          msg._id === messageId 
            ? { ...msg, status: "sent" as const, readAt: undefined }
            : msg
        ));
        
        setUnreadCount(prev => prev + 1);
        
        if (selectedMessage && selectedMessage._id === messageId) {
          setSelectedMessage(prev => prev ? ({
            ...prev,
            status: "sent" as const,
            readAt: undefined
          }) : null);
        }

        // Dispatch event to notify other components of message status change
        window.dispatchEvent(new CustomEvent('messageStatusChanged'));
      }
    } catch (error) {
      console.error("Error marking message as unread:", error);
    }
  };

  // const handleSendMessage = async (messageData: {
  //   recipients: string[];
  //   subject: string;
  //   content: string;
  //   type: "personal";
  // }) => {
  //   try {
  //     const response = await fetch("/api/messages", {
  //       method: "POST",
  //       headers: {
  //         "Content-Type": "application/json",
  //       },
  //       body: JSON.stringify(messageData),
  //     });
      
  //     if (response.ok) {
  //       fetchMessages(); // Refresh messages
  //     } else {
  //       console.error("Failed to send message");
  //     }
  //   } catch (error) {
  //     console.error("Error sending message:", error);
  //   }
  // };

  // const handleReply = (message: Message) => {
  //   setSelectedMessage(message);
  //   setShowCompose(true);
  // };

  // const handleForward = (message: Message) => {
  //   setSelectedMessage(message);
  //   setShowCompose(true);
  // };

  
  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
  };

  // Filter messages based on search and filter criteria
  const filteredMessages = (messages || []).filter((message: Message) => {
    if (!message) return false;
    
    const matchesSearch = message.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         message.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (message.type === "broadcast" && "admin".includes(searchQuery.toLowerCase())) || 
                         (message.sender && message.sender.email && message.sender.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesFilter = 
      filter === "all" ||
      (filter === "unread" && message.status !== "read") ||
      (filter === "starred" && message.isStarred) ||
      (filter === "important" && message.isImportant);
    
    return matchesSearch && matchesFilter;
  });

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4 bg-white">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">Messages</h1>
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
          {/* <button
            onClick={() => setShowCompose(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>Compose</span>
          </button> */}
        </div>

        {/* Search and Filters */}
        <div className="flex items-center space-x-4">
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
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as "all" | "unread" | "starred" | "important")}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Messages</option>
            <option value="unread">Unread</option>
            <option value="starred">Starred</option>
            <option value="important">Important</option>
          </select>
        </div>
      </div>

      {/* Main Content - Clean 2 Column Layout */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Column 1: Message List - Shows subject, sender, etc */}
        <div className={`${selectedMessage ? "w-1/3" : "w-full"} border-r border-gray-200`}>
          <MessageInbox
            messages={filteredMessages}
            onMessageStar={handleMessageStar}
            onMessageClick={handleMessageClick}
          />
        </div>

        {/* Column 2: Message Content - Shows full message with collapsible details */}
        {selectedMessage && (
          <div className="flex-1">
            <MessageDetail
              message={selectedMessage}
              onBack={() => setSelectedMessage(null)}
              onReply={() => {}}
              onForward={() => {}}
              onDelete={handleMessageDelete}
              onStar={handleMessageStar}
              onMarkAsRead={handleMarkAsRead}
              onMarkAsUnread={handleMarkAsUnread}
            />
          </div>
        )}
      </div>

      {/* Compose Modal */}
      {/* {showCompose && (
        <MessageCompose
          recipients={recipients}
          onClose={() => {
            setShowCompose(false);
            setSelectedMessage(null);
          }}
          onSend={handleSendMessage}
          isReplying={!!selectedMessage}
          replyToMessage={selectedMessage ? {
            subject: selectedMessage.subject,
            recipientName: selectedMessage.sender ? `${selectedMessage.sender.firstName} ${selectedMessage.sender.lastName}` : 'Unknown Sender'
          } : undefined}
        />
      )} */}
    </div>
  );
}
