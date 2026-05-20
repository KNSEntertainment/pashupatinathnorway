"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { X, Upload } from "lucide-react";
import Image from "next/image";

export default function AboutUsForm({ data, onClose, onSuccess }) {
	const [formData, setFormData] = useState({
		title: {
			en: data?.title?.en || "",
			no: data?.title?.no || "",
			ne: data?.title?.ne || "",
		},
		subtitle: {
			en: data?.subtitle?.en || "",
			no: data?.subtitle?.no || "",
			ne: data?.subtitle?.ne || "",
		},
		about_description_1: {
			en: data?.about_description_1?.en || "",
			no: data?.about_description_1?.no || "",
			ne: data?.about_description_1?.ne || "",
		},
		about_description_2: {
			en: data?.about_description_2?.en || "",
			no: data?.about_description_2?.no || "",
			ne: data?.about_description_2?.ne || "",
		},
		more_about_us: {
			en: data?.more_about_us?.en || "",
			no: data?.more_about_us?.no || "",
			ne: data?.more_about_us?.ne || "",
		},
		image: data?.image || "/pashupatinath.png",
	});
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");
	const [imageFile] = useState(null);
	const [imagePreview, setImagePreview] = useState(data?.image || "/pashupatinath.png");
	const [uploadingImage, setUploadingImage] = useState(false);

	const handleChange = (e) => {
		const { name, value } = e.target;

		// Handle nested fields (e.g., "title.en", "stats.active_members")
		if (name.includes(".")) {
			const keys = name.split(".");
			let currentField = formData;
			
			// Navigate to the parent object
			for (let i = 0; i < keys.length - 1; i++) {
				currentField = currentField[keys[i]];
			}
			
			// Set the final value
			currentField[keys[keys.length - 1]] = value;
			
			setFormData({ ...formData });
		} else {
			// Handle regular fields
			setFormData((prev) => ({
				...prev,
				[name]: value,
			}));
		}
	};

	const handleFileChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Create preview immediately
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePreview(reader.result);
			};
			reader.readAsDataURL(file);

			// Upload the image immediately
			uploadImageImmediately(file);
		}
	};

	const uploadImageImmediately = async (file) => {
		setUploadingImage(true);
		try {
			const uploadFormData = new FormData();
			uploadFormData.append("file", file);
			uploadFormData.append("folder", "about_us");

			const response = await fetch("/api/upload", {
				method: "POST",
				body: uploadFormData,
			});

			if (!response.ok) {
				const errorText = await response.text();
				throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
			}

			const result = await response.json();

			// Update formData with the new image URL
			setFormData((prev) => ({
				...prev,
				image: result.url,
			}));
			setError("");
		} catch (error) {
			console.error("Upload error:", error);
			setError(`Failed to upload image: ${error.message}`);
		} finally {
			setUploadingImage(false);
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");

		try {
			// Validate required fields
			const titleEn = formData.title?.en || "";
			const subtitleEn = formData.subtitle?.en || "";
			const about1En = formData.about_description_1?.en || "";
			const about2En = formData.about_description_2?.en || "";

			if (!titleEn.trim() || !subtitleEn.trim() || !about1En.trim() || !about2En.trim()) {
				setError("English content is required for all text fields");
				setLoading(false);
				return;
			}

			const response = await fetch("/api/about-us", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify(formData),
			});

			if (!response.ok) {
				const errorData = await response.json();
				throw new Error(errorData.error || "Failed to save About Us content");
			}

			const responseData = await response.json();
			console.log("About Us content saved successfully:", responseData);

			onSuccess();
		} catch (error) {
			console.error("Error saving About Us content:", error);
			setError(error.message);
		} finally {
			setLoading(false);
		}
	};

	return (
		<Dialog open={true} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
				<DialogHeader>
					<div className="flex items-center justify-between">
						<DialogTitle>{data ? "Edit About Us Content" : "Create About Us Content"}</DialogTitle>
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
								<Input 
									id="title.en" 
									name="title.en" 
									value={formData.title.en} 
									onChange={handleChange} 
									required 
									placeholder="Enter title (English)" 
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
									placeholder="Enter title (Norwegian)" 
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
									placeholder="Enter title (Nepali)" 
								/>
							</div>
						</div>
					</div>

					{/* Subtitle Fields */}
					<div className="space-y-4">
						<Label className="text-lg font-semibold">Subtitle *</Label>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Label htmlFor="subtitle.en">English *</Label>
								<Input 
									id="subtitle.en" 
									name="subtitle.en" 
									value={formData.subtitle.en} 
									onChange={handleChange} 
									required 
									placeholder="Enter subtitle (English)" 
								/>
							</div>
							<div>
								<Label htmlFor="subtitle.no">Norwegian *</Label>
								<Input 
									id="subtitle.no" 
									name="subtitle.no" 
									value={formData.subtitle.no} 
									onChange={handleChange} 
									required 
									placeholder="Enter subtitle (Norwegian)" 
								/>
							</div>
							<div>
								<Label htmlFor="subtitle.ne">Nepali *</Label>
								<Input 
									id="subtitle.ne" 
									name="subtitle.ne" 
									value={formData.subtitle.ne} 
									onChange={handleChange} 
									required 
									placeholder="Enter subtitle (Nepali)" 
								/>
							</div>
						</div>
					</div>

					{/* Image Upload */}
					<div className="space-y-4">
						<Label className="text-lg font-semibold">About Us Image</Label>

						{/* Image Preview */}
						{imagePreview && (
							<div className="relative w-full h-64 rounded-lg overflow-hidden border-2 border-gray-200">
								<Image src={imagePreview} alt="About Us preview" fill className="object-cover" />
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
					</div>

					{/* Description Fields */}
					<div className="space-y-4">
						<Label className="text-lg font-semibold">About Description 1 *</Label>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Label htmlFor="about_description_1.en">English *</Label>
								<Textarea 
									id="about_description_1.en" 
									name="about_description_1.en" 
									value={formData.about_description_1.en} 
									onChange={handleChange} 
									required 
									placeholder="Enter first description paragraph (English)" 
									rows={4} 
								/>
							</div>
							<div>
								<Label htmlFor="about_description_1.no">Norwegian *</Label>
								<Textarea 
									id="about_description_1.no" 
									name="about_description_1.no" 
									value={formData.about_description_1.no} 
									onChange={handleChange} 
									required 
									placeholder="Enter first description paragraph (Norwegian)" 
									rows={4} 
								/>
							</div>
							<div>
								<Label htmlFor="about_description_1.ne">Nepali *</Label>
								<Textarea 
									id="about_description_1.ne" 
									name="about_description_1.ne" 
									value={formData.about_description_1.ne} 
									onChange={handleChange} 
									required 
									placeholder="Enter first description paragraph (Nepali)" 
									rows={4} 
								/>
							</div>
						</div>
					</div>

					{/* Description 2 Fields */}
					<div className="space-y-4">
						<Label className="text-lg font-semibold">About Description 2 *</Label>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Label htmlFor="about_description_2.en">English *</Label>
								<Textarea 
									id="about_description_2.en" 
									name="about_description_2.en" 
									value={formData.about_description_2.en} 
									onChange={handleChange} 
									required 
									placeholder="Enter second description paragraph (English)" 
									rows={4} 
								/>
							</div>
							<div>
								<Label htmlFor="about_description_2.no">Norwegian *</Label>
								<Textarea 
									id="about_description_2.no" 
									name="about_description_2.no" 
									value={formData.about_description_2.no} 
									onChange={handleChange} 
									required 
									placeholder="Enter second description paragraph (Norwegian)" 
									rows={4} 
								/>
							</div>
							<div>
								<Label htmlFor="about_description_2.ne">Nepali *</Label>
								<Textarea 
									id="about_description_2.ne" 
									name="about_description_2.ne" 
									value={formData.about_description_2.ne} 
									onChange={handleChange} 
									required 
									placeholder="Enter second description paragraph (Nepali)" 
									rows={4} 
								/>
							</div>
						</div>
					</div>

					{/* Button Text Fields */}
					<div className="space-y-4">
						<Label className="text-lg font-semibold">&quot;More About Us&quot; Button Text *</Label>
						<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
							<div>
								<Label htmlFor="more_about_us.en">English *</Label>
								<Input 
									id="more_about_us.en" 
									name="more_about_us.en" 
									value={formData.more_about_us.en} 
									onChange={handleChange} 
									required 
									placeholder="e.g., More About Us" 
								/>
							</div>
							<div>
								<Label htmlFor="more_about_us.no">Norwegian *</Label>
								<Input 
									id="more_about_us.no" 
									name="more_about_us.no" 
									value={formData.more_about_us.no} 
									onChange={handleChange} 
									required 
									placeholder="e.g., Mer Om Oss" 
								/>
							</div>
							<div>
								<Label htmlFor="more_about_us.ne">Nepali *</Label>
								<Input 
									id="more_about_us.ne" 
									name="more_about_us.ne" 
									value={formData.more_about_us.ne} 
									onChange={handleChange} 
									required 
									placeholder="e.g., हाम्रो बारेमा थप" 
								/>
							</div>
						</div>
					</div>

					{error && <div className="text-red-600 text-sm">{error}</div>}

					<div className="flex justify-end gap-3 pt-4">
						<Button type="button" variant="outline" onClick={onClose}>
							Cancel
						</Button>
						<Button type="submit" disabled={loading}>
							{loading ? "Saving..." : data ? "Update Content" : "Create Content"}
						</Button>
					</div>
				</form>
			</DialogContent>
		</Dialog>
	);
}
