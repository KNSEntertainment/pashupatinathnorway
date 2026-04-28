import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export type Download = {
	_id: string;
	title_en: string;
	title_ne?: string;
	title_no?: string;
	date: string;
	category: string;
	imageUrl?: string;
	fileUrl?: string;
	// Legacy field
	title?: string;
};

export interface DownloadFormProps {
	handleCloseModal: () => void;
	downloadToEdit: Download | null;
}

const getTodayString = () => {
	const today = new Date();
	const yyyy = today.getFullYear();
	const mm = String(today.getMonth() + 1).padStart(2, "0");
	const dd = String(today.getDate()).padStart(2, "0");
	return `${yyyy}-${mm}-${dd}`;
};

const DownloadForm: React.FC<DownloadFormProps> = ({ handleCloseModal, downloadToEdit }) => {
	const [formData, setFormData] = useState({
		title_en: "",
		title_ne: "",
		title_no: "",
		date: getTodayString(),
		file: null as File | null,
		image: null as File | null,
		category: "",
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (downloadToEdit) {
			setFormData({
				title_en: downloadToEdit.title_en || downloadToEdit.title || "",
				title_ne: downloadToEdit.title_ne || "",
				title_no: downloadToEdit.title_no || "",
				date: downloadToEdit.date,
				category: downloadToEdit.category,
				file: null,
				image: null,
			});
		} else {
			setFormData((prev) => ({ ...prev, date: getTodayString() }));
		}
	}, [downloadToEdit]);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError("");
		setSubmitting(true);
		try {
			const form = new FormData();
			(Object.keys(formData) as Array<keyof typeof formData>).forEach((key) => {
				if ((key === "file" || key === "image") && !formData[key]) return;
				// For file fields, append the file, otherwise append the string
				if (key === "file" || key === "image") {
					if (formData[key]) form.append(key, formData[key] as File);
				} else {
					const value = formData[key] as string;
					// Only append non-empty strings
					if (value && value.trim() !== "") {
						form.append(key, value);
					}
				}
			});
			const url = downloadToEdit ? `/api/downloads/${downloadToEdit._id}` : "/api/downloads/create";
			const method = downloadToEdit ? "PUT" : "POST";
			const response = await fetch(url, {
				method,
				body: form,
			});
			const result = await response.json();
			if (!response.ok) throw new Error(result.error || `Failed to ${downloadToEdit ? "update" : "create"} Download`);
			if (result.success) {
				setFormData({ title_en: "", title_ne: "", title_no: "", date: "", file: null, image: null, category: "" });
				const fileInput = document.getElementById("file") as HTMLInputElement;
				if (fileInput) fileInput.value = "";
				const imageInput = document.getElementById("image") as HTMLInputElement;
				if (imageInput) imageInput.value = "";
				alert(`Download ${downloadToEdit ? "updated" : "created"} successfully!`);
				handleCloseModal();
			}
		} catch (error: unknown) {
			let message = "An unknown error occurred.";
			function hasMessage(e: unknown): e is { message: string } {
				return typeof e === "object" && e !== null && "message" in e && typeof (e as { message: unknown }).message === "string";
			}
			if (hasMessage(error)) {
				message = error.message;
			}
			setError(message);
			console.error(`Error ${downloadToEdit ? "updating" : "creating"} Download:`, error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && <div className="bg-red-50 border border-red-6000 text-red-600 px-4 py-3 rounded">{error}</div>}
			<div>
				<label className="block mb-2 font-bold">Title (Multilingual)</label>

				{/* English */}
				<div className="mb-2">
					<label htmlFor="title_en" className="block text-sm mb-1 text-gray-700">
						English *
					</label>
					<input type="text" id="title_en" value={formData.title_en} onChange={(e) => setFormData({ ...formData, title_en: e.target.value })} className="w-full p-2 border rounded" placeholder="Enter title in English" required />
				</div>

				{/* Nepali */}
				<div className="mb-2">
					<label htmlFor="title_ne" className="block text-sm mb-1 text-gray-700">
						Nepali (नेपाली)
					</label>
					<input type="text" id="title_ne" value={formData.title_ne} onChange={(e) => setFormData({ ...formData, title_ne: e.target.value })} className="w-full p-2 border rounded" placeholder="नेपालीमा शीर्षक प्रविष्ट गर्नुहोस्" />
				</div>

				{/* Norwegian */}
				<div className="mb-2">
					<label htmlFor="title_no" className="block text-sm mb-1 text-gray-700">
						Norwegian (Norsk)
					</label>
					<input type="text" id="title_no" value={formData.title_no} onChange={(e) => setFormData({ ...formData, title_no: e.target.value })} className="w-full p-2 border rounded" placeholder="Skriv inn tittel på norsk" />
				</div>
			</div>
			<div>
				<label htmlFor="date" className="block mb-2 font-bold">
					Date
				</label>
				<input type="date" id="date" value={formData.date} onChange={(e) => setFormData({ ...formData, date: e.target.value })} className="w-full p-2 border rounded" required />
			</div>
			<div>
				<label htmlFor="category" className="block mb-2 font-bold">
					Category
				</label>
				<input type="text" id="category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} className="w-full p-2 border rounded" required />
			</div>
			<div>
				<label htmlFor="file" className="block mb-2 font-bold">
					Document File (max 2MB)
				</label>
				<input type="file" id="file" accept=".pdf,.doc,.docx" onChange={(e) => setFormData({ ...formData, file: e.target.files ? e.target.files[0] : null })} className="w-full p-2 border rounded" required={!downloadToEdit} />
			</div>
			<div>
				<label htmlFor="image" className="block mb-2 font-bold">
					Image (max 1MB)
				</label>
				<input type="file" id="image" accept="image/*" onChange={(e) => setFormData({ ...formData, image: e.target.files ? e.target.files[0] : null })} className="w-full p-2 border rounded" />
			</div>
			<div className="grid grid-cols-2 gap-2">
				<button type="submit" disabled={submitting} className={`w-full p-1.5 rounded ${submitting ? "bg-neutral-400 cursor-not-allowed" : "bg-blue-600 hover:bg-brand_primary"} text-neutral-200 font-bold`}>
					{submitting ? `${downloadToEdit ? "Updating..." : "Creating..."}` : `${downloadToEdit ? "Update" : "Create"} Download`}
				</button>
				<Button variant="outline" onClick={handleCloseModal}>
					Close
				</Button>
			</div>
		</form>
	);
};

export default DownloadForm;
