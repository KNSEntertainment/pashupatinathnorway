import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import MissionVision from "@/models/MissionVision.Model";

interface MultilingualField {
	en: string;
	no: string;
	ne: string;
}


// GET mission-vision content
export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);
		const locale = searchParams.get("locale") || "en";
		const isEditing = searchParams.get("edit") === "true";

		const missionVision = await MissionVision.findOne();

		if (!missionVision) {
			// Return default content if no mission-vision exists yet
			const defaultContent = {
				mission: {
					title: { 
						en: "Our Mission", 
						no: "Vårt Oppdrag", 
						ne: "हाम्रो मिशन" 
					},
					description: { 
						en: "To create a sacred space for worship, spirituality, and cultural preservation for the Hindu community in Norway, fostering unity and spiritual growth.",
						no: "Å skape et hellig rom for tilbedelse, spiritualitet og kulturell bevaring for det hinduiske samfunnet i Norge, og fremme enhet og åndelig vekst.",
						ne: "नर्वेमा हिन्दू समुदायको लागि पूजा, आध्यात्मिकता र सांस्कृतिक संरक्षणको लागि पवित्र स्थान सिर्जना गर्नु, एकता र आध्यात्मिक वृद्धिलाई प्रोत्साहन गर्नु।"
					}
				},
				vision: {
					title: { 
						en: "Our Vision", 
						no: "Vår Visjon", 
						ne: "हाम्रो दृष्टि" 
					},
					description: { 
						en: "To build the first Nepali Hindu temple in Norway, becoming a beacon of cultural heritage and spiritual enlightenment for future generations.",
						no: "Å bygge det første nepalske hindu-tempelet i Norge, og bli et fyrtårn for kulturarv og åndelig opplysning for fremtidige generasjoner.",
						ne: "नर्वेमा पहिलो नेपाली हिन्दू मन्दिर बनाउनु, भावी पुस्ताहरूको लागि सांस्कृतिक सम्पदा र आध्यात्मिक प्रबोधको प्रकाश स्तम्भ बन्नु।"
					}
				}
			};

			if (isEditing) {
				return NextResponse.json(defaultContent);
			} else {
				// Return single locale version for frontend
				const localizedContent = {
					mission: {
						title: defaultContent.mission.title[locale as keyof MultilingualField] || defaultContent.mission.title.en,
						description: defaultContent.mission.description[locale as keyof MultilingualField] || defaultContent.mission.description.en
					},
					vision: {
						title: defaultContent.vision.title[locale as keyof MultilingualField] || defaultContent.vision.title.en,
						description: defaultContent.vision.description[locale as keyof MultilingualField] || defaultContent.vision.description.en
					}
				};
				return NextResponse.json(localizedContent);
			}
		}

		// Transform for locale
		const missionVisionObj = missionVision.toObject ? missionVision.toObject() : missionVision;

		if (isEditing) {
			// Return full multilingual data for editing
			return NextResponse.json(missionVisionObj);
		}

		// Return single locale version for frontend
		const localizedContent = {
			mission: {
				title: missionVision.mission?.title?.[locale as keyof MultilingualField] || missionVision.mission?.title?.en || "",
				description: missionVision.mission?.description?.[locale as keyof MultilingualField] || missionVision.mission?.description?.en || ""
			},
			vision: {
				title: missionVision.vision?.title?.[locale as keyof MultilingualField] || missionVision.vision?.title?.en || "",
				description: missionVision.vision?.description?.[locale as keyof MultilingualField] || missionVision.vision?.description?.en || ""
			}
		};

		return NextResponse.json(localizedContent);
	} catch (error) {
		console.error("Error fetching mission-vision content:", error);
		return NextResponse.json({ error: "Failed to fetch mission-vision content" }, { status: 500 });
	}
}

// POST - Create or update mission-vision content
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
			mission: {
				title: normalizeMultilingualField(body.mission?.title),
				description: normalizeMultilingualField(body.mission?.description)
			},
			vision: {
				title: normalizeMultilingualField(body.vision?.title),
				description: normalizeMultilingualField(body.vision?.description)
			}
		};

		// Validate required fields
		const missionTitleEn = processedData.mission?.title?.en || "";
		const missionDescEn = processedData.mission?.description?.en || "";
		const visionTitleEn = processedData.vision?.title?.en || "";
		const visionDescEn = processedData.vision?.description?.en || "";

		if (!missionTitleEn.trim() || !missionDescEn.trim() || !visionTitleEn.trim() || !visionDescEn.trim()) {
			return NextResponse.json({ error: "English content is required for all text fields" }, { status: 400 });
		}

		// Find existing mission-vision or create new one
		let missionVision = await MissionVision.findOne();

		if (missionVision) {
			// Update existing mission-vision
			missionVision.mission = processedData.mission;
			missionVision.vision = processedData.vision;

			const updatedMissionVision = await missionVision.save();

			return NextResponse.json({
				message: "Mission Vision content updated successfully",
				data: updatedMissionVision
			});
		} else {
			// Create new mission-vision
			missionVision = await MissionVision.create(processedData);

			return NextResponse.json({
				message: "Mission Vision content created successfully",
				data: missionVision
			});
		}
	} catch (error) {
		console.error("Error saving mission-vision content:", error);
		return NextResponse.json({ error: "Failed to save mission-vision content" }, { status: 500 });
	}
}
