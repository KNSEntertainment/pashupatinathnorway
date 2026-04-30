"use client";

import { useState, useRef, useEffect } from "react";
import { Camera, CheckCircle, AlertCircle, Users, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import QrScanner from "qr-scanner";

interface MemberData {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  membershipType: string;
  personalNumber?: string;
  membershipStatus: string;
  createdAt: string;
}

interface AttendanceScannerProps {
  eventId: string;
  eventName: string;
  onAttendanceMarked?: (memberData: unknown) => void;
  foundMember?: MemberData | null;
}

export default function AttendanceScanner({ eventId, eventName, onAttendanceMarked, foundMember }: AttendanceScannerProps) {
  const [isScanning, setIsScanning] = useState(false);
  const [lastScanned, setLastScanned] = useState<{member?: {fullName?: string, email?: string}, attendance?: {checkInTime?: string}} | null>(null);
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // If member is found via search, auto-fill their data
  useEffect(() => {
    if (foundMember) {
      setSuccess(`${foundMember.fullName} is ready for check-in`);
    }
  }, [foundMember]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setError("");
    setSuccess("");

    try {
      // Use qr-scanner to process image
      const qrData = await QrScanner.scanImage(file);
      
      if (qrData) {
        await processQRData(qrData);
      } else {
        setError("No QR code found in the image");
      }
    } catch (error) {
      console.error("Error processing QR code:", error);
      setError("Failed to process QR code. Please ensure the image contains a valid QR code.");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const processQRData = async (qrData: string) => {
    try {
      // Validate QR data is not empty or just whitespace
      if (!qrData || qrData.trim() === '') {
        setError("Empty QR code data. Please scan a valid member ID card.");
        return;
      }

      // Clean up potential extra data or formatting issues
      const cleanData = qrData.trim();
      
      // Remove any potential URL prefixes or extra text
      if (cleanData.startsWith('http')) {
        // If it's a URL, we can't process it as member data
        setError("Invalid QR code format. Please scan member ID card QR code, not a URL.");
        return;
      }

      let parsedData;
      try {
        parsedData = JSON.parse(cleanData);
      } catch (parseError) {
        console.error("JSON Parse Error:", parseError, "Data:", cleanData);
        setError("Invalid QR code format. Please ensure you're scanning a valid member ID card.");
        return;
      }
      
      // Validate the parsed data structure
      if (!parsedData || typeof parsedData !== 'object') {
        setError("Invalid QR code data structure.");
        return;
      }

      if (parsedData.type !== "member_card") {
        setError("Invalid QR code. Please scan a member ID card.");
        return;
      }

      // Validate required fields
      if (!parsedData.personalNumber) {
        setError("QR code missing required member information.");
        return;
      }

      // Mark attendance via API
      const response = await fetch(`/api/verify/${parsedData.personalNumber}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: eventId,
          markedBy: "attendance-scanner", // In real app, this would be the logged-in user ID
          notes: `Scanned at ${eventName}`
        }),
      });

      const result = await response.json();

      if (response.ok) {
        setSuccess(`Attendance marked for ${result.member?.fullName}`);
        setLastScanned(result);
        if (onAttendanceMarked) {
          onAttendanceMarked(result);
        }
      } else {
        if (response.status === 409) {
          setError(`Attendance already marked for this member at ${new Date(result.checkInTime).toLocaleTimeString()}`);
        } else {
          setError(result.error || "Failed to mark attendance");
        }
      }
    } catch (error) {
      console.error("Error processing QR data:", error);
      setError("Invalid QR code format");
    }
  };

  
  const startCameraScan = async () => {
    setIsScanning(true);
    setError("");
    
    try {
      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      // Create video element for camera stream
      const videoElement = document.createElement('video');
      videoElement.srcObject = stream;
      videoElement.play();
      
      // Wait for video to be ready
      await new Promise((resolve) => {
        videoElement.onloadedmetadata = resolve;
      });
      
      // Initialize QR Scanner
      const qrScanner = new QrScanner(
        videoElement,
        result => {
          // Stop scanning and cleanup
          qrScanner.stop();
          stream.getTracks().forEach(track => track.stop());
          setIsScanning(false);
          
          // Process the QR code result
          processQRData(result.data);
        },
        {
          highlightScanRegion: true,
          highlightCodeOutline: true,
        }
      );
      
      await qrScanner.start();
      
    } catch (error) {
      console.error("Camera scanning error:", error);
      setError("Camera access denied or not available. Please use file upload instead.");
      setIsScanning(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="text-center space-y-6">
        {/* Scanner Header */}
        <div className="flex items-center justify-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full flex items-center justify-center">
            <Users className="w-6 h-6 text-white" />
          </div>
          <div className="text-left">
            <h3 className="text-xl font-bold text-gray-900">QR Scanner</h3>
            <p className="text-sm text-gray-600">Mark attendance for {eventName}</p>
          </div>
        </div>

          {/* Error and Success Messages */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {success && (
          <Alert className="border-green-200 bg-green-50">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-700">
              {success}
            </AlertDescription>
          </Alert>
        )}

        {/* Scanner Actions */}
        <div className="space-y-4">
          <Button
            onClick={startCameraScan}
            disabled={isScanning}
            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg h-12 text-base font-medium"
          >
            <Camera className="w-5 h-5 mr-2" />
            {isScanning ? "📷 Scanning..." : "📷 Scan with Camera"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-white px-3 text-gray-500 font-medium">OR</span>
            </div>
          </div>

          <Button
            onClick={() => fileInputRef.current?.click()}
            variant="outline"
            className="w-full h-12 text-base font-medium border-2 border-gray-300 hover:border-blue-500 hover:bg-blue-50"
          >
            <Upload className="w-5 h-5 mr-2" />
            📁 Upload QR Code Image
          </Button>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>

        
        {/* Last Scanned Result */}
        {lastScanned && (
          <div className="mt-6 p-4 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl">
            <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
              <CheckCircle className="w-5 h-5" />
              Last Successful Scan
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Name:</span>
                <span className="font-medium text-gray-900">{lastScanned.member?.fullName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Email:</span>
                <span className="font-medium text-gray-900 text-xs">{lastScanned.member?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Time:</span>
                <span className="font-medium text-gray-900 text-xs">
                  {lastScanned.attendance?.checkInTime ? new Date(lastScanned.attendance.checkInTime).toLocaleTimeString() : 'N/A'}
                </span>
              </div>
              <div className="mt-3 pt-3 border-t border-green-200">
                <Badge className="bg-green-600 text-white hover:bg-green-700">
                  ✓ Successfully Checked In
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
