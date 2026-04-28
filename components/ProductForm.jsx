"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import Image from "next/image";

export default function ProductForm({ handleCloseProductModal, productToEdit = null }) {
	const [formData, setFormData] = useState({
		// Basic info
		price: "",
		currency: "NOK",
		category: "product",
		type: "",
		isActive: true,
		
		// Multi-language content
		name_en: "",
		name_no: "",
		name_ne: "",
		description_en: "",
		description_no: "",
		description_ne: "",
		
		// Stock and digital
		inStock: true,
		stockQuantity: "",
		isDigital: false,
		downloadUrl: "",
		
		// Images
		imageUrl: null,
		images: [],
		removeImages: [],
		
		// Additional fields
		tags: "",
		features: [],
		specifications: {},
	});

	const [submitting, setSubmitting] = useState(false);
	const [error, setError] = useState("");
	const [activeTab, setActiveTab] = useState("en");
	const [currentImages, setCurrentImages] = useState([]);

	// Load existing product
	useEffect(() => {
		if (productToEdit) {
			setFormData({
				price: productToEdit.price?.toString() || "",
				currency: productToEdit.currency || "NOK",
				category: productToEdit.category || "product",
				type: productToEdit.type || "",
				isActive: productToEdit.isActive !== false,
				
				name_en: productToEdit.name?.en || "",
				name_no: productToEdit.name?.no || "",
				name_ne: productToEdit.name?.ne || "",
				description_en: productToEdit.description?.en || "",
				description_no: productToEdit.description?.no || "",
				description_ne: productToEdit.description?.ne || "",
				
				inStock: productToEdit.inStock !== false,
				stockQuantity: productToEdit.stockQuantity?.toString() || "",
				isDigital: productToEdit.isDigital || false,
				downloadUrl: productToEdit.downloadUrl || "",
				
				imageUrl: null,
				images: [],
				removeImages: [],
				
				tags: productToEdit.tags?.join(", ") || "",
				features: productToEdit.features || [],
				specifications: productToEdit.specifications || {},
			});
			
			setCurrentImages(productToEdit.images || []);
		}
	}, [productToEdit]);

	const handleSubmit = async (e) => {
		e.preventDefault();
		setSubmitting(true);
		setError("");

		try {
			const form = new FormData();

			// Basic fields
			form.append("price", formData.price);
			form.append("currency", formData.currency);
			form.append("category", formData.category);
			form.append("type", formData.type);
			form.append("isActive", formData.isActive);
			form.append("inStock", formData.inStock);
			form.append("stockQuantity", formData.stockQuantity);
			form.append("isDigital", formData.isDigital);
			form.append("downloadUrl", formData.downloadUrl);
			form.append("tags", formData.tags);

			// Multi-language fields
			form.append("name_en", formData.name_en);
			form.append("name_no", formData.name_no);
			form.append("name_ne", formData.name_ne);
			form.append("description_en", formData.description_en);
			form.append("description_no", formData.description_no);
			form.append("description_ne", formData.description_ne);

			// Images
			if (formData.imageUrl) {
				form.append("imageUrl", formData.imageUrl);
			}
			formData.images.forEach((image) => {
				if (image) {
					form.append("images", image);
				}
			});
			formData.removeImages.forEach((imageIndex) => {
				form.append("removeImages", imageIndex);
			});

			// Features and specifications
			form.append("features", JSON.stringify(formData.features));
			form.append("specifications", JSON.stringify(formData.specifications));

			const url = productToEdit ? `/api/products/${productToEdit._id}` : "/api/products/create";
			const method = productToEdit ? "PUT" : "POST";

			const response = await fetch(url, {
				method: method,
				body: form,
			});

			const result = await response.json();

			if (!response.ok) {
				throw new Error(result.error || `Failed to ${productToEdit ? "update" : "create"} product`);
			}

			alert(`Product ${productToEdit ? "updated" : "created"} successfully!`);
			handleCloseProductModal();
		} catch (err) {
			setError(err.message);
		} finally {
			setSubmitting(false);
		}
	};

	const getName = () => {
		if (activeTab === "en") return formData.name_en;
		if (activeTab === "ne") return formData.name_ne;
		return formData.name_no;
	};

	const setName = (value) => {
		if (activeTab === "en") {
			setFormData((p) => ({ ...p, name_en: value }));
		} else if (activeTab === "ne") {
			setFormData((p) => ({ ...p, name_ne: value }));
		} else {
			setFormData((p) => ({ ...p, name_no: value }));
		}
	};

	const getDescription = () => {
		if (activeTab === "en") return formData.description_en;
		if (activeTab === "ne") return formData.description_ne;
		return formData.description_no;
	};

	const setDescription = (value) => {
		if (activeTab === "en") {
			setFormData((p) => ({ ...p, description_en: value }));
		} else if (activeTab === "ne") {
			setFormData((p) => ({ ...p, description_ne: value }));
		} else {
			setFormData((p) => ({ ...p, description_no: value }));
		}
	};

	const addFeature = () => {
		setFormData((p) => ({
			...p,
			features: [...p.features, { en: "", no: "", ne: "" }]
		}));
	};

	const updateFeature = (index, lang, value) => {
		setFormData((p) => ({
			...p,
			features: p.features.map((feature, i) =>
				i === index ? { ...feature, [lang]: value } : feature
			)
		}));
	};

	const removeFeature = (index) => {
		setFormData((p) => ({
			...p,
			features: p.features.filter((_, i) => i !== index)
		}));
	};

	const addSpecification = () => {
		const key = prompt("Enter specification key:");
		if (key) {
			setFormData((p) => ({
				...p,
				specifications: { ...p.specifications, [key]: { en: "", no: "", ne: "" } }
			}));
		}
	};

	const updateSpecification = (key, lang, value) => {
		setFormData((p) => ({
			...p,
			specifications: {
				...p.specifications,
				[key]: { ...p.specifications[key], [lang]: value }
			}
		}));
	};

	const removeSpecification = (key) => {
		const newSpecs = { ...formData.specifications };
		delete newSpecs[key];
		setFormData((p) => ({ ...p, specifications: newSpecs }));
	};

	const removeImage = (index) => {
		setFormData((p) => ({
			...p,
			removeImages: [...p.removeImages, index]
		}));
		setCurrentImages((prev) => prev.filter((_, i) => i !== index));
	};

	return (
		<div className="max-h-[calc(100vh-200px)] overflow-y-auto">
			<form onSubmit={handleSubmit} className="space-y-4">
				{error && <div className="bg-red-50 border border-red-600 text-red-600 px-4 py-3 rounded">{error}</div>}

				{/* Basic Information */}
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<Label htmlFor="price">Price (NOK)</Label>
						<Input
							id="price"
							type="number"
							value={formData.price}
							onChange={(e) => setFormData({ ...formData, price: e.target.value })}
							required
						/>
					</div>
					<div>
						<Label htmlFor="category">Category</Label>
						<Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
							<SelectTrigger>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								<SelectItem value="product">Product</SelectItem>
								<SelectItem value="service">Service</SelectItem>
							</SelectContent>
						</Select>
					</div>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div>
						<Label htmlFor="type">Type</Label>
						<Input
							id="type"
							value={formData.type}
							onChange={(e) => setFormData({ ...formData, type: e.target.value })}
							placeholder="e.g., book, puja, consultation"
							required
						/>
					</div>
					<div>
						<Label htmlFor="tags">Tags (comma separated)</Label>
						<Input
							id="tags"
							value={formData.tags}
							onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
							placeholder="e.g., religious, book, digital"
						/>
					</div>
				</div>

				{/* Language Tabs */}
				<div className="flex gap-2">
					{["en", "ne", "no"].map((lang) => (
						<Button
							key={lang}
							type="button"
							variant={activeTab === lang ? "default" : "outline"}
							onClick={() => setActiveTab(lang)}
							className="px-4 py-2"
						>
							{lang.toUpperCase()}
						</Button>
					))}
				</div>

				{/* Multi-language Content */}
				<div className="space-y-4">
					<div>
						<Label htmlFor={`name_${activeTab}`}>Name ({activeTab.toUpperCase()})</Label>
						<Input
							id={`name_${activeTab}`}
							value={getName()}
							onChange={(e) => setName(e.target.value)}
							placeholder="Product name"
							required={activeTab === "en"}
						/>
					</div>

					<div>
						<Label htmlFor={`description_${activeTab}`}>Description ({activeTab.toUpperCase()})</Label>
						<Textarea
							id={`description_${activeTab}`}
							value={getDescription()}
							onChange={(e) => setDescription(e.target.value)}
							placeholder="Product description"
							rows={4}
							required={activeTab === "en"}
						/>
					</div>
				</div>

				{/* Stock and Digital Options */}
				<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
					<div className="flex items-center space-x-2">
						<Checkbox
							id="inStock"
							checked={formData.inStock}
							onCheckedChange={(checked) => setFormData({ ...formData, inStock: checked })}
						/>
						<Label htmlFor="inStock">In Stock</Label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							id="isDigital"
							checked={formData.isDigital}
							onCheckedChange={(checked) => setFormData({ ...formData, isDigital: checked })}
						/>
						<Label htmlFor="isDigital">Digital Product</Label>
					</div>
					<div className="flex items-center space-x-2">
						<Checkbox
							id="isActive"
							checked={formData.isActive}
							onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
						/>
						<Label htmlFor="isActive">Active</Label>
					</div>
				</div>

				{!formData.inStock && (
					<div>
						<Label htmlFor="stockQuantity">Stock Quantity</Label>
						<Input
							id="stockQuantity"
							type="number"
							value={formData.stockQuantity}
							onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })}
							min="0"
						/>
					</div>
				)}

				{formData.isDigital && (
					<div>
						<Label htmlFor="downloadUrl">Download URL</Label>
						<Input
							id="downloadUrl"
							value={formData.downloadUrl}
							onChange={(e) => setFormData({ ...formData, downloadUrl: e.target.value })}
							placeholder="URL for digital download"
						/>
					</div>
				)}

				{/* Image Upload */}
				<div className="space-y-4">
					<Label>Product Images</Label>
					
					{/* Main Image */}
					<div>
						<Label htmlFor="imageUrl">Main Image</Label>
						<Input
							id="imageUrl"
							type="file"
							onChange={(e) => setFormData({ ...formData, imageUrl: e.target.files[0] })}
							accept="image/*"
						/>
						{productToEdit?.imageUrl && (
							<div className="mt-2 flex items-center gap-3">
								<Image
									src={productToEdit.imageUrl}
									alt="Current main image"
									className="h-16 w-16 rounded object-cover border"
									width={64}
									height={64}
								/>
								<span className="text-sm text-gray-700">Current main image</span>
							</div>
						)}
					</div>

					{/* Additional Images */}
					<div>
						<Label>Additional Images</Label>
						<Input
							type="file"
							multiple
							onChange={(e) => setFormData({ ...formData, images: Array.from(e.target.files) })}
							accept="image/*"
							className="mb-2"
						/>
						
						{currentImages.length > 0 && (
							<div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-2">
								{currentImages.map((image, index) => (
									<div key={index} className="relative group">
										<Image
											src={image}
											alt={`Product image ${index + 1}`}
											className="w-full h-24 object-cover rounded border"
											width={100}
											height={96}
										/>
										<Button
											type="button"
											variant="destructive"
											size="sm"
											onClick={() => removeImage(index)}
											className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity"
										>
											×
										</Button>
									</div>
								))}
							</div>
						)}
					</div>
				</div>

				{/* Features */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<Label>Features</Label>
						<Button type="button" onClick={addFeature} variant="outline" size="sm">
							Add Feature
						</Button>
					</div>
					
					{formData.features.map((feature, index) => (
						<div key={index} className="border rounded p-3 space-y-2">
							<div className="flex items-center justify-between">
								<Label>Feature {index + 1}</Label>
								<Button
									type="button"
									variant="destructive"
									size="sm"
									onClick={() => removeFeature(index)}
								>
									Remove
								</Button>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
								<div>
									<Label>English</Label>
									<Input
										value={feature.en}
										onChange={(e) => updateFeature(index, "en", e.target.value)}
										placeholder="Feature in English"
									/>
								</div>
								<div>
									<Label>Norwegian</Label>
									<Input
										value={feature.no}
										onChange={(e) => updateFeature(index, "no", e.target.value)}
										placeholder="Feature in Norwegian"
									/>
								</div>
								<div>
									<Label>Nepali</Label>
									<Input
										value={feature.ne}
										onChange={(e) => updateFeature(index, "ne", e.target.value)}
										placeholder="Feature in Nepali"
									/>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Specifications */}
				<div className="space-y-4">
					<div className="flex items-center justify-between">
						<Label>Specifications</Label>
						<Button type="button" onClick={addSpecification} variant="outline" size="sm">
							Add Specification
						</Button>
					</div>
					
					{Object.entries(formData.specifications).map(([key, spec]) => (
						<div key={key} className="border rounded p-3 space-y-2">
							<div className="flex items-center justify-between">
								<Label>{key}</Label>
								<Button
									type="button"
									variant="destructive"
									size="sm"
									onClick={() => removeSpecification(key)}
								>
									Remove
								</Button>
							</div>
							
							<div className="grid grid-cols-1 md:grid-cols-3 gap-2">
								<div>
									<Label>English</Label>
									<Input
										value={spec.en}
										onChange={(e) => updateSpecification(key, "en", e.target.value)}
										placeholder="Specification in English"
									/>
								</div>
								<div>
									<Label>Norwegian</Label>
									<Input
										value={spec.no}
										onChange={(e) => updateSpecification(key, "no", e.target.value)}
										placeholder="Specification in Norwegian"
									/>
								</div>
								<div>
									<Label>Nepali</Label>
									<Input
										value={spec.ne}
										onChange={(e) => updateSpecification(key, "ne", e.target.value)}
										placeholder="Specification in Nepali"
									/>
								</div>
							</div>
						</div>
					))}
				</div>

				{/* Submit Buttons */}
				<div className="flex gap-2">
					<Button
						type="submit"
						disabled={submitting}
						className="flex-1"
					>
						{submitting ? `${productToEdit ? "Updating" : "Creating"} Product...` : `${productToEdit ? "Update" : "Create"} Product`}
					</Button>
					<Button variant="outline" onClick={handleCloseProductModal}>
						Cancel
					</Button>
				</div>
			</form>
		</div>
	);
}
