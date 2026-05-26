import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useState, useEffect } from "react";

export default function EventForm({ handleCloseEventModal, eventToEdit = null }) {
	const toSafeString = (value) => (value === null || value === undefined ? "" : String(value));

	const [formData, setFormData] = useState({
		eventname: "",
		eventdescription: "",
		eventvenue: "",
		eventdate: "",
		eventtime: "",
		eventposter: null,
		// New pricing and registration fields
		memberPrice: "",
		guestPrice: "",
		allowGuestRegistration: true,
		registrationDeadline: "",
		maxAttendees: "",
		// Festival linkage fields
		festivalId: "",
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [festivals, setFestivals] = useState([]);

	useEffect(() => {
		// Fetch festivals for dropdown
		const fetchFestivals = async () => {
			try {
				const response = await fetch("/api/festivals");
				const data = await response.json();
				// Handle both array response and object with success property
				console.log("Festivals API response:", data);
				if (Array.isArray(data)) {
					console.log("Setting festivals from array:", data.length);
					setFestivals(data);
				} else if (data.success && data.festivals) {
					console.log("Setting festivals from object:", data.festivals.length);
					setFestivals(data.festivals);
				} else {
					console.log("No festivals found, setting empty array");
					setFestivals([]);
				}
			} catch (error) {
				console.error("Error fetching festivals:", error);
				setFestivals([]);
			}
		};
		fetchFestivals();
	}, []);

	useEffect(() => {
		if (eventToEdit) {
			const eventDateValue = eventToEdit.eventdate ? String(eventToEdit.eventdate).split("T")[0] : "";
			const registrationDeadlineValue = eventToEdit.registrationDeadline ? String(eventToEdit.registrationDeadline).split("T")[0] : "";
			const stringKeys = ["eventname", "eventdescription", "eventvenue", "eventtime"];
			const sanitizedStrings = stringKeys.reduce((acc, key) => {
				acc[key] = toSafeString(eventToEdit[key]);
				return acc;
			}, {});
			setFormData((prev) => ({
				...prev,
				...sanitizedStrings,
				eventdate: eventDateValue,
				eventposter: null,
				// New pricing and registration fields
				memberPrice: eventToEdit.memberPrice ? String(eventToEdit.memberPrice) : "",
				guestPrice: eventToEdit.guestPrice ? String(eventToEdit.guestPrice) : "",
				allowGuestRegistration: eventToEdit.allowGuestRegistration ?? true,
				registrationDeadline: registrationDeadlineValue,
				maxAttendees: eventToEdit.maxAttendees ? String(eventToEdit.maxAttendees) : "",
				// Festival linkage fields
				festivalId: eventToEdit.festivalId || "",
			}));
		}
	}, [eventToEdit]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSubmitting(true);

		try {
			const form = new FormData();
			const payload = { ...formData };
			Object.keys(payload).forEach((key) => {
					// Always include festivalId field, even if empty (to set it to null)
					if (key === 'festivalId' || payload[key]) {
					form.append(key, payload[key]);
				}
			});

			const url = eventToEdit ? `/api/events/${eventToEdit._id}` : "/api/events/create";
			const method = eventToEdit ? "PUT" : "POST";

			const response = await fetch(url, {
				method: method,
				body: form,
			});

			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error || `Failed to ${eventToEdit ? "update" : "create"} event`);
			}

			if (result.success) {
				setFormData({
					eventname: "",
					eventdescription: "",
					eventvenue: "",
					eventdate: "",
					eventtime: "",
					eventposter: null,
					eventposter2: null,
					eventposter3: null,
					eventvideo: null,
					removeEventPoster2: false,
					removeEventPoster3: false,
					// New pricing and registration fields
					memberPrice: "",
					guestPrice: "",
					allowGuestRegistration: true,
					registrationDeadline: "",
					maxAttendees: "",
					// Festival linkage fields
					festivalId: "",
				});
				// Reset eventposter input
				const eventposterInput = document.getElementById("eventposter");
				if (eventposterInput) {
					eventposterInput.value = "";
				}
				alert(`Event ${eventToEdit ? "updated" : "created"} successfully!`);
				handleCloseEventModal();
			}
		} catch (error) {
			setError(error.message);
			console.error(`Error ${eventToEdit ? "updating" : "creating"} event:`, error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="max-h-[calc(100vh-200px)] overflow-y-auto">
			<form onSubmit={handleSubmit} className="space-y-1 grid grid-cols-1 md:grid-cols-2 gap-6">
				{error && <div className="bg-red-50 border border-red-6000 text-red-600 px-4 py-3 rounded">{error}</div>}
				<div>
					<label htmlFor="eventname" className="block mb-2 font-bold">
						Name of Event
					</label>
					<input type="text" id="eventname" value={formData.eventname} onChange={(e) => setFormData({ ...formData, eventname: e.target.value })} className="w-full p-2 border rounded" required />
				</div>
				<div>
					<label htmlFor="eventvenue" className="block mb-2 font-bold">
						Event Venue
					</label>
					<input id="eventvenue" value={formData.eventvenue} onChange={(e) => setFormData({ ...formData, eventvenue: e.target.value })} className="w-full p-2 border rounded" />
				</div>
				<div>
					<label htmlFor="eventdescription" className="block mb-2 font-bold">
						Description of Event
					</label>
					<textarea id="eventdescription" value={formData.eventdescription} onChange={(e) => setFormData({ ...formData, eventdescription: e.target.value })} className="w-full p-2 border rounded" rows={1} required />
				</div>

				<div>
					<label htmlFor="eventdate" className="block mb-2 font-bold">
						Event Date
					</label>
					<input type="date" id="eventdate" value={formData.eventdate} onChange={(e) => setFormData({ ...formData, eventdate: e.target.value })} className="w-full p-2 border rounded" />
				</div>
				<div>
					<label htmlFor="eventtime" className="block mb-2 font-bold">
						Event Time
					</label>
					<input type="text" id="eventtime" value={formData.eventtime} onChange={(e) => setFormData({ ...formData, eventtime: e.target.value })} className="w-full p-2 border rounded" />
				</div>

				{/* Festival Linkage Fields */}
				<div className="md:col-span-2 border-t pt-4">
					<h3 className="text-lg font-semibold mb-4 text-gray-800">Festival Linkage Settings</h3>
				</div>

				<div>
					<label htmlFor="festivalId" className="block mb-2 font-bold">
						Associated Festival
					</label>
					<select 
						id="festivalId" 
						value={formData.festivalId} 
						onChange={(e) => setFormData({ ...formData, festivalId: e.target.value })} 
						className="w-full p-2 border rounded"
					>
						<option value="">None (General Event)</option>
						{festivals.map((festival) => {
							console.log("Rendering festival option:", festival.title);
							return (
								<option key={festival._id} value={festival._id}>
									{typeof festival.title === 'string' ? festival.title : 
									 (festival.title?.en || festival.title?.no || festival.title?.ne || 'Unknown Festival')}
								</option>
							);
						})}
					</select>
					<p className="text-xs text-gray-500 mt-1">Select the festival this event belongs to (optional)</p>
				</div>

				{/* New Pricing and Registration Fields */}
				<div className="md:col-span-2 border-t pt-4">
					<h3 className="text-lg font-semibold mb-4 text-gray-800">Pricing & Registration Settings</h3>
				</div>

				<div>
					<label htmlFor="memberPrice" className="block mb-2 font-bold">
						Member Price (kr)
					</label>
					<input 
						type="number" 
						id="memberPrice" 
						value={formData.memberPrice} 
						onChange={(e) => setFormData({ ...formData, memberPrice: e.target.value })} 
						className="w-full p-2 border rounded" 
						min="0" 
						step="0.01"
						placeholder="0.00"
					/>
					<p className="text-xs text-gray-500 mt-1">Price for registered members</p>
				</div>

				<div>
					<label htmlFor="guestPrice" className="block mb-2 font-bold">
						Guest Price (kr)
					</label>
					<input 
						type="number" 
						id="guestPrice" 
						value={formData.guestPrice} 
						onChange={(e) => setFormData({ ...formData, guestPrice: e.target.value })} 
						className="w-full p-2 border rounded" 
						min="0" 
						step="0.01"
						placeholder="0.00"
					/>
					<p className="text-xs text-gray-500 mt-1">Price for non-members</p>
				</div>

				<div>
					<label htmlFor="registrationDeadline" className="block mb-2 font-bold">
						Registration Deadline
					</label>
					<input 
						type="date" 
						id="registrationDeadline" 
						value={formData.registrationDeadline} 
						onChange={(e) => setFormData({ ...formData, registrationDeadline: e.target.value })} 
						className="w-full p-2 border rounded"
					/>
					<p className="text-xs text-gray-500 mt-1">Last date for registration (optional)</p>
				</div>

				<div>
					<label htmlFor="maxAttendees" className="block mb-2 font-bold">
						Maximum Attendees
					</label>
					<input 
						type="number" 
						id="maxAttendees" 
						value={formData.maxAttendees} 
						onChange={(e) => setFormData({ ...formData, maxAttendees: e.target.value })} 
						className="w-full p-2 border rounded" 
						min="1"
						placeholder="Unlimited"
					/>
					<p className="text-xs text-gray-500 mt-1">Leave empty for unlimited</p>
				</div>

				<div className="md:col-span-2">
					<label className="flex items-center gap-2 mb-2">
						<input
							type="checkbox"
							id="allowGuestRegistration"
							checked={formData.allowGuestRegistration}
							onChange={(e) => setFormData({ ...formData, allowGuestRegistration: e.target.checked })}
							className="rounded"
						/>
						<span className="font-bold">Allow Guest Registration</span>
					</label>
					<p className="text-xs text-gray-500">Enable non-members to register for this event</p>
				</div>

				<div>
					<label htmlFor="eventposter" className="block mb-2 font-bold">
						Event Main Poster
					</label>
					<input type="file" id="eventposter" onChange={(e) => setFormData({ ...formData, eventposter: e.target.files[0] })} className="w-full p-2 border rounded" />
					{eventToEdit?.eventposterUrl && (
						<div className="mt-2 flex items-center gap-3">
							<Image src={eventToEdit.eventposterUrl} alt="Current main poster" className="h-16 w-16 rounded object-cover border" width={64} height={64} />
							<span className="text-sm text-gray-700">Current image</span>
						</div>
					)}
				</div>
								<div className="grid gap-2">
					<button type="submit" disabled={submitting} className={`w-full p-1.5 rounded ${submitting ? "bg-neutral-400 cursor-not-allowed" : "bg-red-600 text-gray-100 hover:bg-brand_primary"} hover:text-gray-700 font-bold`}>
						{submitting ? `${eventToEdit ? "Updating" : "Creating"} Event...` : `${eventToEdit ? "Update" : "Create"} Event`}
					</button>
					<Button variant="outline" onClick={handleCloseEventModal}>
						Close
					</Button>
				</div>
			</form>
		</div>
	);
}
