import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Hero from "@/models/Hero.Model";
import { deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";

// GET single slide by ID
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	try {
		await connectDB();
		
		const hero = await Hero.findOne();
		
		if (!hero) {
			return NextResponse.json(
				{ error: "Hero not found" },
				{ status: 404 }
			);
		}
		
		const slide = hero.slides.id(id);
		
		if (!slide) {
			return NextResponse.json(
				{ error: "Slide not found" },
				{ status: 404 }
			);
		}
		
		return NextResponse.json({ slide });
	} catch (error) {
		console.error("Error fetching slide:", error);
		return NextResponse.json(
			{ error: "Failed to fetch slide" },
			{ status: 500 }
		);
	}
}

// PUT - Update a single slide
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	try {
		await connectDB();
		
		const body = await request.json();
		const { title, description, image, primaryLink, primaryButton, secondaryLink, secondaryButton, order, isActive } = body;
		
		const hero = await Hero.findOne();
		
		if (!hero) {
			return NextResponse.json(
				{ error: "Hero not found" },
				{ status: 404 }
			);
		}
		
		const slide = hero.slides.id(id);
		
		if (!slide) {
			return NextResponse.json(
				{ error: "Slide not found" },
				{ status: 404 }
			);
		}
		
		// Delete old image from Cloudinary if image is being replaced
		if (image !== undefined && slide.image && image !== slide.image) {
			try {
				await deleteFromCloudinary(slide.image, "image");
			} catch (error) {
				console.error("Failed to delete old image from Cloudinary:", error);
			}
		}

		// Update slide fields - use plain objects for multilingual fields
		if (title !== undefined) slide.title = title || {};
		if (description !== undefined) slide.description = description || {};
		if (image !== undefined) slide.image = image;
		if (primaryLink !== undefined) slide.primaryLink = primaryLink;
		if (primaryButton !== undefined) slide.primaryButton = primaryButton || {};
		if (secondaryLink !== undefined) slide.secondaryLink = secondaryLink;
		if (secondaryButton !== undefined) slide.secondaryButton = secondaryButton || {};
		if (order !== undefined) slide.order = order;
		if (isActive !== undefined) slide.isActive = isActive;
		
		await hero.save();
		
		return NextResponse.json({ 
			message: "Slide updated successfully",
			slide 
		});
	} catch (error) {
		console.error("Error updating slide:", error);
		return NextResponse.json(
			{ error: "Failed to update slide" },
			{ status: 500 }
		);
	}
}

// DELETE - Remove a slide
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	try {
		await connectDB();
		
		const hero = await Hero.findOne();
		
		if (!hero) {
			return NextResponse.json(
				{ error: "Hero not found" },
				{ status: 404 }
			);
		}
		
		// Find the slide to delete its image from Cloudinary
		const slideToDelete = hero.slides.id(id);
		
		// Delete image from Cloudinary if it exists
		if (slideToDelete && slideToDelete.image) {
			try {
				await deleteFromCloudinary(slideToDelete.image, "image");
			} catch (error) {
				console.error("Failed to delete image from Cloudinary:", error);
			}
		}
		
		// Remove the slide
		hero.slides.pull(id);
		
		await hero.save();
		
		return NextResponse.json({ 
			message: "Slide deleted successfully" 
		});
	} catch (error) {
		console.error("Error deleting slide:", error);
		return NextResponse.json(
			{ error: "Failed to delete slide" },
			{ status: 500 }
		);
	}
}
