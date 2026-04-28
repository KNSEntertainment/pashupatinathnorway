import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Hero from "@/models/Hero.Model";
import { deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";

interface MultilingualField {
	en: string;
	no: string;
	ne: string;
}

interface HeroSlide {
	_id?: string;
	title: MultilingualField;
	description: MultilingualField;
	image: string;
	primaryLink: string;
	primaryButton: MultilingualField;
	secondaryLink: string;
	secondaryButton: MultilingualField;
	order: number;
	isActive: boolean;
}

// type HeroSlideDocument = HeroSlide & {
// 	_id: string;
// }

// GET all hero slides
export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);
		const locale = searchParams.get("locale") || "en";
		const isEditing = searchParams.get("edit") === "true";

		const hero = await Hero.findOne();

		if (!hero) {
			// Return empty array if no hero exists yet
			return NextResponse.json({ slides: [] });
		}

		// Sort slides by order field and transform for locale
		const sortedSlides = hero.slides
			.sort((a, b) => a.order - b.order)
			.map((slide) => {
				const slideObj = slide.toObject ? slide.toObject() : slide;

				// If editing, return full multilingual data
				if (isEditing) {
					// Ensure we return clean JSON-serializable objects
					return {
						_id: slideObj._id?.toString ? slideObj._id.toString() : slideObj._id,
						title: slideObj.title,
						description: slideObj.description,
						image: slideObj.image || "", // Ensure image is always a string
						primaryLink: slideObj.primaryLink,
						primaryButton: slideObj.primaryButton,
						secondaryLink: slideObj.secondaryLink,
						secondaryButton: slideObj.secondaryButton,
						isActive: slideObj.isActive,
						order: slideObj.order,
					};
				}

				// Otherwise, return single locale version
				const processedSlide = {
					...slideObj,
					title: slide.title[locale] || slide.title.en || "",
					description: slide.description[locale] || slide.description.en || "",
					primaryButton: slide.primaryButton[locale] || slide.primaryButton.en || "",
					secondaryButton: slide.secondaryButton[locale] || slide.secondaryButton.en || "",
				};

				return processedSlide;
			}) as unknown as HeroSlide[];

		return NextResponse.json({ slides: sortedSlides });
	} catch (error) {
		console.error("Error fetching hero slides:", error);
		return NextResponse.json({ error: "Failed to fetch hero slides" }, { status: 500 });
	}
}

// POST - Create or update hero slides
export async function POST(request: Request) {
	try {
		await connectDB();

		const body = await request.json();
		const { slides } = body;

		if (!slides || !Array.isArray(slides)) {
			return NextResponse.json({ error: "Slides array is required" }, { status: 400 });
		}

		// Debug: Log received data
		console.log("Received slides data:", JSON.stringify(slides, null, 2));

		// Validate and process each slide
		const processedSlides = slides.map((slide, index) => {
			// Debug: Log each slide
			console.log(`Processing slide ${index}:`, JSON.stringify(slide, null, 2));

			// Helper function to normalize multilingual field
			const normalizeMultilingualField = (field: MultilingualField | string, fieldName: string): MultilingualField => {
				if (typeof field === "string") {
					// If it's a string, treat it as English content
					console.log(`Converting ${fieldName} from string to object:`, field);
					return { en: field, no: field, ne: field };
				} else if (typeof field === "object" && field !== null) {
					// If it's already an object, ensure it has all language keys
					return {
						en: field.en || field.no || field.ne || "",
						no: field.no || field.en || field.ne || "",
						ne: field.ne || field.en || field.no || "",
					};
				} else {
					// Default empty object
					return { en: "", no: "", ne: "" };
				}
			};

			// Validate and convert multilingual fields to plain objects
			const processedSlide = {
				...slide,
				title: normalizeMultilingualField(slide.title, "title"),
				description: normalizeMultilingualField(slide.description, "description"),
				primaryButton: normalizeMultilingualField(slide.primaryButton, "primaryButton"),
				secondaryButton: normalizeMultilingualField(slide.secondaryButton, "secondaryButton"),
				// Ensure image exists (required field)
				image: slide.image || "",
			};

			// Debug: Log processed slide
			console.log(`Processed slide ${index}:`, JSON.stringify(processedSlide, null, 2));

			// Validate required fields
			if (!processedSlide.primaryLink || !processedSlide.secondaryLink) {
				throw new Error("Button links are required");
			}

			// For new slides, image should be present; for updates, allow existing image
			console.log("Checking image validation:", {
				hasImage: !!processedSlide.image,
				image: processedSlide.image,
				hasId: !!processedSlide._id,
				isNewSlide: !processedSlide._id,
			});

			if (!processedSlide.image && !processedSlide._id) {
				console.log("Image validation failed - no image for new slide");
				throw new Error("Image is required for new slides");
			}

			// Check that at least English content exists for multilingual fields
			console.log("Validating English content:", {
				titleEn: processedSlide.title.en,
				descriptionEn: processedSlide.description.en,
				primaryButtonEn: processedSlide.primaryButton.en,
				secondaryButtonEn: processedSlide.secondaryButton.en,
				titleType: typeof processedSlide.title,
				titleKeys: processedSlide.title ? Object.keys(processedSlide.title) : "no title object",
				fullTitle: processedSlide.title,
				fullDescription: processedSlide.description,
				fullPrimaryButton: processedSlide.primaryButton,
				fullSecondaryButton: processedSlide.secondaryButton,
			});

			// Temporarily disable validation to see what data is being received
			// More flexible validation - check if English content exists and is not empty
			const titleEn = processedSlide.title?.en || "";
			const descriptionEn = processedSlide.description?.en || "";
			const primaryButtonEn = processedSlide.primaryButton?.en || "";
			const secondaryButtonEn = processedSlide.secondaryButton?.en || "";

			console.log("English content values:", {
				titleEn: `"${titleEn}"`,
				descriptionEn: `"${descriptionEn}"`,
				primaryButtonEn: `"${primaryButtonEn}"`,
				secondaryButtonEn: `"${secondaryButtonEn}"`,
			});

			// Re-enable validation with proper logic
			if (!titleEn.trim() || !descriptionEn.trim() || !primaryButtonEn.trim() || !secondaryButtonEn.trim()) {
				console.log("English validation failed:", {
					titleEn: titleEn,
					descriptionEn: descriptionEn,
					primaryButtonEn: primaryButtonEn,
					secondaryButtonEn: secondaryButtonEn,
				});
				throw new Error("English content is required for all text fields");
			}

			return processedSlide;
		});

		// Find existing hero or create new one
		let hero = await Hero.findOne();

		// Debug: Log existing hero data
		if (hero) {
			console.log("Existing hero slides:", JSON.stringify(hero.slides, null, 2));
			// Check if existing data has Map structure (old format)
			if (hero.slides.length > 0 && hero.slides[0].title && typeof hero.slides[0].title === "object" && hero.slides[0].title instanceof Map) {
				console.log("Detected old Map format, clearing existing data...");
				await Hero.deleteMany({});
				hero = null;
			}
		}

		if (hero) {
			// Collect images to delete and track changes
			const imagesToDelete: string[] = [];
			const changedSlides: string[] = [];

			// Store slides reference to maintain type narrowing in callback
			const existingSlides = hero.slides;

			// Check for image deletions and preserve original images when updating
			const slidesWithPreservedImages = processedSlides.map((updatedSlide) => {
				// For existing slides (those with _id), preserve image if no new one provided
				if (updatedSlide._id) {
					const existingSlide = existingSlides.find((s) => s._id?.toString() === updatedSlide._id?.toString());
					if (existingSlide) {
						// If new slide has empty image but existing has image, preserve it
						if (!updatedSlide.image && existingSlide.image) {
							console.log(`Preserving existing image for slide ${updatedSlide._id}: ${existingSlide.image}`);
							updatedSlide.image = existingSlide.image;
						}
						// If image changed, mark old one for deletion
						if (existingSlide.image && updatedSlide.image && updatedSlide.image !== existingSlide.image) {
							console.log(`Image changed for slide ${updatedSlide._id}`);
							console.log(`  Old image: ${existingSlide.image}`);
							console.log(`  New image: ${updatedSlide.image}`);
							imagesToDelete.push(existingSlide.image);
							changedSlides.push(updatedSlide._id.toString());
						}
					}
				}
				return updatedSlide;
			});

			// Delete old images from Cloudinary (after collecting them, before saving to DB)
			if (imagesToDelete.length > 0) {
				console.log(`Deleting ${imagesToDelete.length} old image(s) from Cloudinary`);
				try {
					await Promise.all(
						imagesToDelete.map(async (imageUrl) => {
							try {
								console.log(`Deleting: ${imageUrl}`);
								await deleteFromCloudinary(imageUrl, "image");
								console.log(`Successfully deleted: ${imageUrl}`);
							} catch (error) {
								console.error(`Failed to delete image ${imageUrl}:`, error);
								// Continue with DB save even if deletion fails
							}
						}),
					);
				} catch (error) {
					console.error("Error deleting images from Cloudinary:", error);
					// Continue with DB save even if Cloudinary deletion fails
				}
			}

			// Update existing hero
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(hero as any).slides = slidesWithPreservedImages;
			console.log("Setting hero.slides to:", JSON.stringify(slidesWithPreservedImages, null, 2));
			const updatedHero = await hero.save();

			console.log(`Update complete: ${changedSlides.length} slide(s) updated, ${imagesToDelete.length} old image(s) deleted`);

			return NextResponse.json({
				message: "Hero slides updated successfully",
				slides: updatedHero.slides,
				summary: {
					imagesDeleted: imagesToDelete.length,
					slidesUpdated: changedSlides.length,
					deletedUrls: imagesToDelete,
				},
			});
		} else {
			// Create new hero
			console.log("Creating new hero with slides:", JSON.stringify(processedSlides, null, 2));
			hero = await Hero.create({ slides: processedSlides });

			return NextResponse.json({
				message: "Hero slides created successfully",
				slides: hero.slides,
				summary: {
					imagesDeleted: 0,
					slidesUpdated: 0,
				},
			});
		}
	} catch (error) {
		console.error("Error updating hero slides:", error);
		return NextResponse.json({ error: "Failed to update hero slides" }, { status: 500 });
	}
}
