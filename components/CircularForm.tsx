"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Image from "next/image";

interface Circular {
	_id?: string;
	circularTitle: { en: string; no: string; ne: string };
	circularDesc: { en: string; no: string; ne: string };
	circularAuthor: { en: string; no: string; ne: string };
	publicationStatus: string;
	circularPublishedAt?: string;
	circularPdfUrl?: string;
	circularMainPicture?: string;
	circularSecondPicture?: string;
}

// Helper function to convert object to Map for API submission
// const objectToMap = (obj: { en: string; no: string; ne: string }): Map<string, string> => {
// 	return new Map([
// 		["en", obj.en],
// 		["no", obj.no],
// 		["ne", obj.ne],
// 	]);
// };

interface CircularFormProps {
	circular?: Circular;
	onClose: () => void;
	onSuccess: () => void;
}

export default function CircularForm({ circular, onClose, onSuccess }: CircularFormProps) {
	const [loading, setLoading] = useState(false);
	const [formData, setFormData] = useState({
		circularTitle: { en: "", no: "", ne: "" },
		circularDesc: { en: "", no: "", ne: "" },
		circularAuthor: { en: "", no: "", ne: "" },
		publicationStatus: "draft",
		circularPublishedAt: "",
	});
	const [mainImage, setMainImage] = useState<File | null>(null);
	const [secondImage, setSecondImage] = useState<File | null>(null);
	const [mainImagePreview, setMainImagePreview] = useState<string>("");
	const [secondImagePreview, setSecondImagePreview] = useState<string>("");

	useEffect(() => {
		if (circular) {
			setFormData({
				circularTitle: circular.circularTitle,
				circularDesc: circular.circularDesc,
				circularAuthor: circular.circularAuthor,
				publicationStatus: circular.publicationStatus || "draft",
				circularPublishedAt: circular.circularPublishedAt?.split("T")[0] || "",
			});
			if (circular.circularMainPicture) {
				setMainImagePreview(circular.circularMainPicture);
			}
			if (circular.circularSecondPicture) {
				setSecondImagePreview(circular.circularSecondPicture);
			}
		}
	}, [circular]);

	const handleInputChange = (field: string, value: string, lang?: string) => {
		if (lang) {
			setFormData((prev) => {
				const currentField = prev[field as keyof typeof prev];
				if (typeof currentField === "object" && currentField !== null) {
					return {
						...prev,
						[field]: {
							...currentField,
							[lang]: value,
						},
					};
				}
				return prev;
			});
		} else {
			setFormData((prev) => ({
				...prev,
				[field]: value,
			}));
		}
	};

	const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: "main" | "second") => {
		const file = e.target.files?.[0];
		if (file) {
			if (type === "main") {
				setMainImage(file);
				setMainImagePreview(URL.createObjectURL(file));
			} else {
				setSecondImage(file);
			setSecondImagePreview(URL.createObjectURL(file));
			}
		}
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);

		try {
			const hasAnyTitle = Boolean(formData.circularTitle.en || formData.circularTitle.no || formData.circularTitle.ne);
			if (!hasAnyTitle) {
				alert("Please add a title in at least one language.");
				setLoading(false);
				return;
			}

			const data = new FormData();

			// Add localized fields
			data.append("circularTitle_en", formData.circularTitle.en);
			data.append("circularTitle_no", formData.circularTitle.no);
			data.append("circularTitle_ne", formData.circularTitle.ne);

			data.append("circularDesc_en", formData.circularDesc.en);
			data.append("circularDesc_no", formData.circularDesc.no);
			data.append("circularDesc_ne", formData.circularDesc.ne);

			data.append("circularAuthor_en", formData.circularAuthor.en);
			data.append("circularAuthor_no", formData.circularAuthor.no);
			data.append("circularAuthor_ne", formData.circularAuthor.ne);

			data.append("publicationStatus", formData.publicationStatus);
			data.append("circularPublishedAt", formData.circularPublishedAt);

			if (mainImage) {
				data.append("circularMainPicture", mainImage);
			}
			if (secondImage) {
				data.append("circularSecondPicture", secondImage);
			}

			const url = circular ? `/api/circulars/${circular._id}` : "/api/circulars/create";

			const method = circular ? "PUT" : "POST";

			const response = await fetch(url, {
				method,
				body: data,
			});

			const result = await response.json();

			if (result.success) {
				onSuccess();
				onClose();
			} else {
				alert(`Error: ${result.error}`);
			}
		} catch (error) {
			console.error("Error submitting form:", error);
			alert("Failed to submit circular");
		} finally {
			setLoading(false);
		}
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{/* English Fields */}
			<div className="space-y-4 border-b pb-6">
				<h3 className="text-lg font-semibold text-gray-900">English</h3>
				<div>
					<Label htmlFor="title_en">Title (English)</Label>
					<Input id="title_en" value={formData.circularTitle.en} onChange={(e) => handleInputChange("circularTitle", e.target.value, "en")} placeholder="Enter circular title in English" />
				</div>
				<div>
					<Label htmlFor="desc_en">Description (English)</Label>
					<Textarea id="desc_en" rows={4} value={formData.circularDesc.en} onChange={(e) => handleInputChange("circularDesc", e.target.value, "en")} placeholder="Enter description in English" />
				</div>
				<div>
					<Label htmlFor="author_en">Author (English)</Label>
					<Input id="author_en" value={formData.circularAuthor.en} onChange={(e) => handleInputChange("circularAuthor", e.target.value, "en")} placeholder="Enter author name in English" />
				</div>
			</div>

			{/* Norwegian Fields */}
			<div className="space-y-4 border-b pb-6">
				<h3 className="text-lg font-semibold text-gray-900">Norwegian</h3>
				<div>
					<Label htmlFor="title_no">Title (Norwegian)</Label>
					<Input id="title_no" value={formData.circularTitle.no} onChange={(e) => handleInputChange("circularTitle", e.target.value, "no")} placeholder="Enter circular title in Norwegian" />
				</div>
				<div>
					<Label htmlFor="desc_no">Description (Norwegian)</Label>
					<Textarea id="desc_no" rows={4} value={formData.circularDesc.no} onChange={(e) => handleInputChange("circularDesc", e.target.value, "no")} placeholder="Enter description in Norwegian" />
				</div>
				<div>
					<Label htmlFor="author_no">Author (Norwegian)</Label>
					<Input id="author_no" value={formData.circularAuthor.no} onChange={(e) => handleInputChange("circularAuthor", e.target.value, "no")} placeholder="Enter author name in Norwegian" />
				</div>
			</div>

			{/* Nepali Fields */}
			<div className="space-y-4 border-b pb-6">
				<h3 className="text-lg font-semibold text-gray-900">Nepali</h3>
				<div>
					<Label htmlFor="title_ne">Title (Nepali)</Label>
					<Input id="title_ne" value={formData.circularTitle.ne} onChange={(e) => handleInputChange("circularTitle", e.target.value, "ne")} placeholder="Enter circular title in Nepali" />
				</div>
				<div>
					<Label htmlFor="desc_ne">Description (Nepali)</Label>
					<Textarea id="desc_ne" rows={4} value={formData.circularDesc.ne} onChange={(e) => handleInputChange("circularDesc", e.target.value, "ne")} placeholder="Enter description in Nepali" />
				</div>
				<div>
					<Label htmlFor="author_ne">Author (Nepali)</Label>
					<Input id="author_ne" value={formData.circularAuthor.ne} onChange={(e) => handleInputChange("circularAuthor", e.target.value, "ne")} placeholder="Enter author name in Nepali" />
				</div>
			</div>

			{/* Publication Settings */}
			<div className="space-y-4 border-b pb-6">
				<h3 className="text-lg font-semibold text-gray-900">Publication Settings</h3>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<Label htmlFor="status">Publication Status *</Label>
						<Select value={formData.publicationStatus} onValueChange={(value) => handleInputChange("publicationStatus", value)}>
							<SelectTrigger>
								<SelectValue placeholder="Select status" />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="draft">Draft</SelectItem>
								<SelectItem value="published">Published</SelectItem>
								<SelectItem value="archived">Archived</SelectItem>
							</SelectContent>
						</Select>
					</div>
					<div>
						<Label htmlFor="publishedAt">Published Date</Label>
						<Input id="publishedAt" type="date" value={formData.circularPublishedAt} onChange={(e) => handleInputChange("circularPublishedAt", e.target.value)} />
					</div>
				</div>
			</div>

			{/* Images */}
			<div className="space-y-4">
				<h3 className="text-lg font-semibold text-gray-900">Images</h3>
				<div className="grid grid-cols-2 gap-4">
					<div>
						<Label htmlFor="mainImage">Main Picture</Label>
						<Input id="mainImage" type="file" accept="image/*" onChange={(e) => handleImageChange(e, "main")} />
						{mainImagePreview && <Image src={mainImagePreview} alt="Main preview" width={400} height={160} className="mt-2 w-full h-40 object-cover rounded" />}
					</div>
					<div>
						<Label htmlFor="secondImage">Second Picture</Label>
						<Input id="secondImage" type="file" accept="image/*" onChange={(e) => handleImageChange(e, "second")} />
						{secondImagePreview && <Image src={secondImagePreview} alt="Second preview" width={400} height={160} className="mt-2 w-full h-40 object-cover rounded" />}
					</div>
				</div>
			</div>

			{/* Actions */}
			<div className="flex justify-end gap-3 pt-4 border-t">
				<Button type="button" variant="outline" onClick={onClose} disabled={loading}>
					Cancel
				</Button>
				<Button type="submit" disabled={loading}>
					{loading ? "Saving..." : circular ? "Update Circular" : "Create Circular"}
				</Button>
			</div>
		</form>
	);
}
