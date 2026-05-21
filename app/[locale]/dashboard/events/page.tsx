"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Calendar, MapPin, Clock, Users, Ticket, ArrowRight, CreditCard, Star } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface Event {
  _id: string;
  eventname: string;
  eventdate: string;
  eventtime: string;
  eventvenue: string;
  eventdescription?: string;
  eventposterUrl?: string;
  memberPrice?: number;
  guestPrice?: number;
  maxAttendees?: number;
  registrationDeadline?: string;
}

interface EventRegistration {
  _id: string;
  eventId: Event;
  registrationType: string;
  registrationStatus: string;
  paymentStatus: string;
  attendeeCount: number;
  registrationId: string;
  createdAt: string;
  membershipRef?: {
    firstName: string;
    lastName: string;
    email: string;
    membershipId: string;
  };
}

export default function MemberEventsPage() {
  const [activeEvents, setActiveEvents] = useState<EventRegistration[]>([]);
  const [pastEvents, setPastEvents] = useState<EventRegistration[]>([]);
  const [upcomingEvents, setUpcomingEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);

  const fetchEventData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch all events
      const eventsResponse = await fetch("/api/events");
      const eventsData = await eventsResponse.json();
      
      if (!eventsData.success) {
        throw new Error("Failed to fetch events");
      }

      // Fetch user registrations
      const registrationsResponse = await fetch("/api/event-registration");
      const registrationsData = await registrationsResponse.json();

      const allEvents = eventsData.events;
      const userRegistrations = Array.isArray(registrationsData) 
        ? registrationsData.filter((reg: EventRegistration) => 
            reg.membershipRef?.email === userEmail
          )
        : [];

      // Categorize events
      const now = new Date();
      const active: EventRegistration[] = [];
      const past: EventRegistration[] = [];
      const upcoming: Event[] = [];

      // Process registered events
      userRegistrations.forEach((registration: EventRegistration) => {
        if (registration.eventId && registration.eventId.eventdate) {
          const eventDate = new Date(registration.eventId.eventdate);
          if (eventDate >= now && registration.registrationStatus === "registered") {
            active.push(registration);
          } else if (eventDate < now) {
            past.push(registration);
          }
        }
      });

      // Process upcoming events (not registered yet)
      allEvents.forEach((event: Event) => {
        const eventDate = new Date(event.eventdate);
        const isRegistered = userRegistrations.some((reg: EventRegistration) => 
          reg.eventId?._id === event._id
        );
        
        if (eventDate >= now && !isRegistered) {
          upcoming.push(event);
        }
      });

      // Sort events by date
      active.sort((a, b) => new Date(a.eventId.eventdate).getTime() - new Date(b.eventId.eventdate).getTime());
      past.sort((a, b) => new Date(b.eventId.eventdate).getTime() - new Date(a.eventId.eventdate).getTime());
      upcoming.sort((a, b) => new Date(a.eventdate).getTime() - new Date(b.eventdate).getTime());

      setActiveEvents(active);
      setPastEvents(past);
      setUpcomingEvents(upcoming);
    } catch (error) {
      console.error("Error fetching event data:", error);
      setError("Failed to load event data");
    } finally {
      setLoading(false);
    }
  }, [userEmail]);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      const user = JSON.parse(userData);
      setUserEmail(user.email);
    }
    fetchEventData();
  }, [fetchEventData]);

  const generateQRCode = (registrationId: string) => {
    // This would integrate with a QR code library
    // For now, return a placeholder URL
    return `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${registrationId}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">Oops! Something went wrong</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Events</h1>
          <p className="text-gray-600">Manage your event tickets and discover upcoming events</p>
        </div>

        {/* Active Events with QR Codes */}
        {activeEvents.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Ticket className="w-6 h-6 text-green-600" />
              Active Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {activeEvents.map((registration) => (
                <Card key={registration._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <CardHeader className="bg-gradient-to-r from-green-600 to-green-700 text-white">
                    <CardTitle className="text-lg">{registration.eventId.eventname}</CardTitle>
                    <div className="flex items-center gap-2 text-green-100 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(registration.eventId.eventdate).toLocaleDateString()}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{registration.eventId.eventtime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{registration.eventId.eventvenue}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{registration.attendeeCount} Attendees</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm capitalize">{registration.paymentStatus}</span>
                      </div>
                    </div>
                    
                    {/* QR Code Section */}
                    <div className="mt-6 text-center">
                      <div className="inline-block p-4 bg-white rounded-lg shadow-sm border">
                        <Image   
                          src={generateQRCode(registration.registrationId)}
                          alt="Event QR Code"
                          width={128}
                          height={128}
                        />
                        <p className="text-xs text-gray-500 mt-2">Registration ID: {registration.registrationId}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Past Events */}
        {pastEvents.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Star className="w-6 h-6 text-blue-600" />
              Past Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pastEvents.map((registration) => (
                <Card key={registration._id} className="overflow-hidden hover:shadow-lg transition-shadow opacity-75">
                  <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white">
                    <CardTitle className="text-lg">{registration.eventId.eventname}</CardTitle>
                    <div className="flex items-center gap-2 text-blue-100 text-sm">
                      <Calendar className="w-4 h-4" />
                      {new Date(registration.eventId.eventdate).toLocaleDateString()}
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{registration.eventId.eventtime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{registration.eventId.eventvenue}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Users className="w-4 h-4" />
                        <span className="text-sm">{registration.attendeeCount} Attendees</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <CreditCard className="w-4 h-4" />
                        <span className="text-sm capitalize">{registration.paymentStatus}</span>
                      </div>
                    </div>
                    <div className="mt-4 p-3 bg-gray-100 rounded-lg text-center">
                      <span className="text-sm text-gray-600 font-medium">Event Completed</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* Upcoming Events */}
        {upcomingEvents.length > 0 && (
          <section className="mb-12">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-purple-600" />
              Upcoming Events
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingEvents.map((event) => (
                <Card key={event._id} className="overflow-hidden hover:shadow-lg transition-shadow">
                  <div className="relative h-48 bg-gray-200">
                    <Image
                      src={event.eventposterUrl || "/pashupatinath.png"}
                      alt={event.eventname}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                  </div>
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3">{event.eventname}</h3>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-gray-600">
                        <Calendar className="w-4 h-4" />
                        <span className="text-sm">
                          {new Date(event.eventdate).toLocaleDateString('en-US', { 
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span className="text-sm">{event.eventtime}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <MapPin className="w-4 h-4" />
                        <span className="text-sm">{event.eventvenue}</span>
                      </div>
                      {(event.memberPrice || event.guestPrice) && (
                        <div className="flex items-center gap-2 text-gray-600">
                          <CreditCard className="w-4 h-4" />
                          <span className="text-sm">
                            {event.memberPrice && `Member: ${event.memberPrice} NOK`}
                            {event.memberPrice && event.guestPrice && " | "}
                            {event.guestPrice && `Guest: ${event.guestPrice} NOK`}
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {event.eventdescription && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {event.eventdescription}
                      </p>
                    )}

                    <Link
                      href={`/register?eventId=${event._id}`}
                      className="inline-flex items-center justify-center w-full gap-2 bg-purple-600 text-white hover:bg-purple-700 px-4 py-2 rounded-lg font-medium text-sm transition-colors"
                    >
                      <ArrowRight className="w-4 h-4" />
                      Register Now
                    </Link>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>
        )}

        {/* No Events State */}
        {activeEvents.length === 0 && pastEvents.length === 0 && upcomingEvents.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">No Events Found</h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              You haven&apos;t registered for any events yet, and there are no upcoming events available.
            </p>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 bg-red-700 text-white hover:bg-red-800 px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Browse All Events
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
