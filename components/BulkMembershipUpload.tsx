"use client";
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Download, CheckCircle, XCircle, AlertCircle, Search, Mail, CheckSquare, FileDown } from "lucide-react";

interface UploadResult {
  success: number;
  failed: number;
  errors: string[];
  processedMembers: Array<{
    firstName: string;
    lastName: string;
    email: string;
  }>;
}

interface VerificationResult {
  totalMembers: number;
  verifiedMembers: number;
  unverifiedMembers: number;
  verifiedList: Array<{
    firstName: string;
    lastName: string;
    personalNumber: string;
    email: string;
  }>;
  unverifiedList: Array<{
    firstName: string;
    lastName: string;
    personalNumber: string;
    email: string;
  }>;
}

export default function BulkMembershipUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  // Verification states
  const [verificationFile, setVerificationFile] = useState<File | null>(null);
  const [verifying, setVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);
  const [verificationError, setVerificationError] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setError(null);
      setResult(null);
    } else {
      setError('Please select a CSV file');
      setFile(null);
    }
  };

  const handleVerificationFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'text/csv') {
      setVerificationFile(selectedFile);
      setVerificationError(null);
      setVerificationResult(null);
    } else {
      setVerificationError('Please select a CSV file');
      setVerificationFile(null);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const response = await fetch('/api/membership/template');
      if (!response.ok) {
        throw new Error('Failed to download template');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'membership-template.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch {
      setError('Failed to download template');
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select a file first');
      return;
    }

    setUploading(true);
    setError(null);
    setResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/membership/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setResult(data.results);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleCrosscheckVerification = async () => {
    if (!verificationFile) {
      setVerificationError('Please select a verification file first');
      return;
    }

    setVerifying(true);
    setVerificationError(null);
    setVerificationResult(null);

    try {
      const formData = new FormData();
      formData.append('file', verificationFile);

      const response = await fetch('/api/membership/verification-crosscheck', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setVerificationResult(data.results);
    } catch (err) {
      setVerificationError(err instanceof Error ? err.message : 'Verification failed');
    } finally {
      setVerifying(false);
    }
  };

  const handleUpdateVerifiedStatus = async () => {
    if (!verificationResult) {
      setVerificationError('Please run crosscheck verification first');
      return;
    }

    try {
      const verifiedPersonalNumbers = verificationResult.verifiedList.map(member => member.personalNumber);
      
      const response = await fetch('/api/membership/update-verified-status', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ verifiedPersonalNumbers }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Status update failed');
      }

      // Show success message
      alert(`Success! ${data.results.message}`);
      
      // Refresh verification results
      await handleCrosscheckVerification();
    } catch (err) {
      setVerificationError(err instanceof Error ? err.message : 'Status update failed');
    }
  };

  const handleSendBulkEmails = async () => {
    if (!verificationResult) {
      setVerificationError('Please run crosscheck verification first');
      return;
    }

    if (!confirm(`Are you sure you want to send follow-up emails to ${verificationResult.unverifiedList.length} unverified members?`)) {
      return;
    }

    try {
      const unverifiedPersonalNumbers = verificationResult.unverifiedList.map(member => member.personalNumber);
      
      const response = await fetch('/api/membership/send-verification-followup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ unverifiedPersonalNumbers }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Email sending failed');
      }

      // Show success message
      alert(`Success! ${data.results.message}`);
      
      // Refresh verification results
      await handleCrosscheckVerification();
    } catch (err) {
      setVerificationError(err instanceof Error ? err.message : 'Email sending failed');
    }
  };

  const handleExportUnverified = async () => {
    if (!verificationResult) {
      setVerificationError('Please run crosscheck verification first');
      return;
    }

    try {
      const unverifiedPersonalNumbers = verificationResult.unverifiedList.map(member => member.personalNumber);
      
      const response = await fetch('/api/membership/export-unverified', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ unverifiedPersonalNumbers }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Export failed');
      }

      // Download the CSV file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `unverified-members-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      setVerificationError(err instanceof Error ? err.message : 'Export failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bulk Upload Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Bulk Membership Upload
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
          {/* Download Template Section */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-2">Step 1: Download Template</h3>
            <p className="text-sm text-gray-600 mb-3">
              Download the CSV template to ensure your data has the correct format and headers.
            </p>
            <Button onClick={handleDownloadTemplate} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download CSV Template
            </Button>
          </div>

          {/* File Upload Section */}
          <div className="border rounded-lg p-4 bg-gray-50">
            <h3 className="font-semibold mb-2">Step 2: Upload Your CSV File</h3>
            <p className="text-sm text-gray-600 mb-3">
              Select the CSV file containing your membership data.
            </p>
            <input
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            />
            {file && (
              <div className="mt-2 text-sm text-green-600">
                Selected: {file.name}
              </div>
            )}
          </div>

          {/* Upload Button */}
          <Button 
            onClick={handleUpload} 
            disabled={!file || uploading}
            className="w-full"
          >
            {uploading ? 'Uploading...' : 'Upload Memberships'}
          </Button>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Results Display */}
          {result && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>
                  Upload completed! Success: {result.success}, Failed: {result.failed}
                </AlertDescription>
              </Alert>

              {result.processedMembers.length > 0 && (
                <div className="border rounded-lg p-4 bg-green-50">
                  <h4 className="font-semibold text-green-800 mb-2">
                    Successfully Added Members ({result.processedMembers.length})
                  </h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {result.processedMembers.map((member, index) => (
                      <div key={index} className="text-sm text-green-700">
                        {member.firstName} {member.lastName} - {member.email}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {result.errors.length > 0 && (
                <div className="border rounded-lg p-4 bg-red-50">
                  <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    Errors ({result.errors.length})
                  </h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {result.errors.map((error, index) => (
                      <div key={index} className="text-sm text-red-700">
                        {error}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          </CardContent>
        </Card>

        {/* Oslo Kommune Verification Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5" />
              Oslo Kommune Verification
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="border rounded-lg p-4 bg-blue-50">
              <h3 className="font-semibold mb-2">Crosscheck Personal Numbers</h3>
              <p className="text-sm text-gray-600 mb-3">
                Upload the verification file from Oslo kommune to identify members who were not approved.
              </p>
              <input
                type="file"
                accept=".csv"
                onChange={handleVerificationFileChange}
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
              />
              {verificationFile && (
                <div className="mt-2 text-sm text-green-600">
                  Selected: {verificationFile.name}
                </div>
              )}
            </div>

          <Button 
            onClick={handleCrosscheckVerification} 
            disabled={!verificationFile || verifying}
            className="w-full"
          >
            {verifying ? 'Crosschecking...' : 'Crosscheck Personal Numbers'}
          </Button>

          {/* Verification Error Display */}
          {verificationError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{verificationError}</AlertDescription>
            </Alert>
          )}

          {/* Verification Results Display */}
          {verificationResult && (
            <div className="space-y-4">
              <Alert>
                <Search className="h-4 w-4" />
                <AlertDescription>
                  Verification completed! Total: {verificationResult.totalMembers}, 
                  Verified: {verificationResult.verifiedMembers}, 
                  Unverified: {verificationResult.unverifiedMembers}
                </AlertDescription>
              </Alert>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3 p-4 bg-gray-50 border rounded-lg">
                {verificationResult.verifiedList.length > 0 && (
                  <Button 
                    onClick={handleUpdateVerifiedStatus}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700"
                  >
                    <CheckSquare className="h-4 w-4" />
                    Update {verificationResult.verifiedList.length} Verified to Approved
                  </Button>
                )}
                
                {verificationResult.unverifiedList.length > 0 && (
                  <>
                    <Button 
                      onClick={handleSendBulkEmails}
                      variant="outline"
                      className="flex items-center gap-2 border-orange-300 text-orange-700 hover:bg-orange-50"
                    >
                      <Mail className="h-4 w-4" />
                      Send Follow-up Emails ({verificationResult.unverifiedList.length})
                    </Button>
                    
                    <Button 
                      onClick={handleExportUnverified}
                      variant="outline"
                      className="flex items-center gap-2 border-blue-300 text-blue-700 hover:bg-blue-50"
                    >
                      <FileDown className="h-4 w-4" />
                      Export Unverified ({verificationResult.unverifiedList.length})
                    </Button>
                  </>
                )}
              </div>

              {/* Verified Members */}
              {verificationResult.verifiedList.length > 0 && (
                <div className="border rounded-lg p-4 bg-green-50">
                  <h4 className="font-semibold text-green-800 mb-2">
                    ✅ Verified by Oslo Kommune ({verificationResult.verifiedList.length})
                  </h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {verificationResult.verifiedList.map((member, index) => (
                      <div key={index} className="text-sm text-green-700">
                        {member.firstName} {member.lastName} - {member.personalNumber}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Unverified Members */}
              {verificationResult.unverifiedList.length > 0 && (
                <div className="border rounded-lg p-4 bg-red-50">
                  <h4 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
                    <XCircle className="h-4 w-4" />
                    ❌ Not Verified by Oslo Kommune ({verificationResult.unverifiedList.length})
                  </h4>
                  <div className="space-y-1 max-h-40 overflow-y-auto">
                    {verificationResult.unverifiedList.map((member, index) => (
                      <div key={index} className="text-sm text-red-700">
                        {member.firstName} {member.lastName} - {member.personalNumber}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
