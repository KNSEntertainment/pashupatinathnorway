"use client";

import React, { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { Calendar, MapPin, Clock, Users, ArrowLeft, Share2 } from "lucide-react";
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

export default function EventDetailPage() {
  const t = useTranslations("events");
  const params = useParams();
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const eventId = params.id as string;

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/events/${eventId}`);
        const data = await response.json();
        if (data.event) {
          setEvent(data.event);
        } else {
          setError('Event not found');
        }
      } catch {
        setError('Failed to fetch event');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEvent();
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
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-700"></div>
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
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
        
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
        <div className="absolute top-4 right-4 md:top-8 md:right-8 flex gap-2">
          <button
            onClick={handleShare}
            className="p-2 bg-white/90 backdrop-blur-sm text-gray-700 rounded-lg hover:bg-white transition-colors"
            title={t("share_event") || "Share Event"}
          >
            <Share2 className="w-5 h-5" />
          </button>
     
        </div>

        {/* Event Title Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12">
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
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {/* Event Description */}
              <div className="bg-white rounded-xl p-8 shadow-sm">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">
                  {t("about_this_event") || "About This Event"}
                </h2>
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
              <div className="bg-white rounded-xl p-8 shadow-sm">
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
              <div className="bg-white rounded-xl p-6 shadow-sm">
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


              {/* Related Events */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h3 className="text-lg font-bold text-gray-900 mb-4">
                  {t("more_events") || "More Events"}
                </h3>
                <Link
                  href="/events"
                  className="text-red-700 hover:text-red-800 font-medium text-sm"
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
