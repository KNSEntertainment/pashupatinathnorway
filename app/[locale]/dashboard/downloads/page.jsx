"use client";

import React, { useState } from "react";
import useFetchData from "@/hooks/useFetchData";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Pencil, Trash2 } from "lucide-react";
import Image from "next/image";
import DownloadForm from "@/components/DownloadForm";

// type Download = {
// 	_id: string;
// 	title: string;
// 	date: string;
// 	category: string;
// 	imageUrl?: string;
// 	fileUrl?: string;
// 	// Add other fields as needed
// };

export default function DownloadsDashboardPage() {
	const [openModal, setOpenModal] = useState(false);

	const [downloadToEdit, setDownloadToEdit] = useState(null);
	const { data: downloads, error, loading, mutate } = useFetchData("/api/downloads", "downloads");

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

	const handleEdit = (download) => {
		setDownloadToEdit(download);
		setOpenModal(true);
	};

	const handleDelete = async (id) => {
		if (window.confirm("Are you sure you want to delete this document?")) {
			try {
				const response = await fetch(`/api/downloads/${id}`, { method: "DELETE" });
				if (!response.ok) throw new Error("Failed to delete document");
				mutate();
			} catch (error) {
				console.error("Error deleting document:", error);
				alert("Failed to delete document. Please try again.");
			}
		}
	};

	const handleCloseModal = () => {
		setOpenModal(false);
		setDownloadToEdit(null);
		mutate();
	};

	const handleCreate = () => {
		setDownloadToEdit(null);
		setOpenModal(!openModal);
	};

	return (
		<div className="max-w-6xl">
			<div className="flex justify-between items-center mb-4">
				<h1 className="text-2xl font-bold">Manage Downloads</h1>
				<button onClick={handleCreate} className="bg-brand text-neutral-200 font-bold px-4 py-2 rounded hover:bg-red-700 transition-colors">
					{openModal ? "Cancel" : "Create Download"}
				</button>
			</div>

			{/* Inline Form Section */}
			{openModal && (
				<div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-brand">
					<h2 className="text-lg font-bold text-white bg-brand p-4 mb-4 text-center rounded">{downloadToEdit ? "Edit Download" : "Create Download"}</h2>
					<DownloadForm handleCloseModal={handleCloseModal} downloadToEdit={downloadToEdit} />
				</div>
			)}
			<div className="bg-white rounded-lg shadow">
				<Table>
					<TableHeader>
						<TableRow>
							<TableHead>Title</TableHead>
							<TableHead>Date</TableHead>
							<TableHead>Category</TableHead>
							<TableHead>Image</TableHead>
							<TableHead>File</TableHead>
							<TableHead>Actions</TableHead>
						</TableRow>
					</TableHeader>
					<TableBody>
						{downloads.length > 0 ? (
							downloads.map((doc) => (
								<TableRow key={doc._id}>
									<TableCell className="w-48 font-semibold">{doc.title}</TableCell>
									<TableCell className="w-48">{doc.date}</TableCell>
									<TableCell className="w-48">{doc.category}</TableCell>
									<TableCell className="w-24">{doc.imageUrl ? <Image src={doc.imageUrl} width={64} height={64} alt={doc.title} className="w-16 h-16 rounded object-cover" /> : <span className="text-gray-900">No Image</span>}</TableCell>
									<TableCell className="w-24">
										{doc.fileUrl ? (
											<a href={doc.fileUrl} target="_blank" rel="noopener noreferrer" className="text-brand underline">
												Download
											</a>
										) : (
											<span className="text-gray-900">No File</span>
										)}
									</TableCell>
									<TableCell>
										<div className="flex space-x-2">
											<Button variant="ghost" size="icon" onClick={() => handleEdit(doc)}>
												<Pencil className="w-6 h-6 text-brand" />
											</Button>
											<Button variant="ghost" size="icon" onClick={() => handleDelete(doc._id)}>
												<Trash2 className="w-6 h-6 text-red-600" />
											</Button>
										</div>
									</TableCell>
								</TableRow>
							))
						) : (
							<TableRow>
								<TableCell colSpan={6} className="text-red-600">
									No downloads found.
								</TableCell>
							</TableRow>
						)}
					</TableBody>
				</Table>
			</div>
		</div>
	);
}
