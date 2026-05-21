"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { 
  User, 
  Users, 
  Calendar, 
  CreditCard, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  UserPlus,
  UserCheck,
  ArrowLeft,
  ArrowRight,
  Heart,
  Target
} from "lucide-react";
import { toast } from "react-hot-toast";
import CustomCaptcha from "@/components/ui/custom-captcha";

interface Event {
  _id: string;
  eventname: string;
  eventdescription: string;
  eventvenue: string;
  eventdate: string;
  eventtime: string;
  memberPrice: number;
  guestPrice: number;
  allowGuestRegistration: boolean;
  registrationDeadline: string;
  maxAttendees: number;
}

interface Membership {
  _id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  membershipId: string;
  membershipStatus: string;
  familyMembers: Array<{
    firstName: string;
    lastName: string;
    relationship: string;
  }>;
}

interface RegistrationData {
  eventId: string;
  registrationType: "member" | "guest";
  userId?: string;
  membershipId?: string;
  attendeeCount: number;
  selectedFamilyMembers: Array<{
    name: string;
    relationship: string;
  }>;
  name: string;
  email: string;
  phone: string;
  address: string;
  donationAmount: number;
}

interface EventRegistrationFlowProps {
  eventId: string;
  onRegistrationComplete?: (registration: RegistrationData) => void;
  onCancel?: () => void;
}

export default function EventRegistrationFlow({ eventId, onRegistrationComplete, onCancel }: EventRegistrationFlowProps) {
  const { data: session, status: sessionStatus } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [event, setEvent] = useState<Event | null>(null);
  const [userMembership, setUserMembership] = useState<Membership | null>(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [captchaVerified, setCaptchaVerified] = useState(false);
  const [registrationData, setRegistrationData] = useState<RegistrationData>({
    eventId,
    registrationType: "guest",
    attendeeCount: 1,
    selectedFamilyMembers: [],
    name: "",
    email: "",
    phone: "",
    address: "",
    donationAmount: 0,
  });

  // Fetch event details
  const fetchEvent = useCallback(async () => {
    try {
      const response = await fetch(`/api/events/${eventId}`);
      if (!response.ok) throw new Error("Failed to fetch event");
      const data = await response.json();
      setEvent(data.event || data);
    } catch (error) {
      toast.error("Failed to load event details");
      console.error(error);
    }
  }, [eventId]);

  // Fetch user membership status
  const fetchUserMembership = useCallback(async () => {
    if (session?.user) {
      setIsLoggedIn(true);
      
      // Fetch membership details
      try {
        const membershipResponse = await fetch("/api/membership/current-user");
        if (membershipResponse.ok) {
          const result = await membershipResponse.json();
          const membershipData = result.membership;
          setUserMembership(membershipData);
          
          // Pre-fill registration data for members
          if (membershipData?.membershipStatus === "approved") {
            setRegistrationData(prev => ({
              ...prev,
              registrationType: "member",
              membershipId: membershipData.personalNumber, // Use personalNumber as membershipId
              name: `${membershipData.firstName} ${membershipData.lastName}`.trim(),
              email: membershipData.email,
              phone: membershipData.phone,
              address: membershipData.address || "",
            }));
          }
        }
      } catch (error) {
        console.error("Failed to fetch membership data:", error);
      }
    } else {
      setIsLoggedIn(false);
      setUserMembership(null);
    }
    
    // Stop initial loading after session is determined
    setInitialLoading(false);
  }, [session]);

  useEffect(() => {
    fetchEvent();
    fetchUserMembership();
  }, [fetchEvent, fetchUserMembership]);

  // Auto-skip step 1 for logged-in members
  useEffect(() => {
    if (isLoggedIn && userMembership?.membershipStatus === "approved" && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [isLoggedIn, userMembership, currentStep]);

  const calculatePricing = () => {
    if (!event) return { basePrice: 0, paymentAmount: 0, totalPayment: 0 };
    
    const basePrice = registrationData.registrationType === "member" 
      ? event.memberPrice 
      : event.guestPrice;
    
    const paymentAmount = basePrice * registrationData.attendeeCount;
    const totalPayment = paymentAmount + registrationData.donationAmount;
    
    return { basePrice, paymentAmount, totalPayment };
  };

  const validateRegistration = () => {
    if (!event) return false;
    
    // Check registration deadline
    if (event.registrationDeadline && new Date() > new Date(event.registrationDeadline)) {
      toast.error("Registration deadline has passed");
      return false;
    }
    
    // Check if guest registration is allowed
    if (registrationData.registrationType === "guest" && !event.allowGuestRegistration) {
      toast.error("Guest registration is not allowed for this event");
      return false;
    }
    
    // Validate member status
    if (registrationData.registrationType === "member") {
      if (!userMembership || userMembership.membershipStatus !== "approved") {
        toast.error("Your membership is not active. Please continue as guest or contact support.");
        return false;
      }
    }
    
    return true;
  };

  const handleSubmitRegistration = async () => {
    if (!validateRegistration()) return;
    
    setLoading(true);
    try {
      const response = await fetch("/api/event-registration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(registrationData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to register");
      }
      
      const registration = await response.json();
      toast.success("Registration successful!");
      onRegistrationComplete?.(registration);
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : "Failed to complete registration";
      toast.error(errorMessage);
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const renderStepIndicator = () => {
    const steps = [
      { number: 1, title: "Registration Type", icon: Users },
      { number: 2, title: "Personal Info", icon: User },
      { number: 3, title: "Attendees", icon: UserPlus },
      { number: 4, title: "Donation", icon: Heart },
      { number: 5, title: "Review & Pay", icon: CreditCard },
    ];
    
    return (
      <div className="flex justify-between items-center mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 ${
              currentStep >= step.number 
                ? "border-blue-500 bg-blue-500 text-white" 
                : "border-gray-300 text-gray-500"
            }`}>
              {currentStep > step.number ? (
                <CheckCircle size={20} />
              ) : (
                React.createElement(step.icon, { size: 20 })
              )}
            </div>
            <span className={`ml-2 text-sm font-medium ${
              currentStep >= step.number ? "text-blue-600" : "text-gray-500"
            }`}>
              {step.title}
            </span>
            {index < steps.length - 1 && (
              <div className={`flex-1 h-0.5 mx-4 ${
                currentStep > step.number ? "bg-blue-500" : "bg-gray-300"
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Choose Registration Type</h2>
      
      {isLoggedIn ? (
        <div className="space-y-4">
          {userMembership?.membershipStatus === "approved" ? (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <UserCheck className="text-green-500" size={24} />
                <div>
                  <h3 className="font-semibold text-green-800">Fast Member Registration</h3>
                  <p className="text-green-600">Your membership is active. Register quickly with pre-filled information.</p>
                </div>
              </div>
              <button
                onClick={() => setRegistrationData(prev => ({ ...prev, registrationType: "member" }))}
                className="w-full bg-green-500 text-white py-3 rounded-lg hover:bg-green-600 transition-colors"
              >
                Continue as Member
              </button>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <AlertCircle className="text-yellow-500" size={24} />
                <div>
                  <h3 className="font-semibold text-yellow-800">Membership Under Review</h3>
                  <p className="text-yellow-600">Your membership is currently under review. You can continue as guest.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={() => {
                    setRegistrationData(prev => ({ ...prev, registrationType: "guest" }));
                    setCurrentStep(2);
                  }}
                  className="flex-1 bg-yellow-500 text-white py-3 rounded-lg hover:bg-yellow-600 transition-colors"
                >
                  Continue as Guest
                </button>
                <button
                  onClick={() => window.location.href = "/en/membership-status"}
                  className="flex-1 bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  View Membership Status
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-3">
              <UserPlus className="text-purple-500" size={24} />
              <div>
                <h3 className="font-semibold text-purple-800">Become a Member</h3>
                <p className="text-purple-600">Get faster registration and exclusive benefits for future events.</p>
              </div>
            </div>
            <button
              onClick={() => window.location.href = "/en/membership"}
              className="w-full bg-purple-500 text-white py-3 rounded-lg hover:bg-purple-600 transition-colors"
            >
              Become Member
            </button>
          </div>
          
          {event?.allowGuestRegistration && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h3 className="font-semibold text-gray-800 mb-2">Continue as Guest</h3>
              <p className="text-gray-600 mb-3">Register for this event without membership.</p>
              <button
                onClick={() => {
                  setRegistrationData(prev => ({ ...prev, registrationType: "guest" }));
                  setCurrentStep(2);
                }}
                className="w-full bg-gray-500 text-white py-3 rounded-lg hover:bg-gray-600 transition-colors"
              >
                Continue as Guest
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Personal Information</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Full Name *</label>
          <input
            type="text"
            required
            value={registrationData.name}
            onChange={(e) => setRegistrationData(prev => ({ ...prev, name: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={registrationData.registrationType === "member"}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
          <input
            type="email"
            required
            value={registrationData.email}
            onChange={(e) => setRegistrationData(prev => ({ ...prev, email: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={registrationData.registrationType === "member"}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone *</label>
          <input
            type="tel"
            required
            value={registrationData.phone}
            onChange={(e) => setRegistrationData(prev => ({ ...prev, phone: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={registrationData.registrationType === "member"}
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Address *</label>
          <input
            type="text"
            required
            value={registrationData.address}
            onChange={(e) => setRegistrationData(prev => ({ ...prev, address: e.target.value }))}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={registrationData.registrationType === "member"}
          />
        </div>
      </div>
      
      {registrationData.registrationType === "member" && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-600 text-sm">
            Your information has been pre-filled from your membership profile. Contact support if you need to update your details.
          </p>
        </div>
      )}
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-gray-800">Attendee Information</h2>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Number of Attendees *</label>
        <input
          type="number"
          required
          min="1"
          max={event?.maxAttendees || 10}
          value={registrationData.attendeeCount}
          onChange={(e) => {
            const value = parseInt(e.target.value) || 1;
            const maxAttendees = event?.maxAttendees || 10;
            
            if (value > maxAttendees) {
              toast.error(`Maximum ${maxAttendees} attendees allowed for this event`);
              return;
            }
            
            setRegistrationData(prev => ({ ...prev, attendeeCount: value }));
          }}
          className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
            registrationData.attendeeCount > (event?.maxAttendees || 10)
              ? 'border-red-300 bg-red-50'
              : 'border-gray-300'
          }`}
        />
        <div className="mt-1">
          {event?.maxAttendees && (
            <p className={`text-sm ${
              registrationData.attendeeCount > event.maxAttendees
                ? 'text-red-600 font-medium'
                : 'text-gray-500'
            }`}>
              {registrationData.attendeeCount > event.maxAttendees
                ? `⚠️ Exceeds maximum limit! Maximum ${event.maxAttendees} attendees allowed`
                : `Maximum ${event.maxAttendees} attendees allowed`
              }
            </p>
          )}
          {event?.maxAttendees && registrationData.attendeeCount <= event.maxAttendees && (
            <p className="text-xs text-green-600 mt-1">
              ✓ {event.maxAttendees - registrationData.attendeeCount} spots remaining
            </p>
          )}
        </div>
      </div>
      
      {registrationData.registrationType === "member" && userMembership?.familyMembers && userMembership.familyMembers.length > 0 && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Select Family Members (Optional)</label>
          <div className="space-y-2">
            {userMembership.familyMembers.map((member, index) => (
              <label key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  type="checkbox"
                  onChange={(e) => {
                    if (e.target.checked) {
                      setRegistrationData(prev => ({
                        ...prev,
                        selectedFamilyMembers: [...prev.selectedFamilyMembers, {
                          name: `${member.firstName} ${member.lastName}`,
                          relationship: member.relationship
                        }]
                      }));
                    } else {
                      setRegistrationData(prev => ({
                        ...prev,
                        selectedFamilyMembers: prev.selectedFamilyMembers.filter(
                          fm => fm.name !== `${member.firstName} ${member.lastName}`
                        )
                      }));
                    }
                  }}
                  className="rounded"
                />
                <div>
                  <p className="font-medium text-gray-800">
                    {member.firstName} {member.lastName}
                  </p>
                  <p className="text-sm text-gray-500">{member.relationship}</p>
                </div>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  const renderStep4 = () => {
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Support This Event</h2>
        
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <Heart className="text-orange-500" size={24} />
            <div>
              <h3 className="font-semibold text-orange-800">Would you like to contribute?</h3>
              <p className="text-orange-600">Your donation helps us organize better events for the community.</p>
            </div>
          </div>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Donation Amount (Optional)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={registrationData.donationAmount}
                onChange={(e) => setRegistrationData(prev => ({ ...prev, donationAmount: parseFloat(e.target.value) || 0 }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter amount"
              />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {[50, 100, 250, 500].map(amount => (
                <button
                  key={amount}
                  onClick={() => setRegistrationData(prev => ({ ...prev, donationAmount: amount }))}
                  className="py-2 px-3 border border-orange-300 rounded-lg hover:bg-orange-100 transition-colors"
                >
                  ${amount}
                </button>
              ))}
            </div>
          </div>
        </div>
        
        {registrationData.donationAmount > 0 && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <p className="text-green-800">
              Thank you for your generous donation of ${registrationData.donationAmount}!
            </p>
          </div>
        )}
      </div>
    );
  };

  const renderStep5 = () => {
    const { basePrice, paymentAmount, totalPayment } = calculatePricing();
    
    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Review & Complete Registration</h2>
        
        <div className="bg-gray-50 rounded-lg p-6">
          <h3 className="font-semibold text-gray-800 mb-4">Registration Summary</h3>
          
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Event:</span>
              <span className="font-medium">{event?.eventname}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Date:</span>
              <span className="font-medium">{event?.eventdate} at {event?.eventtime}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Registration Type:</span>
              <span className="font-medium capitalize">{registrationData.registrationType}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Attendees:</span>
              <span className="font-medium">{registrationData.attendeeCount}</span>
            </div>
            
            {registrationData.registrationType === "member" && (
              <div className="flex justify-between">
                <span className="text-gray-600">Membership ID:</span>
                <span className="font-medium">{registrationData.membershipId}</span>
              </div>
            )}
            
            <hr className="border-gray-300" />
            
            <div className="flex justify-between">
              <span className="text-gray-600">Base Price ({registrationData.registrationType}):</span>
              <span className="font-medium">${basePrice}</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Registration Fees:</span>
              <span className="font-medium">${paymentAmount}</span>
            </div>
            
            {registrationData.donationAmount > 0 && (
              <div className="flex justify-between">
                <span className="text-gray-600">Donation:</span>
                <span className="font-medium text-green-600">${registrationData.donationAmount}</span>
              </div>
            )}
            
            <hr className="border-gray-300" />
            
            <div className="flex justify-between text-lg font-bold">
              <span>Total Payment:</span>
              <span className={totalPayment > 0 ? "text-blue-600" : "text-green-600"}>
                {totalPayment > 0 ? `$${totalPayment}` : "FREE"}
              </span>
            </div>
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <CheckCircle className="text-blue-500" size={20} />
            <p className="text-blue-800">
              By completing this registration, you agree to the event terms and conditions.
            </p>
          </div>
        </div>
        
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Security Verification
          </label>
          <CustomCaptcha
            onVerify={(isValid) => setCaptchaVerified(isValid)}
          />
        </div>
        
        <button
          onClick={handleSubmitRegistration}
          disabled={loading || !captchaVerified}
          className="w-full bg-blue-500 text-white py-3 rounded-lg hover:bg-blue-600 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {loading ? "Processing..." : `Complete Registration ${paymentAmount > 0 ? `- $${paymentAmount}` : "- FREE"}`}
        </button>
        
        {!captchaVerified && (
          <p className="text-sm text-gray-500 text-center mt-2">
            Please complete the security verification to proceed
          </p>
        )}
      </div>
    );
  };

  const renderCurrentStep = () => {
    // Show skeleton loading only for registration form content while session is loading
    if (initialLoading || sessionStatus === "loading") {
      return (
        <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
          <div className="space-y-6 animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3"></div>
            <div className="space-y-4">
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-2/3"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        </div>
      );
    }

    switch (currentStep) {
      case 1: return renderStep1();
      case 2: return renderStep2();
      case 3: return renderStep3();
      case 4: return renderStep4();
      case 5: return renderStep5();
      default: return renderStep1();
    }
  };

  if (!event) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  
  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* Event Header */}
      <div className="bg-white rounded-lg shadow mb-6 p-6 border border-gray-200">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">{event.eventname}</h1>
            <p className="text-gray-600 mb-4">{event.eventdescription}</p>
            <div className="flex flex-wrap gap-4 text-sm text-gray-500">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                <span>{event.eventdate} at {event.eventtime}</span>
              </div>
              <div className="flex items-center gap-1">
                <Target size={16} />
                <span>{event.eventvenue}</span>
              </div>
              {event.maxAttendees && (
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>Max {event.maxAttendees} attendees</span>
                </div>
              )}
            </div>
          </div>
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex items-center gap-2 text-gray-500 hover:text-gray-700"
            >
              <ArrowLeft size={20} />
              Back
            </button>
          )}
        </div>
        
        {/* Pricing Information */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <div className="flex flex-wrap gap-6">
            <div>
              <span className="text-sm text-gray-500">Member Price:</span>
              <span className="ml-2 font-bold text-green-600">
                {event.memberPrice > 0 ? `$${event.memberPrice}` : "FREE"}
              </span>
            </div>
            {event.allowGuestRegistration && (
              <div>
                <span className="text-sm text-gray-500">Guest Price:</span>
                <span className="ml-2 font-bold text-blue-600">
                  {event.guestPrice > 0 ? `$${event.guestPrice}` : "FREE"}
                </span>
              </div>
            )}
            {event.registrationDeadline && (
              <div className="flex items-center gap-1">
                <Clock size={16} className="text-orange-500" />
                <span className="text-sm text-orange-600">
                  Register by {new Date(event.registrationDeadline).toLocaleDateString()}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Registration Form */}
      <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
        {renderStepIndicator()}
        {renderCurrentStep()}
        
        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
            disabled={currentStep === 1}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ArrowLeft size={20} />
            Previous
          </button>
          
          {currentStep < 5 && (
            <button
              onClick={() => setCurrentStep(Math.min(5, currentStep + 1))}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Next
              <ArrowRight size={20} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
