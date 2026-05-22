"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Membership } from "@/types";

export function useMembershipData() {
  const { data: session, status } = useSession();
  const [membershipData, setMembershipData] = useState<Membership | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "unauthenticated") {
      setLoading(false);
      return;
    }

    if (session?.user?.email) {
      fetch(`/api/membership?email=${encodeURIComponent(session.user.email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            setMembershipData(data[0]);
          }
          setLoading(false);
        })
        .catch(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [status, session?.user?.email]);

  return { membershipData, loading, isExecutive: membershipData?.membershipType === "Executive" };
}
