"use client";
import { useState } from "react";
import { X } from "lucide-react";

interface Recipient {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  membershipType: string;
}

interface MessageComposeProps {
  recipients: Recipient[];
  onClose: () => void;
  onSend: (message: {
    recipients: string[];
    subject: string;
    content: string;
    type: "personal";
  }) => void;
  isReplying?: boolean;
  replyToMessage?: {
    subject: string;
    recipientName: string;
  };
}

export default function MessageCompose({
  recipients,
  onClose,
  onSend,
  isReplying = false,
  replyToMessage
}: MessageComposeProps) {
  // Initialize all state first
  const [selectedRecipients] = useState<string[]>([]);
  const [searchQuery] = useState("");
  const [isSending, setIsSending] = useState(false);
  
  // Initialize dependent state after basic state
  const [subject, setSubject] = useState(() => {
    if (isReplying && replyToMessage?.subject) {
      return `Re: ${replyToMessage.subject.replace(/^Re:\s*/i, '')}`;
    }
    return "";
  });
  
  const [content, setContent] = useState(() => {
    if (isReplying && replyToMessage) {
      return `\n\n---\nOn ${new Date().toLocaleDateString()}, ${replyToMessage.recipientName} wrote:`;
    }
    return "";
  });

  // const handleRecipientToggle = (recipientId: string) => {
  //   setSelectedRecipients(prev =>
  //     prev.includes(recipientId)
  //       ? prev.filter(id => id !== recipientId)
  //       : [...prev, recipientId]
  //   );
  // };

  const handleSend = async () => {
    if (selectedRecipients.length === 0 || !subject.trim() || !content.trim()) {
      return;
    }

    setIsSending(true);
    try {
      await onSend({
        recipients: selectedRecipients,
        subject: subject.trim(),
        content: content.trim(),
        type: "personal"
      });
      onClose();
    } catch (error) {
      console.error("Failed to send message:", error);
    } finally {
      setIsSending(false);
    }
  };

  // Simple filtered recipients with safe access
  const filteredRecipients = [];
  if (Array.isArray(recipients)) {
    for (const recipient of recipients) {
      if (recipient && typeof recipient === 'object') {
        const firstName = recipient.firstName || '';
        const lastName = recipient.lastName || '';
        const email = recipient.email || '';
        const query = searchQuery || '';
        
        if (firstName.toLowerCase().includes(query.toLowerCase()) ||
            lastName.toLowerCase().includes(query.toLowerCase()) ||
            email.toLowerCase().includes(query.toLowerCase())) {
          filteredRecipients.push(recipient);
        }
      }
    }
  }

  return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">
              {isReplying ? "Reply to Message" : "New Message"}
            </h2>
            <button
              onClick={onClose}
              className="p-1 hover:bg-gray-100 rounded-full transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>

          {/* Subject */}
          <div className="p-4 border-b border-gray-200">
            <input
              type="text"
              placeholder="Subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Message Content */}
          <div className="flex-1 p-4">
            <textarea
              placeholder="Write your message..."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="w-full h-64 p-3 border border-gray-300 rounded-lg resize-none focus:outline-none"
            />
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between p-4 border-t border-gray-200">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSend}
              disabled={isSending || !subject.trim() || !content.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSending ? "Sending..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    );
}
