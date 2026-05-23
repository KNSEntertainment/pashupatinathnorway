"use client";

import React, { useState, useEffect } from "react";
import { Calendar, MapPin, Clock, Users, Plus, Edit, Trash2, Search } from "lucide-react";
import Image from "next/image";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardPageLayout from "@/components/layout/DashboardPageLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import EventForm from "@/components/EventForm";

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
  createdAt: string;
  updatedAt: string;
}

export default function EventsManagementPage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState<"all" | "upcoming" | "past">("all");
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/events");
      const data = await response.json();
      
      if (!data.success) {
        throw new Error("Failed to fetch events");
      }
      
      setEvents(data.events || []);
    } catch (error) {
      console.error("Error fetching events:", error);
      setError("Failed to load events");
    } finally {
      setLoading(false);
    }
  };

  const filteredEvents = events.filter(event => {
    const matchesSearch = event.eventname.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         event.eventvenue.toLowerCase().includes(searchTerm.toLowerCase());
    
    const eventDate = new Date(event.eventdate);
    const now = new Date();
    
    const matchesFilter = filterStatus === "all" || 
                         (filterStatus === "upcoming" && eventDate >= now) ||
                         (filterStatus === "past" && eventDate < now);
    
    return matchesSearch && matchesFilter;
  });

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return;
    
    try {
      const response = await fetch(`/api/events/${eventId}`, {
        method: "DELETE",
      });
      
      if (!response.ok) {
        throw new Error("Failed to delete event");
      }
      
      fetchEvents(); // Refresh the list
    } catch (error) {
      console.error("Error deleting event:", error);
      alert("Failed to delete event");
    }
  };

  const getEventStatus = (eventDate: string) => {
    const date = new Date(eventDate);
    const now = new Date();
    return date >= now ? "upcoming" : "past";
  };

  const getStatusBadge = (eventDate: string) => {
    const status = getEventStatus(eventDate);
    return (
      <Badge className={status === "upcoming" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}>
        {status === "upcoming" ? "Upcoming" : "Past"}
      </Badge>
    );
  };

  const handleCloseEventModal = () => {
    setShowEventForm(false);
    setEditingEvent(null);
    fetchEvents(); // Refresh the events list after creating/updating
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
    <DashboardPageLayout
      title="Events Management"
      description="Create, edit, and manage organization events"
      icon="Calendar"
    >
      <div className="space-y-6">
        {/* Header Actions */}
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={filterStatus === "all" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("all")}
              >
                All
              </Button>
              <Button
                variant={filterStatus === "upcoming" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("upcoming")}
              >
                Upcoming
              </Button>
              <Button
                variant={filterStatus === "past" ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterStatus("past")}
              >
                Past
              </Button>
            </div>
          </div>
          <Button
            onClick={() => setShowEventForm(true)}
            className="bg-red-700 hover:bg-red-800"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Event
          </Button>
        </div>

        {/* Events Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event) => (
            <Card key={event._id} className="overflow-hidden hover:shadow-lg transition-shadow">
              <div className="relative h-48 bg-gray-200">
                <Image
                  src={event.eventposterUrl || "/pashupatinath.png"}
                  alt={event.eventname}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute top-2 right-2">
                  {getStatusBadge(event.eventdate)}
                </div>
              </div>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg line-clamp-1">{event.eventname}</CardTitle>
                    <div className="flex items-center gap-2 text-gray-600 text-sm mt-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(event.eventdate).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 mb-4">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm">{event.eventtime}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="w-4 h-4" />
                    <span className="text-sm line-clamp-1">{event.eventvenue}</span>
                  </div>
                  {(event.memberPrice || event.guestPrice) && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <Users className="w-4 h-4" />
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

                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      setEditingEvent(event);
                      setShowEventForm(true);
                    }}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Edit
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:border-red-300"
                    onClick={() => handleDeleteEvent(event._id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-16">
            <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <Calendar className="w-10 h-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-semibold text-gray-900 mb-3">
              {searchTerm || filterStatus !== "all" ? "No Events Found" : "No Events Yet"}
            </h3>
            <p className="text-gray-600 max-w-md mx-auto mb-8">
              {searchTerm || filterStatus !== "all" 
                ? "Try adjusting your search or filter criteria."
                : "Start by creating your first event to get started."
              }
            </p>
            {!searchTerm && filterStatus === "all" && (
              <Button
                onClick={() => setShowEventForm(true)}
                className="bg-red-700 hover:bg-red-800"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Your First Event
              </Button>
            )}
          </div>
        )}

        {/* Event Form Modal */}
        {showEventForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">
                  {editingEvent ? "Edit Event" : "Create New Event"}
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCloseEventModal}
                >
                  ×
                </Button>
              </div>
              <EventForm 
                handleCloseEventModal={handleCloseEventModal}
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                eventToEdit={editingEvent as any}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardPageLayout>
  );
}
