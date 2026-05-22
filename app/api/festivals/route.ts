import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Festivals from "@/models/Festivals.Model";
import { requireAdmin } from "@/lib/apiAuth";

interface MultilingualField {
	en: string;
	no: string;
	ne: string;
}

interface MultilingualArray {
	en: string[];
	no: string[];
	ne: string[];
}

// GET festivals content
export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);
		const locale = searchParams.get("locale") || "en";
		const isEditing = searchParams.get("edit") === "true";
		const id = searchParams.get("id");

		if (id) {
			// Get specific festival by ID
			const festival = await Festivals.findById(id);
			if (!festival) {
				return NextResponse.json({ error: "Festival not found" }, { status: 404 });
			}

			if (isEditing) {
				return NextResponse.json(festival);
			}

			// Return single locale version
			const festivalObj = festival.toObject ? festival.toObject() : festival;
			const localizedFestival = {
				...festivalObj,
				title: festivalObj.title?.[locale as keyof MultilingualField] || festivalObj.title?.en || "",
				description: festivalObj.description?.[locale as keyof MultilingualField] || festivalObj.description?.en || "",
				features: festivalObj.features?.[locale as keyof MultilingualArray] || festivalObj.features?.en || [],
				timing: festivalObj.timing?.[locale as keyof MultilingualField] || festivalObj.timing?.en || ""
			};

			return NextResponse.json(localizedFestival);
		}

		// Get all festivals
		const festivals = await Festivals.find({ isActive: true }).sort({ highlight: -1, order: 1, createdAt: 1 });

		if (festivals.length === 0) {
			// Return default content if no festivals exist yet
			const defaultContent = [
				{
					id: "maha-shivaratri",
					title: { 
						en: "Maha Shivaratri", 
						no: "Maha Shivaratri", 
						ne: "महा शिवरात्रि" 
					},
					description: { 
						en: "A grand celebration of Lord Shiva with night-long prayers and rituals. Annual General Meeting will be arranged on this occasion.",
						no: "En stor feiring av Lord Shiva med nattlange bønner og ritualer. Årsmøte vil bli arrangert i denne anledningen.",
						ne: "भगवान शिवको ठूलो उत्सव रातभरि प्रार्थना र अनुष्ठानहरूसहित। यस अवसरमा वार्षिक साधारण बैठक आयोजना गरिनेछ।"
					},
					icon: "Star",
					features: {
						en: ["Night-long prayers and meditation", "Sacred Shiva lingam abhishek", "Annual General Meeting"],
						no: ["Nattlange bønner og meditasjon", "Hellig Shiva lingam abhishek", "Årsmøte"],
						ne: ["रातभरि प्रार्थना र ध्यान", "पवित्र शिव लिङ्ग अभिषेक", "वार्षिक साधारण बैठक"]
					},
					timing: {
						en: "February/March annually",
						no: "Februar/mars årlig",
						ne: "फेब्रुअरी/मार्च वार्षिक"
					},
					highlight: true,
					order: 0,
					isActive: true
				},
				{
					id: "teej",
					title: { 
						en: "Teej", 
						no: "Teej", 
						ne: "तीज" 
					},
					description: { 
						en: "Celebrations of devotion, family, and the triumph of good over evil.",
						no: "Feiringer av fromhet, familie, og triumfen av godt over ondt.",
						ne: "भक्ति, परिवार, र असललाई बुरामाथि विजयको उत्सव।"
					},
					icon: "Heart",
					features: {
						en: ["Women's fasting and prayers", "Traditional dances and songs", "Family gatherings and blessings"],
						no: ["Kvinners faste og bønner", "Tradisjonelle danser og sanger", "Familiesamlinger og velsignelser"],
						ne: ["महिलाहरूको उपवास र प्रार्थना", "परम्परागत नृत्य र गीतहरू", "परिवारिक भेटघाट र आशीर्वाद"]
					},
					timing: {
						en: "August/September annually",
						no: "August/september årlig",
						ne: "अगस्ट/सेप्टेम्बर वार्षिक"
					},
					highlight: false,
					order: 1,
					isActive: true
				},
				{
					id: "dashain-tihar",
					title: { 
						en: "Dashain & Tihar", 
						no: "Dashain & Tihar", 
						ne: "दशैं र तिहार" 
					},
					description: { 
						en: "The Festival of Lights, celebrating victory and new beginnings.",
						no: "Lysenes festival, feirer seier og nye begynnelser.",
						ne: "उज्यालोको चाड, विजय र नयाँ सुरुवातको उत्सव।"
					},
					icon: "Sparkles",
					features: {
						en: ["Tika blessings and family reunions", "Diyo lighting and decorations", "Traditional feasts and celebrations"],
						no: ["Tika velsignelser og familiesammenkomster", "Diyo belysning og dekorasjoner", "Tradisjonelle fester og feiringer"],
						ne: ["टीका आशीर्वाद र परिवारिक पुनर्मिलन", "दियो बाल्ने र सजावट", "परम्परागत भोज र उत्सव"]
					},
					timing: {
						en: "October annually",
						no: "Oktober årlig",
						ne: "अक्टोबर वार्षिक"
					},
					highlight: false,
					order: 2,
					isActive: true
				},
				{
					id: "holi",
					title: { 
						en: "Holi", 
						no: "Holi", 
						ne: "होली" 
					},
					description: { 
						en: "The colorful festival of love, unity, and joy.",
						no: "Den fargerike festivalen av kjærlighet, enhet og glede.",
						ne: "प्रेम, एकता र खुशीको रंगीन चाड।"
					},
					icon: "PartyPopper",
					features: {
						en: ["Colorful powders and water play", "Traditional sweets and music", "Community celebration and joy"],
						no: ["Fargerike pulvere og vannlek", "Tradisjonelle søtsaker og musikk", "Samfunnsfeiring og glede"],
						ne: ["रंगीन पाउडर र पानी खेल", "परम्परागत मिठाई र संगीत", "सामुदायिक उत्सव र खुशी"]
					},
					timing: {
						en: "March annually",
						no: "Mars årlig",
						ne: "मार्च वार्षिक"
					},
					highlight: false,
					order: 3,
					isActive: true
				}
			];

			if (isEditing) {
				return NextResponse.json(defaultContent);
			} else {
				// Return single locale version for frontend
				const localizedContent = defaultContent.map(festival => ({
					...festival,
					title: festival.title[locale as keyof MultilingualField] || festival.title.en,
					description: festival.description[locale as keyof MultilingualField] || festival.description.en,
					features: festival.features[locale as keyof MultilingualArray] || festival.features.en,
					timing: festival.timing[locale as keyof MultilingualField] || festival.timing.en
				}));
				return NextResponse.json(localizedContent);
			}
		}

		// Transform for locale
		const festivalsObj = festivals.map(festival => {
			const festivalData = festival.toObject ? festival.toObject() : festival;
			
			if (isEditing) {
				return festivalData;
			}

			// Return single locale version for frontend
			return {
				...festivalData,
				title: festivalData.title?.[locale as keyof MultilingualField] || festivalData.title?.en || "",
				description: festivalData.description?.[locale as keyof MultilingualField] || festivalData.description?.en || "",
				features: festivalData.features?.[locale as keyof MultilingualArray] || festivalData.features?.en || [],
				timing: festivalData.timing?.[locale as keyof MultilingualField] || festivalData.timing?.en || ""
			};
		});

		return NextResponse.json(festivalsObj);
	} catch (error) {
		console.error("Error fetching festivals content:", error);
		return NextResponse.json({ error: "Failed to fetch festivals content" }, { status: 500 });
	}
}

// POST - Create new festival
export async function POST(request: Request) {
	try {
		const auth = await requireAdmin();
		if (auth.response) return auth.response;

		await connectDB();

		const body = await request.json();

		// Helper function to normalize multilingual field
		const normalizeMultilingualField = (field: MultilingualField | string): MultilingualField => {
			if (typeof field === "string") {
				return { en: field, no: field, ne: field };
			} else if (typeof field === "object" && field !== null) {
				return {
					en: field.en || field.no || field.ne || "",
					no: field.no || field.en || field.ne || "",
					ne: field.ne || field.en || field.no || "",
				};
			} else {
				return { en: "", no: "", ne: "" };
			}
		};

		// Helper function to normalize multilingual array
		const normalizeMultilingualArray = (field: MultilingualArray | string[]): MultilingualArray => {
			if (Array.isArray(field)) {
				return { en: field, no: field, ne: field };
			} else if (typeof field === "object" && field !== null) {
				return {
					en: field.en || [],
					no: field.no || [],
					ne: field.ne || []
				};
			} else {
				return { en: [], no: [], ne: [] };
			}
		};

		// Process the data
		const processedData = {
			title: normalizeMultilingualField(body.title),
			description: normalizeMultilingualField(body.description),
			icon: body.icon || "Star",
			features: normalizeMultilingualArray(body.features),
			timing: normalizeMultilingualField(body.timing),
			highlight: body.highlight || false,
			order: body.order || 0,
			isActive: body.isActive !== undefined ? body.isActive : true
		};

		// Validate required fields
		const titleEn = processedData.title?.en || "";
		const descEn = processedData.description?.en || "";

		if (!titleEn.trim() || !descEn.trim()) {
			return NextResponse.json({ error: "English title and description are required" }, { status: 400 });
		}

		// Create new festival
		const festival = await Festivals.create(processedData);

		return NextResponse.json({
			message: "Festival created successfully",
			data: festival
		});
	} catch (error) {
		console.error("Error creating festival:", error);
		return NextResponse.json({ error: "Failed to create festival" }, { status: 500 });
	}
}

// PUT - Update festival
export async function PUT(request: Request) {
	try {
		const auth = await requireAdmin();
		if (auth.response) return auth.response;

		await connectDB();

		const body = await request.json();
		const { id } = body;

		if (!id) {
			return NextResponse.json({ error: "Festival ID is required" }, { status: 400 });
		}

		// Helper function to normalize multilingual field
		const normalizeMultilingualField = (field: MultilingualField | string): MultilingualField => {
			if (typeof field === "string") {
				return { en: field, no: field, ne: field };
			} else if (typeof field === "object" && field !== null) {
				return {
					en: field.en || field.no || field.ne || "",
					no: field.no || field.en || field.ne || "",
					ne: field.ne || field.en || field.no || "",
				};
			} else {
				return { en: "", no: "", ne: "" };
			}
		};

		// Helper function to normalize multilingual array
		const normalizeMultilingualArray = (field: MultilingualArray | string[]): MultilingualArray => {
			if (Array.isArray(field)) {
				return { en: field, no: field, ne: field };
			} else if (typeof field === "object" && field !== null) {
				return {
					en: field.en || [],
					no: field.no || [],
					ne: field.ne || []
				};
			} else {
				return { en: [], no: [], ne: [] };
			}
		};

		// Process the data
		const processedData = {
			title: normalizeMultilingualField(body.title),
			description: normalizeMultilingualField(body.description),
			icon: body.icon,
			features: normalizeMultilingualArray(body.features),
			timing: normalizeMultilingualField(body.timing),
			highlight: body.highlight,
			order: body.order,
			isActive: body.isActive
		};

		// Validate required fields
		const titleEn = processedData.title?.en || "";
		const descEn = processedData.description?.en || "";

		if (!titleEn.trim() || !descEn.trim()) {
			return NextResponse.json({ error: "English title and description are required" }, { status: 400 });
		}

		// Update festival
		const festival = await Festivals.findByIdAndUpdate(
			id,
			processedData,
			{ new: true, runValidators: true }
		);

		if (!festival) {
			return NextResponse.json({ error: "Festival not found" }, { status: 404 });
		}

		return NextResponse.json({
			message: "Festival updated successfully",
			data: festival
		});
	} catch (error) {
		console.error("Error updating festival:", error);
		return NextResponse.json({ error: "Failed to update festival" }, { status: 500 });
	}
}

// DELETE - Delete festival
export async function DELETE(request: NextRequest) {
	try {
		const auth = await requireAdmin();
		if (auth.response) return auth.response;

		await connectDB();

		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json({ error: "Festival ID is required" }, { status: 400 });
		}

		const festival = await Festivals.findByIdAndDelete(id);

		if (!festival) {
			return NextResponse.json({ error: "Festival not found" }, { status: 404 });
		}

		return NextResponse.json({
			message: "Festival deleted successfully"
		});
	} catch (error) {
		console.error("Error deleting festival:", error);
		return NextResponse.json({ error: "Failed to delete festival" }, { status: 500 });
	}
}
