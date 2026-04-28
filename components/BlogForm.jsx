"use client";

import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

const Editor = dynamic(() => import("./Editor"), {
	ssr: false,
	loading: () => <p>Loading editor...</p>,
});

export default function BlogForm({ handleCloseBlogModal, blogToEdit = null }) {
	const [formData, setFormData] = useState({
		blogTitle_en: "",
		blogTitle_ne: "",
		blogTitle_no: "",
		blogDesc_en: "",
		blogDesc_ne: "",
		blogDesc_no: "",
		blogMainPicture: null,
		blogSecondPicture: null,
		blogDate: "",
	});

	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [activeTab, setActiveTab] = useState("en");

	// Load existing blog
	useEffect(() => {
		if (blogToEdit) {
			setFormData({
				blogTitle_en: blogToEdit.blogTitle_en || "",
				blogTitle_ne: blogToEdit.blogTitle_ne || "",
				blogTitle_no: blogToEdit.blogTitle_no || "",
				blogDesc_en: blogToEdit.blogDesc_en || "",
				blogDesc_ne: blogToEdit.blogDesc_ne || "",
				blogDesc_no: blogToEdit.blogDesc_no || "",
				blogDate: blogToEdit.blogDate || "",
				blogMainPicture: null,
				blogSecondPicture: null,
			});
		}
	}, [blogToEdit]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setError("");

		try {
			const form = new FormData();

			Object.keys(formData).forEach((key) => {
				if (formData[key]) {
					form.append(key, formData[key]);
				}
			});

			const url = blogToEdit ? `/api/blogs/${blogToEdit._id}` : "/api/blogs/create";

			const response = await fetch(url, {
				method: blogToEdit ? "PUT" : "POST",
				body: form,
			});

			const result = await response.json();

			if (!response.ok) throw new Error(result.error);

			alert("Success!");
			handleCloseBlogModal();
		} catch (err) {
			setError(err.message);
		} finally {
			setSubmitting(false);
		}
	};

	const getDesc = () => {
		if (activeTab === "en") return formData.blogDesc_en;
		if (activeTab === "ne") return formData.blogDesc_ne;
		return formData.blogDesc_no;
	};

	const setDesc = (value) => {
		if (activeTab === "en") {
			setFormData((p) => ({ ...p, blogDesc_en: value }));
		} else if (activeTab === "ne") {
			setFormData((p) => ({ ...p, blogDesc_ne: value }));
		} else {
			setFormData((p) => ({ ...p, blogDesc_no: value }));
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-4">
			{error && <div className="text-red-500">{error}</div>}

			<input type="date" value={formData.blogDate} onChange={(e) => setFormData({ ...formData, blogDate: e.target.value })} />

			{/* Tabs */}
			<div className="flex gap-2">
				{["en", "ne", "no"].map((lang) => (
					<button key={lang} type="button" onClick={() => setActiveTab(lang)}>
						{lang}
					</button>
				))}
			</div>

			{/* Title */}
			<input
				value={formData[`blogTitle_${activeTab}`]}
				onChange={(e) =>
					setFormData({
						...formData,
						[`blogTitle_${activeTab}`]: e.target.value,
					})
				}
				placeholder="Title"
			/>

			{/* Editor */}
			<Editor value={getDesc()} onChange={setDesc} placeholder="Write blog..." />

			<button type="submit" disabled={submitting}>
				{submitting ? "Saving..." : "Save"}
			</button>

			<Button onClick={handleCloseBlogModal}>Close</Button>
		</form>
	);
}
