"use client";

import { useState } from "react";
import { toast } from "react-hot-toast";
import { Search, User, Mail, AlertCircle, CheckCircle, Clock, XCircle } from "lucide-react";
import CustomCaptcha from "@/components/ui/custom-captcha";

interface MembershipData {
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
  phone?: string;
  address?: string;
  membershipId: string;
  membershipType: string;
  membershipStatus: string;
  createdAt: string;
}

export default function MembershipStatusPage() {
  const [email, setEmail] = useState("");
  const [personalNumber, setPersonalNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [membershipData, setMembershipData] = useState<MembershipData | null>(null);
  const [error, setError] = useState("");
  const [captchaVerified, setCaptchaVerified] = useState(false);

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !personalNumber) {
      setError("Please fill in both email and personal number");
      return;
    }

    if (!captchaVerified) {
      setError("Please complete the CAPTCHA verification");
      return;
    }

    setLoading(true);
    setError("");
    setMembershipData(null);

    try {
      const response = await fetch("/api/membership/lookup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          personalNumber: personalNumber.trim(),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to lookup membership status");
      }

      setMembershipData(data.membership);
      toast.success("Membership status found!");
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to lookup membership status";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "approved":
        return <CheckCircle className="text-green-500" size={24} />;
      case "pending":
        return <Clock className="text-yellow-500" size={24} />;
      case "rejected":
        return <XCircle className="text-red-500" size={24} />;
      default:
        return <AlertCircle className="text-gray-500" size={24} />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "approved":
        return "text-green-600 bg-green-50 border-green-200";
      case "pending":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "approved":
        return "approved";
      case "pending":
        return "pending";
      case "rejected":
        return "rejected";
      default:
        return "unknown";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <Search className="text-blue-600" size={32} />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Membership Status Lookup
          </h1>
          <p className="text-gray-600">
            Enter your email and personal number to check your membership status
          </p>
        </div>

        {/* Lookup Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <form onSubmit={handleLookup} className="space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="text-gray-400" size={20} />
                </div>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your email address"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="personalNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Personal Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="text-gray-400" size={20} />
                </div>
                <input
                  type="text"
                  id="personalNumber"
                  value={personalNumber}
                  onChange={(e) => setPersonalNumber(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter your personal number"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Security Verification
              </label>
              <CustomCaptcha
                onVerify={(isValid) => setCaptchaVerified(isValid)}
                error={!captchaVerified && error?.includes("CAPTCHA") ? error : ""}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <AlertCircle className="text-red-500" size={20} />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Looking up...
                </>
              ) : (
                <>
                  <Search size={20} />
                  Check Membership Status
                </>
              )}
            </button>
          </form>
        </div>

        {/* Results */}
        {membershipData && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className={`p-6 border-2 ${getStatusColor(membershipData.membershipStatus)}`}>
              <div className="flex items-start gap-4">
                {getStatusIcon(membershipData.membershipStatus)}
                <div className="flex-1">
                  <div className="space-y-3">
                    <div>
                      <p className="text-lg font-medium">
                        Dear {membershipData.firstName}, your membership status is {getStatusText(membershipData.membershipStatus)}.
                      </p>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div className="bg-white bg-opacity-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Membership ID</p>
                        <p className="text-lg font-semibold mt-1">{membershipData.membershipId}</p>
                      </div>
                      <div className="bg-white bg-opacity-50 rounded-lg p-3">
                        <p className="text-xs font-medium text-gray-600 uppercase tracking-wide">Membership Type</p>
                        <p className="text-lg font-semibold capitalize mt-1">
                          {membershipData.membershipType || "Standard"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
