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
		eventposter2: null,
		eventposter3: null,
		eventvideo: null,
		removeEventPoster2: false,
		removeEventPoster3: false,
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (eventToEdit) {
			const eventDateValue = eventToEdit.eventdate ? String(eventToEdit.eventdate).split("T")[0] : "";
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
				eventposter2: null,
				eventposter3: null,
				eventvideo: null,
				removeEventPoster2: false,
				removeEventPoster3: false,
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
				if (key === "removeEventPoster2" || key === "removeEventPoster3") return;
				if (payload[key]) {
					form.append(key, payload[key]);
				}
			});
			if (formData.removeEventPoster2) {
				form.append("removeEventPoster2", "true");
			}
			if (formData.removeEventPoster3) {
				form.append("removeEventPoster3", "true");
			}

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
				});
				// Reset eventposter input
				const eventposterInput = document.getElementById("eventposter");
				if (eventposterInput) {
					eventposterInput.value = "";
				}
				const eventposterInput2 = document.getElementById("eventposter2");
				if (eventposterInput2) {
					eventposterInput2.value = "";
				}
				const eventposterInput3 = document.getElementById("eventposter3");
				if (eventposterInput3) {
					eventposterInput3.value = "";
				}
				const eventvideoInput = document.getElementById("eventvideo");
				if (eventvideoInput) {
					eventvideoInput.value = "";
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
				<div>
					<label htmlFor="eventposter2" className="block mb-2 font-bold">
						Event Poster 2
					</label>
					<input type="file" id="eventposter2" onChange={(e) => setFormData({ ...formData, eventposter2: e.target.files[0] })} disabled={formData.removeEventPoster2} className="w-full p-2 border rounded" />
					{eventToEdit?.eventposter2Url && (
						<div className="mt-2 flex items-center gap-3">
							<Image src={eventToEdit.eventposter2Url} alt="Current poster 2" className="h-16 w-16 rounded object-cover border" width={64} height={64} />
							<label className="flex items-center gap-2 text-sm text-gray-700">
								<input
									type="checkbox"
									checked={formData.removeEventPoster2}
									onChange={(e) => {
										const checked = e.target.checked;
										setFormData({ ...formData, removeEventPoster2: checked, eventposter2: checked ? null : formData.eventposter2 });
									}}
								/>
								Remove this image
							</label>
						</div>
					)}
				</div>
				<div>
					<label htmlFor="eventposter3" className="block mb-2 font-bold">
						Event Poster 3
					</label>
					<input type="file" id="eventposter3" onChange={(e) => setFormData({ ...formData, eventposter3: e.target.files[0] })} disabled={formData.removeEventPoster3} className="w-full p-2 border rounded" />
					{eventToEdit?.eventposter3Url && (
						<div className="mt-2 flex items-center gap-3">
							<Image src={eventToEdit.eventposter3Url} alt="Current poster 3" className="h-16 w-16 rounded object-cover border" width={64} height={64} />
							<label className="flex items-center gap-2 text-sm text-gray-700">
								<input
									type="checkbox"
									checked={formData.removeEventPoster3}
									onChange={(e) => {
										const checked = e.target.checked;
										setFormData({ ...formData, removeEventPoster3: checked, eventposter3: checked ? null : formData.eventposter3 });
									}}
								/>
								Remove this image
							</label>
						</div>
					)}
				</div>
				<div>
					<label htmlFor="eventvideo" className="block mb-2 font-bold">
						Event Video
					</label>
					<input type="file" id="eventvideo" onChange={(e) => setFormData({ ...formData, eventvideo: e.target.files[0] })} className="w-full p-2 border rounded" />
				</div>
				<div className="grid gap-2">
					<button type="submit" disabled={submitting} className={`w-full p-1.5 rounded ${submitting ? "bg-neutral-400 cursor-not-allowed" : "bg-red-600 hover:bg-brand"} text-neutral-200 font-bold`}>
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
