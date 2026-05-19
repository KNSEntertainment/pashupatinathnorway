import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import AboutUs from "@/models/AboutUs.Model";
import { deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";

interface MultilingualField {
	en: string;
	no: string;
	ne: string;
}


// GET about-us content
export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);
		const locale = searchParams.get("locale") || "en";
		const isEditing = searchParams.get("edit") === "true";

		const aboutUs = await AboutUs.findOne();

		if (!aboutUs) {
			// Return default content if no about-us exists yet
			const defaultContent = {
				title: { en: "Our Vision", no: "Vår Visjon", ne: "हाम्रो दृष्टि" },
				subtitle: { en: "Building Pashupatinath Norway Temple", no: "Bygging av Pashupatinath Norge Tempel", ne: "पशुपतिनाथ नर्वे मन्दिर निर्माण" },
				about_description_1: { 
					en: "Pashupatinath Norway Temple is dedicated to creating a sacred space for worship, spirituality, and cultural preservation for the Hindu community in Norway.",
					no: "Pashupatinath Norge Tempel er dedikert til å skape et hellig rom for tilbedelse, spiritualitet og kulturell bevaring for det hinduiske samfunnet i Norge.",
					ne: "पशुपतिनाथ नर्वे मन्दिर नर्वेमा हिन्दू समुदायको लागि पूजा, आध्यात्मिकता र सांस्कृतिक संरक्षणको लागि पवित्र स्थान सिर्जना गर्न समर्पित छ।"
				},
				about_description_2: { 
					en: "Our goal is to build the first Nepali Hindu temple in Norway, where devotees can gather for prayers, rituals, and festivals that honor our rich traditions.",
					no: "Vårt mål er å bygge det første nepalske hindu-tempelet i Norge, hvor tilhengere kan samles for bønner, ritualer og festivaler som ærer våre rike tradisjoner.",
					ne: "हाम्रो लक्ष्य नर्वेमा पहिलो नेपाली हिन्दू मन्दिर बनाउनु हो, जहाँ भक्तहरू हाम्रा समृद्ध परम्पराहरूको सम्मान गर्ने प्रार्थना, रीतिरिवाज र चाडपर्वहरूको लागि एकत्रित हुन सक्छन्।"
				},
				more_about_us: { en: "More About Us", no: "Mer Om Oss", ne: "हाम्रो बारेमा थप" },
				image: "/pashupatinath.png",
				stats: {
					active_members: "200+",
					months_active: "6+",
					active_members_label: { en: "Active Members", no: "Aktive Medlemmer", ne: "सक्रिय सदस्यहरू" },
					months_active_label: { en: "Months Active", no: "Måneder Aktiv", ne: "महिना सक्रिय" }
				}
			};

			if (isEditing) {
				return NextResponse.json(defaultContent);
			} else {
				// Return single locale version for frontend
				const localizedContent = {
					title: defaultContent.title[locale as keyof MultilingualField] || defaultContent.title.en,
					subtitle: defaultContent.subtitle[locale as keyof MultilingualField] || defaultContent.subtitle.en,
					about_description_1: defaultContent.about_description_1[locale as keyof MultilingualField] || defaultContent.about_description_1.en,
					about_description_2: defaultContent.about_description_2[locale as keyof MultilingualField] || defaultContent.about_description_2.en,
					more_about_us: defaultContent.more_about_us[locale as keyof MultilingualField] || defaultContent.more_about_us.en,
					image: defaultContent.image,
					stats: {
						active_members: defaultContent.stats.active_members,
						months_active: defaultContent.stats.months_active,
						active_members_label: defaultContent.stats.active_members_label[locale as keyof MultilingualField] || defaultContent.stats.active_members_label.en,
						months_active_label: defaultContent.stats.months_active_label[locale as keyof MultilingualField] || defaultContent.stats.months_active_label.en
					}
				};
				return NextResponse.json(localizedContent);
			}
		}

		// Transform for locale
		const aboutUsObj = aboutUs.toObject ? aboutUs.toObject() : aboutUs;

		if (isEditing) {
			// Return full multilingual data for editing
			return NextResponse.json(aboutUsObj);
		}

		// Return single locale version for frontend
		const localizedContent = {
			title: aboutUs.title?.[locale as keyof MultilingualField] || aboutUs.title?.en || "",
			subtitle: aboutUs.subtitle?.[locale as keyof MultilingualField] || aboutUs.subtitle?.en || "",
			about_description_1: aboutUs.about_description_1?.[locale as keyof MultilingualField] || aboutUs.about_description_1?.en || "",
			about_description_2: aboutUs.about_description_2?.[locale as keyof MultilingualField] || aboutUs.about_description_2?.en || "",
			more_about_us: aboutUs.more_about_us?.[locale as keyof MultilingualField] || aboutUs.more_about_us?.en || "",
			image: aboutUs.image || "",
			stats: {
				active_members: aboutUs.stats?.active_members || "200+",
				months_active: aboutUs.stats?.months_active || "6+",
				active_members_label: aboutUs.stats?.active_members_label?.[locale as keyof MultilingualField] || aboutUs.stats?.active_members_label?.en || "Active Members",
				months_active_label: aboutUs.stats?.months_active_label?.[locale as keyof MultilingualField] || aboutUs.stats?.months_active_label?.en || "Months Active"
			}
		};

		return NextResponse.json(localizedContent);
	} catch (error) {
		console.error("Error fetching about-us content:", error);
		return NextResponse.json({ error: "Failed to fetch about-us content" }, { status: 500 });
	}
}

// POST - Create or update about-us content
export async function POST(request: Request) {
	try {
		await connectDB();

		const body = await request.json();

		// Helper function to normalize multilingual field
		const normalizeMultilingualField = (field: MultilingualField | string): MultilingualField => {
			if (typeof field === "string") {
				// If it's a string, treat it as English content
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

		// Process the data
		const processedData = {
			title: normalizeMultilingualField(body.title),
			subtitle: normalizeMultilingualField(body.subtitle),
			about_description_1: normalizeMultilingualField(body.about_description_1),
			about_description_2: normalizeMultilingualField(body.about_description_2),
			more_about_us: normalizeMultilingualField(body.more_about_us),
			image: body.image || "/pashupatinath.png",
			stats: {
				active_members: body.stats?.active_members || "200+",
				months_active: body.stats?.months_active || "6+",
				active_members_label: normalizeMultilingualField(body.stats?.active_members_label),
				months_active_label: normalizeMultilingualField(body.stats?.months_active_label)
			}
		};

		// Validate required fields
		const titleEn = processedData.title?.en || "";
		const subtitleEn = processedData.subtitle?.en || "";
		const about1En = processedData.about_description_1?.en || "";
		const about2En = processedData.about_description_2?.en || "";

		if (!titleEn.trim() || !subtitleEn.trim() || !about1En.trim() || !about2En.trim()) {
			return NextResponse.json({ error: "English content is required for all text fields" }, { status: 400 });
		}

		// Find existing about-us or create new one
		let aboutUs = await AboutUs.findOne();

		if (aboutUs) {
			// Update existing about-us
			const oldImage = aboutUs.image;
			
			// Update fields
			aboutUs.title = processedData.title;
			aboutUs.subtitle = processedData.subtitle;
			aboutUs.about_description_1 = processedData.about_description_1;
			aboutUs.about_description_2 = processedData.about_description_2;
			aboutUs.more_about_us = processedData.more_about_us;
			aboutUs.image = processedData.image;
			aboutUs.stats = processedData.stats;

			const updatedAboutUs = await aboutUs.save();

			// Delete old image from Cloudinary if it changed
			if (oldImage && oldImage !== processedData.image && oldImage.startsWith("http")) {
				try {
					await deleteFromCloudinary(oldImage, "image");
					console.log(`Successfully deleted old image: ${oldImage}`);
				} catch (error) {
					console.error(`Failed to delete old image ${oldImage}:`, error);
				}
			}

			return NextResponse.json({
				message: "About Us content updated successfully",
				data: updatedAboutUs
			});
		} else {
			// Create new about-us
			aboutUs = await AboutUs.create(processedData);

			return NextResponse.json({
				message: "About Us content created successfully",
				data: aboutUs
			});
		}
	} catch (error) {
		console.error("Error saving about-us content:", error);
		return NextResponse.json({ error: "Failed to save about-us content" }, { status: 500 });
	}
}
