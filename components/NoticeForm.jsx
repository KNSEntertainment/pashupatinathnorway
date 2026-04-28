import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

export default function NoticeForm({ handleCloseNoticeModal, noticeToEdit = null }) {
	const [formData, setFormData] = useState({
		noticetitle: "",
		noticedate: "",
		noticetime: "",
		notice: "",
		noticeimage: null,
		createdBy: "Admin",
	});
	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (noticeToEdit) {
			// Format date for input
			let formattedDate = "";
			if (noticeToEdit.noticedate) {
				const date = new Date(noticeToEdit.noticedate);
				formattedDate = date.toISOString().split("T")[0];
			}
			setFormData({
				...noticeToEdit,
				noticedate: formattedDate,
				noticetime: noticeToEdit.noticetime || "",
				noticeimage: null,
			});
		}
	}, [noticeToEdit]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setError("");
		setSubmitting(true);

		try {
			const form = new FormData();

			Object.keys(formData).forEach((key) => {
				if (key !== "noticeimage" || (key === "noticeimage" && formData[key])) {
					form.append(key, formData[key]);
				}
			});

			const url = noticeToEdit ? `/api/notices/${noticeToEdit._id}` : "/api/notices/create";
			const method = noticeToEdit ? "PUT" : "POST";

			const response = await fetch(url, {
				method: method,
				body: form,
			});

			const result = await response.json();
			if (!response.ok) {
				throw new Error(result.error || `Failed to ${noticeToEdit ? "update" : "create"} Notice`);
			}

			if (result.success) {
				setFormData({
					noticetitle: "",
					noticedate: "",
					noticetime: "",
					notice: "",
					noticeimage: null,
					createdBy: "Admin",
				});
				// Reset image input
				const noticeImageInput = document.getElementById("noticeimage");
				if (noticeImageInput) {
					noticeImageInput.value = "";
				}
				alert(`Notice ${noticeToEdit ? "updated" : "created"} successfully!`);
				handleCloseNoticeModal();
			}
		} catch (error) {
			setError(error.message);
			console.error(`Error ${noticeToEdit ? "updating" : "creating"} Notice:`, error);
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && <div className="bg-red-50 border border-red-6000 text-red-600 px-4 py-3 rounded">{error}</div>}

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label htmlFor="noticetitle" className="block mb-2 font-bold">
						Notice Title
					</label>
					<input type="text" id="noticetitle" value={formData.noticetitle} onChange={(e) => setFormData({ ...formData, noticetitle: e.target.value })} className="w-full p-2 border rounded" required />
				</div>
				<div>
					<label htmlFor="createdBy" className="block mb-2 font-bold">
						Created By
					</label>
					<input type="text" id="createdBy" value={formData.createdBy} onChange={(e) => setFormData({ ...formData, createdBy: e.target.value })} className="w-full p-2 border rounded" required />
				</div>
			</div>

			<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
				<div>
					<label htmlFor="noticedate" className="block mb-2 font-bold">
						Date
					</label>
					<input type="date" id="noticedate" value={formData.noticedate} onChange={(e) => setFormData({ ...formData, noticedate: e.target.value })} className="w-full p-2 border rounded" required />
				</div>
				<div>
					<label htmlFor="noticetime" className="block mb-2 font-bold">
						Time (Optional)
					</label>
					<input type="time" id="noticetime" value={formData.noticetime} onChange={(e) => setFormData({ ...formData, noticetime: e.target.value })} className="w-full p-2 border rounded" />
				</div>
			</div>

			<div>
				<label htmlFor="notice" className="block mb-2 font-bold">
					Notice
				</label>
				<textarea id="notice" value={formData.notice} onChange={(e) => setFormData({ ...formData, notice: e.target.value })} className="w-full p-2 border rounded" rows="2" required></textarea>
			</div>

			<div>
				<label htmlFor="noticeimage" className="block mb-2 font-bold">
					Relevant Poster
				</label>
				<input type="file" id="noticeimage" onChange={(e) => setFormData({ ...formData, noticeimage: e.target.files[0] })} className="w-full p-2 border rounded" />
			</div>

			<div className="grid grid-cols-2 gap-2">
				<button type="submit" disabled={submitting} className={`w-full p-1.5 rounded ${submitting ? "bg-neutral-400 cursor-not-allowed" : "bg-red-600 hover:bg-brand"} text-neutral-200 font-bold`}>
					{submitting ? `${noticeToEdit ? "Updating" : "Creating"} Notice...` : `${noticeToEdit ? "Update" : "Create"} Notice`}
				</button>
				<Button variant="outline" onClick={handleCloseNoticeModal}>
					Close
				</Button>
			</div>
		</form>
	);
}
