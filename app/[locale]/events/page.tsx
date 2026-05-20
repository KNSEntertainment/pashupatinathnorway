"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Calendar, MapPin, Clock, Users, ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { Link } from "@/i18n/navigation";

interface Event {
  _id: string;
  eventname: string;
  eventdate: string;
  eventtime: string;
  eventvenue: string;
  eventdescription?: string;
  eventposterUrl?: string;
}

export default function EventsPage() {
  const t = useTranslations("events");
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const eventsPerPage = 6;

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/events");
      const data = await response.json();
      
      if (data.success) {
        setEvents(data.events);
      } else {
        setError("Failed to load events");
      }
    } catch {
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  // Pagination logic
  const indexOfLastEvent = currentPage * eventsPerPage;
  const indexOfFirstEvent = indexOfLastEvent - eventsPerPage;
  const currentEvents = events.slice(indexOfFirstEvent, indexOfLastEvent);
  const totalPages = Math.ceil(events.length / eventsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-brand_primary">
        <div className="container mx-auto px-4 py-16 lg:py-24">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              {t("title") || "Upcoming Events"}
            </h1>
            <p className="text-xl md:text-2xl text-gray-800 mb-8">
              {t("subtitle") || "Join us for spiritual gatherings, cultural celebrations, and community events"}
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm md:text-base">
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Calendar className="w-5 h-5" />
                <span>{t("regular_events") || "Regular Events"}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <Users className="w-5 h-5" />
                <span>{t("community_gatherings") || "Community Gatherings"}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-full">
                <MapPin className="w-5 h-5" />
                <span>{t("temple_location") || "Temple Location"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Content */}
      <div className="container mx-auto px-4 py-12 lg:py-16">
        {events.length === 0 ? (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              {t("no_events") || "No Events Scheduled"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto">
              {t("no_events_desc") || "Check back soon for upcoming events and activities at Pashupatinath Norway Temple"}
            </p>
          </div>
        ) : (
          <>
            {/* Events Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {currentEvents.map((event) => (
                <div
                  key={event._id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300"
                >
                  {/* Event Image */}
                  <div className="relative h-48 bg-gray-200">
                    <Image
                      src={event.eventposterUrl || "/pashupatinath.png"}
                      alt={event.eventname}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full">
                      <span className="text-sm font-medium text-red-700">
                        {new Date(event.eventdate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          day: 'numeric' 
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Event Content */}
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
                      {event.eventname}
                    </h3>
                    
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
                    </div>

                    {event.eventdescription && (
                      <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                        {event.eventdescription}
                      </p>
                    )}

                    <Link
                      href={`/events/${event._id}`}
                      className="inline-flex items-center gap-2 text-red-700 hover:text-red-800 font-medium text-sm transition-colors"
                    >
                      {t("view_details") || "View Details"}
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ChevronLeft className="w-4 h-4" />
                  {t("previous") || "Previous"}
                </button>

                <div className="flex space-x-1">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        currentPage === number
                          ? "bg-red-700 text-white"
                          : "bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {number}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {t("next") || "Next"}
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </>
        )}

        {/* Call to Action */}
        <div className="mt-16 bg-gradient-to-r from-red-700 to-red-800 rounded-2xl p-8 md:p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            {t("cta_title") || "Stay Connected"}
          </h2>
          <p className="text-xl text-red-100 mb-8 max-w-2xl mx-auto">
            {t("cta_description") || "Join our community and never miss an event. Subscribe to our newsletter for updates on upcoming activities."}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/membership"
              className="inline-flex items-center justify-center px-6 py-3 bg-white text-red-700 font-medium rounded-lg hover:bg-gray-100 transition-colors"
            >
              {t("become_member") || "Become a Member"}
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center justify-center px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-500 transition-colors"
            >
              {t("contact_us") || "Contact Us"}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
