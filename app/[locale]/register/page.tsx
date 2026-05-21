"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import EventRegistrationFlow from "@/components/EventRegistrationFlow";
import { toast } from "react-hot-toast";
import QRCode from "qrcode";
import Image from "next/image";

interface RegistrationData {
  _id?: string;
  registrationId?: string;
  eventId: string | { _id: string; eventname: string };
  name: string;
  email: string;
  attendeeCount: number;
  registrationType: string;
  paymentAmount?: number;
}

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const eventId = searchParams.get("eventId");
  const [isCompleted, setIsCompleted] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);
  const [qrCodeUrl, setQrCodeUrl] = useState("");

  // Generate QR code when registration is completed
  useEffect(() => {
    if (isCompleted && registrationData) {
      generateQRCode();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isCompleted, registrationData]);

  const generateQRCode = async () => {
    try {
      // Create QR code data with registration information
      const qrData = {
        registrationId: registrationData?.registrationId || (registrationData?._id ? `REG_${registrationData._id.toString().slice(-8)}` : 'N/A'),
        eventId: typeof registrationData?.eventId === 'object' ? registrationData.eventId?._id : registrationData?.eventId,
        eventName: typeof registrationData?.eventId === 'object' && registrationData.eventId?.eventname 
          ? registrationData.eventId.eventname 
          : 'Event',
        attendeeName: registrationData?.name || 'N/A',
        attendeeEmail: registrationData?.email || 'N/A',
        attendeeCount: registrationData?.attendeeCount || 1,
        registrationType: registrationData?.registrationType || 'guest',
        timestamp: new Date().toISOString()
      };

      // Convert to JSON string for QR code
      const qrString = JSON.stringify(qrData);
      
      // Generate QR code as data URL
      const qrCodeDataUrl = await QRCode.toDataURL(qrString, {
        width: 200,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      
      setQrCodeUrl(qrCodeDataUrl);
    } catch (error) {
      console.error("Error generating QR code:", error);
    }
  };

  const handleRegistrationComplete = (registration: RegistrationData) => {
    setRegistrationData(registration);
    setIsCompleted(true);
    toast.success("Registration completed successfully!");
  };

  const handleCancel = () => {
    // Redirect back to events page or previous page
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {isCompleted ? (
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Registration Successful!
            </h1>
            <p className="text-gray-600 mb-8">
              Thank you for registering for this event. We&apos;ve received your registration and will send you a confirmation email shortly.
            </p>
            
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Registration Details</h3>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Registration ID:</span>
                  <span className="font-medium">
                    {registrationData?.registrationId || 
                     (registrationData?._id ? `REG_${registrationData._id.toString().slice(-8)}` : 'N/A')}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Event:</span>
                  <span className="font-medium">
                    {typeof registrationData?.eventId === 'object' && registrationData.eventId?.eventname 
                      ? registrationData.eventId.eventname 
                      : 'Event'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Attendees:</span>
                  <span className="font-medium">{registrationData?.attendeeCount || 1}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Amount:</span>
                  <span className="font-medium">${registrationData?.paymentAmount || 0}</span>
                </div>
              </div>
            </div>

            {/* QR Code Section */}
            {qrCodeUrl && (
              <div className="bg-gray-50 rounded-lg p-6 mb-8 text-center">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Check-in QR Code</h3>
                  <span className="text-sm text-gray-600 mb-4">
                  Scan this QR code at the event venue for quick check-in
                </span>
                <div className="flex justify-center mb-4">
                  <div className="bg-white p-4 rounded-lg shadow-md">
                    <Image 
                      src={qrCodeUrl} 
                      alt="Registration QR Code" 
                      width={192}
                      height={192}
                      className="w-48 h-48"
                    />
                  </div>
                </div>
                <p className="text-xs text-gray-500">
                  Save this QR code or take a screenshot for easy access at the event
                </p>
              </div>
            )}
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.href = "/en/events"}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Browse More Events
              </button>
              <button
                onClick={() => window.location.href = "/en/dashboard"}
                className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">
                Event Registration
              </h1>
              <p className="text-gray-600">
                Complete your registration in a few simple steps
              </p>
            </div>
            
            {eventId ? (
              <EventRegistrationFlow 
                eventId={eventId} 
                onRegistrationComplete={handleRegistrationComplete}
                onCancel={handleCancel}
              />
            ) : (
              <div className="bg-white p-8 rounded-lg shadow text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">No Event Selected</h2>
                <p className="text-gray-600 mb-6">
                  Please select an event to register for, or use the registration link provided in the event details.
                </p>
                <button
                  onClick={() => window.location.href = "/en/events"}
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Events
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
