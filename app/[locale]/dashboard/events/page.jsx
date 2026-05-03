"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2, Calendar, MapPin, Clock } from "lucide-react";
import Image from "next/image";
import EventForm from "@/components/EventForm";
import useFetchData from "@/hooks/useFetchData";

export default function EventsPage() {
	const [openEventModal, setOpenEventModal] = useState(false);
	const [eventToEdit, setEventToEdit] = useState(null);
	const { data: events, error, loading, mutate } = useFetchData("/api/events", "events");

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

	const handleEdit = (event) => {
		setEventToEdit(event);
		setOpenEventModal(true);
	};

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this event?")) {
			try {
				const response = await fetch(`/api/events/${id}`, {
					method: "DELETE",
				});
				if (!response.ok) {
					throw new Error("Failed to delete event");
				}
				mutate();
			} catch (error) {
				console.error("Error deleting event:", error);
			}
		}
	};

	const handleCloseEventModal = () => {
		setOpenEventModal(false);
		setEventToEdit(null);
		mutate();
	};

	const handleCreateEvent = () => {
		setEventToEdit(null);
		setOpenEventModal(!openEventModal);
	};

	return (
		<div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
			{/* Header Section */}
			<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
				<div>
					<h1 className="text-3xl font-light text-gray-900 tracking-tight">Events</h1>
					<p className="text-sm text-gray-500 mt-1">Manage your temple events and activities</p>
				</div>
				<Button 
					onClick={handleCreateEvent} 
					className="bg-gray-900 text-white hover:bg-gray-800 transition-colors duration-200 shadow-sm"
				>
					{openEventModal ? "Cancel" : "Create Event"}
				</Button>
			</div>

			{/* Form Section */}
			{openEventModal && (
				<div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
					<div className="border-b border-gray-200 pb-4 mb-6">
						<h2 className="text-lg font-medium text-gray-900">
							{eventToEdit ? "Edit Event" : "Create New Event"}
						</h2>
					</div>
					<EventForm handleCloseEventModal={handleCloseEventModal} eventToEdit={eventToEdit} />
				</div>
			)}

			{/* Events Table */}
			<div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
				<div className="overflow-x-auto">
					<Table>
						<TableHeader>
							<TableRow className="border-b border-gray-100 bg-gray-50/50">
								<TableHead className="font-medium text-gray-700 py-4 px-6">Event</TableHead>
								<TableHead className="font-medium text-gray-700 py-4 px-6">Details</TableHead>
								<TableHead className="font-medium text-gray-700 py-4 px-6 text-right">Actions</TableHead>
							</TableRow>
						</TableHeader>
						<TableBody>
							{events.length > 0 ? (
								events.map((event) => (
									<TableRow key={event._id} className="border-b border-gray-100 hover:bg-gray-50/50 transition-colors">
										<TableCell className="py-4 px-6">
											<div className="flex items-start gap-4">
												<div className="relative">
													<Image 
														src={event.eventposterUrl || "/pashupatinath.png"} 
														width={80} 
														height={80} 
														alt={event.eventname || "Event"} 
														className="w-20 h-20 object-cover rounded-lg shadow-sm"
													/>
												</div>
												<div className="flex-1 min-w-0">
													<h3 className="font-medium text-gray-900 text-lg leading-tight mb-1">
														{event.eventname}
													</h3>
													<div className="flex items-center gap-4 text-sm text-gray-500">
														<div className="flex items-center gap-1">
															<Calendar className="w-4 h-4" />
															{event.eventdate}
														</div>
														<div className="flex items-center gap-1">
															<Clock className="w-4 h-4" />
															{event.eventtime}
														</div>
													</div>
												</div>
											</div>
										</TableCell>
										<TableCell className="py-4 px-6">
											<div className="flex items-center gap-2 text-sm text-gray-600">
												<MapPin className="w-4 h-4 text-gray-400" />
												<span>{event.eventvenue}</span>
											</div>
										</TableCell>
										<TableCell className="py-4 px-6">
											<div className="flex items-center justify-end gap-2">
												<Button 
													variant="ghost" 
													size="sm" 
													onClick={() => handleEdit(event)}
													className="h-8 px-3 text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
												>
													<Pencil className="w-4 h-4 mr-1" />
													Edit
												</Button>
												<Button 
													variant="ghost" 
													size="sm" 
													onClick={() => handleDelete(event._id)}
													className="h-8 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 transition-colors"
												>
													<Trash2 className="w-4 h-4 mr-1" />
													Delete
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell colSpan={3} className="text-center py-12">
										<div className="text-center">
											<div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
												<Calendar className="w-8 h-8 text-gray-400" />
											</div>
											<h3 className="text-lg font-medium text-gray-900 mb-1">No events found</h3>
											<p className="text-sm text-gray-500">Get started by creating your first event</p>
										</div>
									</TableCell>
								</TableRow>
							)}
						</TableBody>
					</Table>
				</div>
			</div>
		</div>
	);
}
