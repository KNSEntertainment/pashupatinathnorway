"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Calendar, MapPin, Clock, Users, ArrowLeft, Share2 } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import UniversalLoader from "@/components/ui/UniversalLoader";

interface Event {
  _id: string;
  eventname: string;
  eventdate: string;
  eventtime: string;
  eventvenue: string;
  eventdescription?: string;
  eventposterUrl?: string;
}

// Utility function to check if event is today or in the future
const isEventTodayOrFuture = (eventDate: string): boolean => {
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Set to start of day for comparison
  const event = new Date(eventDate);
  return event >= today;
};

export default function EventDetailPage() {
  const t = useTranslations("events");
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [latestEvents, setLatestEvents] = useState<Event[]>([]);
  const [eventFinancials, setEventFinancials] = useState<{ totalIncome: number; totalExpenses: number } | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const eventId = params.id as string;

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Fetch current event
        const eventResponse = await fetch(`/api/events/${eventId}`);
        const eventData = await eventResponse.json();
        
        // Fetch latest events (excluding current event)
        const latestResponse = await fetch('/api/events?limit=3');
        const latestData = await latestResponse.json();
        
        if (eventData.event) {
          setEvent(eventData.event);
        } else {
          setError('Event not found');
          return;
        }
        
        // Filter out current event from latest events and take only 3
        if (latestData.events) {
          const filteredEvents = latestData.events
            .filter((e: Event) => e._id !== eventId)
            .slice(0, 3);
          setLatestEvents(filteredEvents);
        }
        
        // Fetch event financial data (optional, doesn't block main functionality)
        try {
          const financialResponse = await fetch(`/api/events/${eventId}/financials`);
          const financialData = await financialResponse.json();
          
          if (financialData.financials) {
            setEventFinancials(financialData.financials);
          }
        } catch {
          // Financial data is optional, don't fail the entire fetch
          console.log('Financial data not available for this event');
        }
      } catch (error) {
        console.error('Error fetching event data:', error);
        setError('Failed to fetch data');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchData();
    }
  }, [eventId]);

  const handleShare = async () => {
    if (navigator.share && event) {
      try {
        await navigator.share({
          title: event.eventname,
          text: `Join us for ${event.eventname} at Pashupatinath Norway Temple`,
          url: window.location.href,
        });
      } catch {
        // Fallback to copying to clipboard
        await navigator.clipboard.writeText(window.location.href);
        alert("Link copied to clipboard!");
      }
    } else {
      // Fallback for browsers that don't support Web Share API
      await navigator.clipboard.writeText(window.location.href);
      alert("Link copied to clipboard!");
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <UniversalLoader size="lg" variant="spinner" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">
            {t("event_not_found") || "Event Not Found"}
          </h2>
          <p className="text-gray-600 mb-6">
            {t("event_not_found_desc") || "The event you're looking for doesn't exist or has been removed."}
          </p>
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-6 py-3 bg-red-700 text-white font-medium rounded-lg hover:bg-red-800 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("back_to_events") || "Back to Events"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section with Event Image */}
      <div className="relative h-96 md:h-[500px] bg-gray-200">
        <Image
          src={event.eventposterUrl || "/pashupatinath.png"}
          alt={event.eventname}
          fill
          className="object-cover object-top"
          sizes="100vw"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 to-transparent"></div>
        
        {/* Back Button */}
        <div className="absolute top-4 left-4 md:top-8 md:left-8">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm text-gray-900 font-medium rounded-lg hover:bg-white transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            {t("back_to_events") || "Back to Events"}
          </Link>
        </div>

        {/* Action Buttons */}
        <div className="absolute top-4 right-4 md:top-8 md:right-8">
          <button
            onClick={handleShare}
            className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white transition-colors"
            title={t("share_event") || "Share Event"}
          >
            <Share2 className="w-5 h-5" />
          </button>
        </div>

        {/* Event Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-4 md:p-12">
          <div className="container mx-auto">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4">
              {event.eventname}
            </h1>
            <div className="flex flex-wrap gap-4 text-white/90">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span>
                  {new Date(event.eventdate).toLocaleDateString('en-US', { 
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                <span>{event.eventtime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Event Details */}
      <div className="container mx-auto px-4 py-6 md:py-12">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Description */}
              <div className="bg-white rounded-xl p-4 md:p-8 shadow-sm">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">
                    {t("about_this_event") || "About This Event"}
                  </h2>
                  {isEventTodayOrFuture(event.eventdate) ? (
                    <Link
                      href={`/register?eventId=${event._id}`}
                      className="inline-flex justify-center items-center gap-2 px-6 py-3 bg-red-700 text-white font-medium rounded-lg hover:bg-red-800 transition-colors"
                    >
                      {t("register") || "Register"}
                    </Link>
                  ) : (
                    <div className="inline-flex justify-center items-center gap-2 bg-gray-300 text-gray-600 px-6 py-3 rounded-lg font-medium cursor-not-allowed">
                      {t("event_completed") || "Event Completed"}
                    </div>
                  )}
                </div>
                {event.eventdescription ? (
                  <div className="prose prose-lg text-gray-600">
                    <p className="whitespace-pre-wrap">{event.eventdescription}</p>
                  </div>
                ) : (
                  <p className="text-gray-500">
                    {t("no_description") || "No description available for this event."}
                  </p>
                )}
              </div>

              {/* Additional Information */}
              <div className="bg-white rounded-xl p-4 md:p-8 shadow-sm">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  {t("additional_info") || "Additional Information"}
                </h3>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 text-red-700 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {t("location") || "Location"}
                      </h4>
                      <p className="text-gray-600">{event.eventvenue}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <Calendar className="w-5 h-5 text-red-700 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {t("date_time") || "Date & Time"}
                      </h4>
                      <p className="text-gray-600">
                        {new Date(event.eventdate).toLocaleDateString('en-US', { 
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })} at {event.eventtime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Users className="w-5 h-5 text-red-700 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">
                        {t("organizer") || "Organizer"}
                      </h4>
                      <p className="text-gray-600">
                        {t("temple_name") || "Pashupatinath Norway Temple"}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {t("get_involved") || "Get Involved"}
                </h3>
                <div className="space-y-3">
                  <Link
                    href="/membership"
                    className="block w-full text-center px-4 py-3 bg-red-700 text-white font-medium rounded-lg hover:bg-red-800 transition-colors"
                  >
                    {t("become_member") || "Become a Member"}
                  </Link>
                  <Link
                    href="/contact"
                    className="block w-full text-center px-4 py-3 border border-red-700 text-red-700 font-medium rounded-lg hover:bg-red-50 transition-colors"
                  >
                    {t("contact_us") || "Contact Us"}
                  </Link>
                </div>
              </div>

              {/* Event Financial Summary - Only show for completed events */}
              {event && !isEventTodayOrFuture(event.eventdate) && eventFinancials && (
                <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-4">
                    {t("event_financial_summary") || "Event Financial Summary"}
                  </h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">↑</span>
                        </div>
                        <h4 className="font-semibold text-green-800">
                          {t("total_income") || "Total Income"}
                        </h4>
                      </div>
                      <p className="text-2xl font-bold text-green-700">
                        {eventFinancials.totalIncome.toLocaleString('nb-NO', {
                          style: 'currency',
                          currency: 'NOK',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        })}
                      </p>
                    </div>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">↓</span>
                        </div>
                        <h4 className="font-semibold text-red-800">
                          {t("total_expenses") || "Total Expenses"}
                        </h4>
                      </div>
                      <p className="text-2xl font-bold text-red-700">
                        {eventFinancials.totalExpenses.toLocaleString('nb-NO', {
                          style: 'currency',
                          currency: 'NOK',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-600 font-medium">
                        {t("net_result") || "Net Result"}
                      </span>
                      <span className={`text-xl font-bold ${
                        (eventFinancials.totalIncome - eventFinancials.totalExpenses) >= 0 
                          ? 'text-green-600' 
                          : 'text-red-600'
                      }`}>
                        {(eventFinancials.totalIncome - eventFinancials.totalExpenses).toLocaleString('nb-NO', {
                          style: 'currency',
                          currency: 'NOK',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Related Events */}
              <div className="bg-white rounded-xl p-4 md:p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {t("more_events") || "More Events"}
                </h3>
                
                {latestEvents.length > 0 ? (
                  <div className="space-y-3 mb-6">
                    {latestEvents.map((latestEvent) => (
                      <Link
                        key={latestEvent._id}
                        href={`/events/${latestEvent._id}`}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow group"
                      >
                        <div className="relative w-16 h-16 flex-shrink-0">
                          {latestEvent.eventposterUrl ? (
                            <Image
                              src={latestEvent.eventposterUrl}
                              alt={latestEvent.eventname}
                              fill
                              className="object-cover rounded-md"
                            />
                          ) : (
                            <div className="w-full h-full bg-gray-200 rounded-md flex items-center justify-center">
                              <Calendar size={20} className="text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-gray-900 group-hover:text-red-700 transition-colors truncate">
                            {latestEvent.eventname}
                          </h4>
                          <div className="flex items-center gap-2 text-sm text-gray-600 mt-1">
                            <div className="flex items-center gap-1">
                              <Calendar size={12} />
                              {new Date(latestEvent.eventdate).toLocaleDateString()}
                            </div>
                            <div className="flex items-center gap-1">
                              <Clock size={12} />
                              {latestEvent.eventtime}
                            </div>
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm mb-6">
                    {t("no_other_events") || "No other events available at the moment."}
                  </p>
                )}
                
                <Link
                  href="/events"
                  className="text-red-700 hover:text-red-800 font-medium text-sm inline-flex items-center gap-1"
                >
                  {t("view_all_events") || "View All Events"} →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
