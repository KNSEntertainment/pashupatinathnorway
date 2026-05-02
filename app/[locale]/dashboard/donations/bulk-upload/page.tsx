"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Download, FileText, CheckCircle, AlertCircle, UploadCloud } from "lucide-react";
import { useRouter } from "next/navigation";

export default function BulkUploadDonations() {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<{
    success: boolean;
    message?: string;
    error?: string;
    validationErrors?: Array<{ row: number; errors: string[] }>;
    totalRows?: number;
    validRows?: number;
    insertedRows?: number;
    skippedRows?: number;
  } | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // Generate CSV template
  const downloadTemplate = () => {
    const csvContent = `donorName,donorEmail,donorPhone,amount,currency,message,address,isAnonymous,paymentStatus,personalNumber
John Doe,john.doe@example.com,12345678,1000,NOK,Donation for temple construction,123 Main St,true,completed,12345678901
Jane Smith,jane.smith@example.com,98765432,500,NOK,General donation,456 Oak Ave,false,pending,98765432109
Anonymous User,anonymous@temple.no,,250,NOK,Anonymous donation,,true,completed,`;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'donations-template.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleFileSelect = (selectedFile: File) => {
    if (selectedFile && selectedFile.type === 'text/csv') {
      setFile(selectedFile);
      setUploadResult(null);
    } else {
      alert('Please select a valid CSV file');
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const handleUpload = async () => {
    if (!file) {
      alert('Please select a file to upload');
      return;
    }

    setUploading(true);
    setUploadResult(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/donations/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        setUploadResult({
          success: true,
          message: result.message,
          totalRows: result.totalRows,
          validRows: result.validRows,
          insertedRows: result.insertedRows,
          skippedRows: result.skippedRows,
        });
      } else {
        setUploadResult({
          success: false,
          error: result.error,
          validationErrors: result.validationErrors,
        });
      }
    } catch {
      setUploadResult({
        success: false,
        error: 'Upload failed. Please try again.',
      });
    } finally {
      setUploading(false);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setUploadResult(null);
    const fileInput = document.getElementById('file-input') as HTMLInputElement;
    if (fileInput) fileInput.value = '';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => router.back()}
            className="mb-4"
          >
            ← Back to Donations
          </Button>
          
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bulk Upload Donations</h1>
          <p className="text-gray-600 mb-8">
            Upload multiple donation records at once using a CSV file. Follow the template format for best results.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Step 1: Download Template */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="w-5 h-5" />
                Step 1: Download Template
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Template Instructions</h3>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• Download the CSV template below</li>
                  <li>• Fill in your donation data</li>
                  <li>• Required fields: donorName, donorEmail, amount, paymentStatus</li>
                  <li>• Personal number must be exactly 11 digits if provided</li>
                  <li>• Amount must be a positive number</li>
                  <li>• isAnonymous should be true/false</li>
                </ul>
              </div>
              
              <Button
                onClick={downloadTemplate}
                className="w-full"
                variant="outline"
              >
                <Download className="w-4 h-4 mr-2" />
                Download CSV Template
              </Button>
            </CardContent>
          </Card>

          {/* Step 2: Upload File */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UploadCloud className="w-5 h-5" />
                Step 2: Upload File
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                  dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600 mb-4">
                  Drag and drop your CSV file here, or click to browse
                </p>
                <input
                  id="file-input"
                  type="file"
                  accept=".csv"
                  onChange={(e) => e.target.files && handleFileSelect(e.target.files[0])}
                  className="hidden"
                />
                <Button
                  onClick={() => document.getElementById('file-input')?.click()}
                  variant="outline"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Select CSV File
                </Button>
              </div>

              {file && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-green-900">
                      Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <Button
                  onClick={handleUpload}
                  disabled={!file || uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    <>
                      <div className="w-4 h-4 mr-2 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Donations
                    </>
                  )}
                </Button>
                
                {file && (
                  <Button
                    onClick={resetUpload}
                    variant="outline"
                  >
                    Clear
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Upload Results */}
        {uploadResult && (
          <Card className={`mt-8 ${
            uploadResult.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
          }`}>
            <CardHeader>
              <CardTitle className={`flex items-center gap-2 ${
                uploadResult.success ? 'text-green-900' : 'text-red-900'
              }`}>
                {uploadResult.success ? (
                  <CheckCircle className="w-5 h-5" />
                ) : (
                  <AlertCircle className="w-5 h-5" />
                )}
                Upload Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              {uploadResult.success ? (
                <div className="space-y-2">
                  <p className="font-medium text-green-900">{uploadResult.message}</p>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div className="text-center">
                      <p className="text-gray-600">Total Rows</p>
                      <p className="font-bold text-lg">{uploadResult.totalRows}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Valid Rows</p>
                      <p className="font-bold text-lg text-green-600">{uploadResult.validRows}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Inserted</p>
                      <p className="font-bold text-lg text-blue-600">{uploadResult.insertedRows}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-gray-600">Skipped</p>
                      <p className="font-bold text-lg text-red-600">{uploadResult.skippedRows}</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="font-medium text-red-900">{uploadResult.error}</p>
                  {uploadResult.validationErrors && uploadResult.validationErrors.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-semibold text-red-900 mb-2">Validation Errors:</h4>
                      <div className="max-h-60 overflow-y-auto space-y-1">
                        {uploadResult.validationErrors.map((error: { row: number; errors: string[] }, index: number) => (
                          <div key={index} className="text-sm bg-red-100 p-2 rounded">
                            <span className="font-medium">Row {error.row}:</span> {error.errors.join(', ')}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
