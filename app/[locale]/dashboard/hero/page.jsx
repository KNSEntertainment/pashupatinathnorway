"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Pencil, Trash2, Plus, Image as ImageIcon, MoveUp, MoveDown } from "lucide-react";
import Image from "next/image";
import HeroSlideForm from "@/components/HeroSlideForm";
import useFetchData from "@/hooks/useFetchData";

export default function HeroPage() {
	const [openSlideModal, setOpenSlideModal] = useState(false);
	const [slideToEdit, setSlideToEdit] = useState(null);
	const { data: heroData, error, loading, mutate } = useFetchData("/api/hero", "slides");

	if (loading) return <p>Loading...</p>;
	if (error) return <p>Error: {error}</p>;

	const slides = Array.isArray(heroData) ? heroData : [];

	const handleEdit = async (slide) => {
		try {
			// Fetch full multilingual data for editing
			const response = await fetch(`/api/hero?edit=true`);
			const data = await response.json();
			const fullSlide = data.slides.find((s) => s._id === slide._id);
			setSlideToEdit(fullSlide);
			setOpenSlideModal(true);
		} catch (error) {
			console.error("Error fetching slide for editing:", error);
		}
	};

	const handleDelete = async (slideId) => {
		if (window.confirm("Are you sure you want to delete this slide?")) {
			try {
				const response = await fetch(`/api/hero/${slideId}`, {
					method: "DELETE",
				});
				if (!response.ok) {
					throw new Error("Failed to delete slide");
				}
				mutate();
			} catch (error) {
				console.error("Error deleting slide:", error);
				alert("Failed to delete slide");
			}
		}
	};

	const handleReorder = async (slideId, direction) => {
		const currentIndex = slides.findIndex((slide) => slide._id === slideId);
		if (currentIndex === -1) return;

		const newIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;
		if (newIndex < 0 || newIndex >= slides.length) return;

		const reorderedSlides = [...slides];
		const [movedSlide] = reorderedSlides.splice(currentIndex, 1);
		reorderedSlides.splice(newIndex, 0, movedSlide);

		// Update order values
		reorderedSlides.forEach((slide, index) => {
			slide.order = index;
		});

		try {
			const response = await fetch("/api/hero", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ slides: reorderedSlides }),
			});
			if (!response.ok) {
				throw new Error("Failed to reorder slides");
			}
			mutate();
		} catch (error) {
			console.error("Error reordering slides:", error);
			alert("Failed to reorder slides");
		}
	};

	const handleToggleActive = async (slideId) => {
		const updatedSlides = slides.map((slide) => (slide._id === slideId ? { ...slide, isActive: !slide.isActive } : slide));

		try {
			const response = await fetch("/api/hero", {
				method: "POST",
				headers: {
					"Content-Type": "application/json",
				},
				body: JSON.stringify({ slides: updatedSlides }),
			});
			if (!response.ok) {
				throw new Error("Failed to update slide");
			}
			mutate();
		} catch (error) {
			console.error("Error updating slide:", error);
			alert("Failed to update slide");
		}
	};

	return (
		<div className="p-6">
			<div className="flex justify-between items-center mb-6">
				<h1 className="text-3xl font-bold">Hero Section Management</h1>
				<Button onClick={() => setOpenSlideModal(true)} className="flex items-center gap-2">
					<Plus className="w-4 h-4" />
					Add New Slide
				</Button>
			</div>

			{slides.length === 0 ? (
				<Card>
					<CardContent className="flex flex-col items-center justify-center py-12">
						<ImageIcon className="w-16 h-16 text-gray-400 mb-4" />
						<h3 className="text-xl font-semibold text-gray-600 mb-2">No Hero Slides</h3>
						<p className="text-gray-500 mb-4">Create your first hero slide to get started</p>
						<Button onClick={() => setOpenSlideModal(true)} className="flex items-center gap-2">
							<Plus className="w-4 h-4" />
							Create First Slide
						</Button>
					</CardContent>
				</Card>
			) : (
				<div className="space-y-4">
					{slides.map((slide, index) => (
						<Card key={slide._id} className={`${!slide.isActive ? "opacity-60" : ""}`}>
							<CardHeader>
								<div className="flex items-center justify-between">
									<CardTitle className="flex items-center gap-2">
										<ImageIcon className="w-5 h-5" />
										Slide {index + 1}
										{!slide.isActive && <span className="text-sm text-gray-500">(Inactive)</span>}
									</CardTitle>
									<div className="flex items-center gap-2">
										<Button variant="outline" size="sm" onClick={() => handleReorder(slide._id, "up")} disabled={index === 0}>
											<MoveUp className="w-4 h-4" />
										</Button>
										<Button variant="outline" size="sm" onClick={() => handleReorder(slide._id, "down")} disabled={index === slides.length - 1}>
											<MoveDown className="w-4 h-4" />
										</Button>
										<Button variant="outline" size="sm" onClick={() => handleToggleActive(slide._id)}>
											{slide.isActive ? "Deactivate" : "Activate"}
										</Button>
										<Button variant="outline" size="sm" onClick={() => handleEdit(slide)}>
											<Pencil className="w-4 h-4" />
										</Button>
										<Button variant="destructive" size="sm" onClick={() => handleDelete(slide._id)}>
											<Trash2 className="w-4 h-4" />
										</Button>
									</div>
								</div>
							</CardHeader>
							<CardContent>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
									<div>
										<div className="relative aspect-video rounded-lg overflow-hidden bg-gray-100">
											<Image src={slide.image} alt={slide.title} fill sizes="100%" className="object-cover" />
										</div>
									</div>
									<div className="space-y-4">
										<div>
											<h4 className="font-semibold text-lg mb-2">{slide.title}</h4>
											<p className="text-gray-600 text-sm">{slide.description}</p>
										</div>
										<div className="space-y-2">
											<div className="flex items-center gap-2">
												<span className="font-medium text-sm">Primary Button:</span>
												<span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">{slide.primaryButton}</span>
												<span className="text-sm text-gray-500">({slide.primaryLink})</span>
											</div>
											<div className="flex items-center gap-2">
												<span className="font-medium text-sm">Secondary Button:</span>
												<span className="text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">{slide.secondaryButton}</span>
												<span className="text-sm text-gray-500">({slide.secondaryLink})</span>
											</div>
										</div>
									</div>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			)}

			{openSlideModal && (
				<HeroSlideForm
					slide={slideToEdit}
					onClose={() => {
						setOpenSlideModal(false);
						setSlideToEdit(null);
					}}
					onSuccess={() => {
						mutate();
						setOpenSlideModal(false);
						setSlideToEdit(null);
					}}
				/>
			)}
		</div>
	);
}
