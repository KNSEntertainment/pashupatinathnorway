"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Upload } from "lucide-react";
import Image from "next/image";

export default function HeroSlideForm({ slide, onClose, onSuccess }) {
	const [formData, setFormData] = useState({
		title: {
			en: typeof slide?.title === "string" ? slide.title : slide?.title?.en || "",
			no: slide?.title?.no || "",
			ne: slide?.title?.ne || "",
		},
		description: {
			en: typeof slide?.description === "string" ? slide.description : slide?.description?.en || "",
			no: slide?.description?.no || "",
			ne: slide?.description?.ne || "",
		},
		image: slide?.image || "",
		primaryLink: slide?.primaryLink || "",
		primaryButton: {
			en: typeof slide?.primaryButton === "string" ? slide.primaryButton : slide?.primaryButton?.en || "",
			no: slide?.primaryButton?.no || "",
			ne: slide?.primaryButton?.ne || "",
		},
		secondaryLink: slide?.secondaryLink || "",
		secondaryButton: {
			en: typeof slide?.secondaryButton === "string" ? slide.secondaryButton : slide?.secondaryButton?.en || "",
			no: slide?.secondaryButton?.no || "",
			ne: slide?.secondaryButton?.ne || "",
		},
		isActive: slide?.isActive !== undefined ? slide.isActive : true,
		order: slide?.order || 0,
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [imageFile, setImageFile] = useState(null);
	const [imagePreview, setImagePreview] = useState(slide?.image || "");
	const [uploadingImage, setUploadingImage] = useState(false);

	const handleChange = (e) => {
		const { name, value, type, checked } = e.target;

		// Handle nested locale fields (e.g., "title.en", "description.no")
		if (name.includes(".")) {
			const [parentField, locale] = name.split(".");
			setFormData((prev) => ({
				...prev,
				[parentField]: {
					...prev[parentField],
					[locale]: type === "checkbox" ? checked : value,
				},
			}));
		} else {
			// Handle regular fields
			setFormData((prev) => ({
				...prev,
				[name]: type === "checkbox" ? checked : value,
			}));
		}
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		console.log("File selected:", file?.name, "Size:", file?.size);
		if (file) {
			// Create preview immediately
			const reader = new FileReader();
			reader.onloadend = () => {
				console.log("Preview created");
				setImagePreview(reader.result);
			};
			reader.onerror = () => {
				console.error("Failed to read file");
				setError("Failed to read file");
			};
			reader.readAsDataURL(file);

			// Upload the image immediately
			console.log("Auto-uploading image...");
			uploadImageImmediately(file);
		}
	};

	const uploadImageImmediately = async (file) => {
		setUploadingImage(true);
		try {
			const uploadFormData = new FormData();
			uploadFormData.append("file", file);
			uploadFormData.append("folder", "hero_slides");

			console.log("=== Auto-Uploading Image ===");
			console.log("File:", file.name, "Size:", file.size);
			if (slide) {
				console.log("Editing slide - Old image URL:", slide.image);
			}

			console.log("Sending upload request...");
			const response = await fetch("/api/upload", {
				method: "POST",
				body: uploadFormData,
			});

			console.log("Upload response status:", response.status);

			if (!response.ok) {
				const errorText = await response.text();
				console.error("Upload error response:", errorText);
				throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
			}

			const result = await response.json();
			console.log("Upload successful!");
			console.log("New image URL:", result.url);

			// Update both formData and state
			setImageFile(null); // Clear file since it's uploaded
			setFormData((prev) => ({
				...prev,
				image: result.url,
			}));
			setError(""); // Clear any previous errors
			console.log("=== Image upload complete ===");
		} catch (error) {
			console.error("Upload error:", error);
			setError(`Failed to upload image: ${error.message}`);
			setImageFile(file); // Keep file for retry
		} finally {
			setUploadingImage(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			// Image should already be uploaded and in formData.image
			if (!formData.image || formData.image.trim() === "") {
				console.error("No image - image upload may have failed");
				setError("Image is required. Please upload an image first.");
				setLoading(false);
				return;
			}

			// Use formData as-is (image already uploaded)
			const finalFormData = { ...formData };

			// Debug: Log what we're sending
			console.log("=== Submitting Slide Data ===");
			console.log("Mode:", slide ? "UPDATE" : "CREATE");
			if (slide) {
				console.log("Slide ID:", slide._id);
				console.log("Old image:", slide.image);
				console.log("New image:", finalFormData.image);
			}
			console.log("Full form data:", finalFormData);

			// const url = slide ? `/api/hero/${slide._id}` : "/api/hero";
			// const method = slide ? "PUT" : "POST";

			let response;

			if (slide) {
				// For updates, fetch all slides and update the specific one
				const allSlidesResponse = await fetch("/api/hero?edit=true");
				const allSlidesData = await allSlidesResponse.json();
				const allSlides = allSlidesData.slides || [];

				// Find and update the specific slide - compare _id as string
				const slideIdStr = slide._id.toString?.() || String(slide._id);
				const updatedSlides = allSlides.map((s) => {
					const sIdStr = s._id?.toString?.() || String(s._id);
					if (sIdStr === slideIdStr) {
						// Return updated slide with all form data
						return {
							...finalFormData,
							_id: s._id, // Preserve the original _id
							order: s.order, // Preserve order
						};
					}
					// Return other slides with safety defaults for required fields
					return {
						...s,
						image: s.image || "", // Ensure image is always a string
						primaryLink: s.primaryLink || "",
						secondaryLink: s.secondaryLink || "",
					};
				});

				console.log("Updating slides - Here's what we're sending to API:");
				updatedSlides.forEach((s, idx) => {
					console.log(`  Slide ${idx} (ID: ${s._id}): image=${s.image ? s.image.substring(0, 50) + "..." : "EMPTY"}`);
				});

				// Send all slides to maintain data integrity
				response = await fetch("/api/hero", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ slides: updatedSlides }),
				});
			} else {
				// Create new slide - need to get existing slides first
				const heroResponse = await fetch("/api/hero");
				const heroData = await heroResponse.json();
				const existingSlides = heroData.slides || [];

				// Add new slide with proper order
				const newSlide = {
					...finalFormData,
					order: existingSlides.length,
				};

				const updatedSlides = [...existingSlides, newSlide];

				response = await fetch("/api/hero", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ slides: updatedSlides }),
				});
			}

			if (!response.ok) {
				const errorData = await response.json();
				console.error("API error response:", errorData);
				throw new Error(slide ? "Failed to update slide" : "Failed to create slide");
			}

			const responseData = await response.json();
			console.log("API response:", responseData);
			if (responseData.summary) {
				console.log(`✅ Update Summary:`);
				console.log(`   - Slides updated: ${responseData.summary.slidesUpdated}`);
				console.log(`   - Old images deleted: ${responseData.summary.imagesDeleted}`);
				if (responseData.summary.deletedUrls?.length > 0) {
					console.log(`   - Deleted URLs:`, responseData.summary.deletedUrls);
				}
			}

			console.log("=== Slide saved successfully ===");
			onSuccess();
		} catch (error) {
			console.error("Error saving slide:", error);
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-center justify-between">
						<DialogTitle>{slide ? "Edit Hero Slide" : "Create New Hero Slide"}</DialogTitle>
						<Button variant="ghost" size="sm" onClick={onClose}>
							<X className="w-4 h-4" />
						</Button>
					</div>
				</DialogHeader>

				<form onSubmit={handleSubmit} className="space-y-6">
					{/* Title Fields */}
					<div className="space-y-4">
						<Label className="text-lg font-semibold">Title *</Label>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Label htmlFor="title.en">English *</Label>
								<Input id="title.en" name="title.en" value={formData.title.en} onChange={handleChange} required placeholder="Enter slide title (English)" />
							</div>
							<div>
								<Label htmlFor="title.no">Norwegian *</Label>
								<Input id="title.no" name="title.no" value={formData.title.no} onChange={handleChange} required placeholder="Enter slide title (Norwegian)" />
							</div>
							<div>
								<Label htmlFor="title.ne">Nepali *</Label>
								<Input id="title.ne" name="title.ne" value={formData.title.ne} onChange={handleChange} required placeholder="Enter slide title (Nepali)" />
							</div>
						</div>
					</div>

					{/* Image Upload */}
					<div className="space-y-4">
						<Label className="text-lg font-semibold">Hero Image *</Label>

						{/* Image Preview */}
						{imagePreview && (
							<div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
								<Image src={imagePreview} alt="Hero slide preview" fill className="object-cover" />
								{imageFile && <div className="absolute top-2 right-2 bg-blue-500 text-white px-2 py-1 rounded text-xs">New Image</div>}
							</div>
						)}

						{/* File Upload */}
						<div className="flex items-center justify-center w-full">
							<label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100">
								<div className="flex flex-col items-center justify-center pt-5 pb-6">
									<Upload className="w-8 h-8 mb-4 text-gray-500" />
									<p className="mb-2 text-sm text-gray-500">
										<span className="font-semibold">Click to upload</span> or drag and drop
									</p>
									<p className="text-xs text-gray-500">PNG, JPG, WEBP up to 10MB</p>
								</div>
								<input type="file" className="hidden" accept="image/*" onChange={handleFileChange} disabled={uploadingImage || loading} />
							</label>
						</div>

						{uploadingImage && <div className="text-center text-sm text-blue-600">Uploading image...</div>}

						{/* Hidden field for form validation */}
						<input type="hidden" name="image" value={formData.image} onChange={handleChange} required />
					</div>

					{/* Description Fields */}
					<div className="space-y-4">
						<Label className="text-lg font-semibold">Description *</Label>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Label htmlFor="description.en">English *</Label>
								<Textarea id="description.en" name="description.en" value={formData.description.en} onChange={handleChange} required placeholder="Enter slide description (English)" rows={3} />
							</div>
							<div>
								<Label htmlFor="description.no">Norwegian *</Label>
								<Textarea id="description.no" name="description.no" value={formData.description.no} onChange={handleChange} required placeholder="Enter slide description (Norwegian)" rows={3} />
							</div>
							<div>
								<Label htmlFor="description.ne">Nepali *</Label>
								<Textarea id="description.ne" name="description.ne" value={formData.description.ne} onChange={handleChange} required placeholder="Enter slide description (Nepali)" rows={3} />
							</div>
						</div>
					</div>

					{/* Primary Button Fields */}
					<div className="space-y-4">
						<Label className="text-lg font-semibold">Primary Button *</Label>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Label htmlFor="primaryButton.en">English Text *</Label>
								<Input id="primaryButton.en" name="primaryButton.en" value={formData.primaryButton.en} onChange={handleChange} required placeholder="e.g., Become a Member" />
							</div>
							<div>
								<Label htmlFor="primaryButton.no">Norwegian Text *</Label>
								<Input id="primaryButton.no" name="primaryButton.no" value={formData.primaryButton.no} onChange={handleChange} required placeholder="e.g., Bli Medlem" />
							</div>
							<div>
								<Label htmlFor="primaryButton.ne">Nepali Text *</Label>
								<Input id="primaryButton.ne" name="primaryButton.ne" value={formData.primaryButton.ne} onChange={handleChange} required placeholder="e.g., \u0938\u0926\u0938\u094d\u092f \u092c\u0928\u094d\u0928\u0941\u0939\u094b\u0938\u094d" />
							</div>
						</div>
						<div>
							<Label htmlFor="primaryLink">Primary Button Link *</Label>
							<Input id="primaryLink" name="primaryLink" value={formData.primaryLink} onChange={handleChange} required placeholder="e.g., /membership" />
						</div>
					</div>

					{/* Secondary Button Fields */}
					<div className="space-y-4">
						<Label className="text-lg font-semibold">Secondary Button *</Label>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Label htmlFor="secondaryButton.en">English Text *</Label>
								<Input id="secondaryButton.en" name="secondaryButton.en" value={formData.secondaryButton.en} onChange={handleChange} required placeholder="e.g., Explore Pashupatinath Norway Temple" />
							</div>
							<div>
								<Label htmlFor="secondaryButton.no">Norwegian Text *</Label>
								<Input id="secondaryButton.no" name="secondaryButton.no" value={formData.secondaryButton.no} onChange={handleChange} required placeholder="e.g., Utforsk Pashupatinath Norway Temple" />
							</div>
							<div>
								<Label htmlFor="secondaryButton.ne">Nepali Text *</Label>
								<Input id="secondaryButton.ne" name="secondaryButton.ne" value={formData.secondaryButton.ne} onChange={handleChange} required placeholder="e.g., Pashupatinath Norway Temple \u0905\u0928\u0941\u0938\u0928\u094d\u0926\u0930\u094d\u0917 \u0917\u0930\u094d\u0928\u0941\u0939\u094b\u0938\u094d" />
							</div>
						</div>
						<div>
							<Label htmlFor="secondaryLink">Secondary Button Link *</Label>
							<Input id="secondaryLink" name="secondaryLink" value={formData.secondaryLink} onChange={handleChange} required placeholder="e.g., /about-us" />
						</div>
					</div>

					{slide && (
						<div className="flex items-center space-x-2">
							<input type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} className="rounded border-gray-300" />
							<Label htmlFor="isActive">Active (show on website)</Label>
						</div>
					)}

					{error && <div className="text-red-600 text-sm">{error}</div>}

					<div className="flex justify-end gap-3 pt-4">
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? "Saving..." : slide ? "Update Slide" : "Create Slide"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
