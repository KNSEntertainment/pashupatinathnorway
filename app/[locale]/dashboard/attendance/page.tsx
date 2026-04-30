"use client";

import { useState, useEffect, useRef } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Users, Calendar, CheckCircle, Download, Search, Upload, Camera } from "lucide-react";

interface Event {
  _id: string;
  eventname: string;
  eventdescription?: string;
  eventvenue?: string;
  eventdate?: string;
  eventtime?: string;
  enableAttendance: boolean;
  attendanceStatus: "not_started" | "active" | "closed";
  maxAttendees?: number;
  createdAt: string;
}

interface AttendanceRecord {
  _id: string;
  eventId: string;
  memberId: string;
  memberPersonalNumber: string;
  memberName: string;
  memberEmail: string;
  checkInTime: string;
  markedBy: string;
  notes?: string;
  createdAt: string;
}

interface MemberData {
  _id: string;
  fullName: string;
  email: string;
  phone?: string;
  profilePhoto?: string;
  membershipType: string;
  city?: string;
  province?: string;
  personalNumber?: string;
  membershipStatus: string;
  createdAt: string;
}

export default function AttendanceDashboard() {
  const { status } = useSession();
  
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingEvent, setUpdatingEvent] = useState<string | null>(null);
  const [error, setError] = useState<string>("");
  
  // Search states
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searching, setSearching] = useState<boolean>(false);
  const [searchResults, setSearchResults] = useState<MemberData[]>([]);
  const [searchTimeout, setSearchTimeout] = useState<NodeJS.Timeout | null>(null);
  
  // QR upload states
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle QR file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!selectedEvent) {
      setError("Please select an event first");
      return;
    }

    setError("");

    try {
      // Import QrScanner dynamically to avoid SSR issues
      const QrScanner = (await import('qr-scanner')).default;
      
      // Use qr-scanner to process the image
      const qrData = await QrScanner.scanImage(file);
      
      if (!qrData || qrData.trim() === '') {
        setError("No QR code found in the image");
        return;
      }

      // Clean up potential extra data or formatting issues
      const cleanData = qrData.trim();
      
      // Remove any potential URL prefixes or extra text
      if (cleanData.startsWith('http')) {
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
      
      // Validate parsed data structure
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
          eventId: selectedEvent._id,
          markedBy: "attendance-scanner",
          notes: `QR check-in at ${selectedEvent.eventname}`
        }),
      });

      if (response.ok) {
        const result = await response.json();
        setError("");
        // Refresh attendance records
        fetchAttendanceRecords(selectedEvent._id);
        // Show success message
        setError(`✓ Attendance marked for ${result.member?.fullName}`);
        // Clear error after 3 seconds
        setTimeout(() => setError(""), 3000);
      } else {
        if (response.status === 409) {
          const errorData = await response.json();
          const memberName = errorData.member?.fullName || errorData.memberName || 'this member';
          setError(`Attendance already marked for ${memberName} at ${new Date(errorData.checkInTime).toLocaleTimeString()}`);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to mark attendance");
        }
      }
      
    } catch (error) {
      console.error("Error processing QR data:", error);
      setError("Invalid QR code format. Please ensure you're scanning a valid member ID card.");
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchEvents();
    }
  }, [status]);

  useEffect(() => {
    if (selectedEvent) {
      fetchAttendanceRecords(selectedEvent._id);
    }
  }, [selectedEvent]);

  const fetchEvents = async () => {
    try {
      const response = await fetch("/api/events");
      if (response.ok) {
        const data = await response.json();
        setEvents(data.events || []);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to fetch events");
    } finally {
      setLoading(false);
    }
  };

  // Debounced search function
  const searchMembers = async (query: string) => {
    if (!query || query.trim() === "") {
      setSearchResults([]);
      return;
    }
    
    setSearching(true);
    setError("");
    
    try {
      const response = await fetch(`/api/members/search?query=${encodeURIComponent(query.trim())}`);
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.members || []);
      } else {
        setError("Failed to search members");
        setSearchResults([]);
      }
    } catch (error) {
      console.error("Error searching members:", error);
      setError("Failed to search members");
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Handle search input with debouncing
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    
    // Clear existing timeout
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }
    
    // Set new timeout for debounced search
    const timeout = setTimeout(() => {
      searchMembers(value);
    }, 300); // 300ms debounce
    
    setSearchTimeout(timeout);
  };

  
  // Mark attendance for a specific member
  const markAttendanceForMember = async (member: MemberData) => {
    if (!selectedEvent) {
      setError("Please select an event first");
      return;
    }

    if (!member.personalNumber) {
      setError("Member personal number not found");
      return;
    }

    try {
      const response = await fetch(`/api/verify/${member.personalNumber}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          eventId: selectedEvent._id,
          markedBy: "attendance-scanner",
          notes: `Manual check-in at ${selectedEvent.eventname}`
        }),
      });

      if (response.ok) {
        setError("");
        // Refresh attendance records
        fetchAttendanceRecords(selectedEvent._id);
        // Clear search results and query
        setSearchResults([]);
        setSearchQuery("");
      } else {
        if (response.status === 409) {
          const errorData = await response.json();
          const checkInTime = errorData.checkInTime ? new Date(errorData.checkInTime).toLocaleTimeString() : '';
          setError(`Attendance already marked for ${member.fullName}${checkInTime ? ` at ${checkInTime}` : ''}`);
        } else {
          const errorData = await response.json();
          setError(errorData.error || "Failed to mark attendance");
        }
      }
    } catch (error) {
      console.error("Error marking attendance:", error);
      setError("Failed to mark attendance");
    }
  };

  const fetchAttendanceRecords = async (eventId: string) => {
    try {
      const response = await fetch(`/api/attendance/mark?eventId=${eventId}`);
      if (response.ok) {
        const result = await response.json();
        setAttendanceRecords(result.attendance || []);
      }
    } catch (error) {
      console.error("Error fetching attendance records:", error);
    }
  };

  const updateEventAttendance = async (eventId: string, updates: Record<string, unknown>) => {
    setUpdatingEvent(eventId);
    try {
      const response = await fetch(`/api/events/${eventId}/attendance`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (response.ok) {
        // Update the event in the list
        setEvents(events.map(event => 
          event._id === eventId 
            ? { ...event, ...updates }
            : event
        ));
        
        // Update selected event if it's the current one
        if (selectedEvent && selectedEvent._id === eventId) {
          setSelectedEvent({ ...selectedEvent, ...updates });
        }
      }
    } catch (error: unknown) {
        console.error("Error updating event:", error);
        if (error instanceof Error) {
          if (error.message.includes('11000')) {
            setError("Validation error: Event data conflict");
          } else if (error.message.includes('ValidationError')) {
            setError(`Validation error: ${error.message}`);
          } else {
            setError("Failed to update event");
          }
        } else {
          setError("Failed to update event");
        }
      } finally {
        setUpdatingEvent(null);
      }
  };

  const exportAttendance = () => {
    if (!selectedEvent || attendanceRecords.length === 0) return;

    const csvContent = [
      ["Name", "Email", "Personal Number", "Check-in Time", "Notes"],
      ...attendanceRecords.map(record => [
        record.memberName,
        record.memberEmail,
        record.memberPersonalNumber,
        new Date(record.checkInTime).toLocaleString(),
        record.notes || ""
      ])
    ].map(row => row.join(",")).join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `attendance-${selectedEvent.eventname.replace(/\s+/g, "-")}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <Loader2 className="h-8 w-8 animate-spin text-brand_primary" />
      </div>
    );
  }

  return (
    <div className="max-w-lg min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-brand_primary rounded-full flex items-center justify-center">
                <Users className="w-4 h-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">Attendance</h1>
            </div>
            {selectedEvent && (
              <Badge className="bg-green-100 text-green-800 text-xs px-2 py-1">
                {selectedEvent.eventname}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Error/Success Alert */}
      {error && (
        <div className="px-4 py-2">
          <Alert className={`${error.startsWith('✓') ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}`}>
            <AlertDescription className={`${error.startsWith('✓') ? 'text-green-700' : 'text-red-700'} text-sm`}>
              {error}
            </AlertDescription>
          </Alert>
        </div>
      )}

      {/* Mobile Search Section */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="relative">
          <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Search members..."
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />
          {searching && (
            <div className="absolute right-3 top-3">
              <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Search Results */}
      {searchResults.length > 0 && (
        <div className="px-4 py-2">
          <div className="text-xs text-gray-500 mb-2">
            {searchResults.length} member{searchResults.length !== 1 ? 's' : ''} found
          </div>
          <div className="space-y-2">
            {searchResults.map((member) => (
              <div
                key={member._id}
                className="bg-white rounded-lg border border-gray-200 p-3 shadow-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900 text-sm">{member.fullName}</div>
                    <div className="text-xs text-gray-500">{member.email}</div>
                  </div>
                  <Button
                    onClick={() => markAttendanceForMember(member)}
                    disabled={!selectedEvent}
                    size="sm"
                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-xs h-8"
                  >
                    Check In
                  </Button>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>📱 {member.phone || "N/A"}</span>
                  <span>🆔 {member.personalNumber || "N/A"}</span>
                </div>
              </div>
            ))}
          </div>
          {!selectedEvent && (
            <div className="mt-3 p-2 bg-yellow-50 rounded-lg text-xs text-yellow-700">
              ⚠️ Please select an event to mark attendance
            </div>
          )}
        </div>
      )}

      {/* No Results */}
      {searchQuery && !searching && searchResults.length === 0 && (
        <div className="px-4 py-8 text-center">
          <Users className="w-12 h-12 text-gray-300 mx-auto mb-2" />
          <p className="text-sm text-gray-500">No members found</p>
        </div>
      )}

      {/* Mobile Event Selection */}
      <div className="px-4 py-3 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-700">Select Event</h2>
          {selectedEvent && (
            <Button
              onClick={() => setSelectedEvent(null)}
              variant="outline"
              size="sm"
              className="text-xs h-6"
            >
              Clear
            </Button>
          )}
        </div>
        
        {events.length === 0 ? (
          <div className="text-center py-4">
            <Calendar className="w-8 h-8 text-gray-300 mx-auto mb-2" />
            <p className="text-sm text-gray-500">No events available</p>
          </div>
        ) : (
          <div className="space-y-2">
            {events.map((event) => (
              <div
                key={event._id}
                onClick={() => setSelectedEvent(event)}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${
                  selectedEvent?._id === event._id
                    ? "border-brand_primary bg-brand/5 border-2"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{event.eventname}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {event.eventdate && `📅 ${event.eventdate}`}
                      {event.eventtime && ` • ${event.eventtime}`}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {event.enableAttendance && event.attendanceStatus === "active" && (
                      <Badge className="bg-green-100 text-green-800 text-xs">
                        Active
                      </Badge>
                    )}
                    {selectedEvent?._id === event._id && (
                      <div className="w-2 h-2 bg-brand_primary rounded-full"></div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Mobile Event Details & Controls */}
      {selectedEvent && (
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-sm text-gray-900">{selectedEvent.eventname}</h3>
              <p className="text-xs text-gray-500">
                {attendanceRecords.length} checked in
                {selectedEvent.eventdate && ` • ${selectedEvent.eventdate}`}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {selectedEvent.enableAttendance && selectedEvent.attendanceStatus === "active" && (
                <Badge className="bg-green-100 text-green-800 text-xs">
                  Active
                </Badge>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => updateEventAttendance(selectedEvent._id, { 
                attendanceStatus: selectedEvent.attendanceStatus === "active" ? "closed" : "active" 
              })}
              disabled={updatingEvent === selectedEvent._id}
              size="sm"
              className={`text-xs h-8 ${
                selectedEvent.attendanceStatus === "active" 
                  ? "bg-red-600 hover:bg-red-700" 
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              {selectedEvent.attendanceStatus === "active" ? "Stop" : "Start"}
            </Button>
            
            <Button
              onClick={() => updateEventAttendance(selectedEvent._id, { 
                enableAttendance: !selectedEvent.enableAttendance 
              })}
              disabled={updatingEvent === selectedEvent._id}
              variant="outline"
              size="sm"
              className="text-xs h-8"
            >
              {selectedEvent.enableAttendance ? "Disable" : "Enable"}
            </Button>
          </div>
        </div>
      )}

      {/* Mobile QR Scanner */}
      {selectedEvent && selectedEvent.enableAttendance && selectedEvent.attendanceStatus === "active" && (
        <div className="px-4 py-3 bg-white border-b border-gray-200">
          <div className="text-center mb-3">
            <h3 className="font-semibold text-sm text-gray-900 mb-1">Quick Check-in</h3>
            <p className="text-xs text-gray-500">Scan QR code or use search above</p>
          </div>
          
          <div className="grid grid-cols-2 gap-2">
            <Button
              onClick={() => fileInputRef.current?.click()}
              className="bg-blue-600 hover:bg-blue-700 text-white text-xs h-12"
            >
              <Upload className="w-4 h-4 mr-1" />
              Upload QR
            </Button>
            
            <Button
              onClick={() => {
                // Camera scan functionality
                alert("Camera scanning coming soon!");
              }}
              className="bg-green-600 hover:bg-green-700 text-white text-xs h-12"
            >
              <Camera className="w-4 h-4 mr-1" />
              Scan QR
            </Button>
          </div>
          
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileUpload}
            className="hidden"
          />
        </div>
      )}

      {/* Mobile Attendance Records */}
      {selectedEvent && attendanceRecords.length > 0 && (
        <div className="px-4 py-3 bg-white">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-sm text-gray-900">
              Recent Check-ins ({attendanceRecords.length})
            </h3>
            {attendanceRecords.length > 0 && (
              <Button
                onClick={exportAttendance}
                variant="outline"
                size="sm"
                className="text-xs h-6"
              >
                <Download className="w-3 h-3 mr-1" />
                Export
              </Button>
            )}
          </div>
          
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {attendanceRecords.slice(0, 10).map((record) => (
              <div key={record._id} className="flex items-center justify-between p-2 bg-gray-50 rounded-lg">
                <div className="flex-1">
                  <div className="font-medium text-sm text-gray-900">{record.memberName}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(record.checkInTime).toLocaleTimeString()}
                  </div>
                </div>
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
            ))}
          </div>
          
          {attendanceRecords.length > 10 && (
            <div className="text-center mt-2">
              <p className="text-xs text-gray-500">
                Showing 10 of {attendanceRecords.length} check-ins
              </p>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {selectedEvent && attendanceRecords.length === 0 && (
        <div className="px-4 py-8 text-center">
          <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6 text-gray-400" />
          </div>
          <p className="text-sm text-gray-500 font-medium">No check-ins yet</p>
          <p className="text-xs text-gray-400 mt-1">
            {selectedEvent.enableAttendance 
              ? "Search members or scan QR codes to check in"
              : "Enable attendance to start tracking"
            }
          </p>
        </div>
      )}

      {/* File input ref for QR upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}
