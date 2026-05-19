import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Rituals from "@/models/Rituals.Model";

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

// GET rituals content
export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);
		const locale = searchParams.get("locale") || "en";
		const isEditing = searchParams.get("edit") === "true";
		const id = searchParams.get("id");

		if (id) {
			// Get specific ritual by ID
			const ritual = await Rituals.findById(id);
			if (!ritual) {
				return NextResponse.json({ error: "Ritual not found" }, { status: 404 });
			}

			if (isEditing) {
				return NextResponse.json(ritual);
			}

			// Return single locale version
			const ritualObj = ritual.toObject ? ritual.toObject() : ritual;
			const localizedRitual = {
				...ritualObj,
				title: ritualObj.title?.[locale as keyof MultilingualField] || ritualObj.title?.en || "",
				description: ritualObj.description?.[locale as keyof MultilingualField] || ritualObj.description?.en || "",
				features: ritualObj.features?.[locale as keyof MultilingualArray] || ritualObj.features?.en || [],
				timing: ritualObj.timing?.[locale as keyof MultilingualField] || ritualObj.timing?.en || ""
			};

			return NextResponse.json(localizedRitual);
		}

		// Get all rituals
		const rituals = await Rituals.find({ isActive: true }).sort({ order: 1, createdAt: 1 });

		if (rituals.length === 0) {
			// Return default content if no rituals exist yet
			const defaultContent = [
				{
					id: "daily-puja",
					title: { 
						en: "Daily Puja & Aarti", 
						no: "Daglig Puja & Aarti", 
						ne: "दैनिक पूजा र आरती" 
					},
					description: { 
						en: "Worship and prayers for peace and prosperity.",
						no: "Tilbeding og bønner for fred og velstand.",
						ne: "शान्ति र समृद्धिको लागि पूजा र प्रार्थना।"
					},
					icon: "Building",
					features: {
						en: ["Morning and evening prayers", "Sacred fire ceremony", "Blessings for devotees"],
						no: ["Morgen- og kveldsbønner", "Hellig ild-seremoni", "Velsignelser for tilbedere"],
						ne: ["बिहान र बेलुकीको प्रार्थना", "पवित्र आगुन समारोह", "भक्तहरूको लागि आशीर्वाद"]
					},
					timing: {
						en: "Daily: 6:00 AM & 6:00 PM",
						no: "Daglig: 06:00 & 18:00",
						ne: "दैनिक: बिहान ६:०० र बेलुका ६:००"
					},
					order: 0,
					isActive: true
				},
				{
					id: "rudrabhishek",
					title: { 
						en: "Rudrabhishek", 
						no: "Rudrabhishek", 
						ne: "रुद्राभिषेक" 
					},
					description: { 
						en: "Special offering to Lord Shiva for blessings and protection.",
						no: "Spesielt tilbud til Lord Shiva for velsignelser og beskyttelse.",
						ne: "भगवान शिवलाई आशीर्वाद र सुरक्षाको लागि विशेष अर्पण।"
					},
					icon: "Flame",
					features: {
						en: ["Abhishek with sacred waters", "Chanting of powerful mantras", "Divine protection blessings"],
						no: ["Abhishek med hellige vann", "Kanting av kraftfulle mantran", "Guddommelige beskyttelsesvelsignelser"],
						ne: ["पवित्र जलसँग अभिषेक", "शक्तिशाली मन्त्रहरूको जाप", "दिव्य सुरक्षा आशीर्वाद"]
					},
					timing: {
						en: "By appointment",
						no: "Etter avtale",
						ne: "अपोइन्टमेन्ट अनुसार"
					},
					order: 1,
					isActive: true
				},
				{
					id: "satyanarayan",
					title: { 
						en: "Satyanarayan Katha", 
						no: "Satyanarayan Katha", 
						ne: "सत्यनारायण कथा" 
					},
					description: { 
						en: "A ritual for well-being, success, and family harmony.",
						no: "Et ritual for velvære, suksess og familiarmoni.",
						ne: "समृद्धि, सफलता र परिवारिक सद्भावको लागि एक अनुष्ठान।"
					},
					icon: "Heart",
					features: {
						en: ["Story of Lord Satyanarayan", "Prasad distribution", "Family blessings"],
						no: ["Historien om Lord Satyanarayan", "Prasad-distribusjon", "Familiens velsignelser"],
						ne: ["भगवान सत्यनारायणको कथा", "प्रसाद वितरण", "परिवारको आशीर्वाद"]
					},
					timing: {
						en: "Weekends & Full Moon Days",
						no: "Helger & Fullmånedsdager",
						ne: "सप्ताहान्त र पूर्णिमाको दिन"
					},
					order: 2,
					isActive: true
				},
				{
					id: "hawan",
					title: { 
						en: "Hawan & Yangya", 
						no: "Hawan & Yangya", 
						ne: "हवन र यज्ञ" 
					},
					description: { 
						en: "Fire rituals for purification and divine blessings.",
						no: "Ild-ritualer for renselse og guddommelige velsignelser.",
						ne: "शुद्धिकरण र दिव्य आशीर्वादको लागि आगुन अनुष्ठानहरू।"
					},
					icon: "Sparkles",
					features: {
						en: ["Sacred fire ceremony", "Offering to divine energies", "Environmental purification"],
						no: ["Hellig ild-seremoni", "Tilbud til guddommelige energier", "Miljømessig renselse"],
						ne: ["पवित्र आगुन समारोह", "दिव्य ऊर्जाहरूमा अर्पण", "वातावरणीय शुद्धिकरण"]
					},
					timing: {
						en: "Special occasions",
						no: "Spesielle anledninger",
						ne: "विशेष अवसरहरू"
					},
					order: 3,
					isActive: true
				}
			];

			if (isEditing) {
				return NextResponse.json(defaultContent);
			} else {
				// Return single locale version for frontend
				const localizedContent = defaultContent.map(ritual => ({
					...ritual,
					title: ritual.title[locale as keyof MultilingualField] || ritual.title.en,
					description: ritual.description[locale as keyof MultilingualField] || ritual.description.en,
					features: ritual.features[locale as keyof MultilingualArray] || ritual.features.en,
					timing: ritual.timing[locale as keyof MultilingualField] || ritual.timing.en
				}));
				return NextResponse.json(localizedContent);
			}
		}

		// Transform for locale
		const ritualsObj = rituals.map(ritual => {
			const ritualData = ritual.toObject ? ritual.toObject() : ritual;
			
			if (isEditing) {
				return ritualData;
			}

			// Return single locale version for frontend
			return {
				...ritualData,
				title: ritualData.title?.[locale as keyof MultilingualField] || ritualData.title?.en || "",
				description: ritualData.description?.[locale as keyof MultilingualField] || ritualData.description?.en || "",
				features: ritualData.features?.[locale as keyof MultilingualArray] || ritualData.features?.en || [],
				timing: ritualData.timing?.[locale as keyof MultilingualField] || ritualData.timing?.en || ""
			};
		});

		return NextResponse.json(ritualsObj);
	} catch (error) {
		console.error("Error fetching rituals content:", error);
		return NextResponse.json({ error: "Failed to fetch rituals content" }, { status: 500 });
	}
}

// POST - Create new ritual
export async function POST(request: Request) {
	try {
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
			icon: body.icon || "Building",
			features: normalizeMultilingualArray(body.features),
			timing: normalizeMultilingualField(body.timing),
			order: body.order || 0,
			isActive: body.isActive !== undefined ? body.isActive : true
		};

		// Validate required fields
		const titleEn = processedData.title?.en || "";
		const descEn = processedData.description?.en || "";

		if (!titleEn.trim() || !descEn.trim()) {
			return NextResponse.json({ error: "English title and description are required" }, { status: 400 });
		}

		// Create new ritual
		const ritual = await Rituals.create(processedData);

		return NextResponse.json({
			message: "Ritual created successfully",
			data: ritual
		});
	} catch (error) {
		console.error("Error creating ritual:", error);
		return NextResponse.json({ error: "Failed to create ritual" }, { status: 500 });
	}
}

// PUT - Update ritual
export async function PUT(request: Request) {
	try {
		await connectDB();

		const body = await request.json();
		const { id } = body;

		if (!id) {
			return NextResponse.json({ error: "Ritual ID is required" }, { status: 400 });
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
			order: body.order,
			isActive: body.isActive
		};

		// Validate required fields
		const titleEn = processedData.title?.en || "";
		const descEn = processedData.description?.en || "";

		if (!titleEn.trim() || !descEn.trim()) {
			return NextResponse.json({ error: "English title and description are required" }, { status: 400 });
		}

		// Update ritual
		const ritual = await Rituals.findByIdAndUpdate(
			id,
			processedData,
			{ new: true, runValidators: true }
		);

		if (!ritual) {
			return NextResponse.json({ error: "Ritual not found" }, { status: 404 });
		}

		return NextResponse.json({
			message: "Ritual updated successfully",
			data: ritual
		});
	} catch (error) {
		console.error("Error updating ritual:", error);
		return NextResponse.json({ error: "Failed to update ritual" }, { status: 500 });
	}
}

// DELETE - Delete ritual
export async function DELETE(request: NextRequest) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);
		const id = searchParams.get("id");

		if (!id) {
			return NextResponse.json({ error: "Ritual ID is required" }, { status: 400 });
		}

		const ritual = await Rituals.findByIdAndDelete(id);

		if (!ritual) {
			return NextResponse.json({ error: "Ritual not found" }, { status: 404 });
		}

		return NextResponse.json({
			message: "Ritual deleted successfully"
		});
	} catch (error) {
		console.error("Error deleting ritual:", error);
		return NextResponse.json({ error: "Failed to delete ritual" }, { status: 500 });
	}
}
