"use client";
import { Star, Paperclip, User, MessageSquare } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export interface Message {
  _id: string;
  subject: string;
  content: string;
  sender: {
    _id: string;
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
}

interface MessageInboxProps {
  messages: Message[];
  onMessageStar: (messageId: string) => void;
  onMessageClick: (message: Message) => void;
}

export default function MessageInbox({
  messages,
  onMessageStar,
  onMessageClick
}: MessageInboxProps) {
  const unreadCount = (messages || []).filter(m => m && m.status !== "read").length;

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-gray-900">Inbox</h2>
          <div className="flex items-center space-x-2">
            {unreadCount > 0 && (
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                {unreadCount} unread
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Message List */}
      <div className="flex-1 overflow-y-auto">
        {(!messages || messages.length === 0) ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-500">
            <MessageSquare className="w-12 h-12 mb-4 text-gray-300" />
            <p>No messages found</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-200">
            {(messages || []).filter(Boolean).map((message) => (
              <div
                key={message._id}
                className={`flex items-start p-4 hover:bg-gray-50 cursor-pointer transition-all duration-200 ${
                  message.status !== "read" ? "bg-slate-50 border-l-4 border-blue-400" : "border-l-4 border-transparent"
                }`}
                onClick={() => {
                  onMessageClick(message);
                }}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-1">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-gray-600" />
                        </div>
                        <span className={`text-sm truncate ${
                          message.status !== "read" ? "font-semibold text-gray-900" : "font-medium text-gray-600"
                        }`}>
                          {message.type === "broadcast" ? "Admin" : "Unknown Sender"}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-1 ml-2">
                      {message.attachments && message.attachments.length > 0 && (
                        <Paperclip className="w-4 h-4 text-gray-400" />
                      )}
                      {message.isImportant && (
                        <div className="w-2 h-2 bg-yellow-400 rounded-full" />
                      )}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onMessageStar(message._id);
                        }}
                        className="p-1 hover:bg-gray-200 rounded"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            message.isStarred ? "fill-yellow-400 text-yellow-400" : "text-gray-400"
                          }`}
                        />
                      </button>
                    </div>
                  </div>
                  
                  <h3 className={`text-sm truncate mb-1 ${
                    message.status !== "read" ? "font-semibold text-gray-900" : "font-medium text-gray-700"
                  }`}>
                    {message.subject}
                  </h3>
                  
                  <p className={`text-sm line-clamp-2 mb-2 ${
                    message.status !== "read" ? "text-gray-700 font-medium" : "text-gray-500"
                  }`}>
                    {message.content}
                  </p>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      message.type === "broadcast" ? "bg-blue-100 text-blue-800" :
                      message.type === "personal" ? "bg-green-100 text-green-800" :
                      message.type === "system" ? "bg-gray-100 text-gray-800" :
                      "bg-purple-100 text-purple-800"
                    }`}>
                      {message.type}
                    </span>
                    {message.threadMessages && message.threadMessages.length > 0 && (
                      <span className="text-xs text-gray-500">
                        {message.threadMessages.length} replies
                      </span>
                    )}
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
