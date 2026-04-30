"use client";

import { useState } from "react";
import { QrCode, CheckCircle, XCircle, Loader2, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface VerificationResult {
  valid: boolean;
  member?: {
    memberId: string;
    membershipNumber: string;
    fullName: string;
    email: string;
    phone?: string;
    city?: string;
    membershipStatus: string;
    issuedDate: string;
    expiryDate: string;
    photoUrl?: string;
  };
  organization?: {
    name: string;
    location: string;
    contact: string;
  };
  timestamp: string;
  checks?: {
    isActive: boolean;
    isExpired: boolean;
    status: string;
  };
  error?: string;
}

export default function VerifyPage() {
  
  const [personalNumber, setPersonalNumber] = useState("");
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [scannedData, setScannedData] = useState("");

  const handleManualVerify = async () => {
    if (!personalNumber.trim()) {
      setError("Please enter a personal number");
      return;
    }

    setIsLoading(true);
    setError("");
    setVerificationResult(null);

    try {
      const response = await fetch(`/api/verify/${personalNumber.trim()}`);
      const data = await response.json();
      
      if (response.ok) {
        setVerificationResult(data);
      } else {
        setVerificationResult(data);
        setError(data.error || "Verification failed");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleQRScan = (qrData: string) => {
    try {
      // Try to parse as JSON first
      const parsed = JSON.parse(qrData);
      
      if (parsed.type === "member_card" && parsed.personalNumber) {
        setScannedData(qrData);
        setPersonalNumber(parsed.personalNumber);
        // Auto-verify after scanning
        setTimeout(() => handleManualVerify(), 500);
      } else {
        setError("Invalid QR code format");
      }
    } catch {
      // If not JSON, check if it's a personal number (11 digits)
      if (qrData.match(/^\d{11}$/)) {
        setPersonalNumber(qrData);
        setTimeout(() => handleManualVerify(), 500);
      } else {
        setError("Invalid QR code format");
      }
    }
  };

  // Simulate QR scan (in production, you'd integrate with a QR scanner library)
  const simulateQRScan = () => {
    // For testing, you can paste QR data here
    const testQRData = prompt("Paste QR code data for testing:");
    if (testQRData) {
      handleQRScan(testQRData);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Member Verification</h1>
        <p className="text-gray-600">Scan QR code or enter personal number to verify</p>
      </div>

      {/* QR Scanner Section */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <QrCode className="w-5 h-5 mr-2" />
            QR Code Scanner
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <QrCode className="w-16 h-16 mx-auto text-gray-400 mb-4" />
              <p className="text-gray-600 mb-4">QR scanner integration coming soon</p>
              <Button onClick={simulateQRScan} variant="outline">
                Test with QR Data
              </Button>
            </div>
            
            {scannedData && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  QR Data: {scannedData.substring(0, 100)}...
                </AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Manual Verification Section */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <label htmlFor="personalNumber" className="block text-sm font-medium text-gray-700 mb-2">
                Personal Number
              </label>
              <input
                id="personalNumber"
                type="text"
                value={personalNumber}
                onChange={(e) => setPersonalNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="Enter 11-digit personal number (e.g., 19028725542)"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={11}
              />
            </div>
            
            <Button 
              onClick={handleManualVerify} 
              disabled={isLoading || personalNumber.trim().length !== 11}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Verifying...
                </>
              ) : (
                "Verify Member"
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">{error}</AlertDescription>
        </Alert>
      )}

      {/* Verification Result */}
      {verificationResult && (
        <Card className={verificationResult.valid ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}>
          <CardHeader>
            <CardTitle className="flex items-center">
              {verificationResult.valid ? (
                <>
                  <CheckCircle className="w-5 h-5 mr-2 text-green-600" />
                  Verification Successful
                </>
              ) : (
                <>
                  <XCircle className="w-5 h-5 mr-2 text-red-600" />
                  Verification Failed
                </>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {verificationResult.valid && verificationResult.member ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Name</p>
                    <p className="font-semibold">{verificationResult.member.fullName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Membership Number</p>
                    <p className="font-semibold">{verificationResult.member.membershipNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Email</p>
                    <p className="font-semibold">{verificationResult.member.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Phone</p>
                    <p className="font-semibold">{verificationResult.member.phone || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">City</p>
                    <p className="font-semibold">{verificationResult.member.city || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Status</p>
                    <p className="font-semibold capitalize">{verificationResult.member.membershipStatus}</p>
                  </div>
                </div>
                
                <div className="border-t pt-4">
                  <p className="text-sm text-gray-600">Organization</p>
                  <p className="font-semibold">{verificationResult.organization?.name}</p>
                  <p className="text-sm text-gray-600">{verificationResult.organization?.location}</p>
                </div>

                <div className="text-xs text-gray-500 text-right">
                  Verified: {new Date(verificationResult.timestamp).toLocaleString()}
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-red-800 font-semibold">
                  {verificationResult.error || "Invalid membership"}
                </p>
                {verificationResult.checks && (
                  <div className="text-sm text-gray-600">
                    <p>Status: {verificationResult.checks.status}</p>
                    <p>Active: {verificationResult.checks.isActive ? "Yes" : "No"}</p>
                    <p>Expired: {verificationResult.checks.isExpired ? "Yes" : "No"}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
