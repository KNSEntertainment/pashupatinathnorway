"use client";
import { useState } from "react";
import { Star, MoreVertical, Paperclip, User, Clock, ChevronLeft, ChevronDown, ChevronUp } from "lucide-react";
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
  parentMessage?: Message;
}

interface MessageDetailProps {
  message: Message;
  onBack: () => void;
  onReply: (message: Message) => void;
  onForward: (message: Message) => void;
  onDelete: (messageId: string) => void;
  onStar: (messageId: string) => void;
  onMarkAsRead: (messageId: string) => void;
  onMarkAsUnread: (messageId: string) => void;
}

export default function MessageDetail({
  message,
  onBack,
  onDelete,
  onStar,
  onMarkAsRead,
  onMarkAsUnread
}: MessageDetailProps) {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showDetails, setShowDetails] = useState(false);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ChevronLeft className="w-5 h-5 text-gray-600" />
            </button>
            <h2 className="text-xl font-semibold text-gray-900">{message.subject}</h2>
          </div>
          
          <div className="flex items-center space-x-2">
            {/* <button
              onClick={() => onReply(message)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Reply"
            >
              <Reply className="w-4 h-4 text-gray-600" />
            </button>
            <button
              onClick={() => onForward(message)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Forward"
            >
              <Forward className="w-4 h-4 text-gray-600" />
            </button> */}
            <button
              onClick={() => onStar(message._id)}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Star"
            >
              <Star
                className={`w-4 h-4 ${
                  message.isStarred ? "fill-yellow-400 text-yellow-400" : "text-gray-600"
                }`}
              />
            </button>
            <div className="relative">
              <button
                onClick={() => setShowDropdown(!showDropdown)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                title="More options"
              >
                <MoreVertical className="w-4 h-4 text-gray-600" />
              </button>
              
              {showDropdown && (
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                  <button
                    onClick={() => {
                      onMarkAsRead(message._id);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Mark as read
                  </button>
                  <button
                    onClick={() => {
                      onMarkAsUnread(message._id);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  >
                    Mark as unread
                  </button>
                  <button
                    onClick={() => {
                      onDelete(message._id);
                      setShowDropdown(false);
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Message Metadata */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="w-5 h-5 text-gray-600" />
              </div>
              <div>
                <div className="font-medium text-gray-900">
                  {message.type === "broadcast" ? "Admin" : "Unknown Sender"}
                </div>
                <div className="text-sm text-gray-500">{message.sender?.email || 'No email'}</div>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}</span>
            </div>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
              message.type === "broadcast" ? "bg-blue-100 text-blue-800" :
              message.type === "personal" ? "bg-green-100 text-green-800" :
              message.type === "system" ? "bg-gray-100 text-gray-800" :
              "bg-purple-100 text-purple-800"
            }`}>
              {message.type}
            </span>
            {message.isImportant && (
              <span className="px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Important
              </span>
            )}
          </div>
        </div>

        {/* Collapsible Message Details */}
        <div className="border-t border-gray-100 mt-4 pt-4">
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-900 transition-colors"
          >
            {showDetails ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
            <span>Message Details</span>
          </button>
          
          {showDetails && (
            <div className="mt-4 space-y-4 bg-gray-50 p-4 rounded-lg">
              {/* Message Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Message Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Status:</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      message.status === "read" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                    }`}>
                      {message.status}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Starred:</span>
                    <span className={message.isStarred ? "text-yellow-500" : "text-gray-400"}>
                      {message.isStarred ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Important:</span>
                    <span className={message.isImportant ? "text-yellow-500" : "text-gray-400"}>
                      {message.isImportant ? "Yes" : "No"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timestamp Info */}
              <div>
                <h4 className="text-sm font-semibold text-gray-900 mb-2">Timestamp Information</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Received:</span>
                    <span className="text-gray-900 text-xs">
                      {new Date(message.createdAt).toLocaleString()}
                    </span>
                  </div>
                  {message.readAt && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Read at:</span>
                      <span className="text-gray-900 text-xs">
                        {new Date(message.readAt).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Attachments */}
              {message.attachments && message.attachments.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Attachments</h4>
                  <div className="space-y-2">
                    {message.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-white rounded border border-gray-200">
                        <span className="text-xs text-gray-700 truncate flex-1">{attachment.filename}</span>
                        <span className="text-xs text-gray-500 ml-2">
                          {(attachment.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Thread Info */}
              {message.threadMessages && message.threadMessages.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold text-gray-900 mb-2">Thread Information</h4>
                  <div className="text-sm text-gray-600">
                    {message.threadMessages.length} replies in this conversation
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Message Content */}
      <div className="flex-1 overflow-y-auto p-6">
        <div className="max-w-3xl mx-auto">
          {/* Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Attachments</h3>
              <div className="space-y-2">
                {message.attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3">
                      <Paperclip className="w-4 h-4 text-gray-400" />
                      <div>
                        <div className="text-sm font-medium text-gray-900">{attachment.filename}</div>
                        <div className="text-xs text-gray-500">{formatFileSize(attachment.size)}</div>
                      </div>
                    </div>
                    <button
                      onClick={() => window.open(attachment.url, '_blank')}
                      className="text-sm text-blue-600 hover:text-blue-800"
                    >
                      Download
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Message Body */}
          <div className="prose max-w-none">
            <div className="whitespace-pre-wrap text-gray-800 leading-relaxed">
              {message.content}
            </div>
          </div>

          {/* Thread Messages */}
          {message.threadMessages && message.threadMessages.length > 0 && (
            <div className="mt-8 border-t border-gray-200 pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Conversation History</h3>
              <div className="space-y-4">
                {message.threadMessages.map((threadMessage) => (
                  <div key={threadMessage._id} className="border-l-2 border-gray-200 pl-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                          <User className="w-3 h-3 text-gray-600" />
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {threadMessage.type === "broadcast" ? "Admin" : "Unknown Sender"}
                        </span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(threadMessage.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <div className="text-sm text-gray-700 whitespace-pre-wrap">
                      {threadMessage.content}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Quick Reply */}
      {/* <div className="border-t border-gray-200 p-4">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => onReply(message)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <Reply className="w-4 h-4" />
            <span>Reply</span>
          </button>
          <button
            onClick={() => onForward(message)}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors flex items-center space-x-2"
          >
            <Forward className="w-4 h-4" />
            <span>Forward</span>
          </button>
        </div>
      </div> */}
    </div>
  );
}
