"use client";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";

export default function GalleryForm({ handleCloseGalleryModal, galleryToEdit }) {
	const [formData, setFormData] = useState({
		media: [],
		category: "",
		alt_en: "",
		alt_ne: "",
		alt_no: "",
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (galleryToEdit) {
			setFormData({
				media: [],
				category: galleryToEdit.category || "",
				alt_en: galleryToEdit.alt_en || galleryToEdit.alt || "",
				alt_ne: galleryToEdit.alt_ne || "",
				alt_no: galleryToEdit.alt_no || "",
			});
		}
	}, [galleryToEdit]);

	const handleFileChange = (e) => {
		const files = Array.from(e.target.files);
		if (files.length > 6) {
			alert("You can only upload up to 6 images.");
			return;
		}
		setFormData({ ...formData, media: files });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSubmitting(true);

		try {
			const form = new FormData();
			form.append("category", formData.category);
			form.append("alt_en", formData.alt_en);
			form.append("alt_ne", formData.alt_ne);
			form.append("alt_no", formData.alt_no);

			formData.media.forEach((file) => {
				form.append("media", file);
			});

			const url = galleryToEdit ? `/api/gallery/${galleryToEdit._id}` : "/api/gallery/create";
			const method = galleryToEdit ? "PUT" : "POST";

			const response = await fetch(url, {
				method: method,
				body: form,
			});

			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error || `Failed to ${galleryToEdit ? "update" : "create"} gallery item`);
			}

			if (result.success) {
				setFormData({
					media: [],
					category: "",
					alt_en: "",
					alt_ne: "",
					alt_no: "",
				});
				alert(`Gallery item ${galleryToEdit ? "updated" : "created"} successfully!`);
				handleCloseGalleryModal();
			}
		} catch (error) {
			setError(error.message);
			console.error(`Error ${galleryToEdit ? "updating" : "creating"} gallery item:`, error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && <div className="bg-red-50 border border-red-6000 text-red-600 px-4 py-3 rounded">{error}</div>}

			<div>
				<label htmlFor="media" className="block mb-2 font-bold">
					Media Files (Max 6)
				</label>
				<input type="file" id="media" multiple onChange={handleFileChange} className="w-full p-2 border rounded" accept="image/*" required={!galleryToEdit} />
			</div>

			<div>
				<label htmlFor="category" className="block mb-2 font-bold">
					Enter Tag - meaningful category for images
				</label>
				<input type="text" id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 border rounded" placeholder="e.g. Field trip" />
			</div>

			<div>
				<label htmlFor="alt_en" className="block mb-2 font-bold">
					Album Title (English)
				</label>
				<input type="text" id="alt_en" value={formData.alt_en} onChange={(e) => setFormData({ ...formData, alt_en: e.target.value })} className="w-full p-2 border rounded" placeholder="e.g. Annual Conference 2025" required />
			</div>

			<div>
				<label htmlFor="alt_ne" className="block mb-2 font-bold">
					Album Title (Nepali - नेपाली)
				</label>
				<input type="text" id="alt_ne" value={formData.alt_ne} onChange={(e) => setFormData({ ...formData, alt_ne: e.target.value })} className="w-full p-2 border rounded" placeholder="उदा. वार्षिक सम्मेलन २०२५" required />
			</div>

			<div>
				<label htmlFor="alt_no" className="block mb-2 font-bold">
					Album Title (Norwegian - Norsk)
				</label>
				<input type="text" id="alt_no" value={formData.alt_no} onChange={(e) => setFormData({ ...formData, alt_no: e.target.value })} className="w-full p-2 border rounded" placeholder="f.eks. Årlig konferanse 2025" required />
			</div>

			<div className="grid grid-cols-2 gap-2">
				<button type="submit" disabled={submitting} className={`w-full p-1.5 rounded ${submitting ? "bg-neutral-400 cursor-not-allowed" : "bg-red-600 hover:bg-brand"} text-neutral-200 font-bold`}>
					{submitting ? `${galleryToEdit ? "Updating" : "Creating"} Gallery Item...` : `${galleryToEdit ? "Update" : "Create"} Gallery Item`}
				</button>
				<Button variant="outline" onClick={handleCloseGalleryModal}>
					Close
				</Button>
			</div>
		</form>
	);
}
