"use client";

import { useMembershipData } from "@/hooks/useMembershipData";
import ExecutiveFinancialSummary from "@/components/executive/ExecutiveFinancialSummary";
import { Shield, AlertCircle } from "lucide-react";

export default function FinancialsPage() {
  const { isExecutive, loading } = useMembershipData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isExecutive) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <div className="flex items-center justify-center mb-4">
            <Shield className="text-red-500" size={48} />
          </div>
          <h1 className="text-2xl font-bold text-center text-gray-800 mb-4">
            Access Restricted
          </h1>
          <p className="text-gray-600 text-center mb-6">
            This page is only accessible to Executive members. If you believe this is an error, please contact the administrator.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="text-blue-500 mt-0.5" size={20} />
              <div className="text-sm text-blue-800">
                <p className="font-semibold mb-1">Executive Membership Required</p>
                <p>Only members with Executive membership type can access financial summaries and reports.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <ExecutiveFinancialSummary />;
}
