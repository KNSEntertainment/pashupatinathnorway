"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Plus, Pencil, Trash2 } from "lucide-react";
import CircularForm from "@/components/CircularForm";

interface Circular {
	_id: string;
	circularTitle: Map<string, string> | { en: string; no: string; ne: string } | string;
	circularDesc: Map<string, string> | { en: string; no: string; ne: string } | string;
	circularAuthor: Map<string, string> | { en: string; no: string; ne: string } | string;
	publicationStatus: string;
	circularPublishedAt?: string;
	circularPdfUrl?: string;
	circularMainPicture?: string;
	circularSecondPicture?: string;
	createdAt: string;
}

// Helper function to safely get localized value from MongoDB Map (serialized as object)
const getLocalizedValue = (field: Record<string, unknown> | Map<string, unknown> | string | null | undefined, key: string): string => {
	if (!field) return "";
	
	// Handle string type (direct value)
	if (typeof field === 'string') {
		return field;
	}
	
	// Handle Map type (rare, but possible)
	if (field instanceof Map) {
		return (field.get(key) as string) || "";
	}
	
	// Handle Object type (most common - MongoDB Map serialized to object)
	if (typeof field === 'object' && field !== null) {
		const fieldObj = field as Record<string, unknown>;
		// Try direct key access first (for {en: "", no: "", ne: ""} structure)
		if (fieldObj[key]) {
			return (fieldObj[key] as string) || "";
		}
		
		// Try all available keys and return the first non-empty string
		const keys = Object.keys(field);
		for (const fieldKey of keys) {
			const value = field[fieldKey];
			if (value && typeof value === 'string' && value.trim() !== '') {
				return value;
			}
		}
		
		// If no non-empty values found, return the first value anyway
		if (keys.length > 0) {
			const firstValue = field[keys[0]];
			if (typeof firstValue === 'string') {
				return firstValue;
			}
		}
	}
	
	// Handle string type (fallback)
	if (typeof field === 'string') {
		return field;
	}
	
	return "";
};

// Helper function to convert Map to Object for form
const mapToObject = (field: Record<string, unknown> | Map<string, unknown> | string | null | undefined): { en: string; no: string; ne: string } => {
	return {
		en: getLocalizedValue(field, "en"),
		no: getLocalizedValue(field, "no"),
		ne: getLocalizedValue(field, "ne"),
	};
};

export default function CircularsPage() {
	const [circulars, setCirculars] = useState<Circular[]>([]);
	const [loading, setLoading] = useState(true);
	const [showForm, setShowForm] = useState(false);
	const [selectedCircular, setSelectedCircular] = useState<Circular | null>(null);

	const fetchCirculars = async () => {
		setLoading(true);
		try {
			const response = await fetch("/api/circulars");
			const data = await response.json();
			if (data.success) {
				setCirculars(data.circulars);
			}
		} catch (error) {
			console.error("Error fetching circulars:", error);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		fetchCirculars();
	}, []);

	const handleEdit = (circular: Circular) => {
		setSelectedCircular(circular);
		setShowForm(true);
	};

	const handleDelete = async (id: string) => {
		if (!confirm("Are you sure you want to delete this circular?")) return;

		try {
			const response = await fetch(`/api/circulars/${id}`, {
				method: "DELETE",
			});
			const data = await response.json();
			if (data.success) {
				fetchCirculars();
			} else {
				alert(`Error: ${data.error}`);
			}
		} catch (error) {
			console.error("Error deleting circular:", error);
			alert("Failed to delete circular");
		}
	};

	const handleCloseForm = () => {
		setShowForm(false);
		setSelectedCircular(null);
	};

	const handleFormSuccess = () => {
		fetchCirculars();
	};

	const getStatusBadge = (status: string) => {
		const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
			published: "default",
			draft: "secondary",
			archived: "outline",
		};
		return <Badge variant={variants[status] || "secondary"}>{status}</Badge>;
	};

	return (
		<div className="container mx-auto py-8 px-4">
			{/* Header with Add Button */}
			<div className="flex justify-between items-center mb-6">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Circulars Management</h1>
					<p className="text-gray-900 mt-1">Create and manage circulars with multi-language support</p>
				</div>
				<Button onClick={() => setShowForm(!showForm)} className="gap-2 bg-brand hover:bg-brand/90">
					{showForm ? (
						"Cancel"
					) : (
						<>
							<Plus className="h-4 w-4" /> Add Circular
						</>
					)}
				</Button>
			</div>

			{/* Inline Form Section */}
			{showForm && (
				<div className="bg-white p-6 rounded-lg shadow-lg mb-6 border-2 border-brand">
					<h2 className="text-2xl font-bold text-gray-900 mb-4">{selectedCircular ? "Edit Circular" : "Add New Circular"}</h2>
					<CircularForm 
					circular={selectedCircular ? {
						...selectedCircular,
						circularTitle: mapToObject(selectedCircular.circularTitle),
						circularDesc: mapToObject(selectedCircular.circularDesc),
						circularAuthor: mapToObject(selectedCircular.circularAuthor),
					} : undefined} 
					onClose={handleCloseForm} 
					onSuccess={handleFormSuccess} 
				/>
				</div>
			)}

			{/* Circulars Table */}
			<Card>
				<CardContent className="pt-6">
					{loading ? (
						<div className="text-center py-8">Loading circulars...</div>
					) : circulars.length === 0 ? (
						<div className="text-center py-8 text-gray-900">No circulars found. Click &quot;Add Circular&quot; to create your first circular.</div>
					) : (
						<Table>
							<TableHeader>
								<TableRow>
									<TableHead>Title (EN)</TableHead>
									<TableHead>Author (EN)</TableHead>
									<TableHead>Status</TableHead>
									<TableHead>Published Date</TableHead>
									<TableHead>Created</TableHead>
									<TableHead className="text-right">Actions</TableHead>
								</TableRow>
							</TableHeader>
							<TableBody>
								{circulars.map((circular: Circular) => (
									<TableRow key={circular._id}>
										<TableCell className="font-medium">{getLocalizedValue(circular.circularTitle, "en") || "No title"}</TableCell>
										<TableCell>{getLocalizedValue(circular.circularAuthor, "en") || "N/A"}</TableCell>
										<TableCell>{getStatusBadge(circular.publicationStatus)}</TableCell>
										<TableCell>{circular.circularPublishedAt ? new Date(circular.circularPublishedAt).toLocaleDateString() : "Not set"}</TableCell>
										<TableCell>{new Date(circular.createdAt).toLocaleDateString()}</TableCell>
										<TableCell className="text-right">
											<div className="flex justify-end gap-2">
												<Button variant="outline" size="sm" onClick={() => handleEdit(circular)} className="gap-1">
													<Pencil className="h-3 w-3" />
													Edit
												</Button>
												<Button variant="destructive" size="sm" onClick={() => handleDelete(circular._id)} className="gap-1">
													<Trash2 className="h-3 w-3" />
													Delete
												</Button>
											</div>
										</TableCell>
									</TableRow>
								))}
							</TableBody>
						</Table>
					)}
				</CardContent>
			</Card>
		</div>
	);
}
