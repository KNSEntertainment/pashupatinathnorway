"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, X, Edit, Trash2, Upload } from "lucide-react";
import Image from "next/image";

const categories = [
	{ value: "health", label: "Health" },
	{ value: "education", label: "Education" },
	{ value: "emergency", label: "Emergency" },
	{ value: "infrastructure", label: "Infrastructure" },
	{ value: "community", label: "Community" },
	{ value: "other", label: "Other" }
];

const statuses = [
	{ value: "active", label: "Active", color: "bg-green-500" },
	{ value: "completed", label: "Completed", color: "bg-blue-500" },
	{ value: "paused", label: "Paused", color: "bg-yellow-500" },
	{ value: "cancelled", label: "Cancelled", color: "bg-red-500" }
];

const urgencies = [
	{ value: "low", label: "Low", color: "bg-gray-500" },
	{ value: "medium", label: "Medium", color: "bg-orange-500" },
	{ value: "high", label: "High", color: "bg-red-500" },
	{ value: "critical", label: "Critical", color: "bg-red-700" }
];

export default function CausesManagement() {
	const [causes, setCauses] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState("");
	const [isDialogOpen, setIsDialogOpen] = useState(false);
	const [editingCause, setEditingCause] = useState(null);
	const [posterFile, setPosterFile] = useState(null);
	const [posterPreview, setPosterPreview] = useState("");

	const [formData, setFormData] = useState({
		title: { en: "", no: "", ne: "" },
		description: { en: "", no: "", ne: "" },
		category: "",
		goalAmount: "",
		status: "active",
		urgency: "medium",
		poster: "",
		endDate: "",
		featured: false
	});

	useEffect(() => {
		fetchCauses();
	}, []);

	const fetchCauses = async () => {
		try {
			const response = await fetch("/api/causes");
			const data = await response.json();
			if (response.ok) {
				setCauses(data.causes);
			} else {
				setError(data.error || "Failed to fetch causes");
			}
		} catch {
			setError("Failed to fetch causes");
		} finally {
			setLoading(false);
		}
	};

	const resetForm = () => {
		setFormData({
			title: { en: "", no: "", ne: "" },
			description: { en: "", no: "", ne: "" },
			category: "",
			goalAmount: "",
			status: "active",
			urgency: "medium",
			poster: "",
			endDate: "",
			featured: false
		});
		setPosterFile(null);
		setPosterPreview("");
		setEditingCause(null);
	};

	const handleEdit = async (cause) => {
		try {
			// Fetch the full cause data with multilingual fields
			const response = await fetch(`/api/causes/${cause._id}`);
			const data = await response.json();
			
			console.log("API Response:", data);
			
			if (response.ok && data.cause) {
				const fullCause = data.cause;
				console.log("Full cause data:", fullCause);
				console.log("Title data:", fullCause.title);
				console.log("Description data:", fullCause.description);
				
				setEditingCause(fullCause);
				
				const formDataToSet = {
					title: fullCause.title || { en: "", no: "", ne: "" },
					description: fullCause.description || { en: "", no: "", ne: "" },
					category: fullCause.category || "",
					goalAmount: fullCause.goalAmount?.toString() || "",
					status: fullCause.status || "active",
					urgency: fullCause.urgency || "medium",
					poster: fullCause.poster || "",
					endDate: fullCause.endDate ? new Date(fullCause.endDate).toISOString().split('T')[0] : "",
					featured: fullCause.featured || false
				};
				
				console.log("Form data being set:", formDataToSet);
				setFormData(formDataToSet);
				setPosterPreview(fullCause.poster || "");
				setIsDialogOpen(true);
			} else {
				setError("Failed to fetch cause details");
			}
		} catch (error) {
			console.error("Error fetching cause details:", error);
			setError("Failed to fetch cause details");
		}
	};

	const handleDelete = async (id) => {
		if (!confirm("Are you sure you want to delete this cause?")) return;

		try {
			const response = await fetch(`/api/causes/${id}`, {
				method: "DELETE"
			});

			if (response.ok) {
				fetchCauses();
			} else {
				const data = await response.json();
				setError(data.error || "Failed to delete cause");
			}
		} catch {
			setError("Failed to delete cause");
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			// Upload poster to Cloudinary if a new file is selected
			let posterUrl = formData.poster;
			if (posterFile) {
				try {
					// Create a signed upload request to our API instead of direct Cloudinary
					const uploadFormData = new FormData();
					uploadFormData.append('file', posterFile);
					uploadFormData.append('folder', 'causes/posters');

					const uploadResponse = await fetch('/api/upload', {
						method: 'POST',
						body: uploadFormData
					});

					if (uploadResponse.ok) {
						const uploadData = await uploadResponse.json();
						posterUrl = uploadData.url; // The API returns 'url' not 'secure_url'
						console.log('Poster uploaded successfully:', posterUrl);
					} else {
						const errorData = await uploadResponse.json();
						console.error('Upload failed:', errorData);
						throw new Error(errorData.error || 'Failed to upload poster');
					}
				} catch (uploadError) {
					console.error('Poster upload error:', uploadError);
					// Don't throw error, just log it and continue without poster
					// This allows the cause to be saved even if poster upload fails
					setError('Warning: Poster upload failed, but cause was saved without poster');
				}
			}

			const url = editingCause ? `/api/causes/${editingCause._id}` : "/api/causes";
			const method = editingCause ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				headers: {
					"Content-Type": "application/json"
				},
				body: JSON.stringify({
					...formData,
					poster: posterUrl,
					goalAmount: parseFloat(formData.goalAmount)
				})
			});

			if (response.ok) {
				setIsDialogOpen(false);
				resetForm();
				fetchCauses();
			} else {
				const data = await response.json();
				setError(data.error || "Failed to save cause");
			}
		} catch {
			setError("Failed to save cause");
		} finally {
			setLoading(false);
		}
	};

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;
		
		if (name.includes('.')) {
			const [parentField, locale] = name.split('.');
			setFormData(prev => ({
				...prev,
				[parentField]: {
					...prev[parentField],
					[locale]: value
				}
			}));
		} else {
			setFormData(prev => ({
				...prev,
				[name]: type === "checkbox" ? checked : value
			}));
		}
	};

	const handlePosterChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			setPosterFile(file);
			const reader = new FileReader();
			reader.onloadend = () => {
				setPosterPreview(reader.result);
			};
			reader.readAsDataURL(file);
		}
	};

	const getStatusBadge = (status) => {
		const statusInfo = statuses.find(s => s.value === status);
		return (
			<Badge className={`${statusInfo?.color || 'bg-gray-500'} text-white`}>
				{statusInfo?.label || status}
			</Badge>
		);
	};

	const getUrgencyBadge = (urgency) => {
		const urgencyInfo = urgencies.find(u => u.value === urgency);
		return (
			<Badge className={`${urgencyInfo?.color || 'bg-gray-500'} text-white`}>
				{urgencyInfo?.label || urgency}
			</Badge>
		);
	};

	if (loading && causes.length === 0) {
		return <div className="flex justify-center items-center h-64">Loading...</div>;
	}

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Causes Management</h1>
				<Button onClick={() => { setIsDialogOpen(true); resetForm(); }}>
					<Plus className="h-4 w-4 mr-2" />
					Add New Cause
				</Button>
			</div>

			{error && (
				<div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
					{error}
				</div>
			)}

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{causes.map((cause) => (
					<Card key={cause._id} className="relative">
						<CardHeader>
							<div className="flex justify-between items-start">
								<CardTitle className="text-lg">{cause.title}</CardTitle>
								<div className="flex gap-2">
									<Button variant="ghost" size="sm" onClick={() => handleEdit(cause)}>
										<Edit className="h-4 w-4" />
									</Button>
									<Button variant="ghost" size="sm" onClick={() => handleDelete(cause._id)}>
										<Trash2 className="h-4 w-4" />
									</Button>
								</div>
							</div>
							<div className="flex gap-2 flex-wrap">
								{getStatusBadge(cause.status)}
								{getUrgencyBadge(cause.urgency)}
								{cause.featured && (
									<Badge className="bg-purple-500 text-white">Featured</Badge>
								)}
							</div>
						</CardHeader>
						<CardContent>
							{cause.image && (
								<div className="relative w-full h-48 mb-4 rounded-lg overflow-hidden">
									<Image
										src={cause.image}
										alt={cause.title}
										fill
										className="object-cover"
									/>
								</div>
							)}
							<p className="text-gray-600 mb-4 line-clamp-3">{cause.description}</p>
							
							<div className="space-y-2">
								<div className="flex justify-between text-sm">
									<span>Progress:</span>
									<span className="font-semibold">
										NOK {cause.currentAmount?.toLocaleString() || 0} / NOK {cause.goalAmount?.toLocaleString() || 0}
									</span>
								</div>
								<Progress value={cause.progressPercentage || 0} className="h-2" />
								<div className="flex justify-between text-sm text-gray-500">
									<span>{cause.progressPercentage?.toFixed(1) || 0}%</span>
									<span>{cause.donationCount || 0} donations</span>
								</div>
							</div>
							
							<div className="mt-4 text-sm text-gray-500">
								<p>Category: {categories.find(c => c.value === cause.category)?.label}</p>
								{cause.endDate && (
									<p>End Date: {new Date(cause.endDate).toLocaleDateString()}</p>
								)}
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
				<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
					<DialogHeader>
						<div className="flex items-center justify-between">
							<DialogTitle>
								{editingCause ? "Edit Cause" : "Create New Cause"}
							</DialogTitle>
					
						</div>
					</DialogHeader>

					<form onSubmit={handleSubmit} className="space-y-6">
						{/* Title Fields */}
						<div className="space-y-4">
							<Label className="text-lg font-semibold">Title *</Label>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<Label htmlFor="title.en">English *</Label>
									<Input
										id="title.en"
										name="title.en"
										value={formData.title.en}
										onChange={handleChange}
										required
										placeholder="Enter cause title (English)"
									/>
								</div>
								<div>
									<Label htmlFor="title.no">Norwegian *</Label>
									<Input
										id="title.no"
										name="title.no"
										value={formData.title.no}
										onChange={handleChange}
										required
										placeholder="Enter cause title (Norwegian)"
									/>
								</div>
								<div>
									<Label htmlFor="title.ne">Nepali *</Label>
									<Input
										id="title.ne"
										name="title.ne"
										value={formData.title.ne}
										onChange={handleChange}
										required
										placeholder="Enter cause title (Nepali)"
									/>
								</div>
							</div>
						</div>

						{/* Description Fields */}
						<div className="space-y-4">
							<Label className="text-lg font-semibold">Description *</Label>
							<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
								<div>
									<Label htmlFor="description.en">English *</Label>
									<Textarea
										id="description.en"
										name="description.en"
										value={formData.description.en}
										onChange={handleChange}
										required
										placeholder="Enter cause description (English)"
										rows={3}
									/>
								</div>
								<div>
									<Label htmlFor="description.no">Norwegian *</Label>
									<Textarea
										id="description.no"
										name="description.no"
										value={formData.description.no}
										onChange={handleChange}
										required
										placeholder="Enter cause description (Norwegian)"
										rows={3}
									/>
								</div>
								<div>
									<Label htmlFor="description.ne">Nepali *</Label>
									<Textarea
										id="description.ne"
										name="description.ne"
										value={formData.description.ne}
										onChange={handleChange}
										required
										placeholder="Enter cause description (Nepali)"
										rows={3}
									/>
								</div>
							</div>
						</div>

						{/* Category and Goal */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="category">Category *</Label>
								<Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
									<SelectTrigger>
										<SelectValue placeholder="Select category" />
									</SelectTrigger>
									<SelectContent>
										{categories.map(cat => (
											<SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="goalAmount">Goal Amount (NOK) *</Label>
								<Input
									id="goalAmount"
									name="goalAmount"
									type="number"
									value={formData.goalAmount}
									onChange={handleChange}
									required
									placeholder="10000"
									min="0"
								/>
							</div>
						</div>

						{/* Poster Upload */}
						<div className="space-y-4">
							<Label className="text-lg font-semibold">Cause Poster</Label>
							<div className="space-y-2">
								<div className="flex items-center gap-2">
									<Upload className="w-4 h-4" />
									<Label htmlFor="poster">Upload Poster (Optional)</Label>
								</div>
								<Input
									id="poster"
									type="file"
									accept="image/*"
									onChange={handlePosterChange}
									className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-brand file:text-white hover:file:bg-brand/90"
								/>
								{posterPreview && (
									<div className="mt-2">
										<div className="relative w-full h-32 rounded-lg overflow-hidden border">
											<Image
												src={posterPreview}
												alt="Poster preview"
												fill
												className="object-cover"
											/>
										</div>
										<Button
											type="button"
											variant="outline"
											size="sm"
											onClick={() => {
												setPosterFile(null);
												setPosterPreview("");
											}}
											className="mt-2"
										>
											<X className="w-4 h-4 mr-1" />
											Remove Poster
										</Button>
									</div>
								)}
							</div>
						</div>

						{/* Status and Urgency */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="status">Status</Label>
								<Select value={formData.status} onValueChange={(value) => setFormData(prev => ({ ...prev, status: value }))}>
									<SelectTrigger>
										<SelectValue placeholder="Select status" />
									</SelectTrigger>
									<SelectContent>
										{statuses.map(status => (
											<SelectItem key={status.value} value={status.value}>{status.label}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
							<div>
								<Label htmlFor="urgency">Urgency</Label>
								<Select value={formData.urgency} onValueChange={(value) => setFormData(prev => ({ ...prev, urgency: value }))}>
									<SelectTrigger>
										<SelectValue placeholder="Select urgency" />
									</SelectTrigger>
									<SelectContent>
										{urgencies.map(urgency => (
											<SelectItem key={urgency.value} value={urgency.value}>{urgency.label}</SelectItem>
										))}
									</SelectContent>
								</Select>
							</div>
						</div>

						{/* End Date and Featured */}
						<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
							<div>
								<Label htmlFor="endDate">End Date (Optional)</Label>
								<Input
									id="endDate"
									name="endDate"
									type="date"
									value={formData.endDate}
									onChange={handleChange}
								/>
							</div>
							<div className="flex items-center space-x-2 pt-6">
								<input
									type="checkbox"
									id="featured"
									name="featured"
									checked={formData.featured}
									onChange={handleChange}
									className="rounded border-gray-300"
								/>
								<Label htmlFor="featured">Featured Cause</Label>
							</div>
						</div>

						{error && (
							<div className="text-red-600 text-sm">{error}</div>
						)}

						<div className="flex justify-end gap-3 pt-4">
							<Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
								Cancel
							</Button>
							<Button type="submit" disabled={loading}>
								{loading ? "Saving..." : (editingCause ? "Update Cause" : "Create Cause")}
							</Button>
						</div>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
