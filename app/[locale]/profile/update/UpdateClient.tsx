"use client";

import { useSession } from "next-auth/react";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { Lock, Eye, EyeOff, AlertTriangle, CheckCircle, User, MapPin, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Membership } from "@/types";

// Address autocomplete interfaces
interface AddressSuggestion {
  id: string;
  label: string;
  addressLine: string;
  city: string;
  postalCode: string;
}

interface GeoapifyProperties {
  place_id?: string | number;
  formatted?: string;
  street?: string;
  housenumber?: string;
  city?: string;
  town?: string;
  village?: string;
  municipality?: string;
  county?: string;
  postcode?: string;
}

interface GeoapifyFeature {
  id?: string | number;
  properties?: GeoapifyProperties;
}

interface GeoapifyResponse {
  features?: GeoapifyFeature[];
}

interface Translations {
  title: string;
  settings: string;
  changePassword: string;
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
  updatePassword: string;
  passwordUpdated: string;
  passwordUpdateError: string;
  passwordsNotMatch: string;
  passwordTooShort: string;
  passwordChanged: string;
  securityWarning: string;
  temporaryPasswordWarning: string;
  changePasswordNow: string;
  personalInfo: string;
  updateProfile: string;
  profileUpdated: string;
  profileUpdateError: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  province: string;
  district: string;
 updating: string;

}

interface Props {
  translations: Translations;
}

export default function UpdateClient({ translations: t }: Props) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const { toast } = useToast();

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [membershipData, setMembershipData] = useState<Membership | null>(null);
  const [hasTemporaryPassword, setHasTemporaryPassword] = useState(false);
  const [currentPasswordError, setCurrentPasswordError] = useState("");
  const [isValidatingCurrentPassword, setIsValidatingCurrentPassword] = useState(false);
  const [isCurrentPasswordValid, setIsCurrentPasswordValid] = useState(false);
  
  // Personal information form states
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    kommune: "",
    fylke: "",
    personalNumber: "",
    permissionPhotos: false,
    permissionPhone: false,
    permissionEmail: false,
    profilePhoto: "",
  });
  
  // Address autocomplete states
  const [addressSuggestions, setAddressSuggestions] = useState<AddressSuggestion[]>([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const [addressError, setAddressError] = useState("");
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [locating, setLocating] = useState(false);
  const [isAddressFocused, setIsAddressFocused] = useState(false);
  const [initialAddressLoaded, setInitialAddressLoaded] = useState(false);
  const geoapifyKey = process.env.NEXT_PUBLIC_GEOAPIFY_KEY;

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/${locale}/login`);
      return;
    }

    // Redirect admins to dashboard
    if (session?.user?.role === "admin") {
      router.push(`/${locale}/dashboard`);
      return;
    }

    // Fetch membership data to check if user has temporary password and populate profile form
    if (session?.user?.email) {
      fetch(`/api/membership?email=${encodeURIComponent(session.user.email)}`)
        .then((res) => res.json())
        .then((data) => {
          if (Array.isArray(data) && data.length > 0) {
            const member = data[0];
            setMembershipData(member);
            
            // Populate profile form with existing data
            setProfileForm({
              firstName: member.firstName || "",
              middleName: member.middleName || "",
              lastName: member.lastName || "",
              phone: member.phone || "",
              address: member.address || "",
              city: member.city || "",
              postalCode: member.postalCode || "",
              kommune: member.kommune || "",
              fylke: member.fylke || "",
              personalNumber: member.personalNumber || "",
              permissionPhotos: member.permissionPhotos || false,
              permissionPhone: member.permissionPhone || false,
              permissionEmail: member.permissionEmail || false,
              profilePhoto: member.profilePhoto || "",
            });
            
            // Check if password was recently reset (within last 24 hours)
            const lastPasswordReset = member.passwordResetTokenExpiry;
            if (lastPasswordReset) {
              const resetTime = new Date(lastPasswordReset);
              const now = new Date();
              const hoursSinceReset = (now.getTime() - resetTime.getTime()) / (1000 * 60 * 60);
              if (hoursSinceReset < 24) {
                setHasTemporaryPassword(true);
              }
            }
          }
        })
        .catch((error) => console.error("Error fetching membership data:", error));
    }
  }, [status, session, router, locale]);

  const validatePassword = (password: string) => {
    return password.length >= 8;
  };

  const validateCurrentPassword = async (password: string) => {
    if (!password || !session?.user?.email) {
      setCurrentPasswordError("");
      setIsCurrentPasswordValid(false);
      return;
    }

    setIsValidatingCurrentPassword(true);
    setCurrentPasswordError("");
    setIsCurrentPasswordValid(false);

    try {
      const response = await fetch("/api/users/verify-current-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session.user.email,
          password: password,
        }),
      });

      const data = await response.json();

      if (response.ok && data.isValid) {
        setIsCurrentPasswordValid(true);
        setCurrentPasswordError("");
      } else {
        setCurrentPasswordError("Current password is incorrect");
        setIsCurrentPasswordValid(false);
      }
    } catch (error) {
      console.error("Password validation error:", error);
      setCurrentPasswordError("Unable to verify password");
      setIsCurrentPasswordValid(false);
    } finally {
      setIsValidatingCurrentPassword(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast({
        title: "Error",
        description: "All password fields are required",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Error",
        description: t.passwordsNotMatch || "New passwords do not match",
        variant: "destructive",
      });
      return;
    }

    if (!validatePassword(newPassword)) {
      toast({
        title: "Error",
        description: t.passwordTooShort || "Password must be at least 8 characters long",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/users/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: session?.user?.email,
          currentPassword,
          newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: t.passwordUpdated || "Password updated successfully",
        });

        // Clear all form states and reset validation
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setHasTemporaryPassword(false);
        setIsCurrentPasswordValid(false);
        setCurrentPasswordError("");
        setIsValidatingCurrentPassword(false);

        // Update membership data to reflect password change
        if (membershipData) {
          setMembershipData({
            ...membershipData,
          });
        }

        // Optional: Redirect to profile after successful password change
        setTimeout(() => {
          router.push(`/${locale}/profile`);
        }, 2000);
      } else {
        throw new Error(data.error || "Failed to update password");
      }
    } catch (error) {
      console.error("Password change error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : t.passwordUpdateError || "Failed to update password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsUpdatingProfile(true);

    try {
      const response = await fetch("/api/users/update-profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(profileForm),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Success",
          description: t.profileUpdated || "Profile updated successfully",
        });

        // Update membership data with the new information
        setMembershipData((prev: Membership | null) => ({
          ...prev,
          ...data.member
        }));
      } else {
        throw new Error(data.error || "Failed to update profile");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : t.profileUpdateError || "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleProfileFormChange = (field: string, value: string | string[] | boolean) => {
    setProfileForm(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Address autocomplete functions
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setProfileForm(prev => ({ ...prev, address: value }));
    setAddressError("");
    setActiveSuggestionIndex(-1);
  };

  const handleAddressFocus = () => {
    setIsAddressFocused(true);
    // Mark initial address as loaded when user first focuses on the field
    if (!initialAddressLoaded) {
      setInitialAddressLoaded(true);
    }
  };

  const handleAddressBlur = () => {
    setIsAddressFocused(false);
    // Clear suggestions when user leaves the field
    setTimeout(() => {
      if (!isAddressFocused) {
        setAddressSuggestions([]);
        setActiveSuggestionIndex(-1);
      }
    }, 200);
  };

  useEffect(() => {
    if (!geoapifyKey) {
      setAddressSuggestions([]);
      return;
    }
    if (!profileForm.address || profileForm.address.trim().length < 3) {
      setAddressSuggestions([]);
      return;
    }
    // Only trigger autocomplete if user is focused on address field and initial data is loaded
    if (!isAddressFocused || !initialAddressLoaded) {
      return;
    }

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      try {
        setAddressLoading(true);
        const text = encodeURIComponent(profileForm.address.trim());
        const url = `https://api.geoapify.com/v1/geocode/autocomplete?text=${text}&filter=countrycode:no&type=street&limit=5&apiKey=${geoapifyKey}`;
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) {
          throw new Error("Failed to fetch address suggestions");
        }
        const data = (await res.json()) as GeoapifyResponse;
        const suggestions: AddressSuggestion[] = (data.features || []).map((feature: GeoapifyFeature) => {
          const props = feature.properties || {};
          const addressLine = [props.street, props.housenumber].filter(Boolean).join(" ").trim() || props.formatted || "";
          const city = props.city || props.town || props.village || props.municipality || props.county || "";
          const postalCode = props.postcode || "";
          return {
            id: props.place_id?.toString() || feature?.id?.toString() || `${addressLine}-${postalCode}`,
            label: props.formatted || addressLine || "Unknown address",
            addressLine: addressLine || props.formatted || "",
            city,
            postalCode,
          };
        });
        setAddressSuggestions(suggestions);
        setActiveSuggestionIndex(suggestions.length > 0 ? 0 : -1);
      } catch (err: unknown) {
        if (!(err instanceof Error) || err.name !== "AbortError") {
          setAddressError("Could not load address suggestions.");
        }
      } finally {
        setAddressLoading(false);
      }
    }, 350);

    return () => {
      clearTimeout(timer);
      controller.abort();
    };
  }, [profileForm.address, geoapifyKey, isAddressFocused, initialAddressLoaded]);

  const applySuggestion = (item: AddressSuggestion) => {
    setProfileForm((prev) => ({
      ...prev,
      address: item.addressLine || item.label,
      city: item.city || prev.city,
      postalCode: item.postalCode || prev.postalCode,
    }));
    setAddressSuggestions([]);
    setActiveSuggestionIndex(-1);
  };

  const handleAddressKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (addressSuggestions.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev + 1) % addressSuggestions.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestionIndex((prev) => (prev - 1 + addressSuggestions.length) % addressSuggestions.length);
    } else if (e.key === "Enter") {
      if (activeSuggestionIndex >= 0) {
        e.preventDefault();
        applySuggestion(addressSuggestions[activeSuggestionIndex]);
      }
    } else if (e.key === "Escape") {
      setAddressSuggestions([]);
      setActiveSuggestionIndex(-1);
    }
  };

  const handleUseMyLocation = () => {
    if (!geoapifyKey) {
      setAddressError("Address lookup is not available.");
      return;
    }
    if (!navigator.geolocation) {
      setAddressError("Geolocation is not supported in this browser.");
      return;
    }
    setLocating(true);
    setAddressError("");
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;
          const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${latitude}&lon=${longitude}&type=street&format=geojson&apiKey=${geoapifyKey}`;
          const res = await fetch(url);
          if (!res.ok) throw new Error("Failed to reverse geocode location");
          const data = await res.json();
          const props = data?.features?.[0]?.properties || {};
          const addressLine = [props.street, props.housenumber].filter(Boolean).join(" ").trim() || props.formatted || "";
          const city = props.city || props.town || props.village || props.municipality || props.county || "";
          const postalCode = props.postcode || "";
          setProfileForm((prev) => ({
            ...prev,
            address: addressLine || prev.address,
            city: city || prev.city,
            postalCode: postalCode || prev.postalCode,
          }));
          setAddressSuggestions([]);
          setActiveSuggestionIndex(-1);
        } catch {
          setAddressError("Could not fetch your address.");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setAddressError("Unable to access your location.");
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-blue-600"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  return (
        	<div className="max-w-4xl space-y-6">
        {/* Header */}
     
        <div className="mb-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Update your profile</h1>
          <p className="text-gray-600">Update your personal information and contact details</p>
        </div>

  

        {/* Security Warning for Temporary Password */}
        {hasTemporaryPassword && (
          <Alert className="mb-6 border-yellow-200 bg-yellow-50">
            <AlertTriangle className="h-4 w-4 text-yellow-600" />
            <AlertDescription className="text-yellow-800">
              <strong>{t.securityWarning || "Security Notice"}</strong>
              <br />
              {t.temporaryPasswordWarning || "You are using a temporary password that was recently reset by an administrator. For your security, please change your password immediately."}
            </AlertDescription>
          </Alert>
        )}

        {/* Personal Information Card */}
        <Card className="shadow-lg border-0 mb-6">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <User className="w-6 h-6 mr-2 text-blue-600" />
              {t.personalInfo || "Personal Information"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleProfileUpdate} className="space-y-6">
              {/* Personal Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Personal Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName" className="text-sm font-semibold text-gray-900">
                      First Name
                    </Label>
                    <Input
                      id="firstName"
                      type="text"
                      value={profileForm.firstName}
                      onChange={(e) => handleProfileFormChange("firstName", e.target.value)}
                      placeholder="Enter your first name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="middleName" className="text-sm font-semibold text-gray-900">
                      Middle Name (Optional)
                    </Label>
                    <Input
                      id="middleName"
                      type="text"
                      value={profileForm.middleName}
                      onChange={(e) => handleProfileFormChange("middleName", e.target.value)}
                      placeholder="Enter your middle name"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName" className="text-sm font-semibold text-gray-900">
                      Last Name
                    </Label>
                    <Input
                      id="lastName"
                      type="text"
                      value={profileForm.lastName}
                      onChange={(e) => handleProfileFormChange("lastName", e.target.value)}
                      placeholder="Enter your last name"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-900">
                      {t.phone || "Phone Number"}
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={profileForm.phone}
                      onChange={(e) => handleProfileFormChange("phone", e.target.value)}
                      placeholder="Enter your phone number"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="personalNumber" className="text-sm font-semibold text-gray-900">
                      Personal Number
                    </Label>
                    <Input
                      id="personalNumber"
                      type="text"
                      value={profileForm.personalNumber}
                      onChange={(e) => handleProfileFormChange("personalNumber", e.target.value)}
                      placeholder="Enter your personal number"
                      maxLength={11}
                      readOnly
                      className="bg-gray-50"
                    />
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <MapPin className="w-4 h-4 mr-2" />
                  Address Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="address" className="text-sm font-semibold text-gray-900">
                      {t.address || "Address"}
                    </Label>
                    <div className="relative">
                      <Input
                        id="address"
                        type="text"
                        value={profileForm.address}
                        onChange={handleAddressChange}
                        onFocus={handleAddressFocus}
                        onBlur={handleAddressBlur}
                        onKeyDown={handleAddressKeyDown}
                        placeholder="Enter your address"
                        autoComplete="off"
                      />
                      <div className="mt-2">
                        <button 
                          type="button" 
                          onClick={handleUseMyLocation} 
                          disabled={locating} 
                          className={`text-sm font-medium px-3 py-1.5 rounded border border-gray-300 bg-white hover:bg-gray-50 transition-colors flex items-center gap-2 ${locating ? "opacity-60 cursor-not-allowed" : ""}`}
                        >
                          {locating ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Locating...
                            </>
                          ) : (
                            <>
                              <MapPin className="w-3 h-3" />
                              Use current location
                            </>
                          )}
                        </button>
                      </div>
                      {addressLoading && (
                        <div className="absolute right-3 top-2.5 text-xs text-gray-500">
                          <Loader2 className="w-4 h-4 animate-spin" />
                        </div>
                      )}
                      {addressError && (
                        <p className="text-xs text-red-600 mt-1">{addressError}</p>
                      )}
                      {addressSuggestions.length > 0 && (
                        <ul className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-auto">
                          {addressSuggestions.map((item, index) => (
                            <li
                              key={item.id}
                              className={`px-3 py-2 text-sm text-gray-900 cursor-pointer ${
                                index === activeSuggestionIndex ? "bg-gray-100" : "hover:bg-gray-50"
                              }`}
                              onMouseDown={(e) => {
                                e.preventDefault();
                                applySuggestion(item);
                              }}
                            >
                              <div className="font-medium">{item.label}</div>
                              <div className="text-xs text-gray-600">
                                {[item.postalCode, item.city].filter(Boolean).join(" ")}
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="city" className="text-sm font-semibold text-gray-900">
                      {t.city || "City"}
                    </Label>
                    <Input
                      id="city"
                      type="text"
                      value={profileForm.city}
                      onChange={(e) => handleProfileFormChange("city", e.target.value)}
                      placeholder="Enter your city"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="postalCode" className="text-sm font-semibold text-gray-900">
                      {t.postalCode || "Postal Code"}
                    </Label>
                    <Input
                      id="postalCode"
                      type="text"
                      value={profileForm.postalCode}
                      onChange={(e) => handleProfileFormChange("postalCode", e.target.value)}
                      placeholder="Enter postal code"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="kommune" className="text-sm font-semibold text-gray-900">
                      Kommune
                    </Label>
                    <Input
                      id="kommune"
                      type="text"
                      value={profileForm.kommune}
                      onChange={(e) => handleProfileFormChange("kommune", e.target.value)}
                      placeholder="Enter kommune"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fylke" className="text-sm font-semibold text-gray-900">
                      Fylke (County)
                    </Label>
                    <Input
                      id="fylke"
                      type="text"
                      value={profileForm.fylke}
                      onChange={(e) => handleProfileFormChange("fylke", e.target.value)}
                      placeholder="Enter fylke"
                    />
                  </div>
                </div>
              </div>



              {/* Submit Button */}
              <Button
                type="submit"
                className="w-fit bg-blue-600 hover:bg-blue-700"
                disabled={isUpdatingProfile}
              >
                {isUpdatingProfile ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                    {t.updating || "Updating..."}
                  </>
                ) : (
                  <>
                    <User className="w-4 h-4 mr-2" />
                    {t.updateProfile || "Update Profile"}
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Change Password Card */}
        <Card className="shadow-lg border-0">
          <CardHeader>
            <CardTitle className="flex items-center text-2xl">
              <Lock className="w-6 h-6 mr-2 text-blue-600" />
              {t.changePassword || "Change Password"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handlePasswordChange} className="max-w-sm mx-auto space-y-6">
              {/* Current Password */}
              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="text-sm font-semibold text-gray-900">
                  {t.currentPassword || "Current Password"}
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => {
                      setCurrentPassword(e.target.value);
                      setCurrentPasswordError(""); // Clear error when typing
                      setIsCurrentPasswordValid(false); // Reset valid state when typing
                    }}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        validateCurrentPassword(currentPassword);
                      }
                    }}
                    className={`pr-10 ${
                      currentPasswordError 
                        ? 'border-red-500 focus:border-red-500' 
                        : isCurrentPasswordValid 
                          ? 'border-green-500 focus:border-green-500' 
                          : ''
                    }`}
                    placeholder="Enter your current password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {isValidatingCurrentPassword && (
                    <div className="absolute right-10 top-1/2 transform -translate-y-1/2">
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600"></div>
                    </div>
                  )}
                </div>
                {currentPasswordError && (
                  <div className="text-sm text-red-600 flex items-center">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    {currentPasswordError}
                  </div>
                )}
                {isCurrentPasswordValid && (
                  <div className="text-sm text-green-600 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Password verified. You can now set a new password.
                  </div>
                )}
                
                {/* Next Button for mobile-friendly validation */}
                {!isCurrentPasswordValid && currentPassword && (
                  <Button
                    type="button"
                    onClick={() => validateCurrentPassword(currentPassword)}
                    disabled={isValidatingCurrentPassword}
                    className="w-full mt-3"
                    variant="outline"
                  >
                    {isValidatingCurrentPassword ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-blue-600 mr-2"></div>
                    ) : null}
                    Next
                  </Button>
                )}
              </div>

              {/* Show rest of form only when current password is valid */}
              {isCurrentPasswordValid && (
                <>
                  {/* New Password */}
                  <div className="space-y-2">
                    <Label htmlFor="newPassword" className="text-sm font-semibold text-gray-900">
                      {t.newPassword || "New Password"}
                    </Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    type={showNewPassword ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="pr-10"
                    placeholder="Enter your new password (min. 8 characters)"
                    required
                    minLength={8}
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {newPassword && (
                  <div className="text-sm text-gray-600">
                    {validatePassword(newPassword) ? (
                      <span className="text-green-600 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Password strength: Good
                      </span>
                    ) : (
                      <span className="text-red-600">
                        Password must be at least 8 characters long
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="space-y-2">
                <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-900">
                  {t.confirmPassword || "Confirm New Password"}
                </Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="pr-10"
                    placeholder="Confirm your new password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {confirmPassword && (
                  <div className="text-sm">
                    {newPassword === confirmPassword ? (
                      <span className="text-green-600 flex items-center">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Passwords match
                      </span>
                    ) : (
                      <span className="text-red-600">
                        Passwords do not match
                      </span>
                    )}
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700"
                disabled={isLoading || !validatePassword(newPassword) || newPassword !== confirmPassword}
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                ) : null}
                {t.updatePassword || "Update Password"}
              </Button>
                </>
              )}
            </form>
          </CardContent>
        </Card>

        {/* Quick Action for Temporary Password Users */}
        {hasTemporaryPassword && (
          <Card className="mt-6 border-yellow-200 bg-yellow-50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-yellow-800 mb-1">
                    {t.changePasswordNow || "Change Your Password Now"}
                  </h3>
                  <p className="text-yellow-700 text-sm">
                    Your account security is important. Change your temporary password to a permanent one.
                  </p>
                </div>
                <Button
                  onClick={() => document.getElementById('currentPassword')?.focus()}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                >
                  Change Now
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
  );
}
