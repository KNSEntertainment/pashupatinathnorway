"use client";
import React from "react";
import GalleryForm from "@/components/GalleryForm";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";

type GalleryItem = {
	_id: string;
	media: string[];
	category?: string;
	classLabel?: string;
	alt?: string;
};

export default function Page() {
	const [gallery, setGallery] = useState<GalleryItem[]>([]);
	const [openModal, setOpenModal] = useState<boolean>(false);
	const [galleryToEdit, setGalleryToEdit] = useState<GalleryItem | null>(null);
	const [error, setError] = useState<string>("");

	const fetchGallery = async (): Promise<GalleryItem[]> => {
		const res = await fetch("/api/gallery");
		const data = await res.json();
		return data.gallery || [];
	};

	const loadGallery = useCallback(async () => {
		try {
			const data = await fetchGallery();
			setGallery(data);
		} catch (err: unknown) {
			if (typeof err === "object" && err !== null && "message" in err) {
				setError("Failed to load gallery: " + (err as { message?: string }).message);
			} else {
				setError("Failed to load gallery: " + String(err));
			}
		} finally {
		}
	}, []);

	useEffect(() => {
		loadGallery();
	}, [loadGallery]);

	const handleEdit = (item: GalleryItem) => {
		setGalleryToEdit(item);
		setOpenModal(!openModal);
	};

	const handleDelete = async (id: string) => {
		if (!window.confirm("Are you sure you want to delete this gallery item?")) return;
		try {
			const res = await fetch(`/api/gallery/${id}`, { method: "DELETE" });
			if (!res.ok) throw new Error("Failed to delete");
			await loadGallery();
		} catch (err: unknown) {
			if (typeof err === "object" && err !== null && "message" in err) {
				alert("Delete failed: " + (err as { message?: string }).message);
			} else {
				alert("Delete failed: " + String(err));
			}
		}
	};

	const handleCloseGalleryModal = () => {
		setOpenModal(false);
		setGalleryToEdit(null);
		loadGallery();
	};

	return (
		<div className="px-4">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Manage Gallery</h1>
				<button
					className="bg-brand_primary text-white px-4 py-2 rounded font-semibold hover:bg-red-800"
					onClick={() => {
						setGalleryToEdit(null);
						setOpenModal(true);
					}}
				>
					Add Gallery Items
				</button>
			</div>

			{error && <div className="mb-4 p-4 bg-red-50 text-red-600 rounded text-center font-semibold">{error}</div>}

			{/* Inline Form Section */}
			{openModal && (
				<div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-brand">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">{galleryToEdit ? "Edit Gallery Item" : "Add New Gallery Item"}</h2>
					<GalleryForm handleCloseGalleryModal={handleCloseGalleryModal} galleryToEdit={galleryToEdit} />
				</div>
			)}

			<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
				{gallery.map((item) => (
					<div key={item._id} className="bg-white rounded shadow p-3 flex flex-col gap-2">
						<div className="flex flex-wrap gap-2">
							{(item.media || []).map((src, i) => (
								<Image key={i} src={src} alt={item.alt || "Gallery image"} width={80} height={80} className="w-20 h-20 object-cover rounded" />
							))}
						</div>
						<div className="font-semibold">{item.category || item.classLabel}</div>
						<div className="flex gap-2 mt-2">
							<button className="bg-brand_primary text-white px-3 py-1 rounded hover:bg-blue-700" onClick={() => handleEdit(item)}>
								Edit
							</button>
							<button className="bg-red-600 text-white px-3 py-1 rounded hover:bg-brand_primary" onClick={() => handleDelete(item._id)}>
								Delete
							</button>
						</div>
					</div>
				))}
			</div>
		</div>
	);
}
