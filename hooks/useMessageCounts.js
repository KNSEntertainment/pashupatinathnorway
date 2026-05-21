"use client";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";

export function useMessageCounts() {
  const { data: session } = useSession();
  const [counts, setCounts] = useState({
    unread: 0,
    total: 0,
    loading: true
  });

  const fetchMessageCounts = async () => {
    try {
      const response = await fetch("/api/messages");
      if (response.ok) {
        const data = await response.json();
        setCounts({
          unread: data.unreadCount || 0,
          total: data.messages?.length || 0,
          loading: false
        });
      } else {
        console.error("Failed to fetch message counts");
        setCounts(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error("Error fetching message counts:", error);
      setCounts(prev => ({ ...prev, loading: false }));
    }
  };

  useEffect(() => {
    if (!session) return;

    fetchMessageCounts();

    // Listen for message status changes
    const handleMessageStatusChange = () => {
      fetchMessageCounts();
    };

    // Add event listener for custom message status change event
    window.addEventListener('messageStatusChanged', handleMessageStatusChange);

    return () => {
      window.removeEventListener('messageStatusChanged', handleMessageStatusChange);
    };
  }, [session]);

  return counts;
}
