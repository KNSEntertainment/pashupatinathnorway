"use client";

import React, { useState } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
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
		<div className="w-full max-w-full px-2 sm:px-6">
			<div className="flex flex-col sm:flex-row sm:justify-between items-stretch gap-2 mb-4">
				<h1 className="text-2xl font-bold">Manage Events</h1>
				<button onClick={handleCreateEvent} className="bg-brand_primary text-gray-700 font-bold px-4 py-2 rounded w-full sm:w-auto text-center hover:bg-red-700 transition-colors">
					{openEventModal ? "Cancel" : "Create Event"}
				</button>
			</div>

			{/* Inline Form Section */}
			{openEventModal && (
				<div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg mb-6 border-2 border-brand">
					<h2 className="text-base sm:text-lg font-bold text-white bg-brand_primary p-2 sm:p-4 mb-4 text-center rounded">{eventToEdit ? "Edit Event" : "Create Event"}</h2>
					<EventForm handleCloseEventModal={handleCloseEventModal} eventToEdit={eventToEdit} />
				</div>
			)}
			<div className="bg-white rounded-lg shadow overflow-x-auto">
				<Table className="min-w-[700px]">
					<TableHeader>
						<TableRow>
							<TableHead>Event Name</TableHead>
							<TableHead>Event Description</TableHead>
							<TableHead>Event Venue</TableHead>
							<TableHead>Event Date</TableHead>
							<TableHead>Event Time</TableHead>
							<TableHead>Poster</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{events.length > 0 ? (
							events.map((event) => (
								<TableRow key={event._id}>
									<TableCell className="font-semibold max-w-40 truncate whitespace-normal break-words">{event.eventname}</TableCell>
									<TableCell className="max-w-40 truncate whitespace-normal break-words">{event.eventdescription}</TableCell>
									<TableCell>{event.eventvenue}</TableCell>
									<TableCell className="w-24">{event.eventdate}</TableCell>
									<TableCell className="w-28">{event.eventtime}</TableCell>
									<TableCell>
										<Image src={event.eventposterUrl || "/pashupatinath.png"} width={100} height={100} alt={event.eventname || "alt"} className="w-16 h-20 object-cover rounded" />
									</TableCell>
									<TableCell>
										<div className="flex flex-col sm:flex-row gap-2">
											<Button variant="ghost" size="icon" onClick={() => handleEdit(event)} className="w-8 h-8">
												<Pencil className="w-5 h-5 text-brand_primary" />
											</Button>
											<Button variant="ghost" size="icon" onClick={() => handleDelete(event._id)} className="w-8 h-8">
												<Trash2 className="w-5 h-5 text-red-600" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={7} className="text-center">
									No events found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
