import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Values from "@/models/Values.Model";
import { requireAdmin } from "@/lib/apiAuth";

interface MultilingualField {
	en: string;
	no: string;
	ne: string;
}



// GET values content
export async function GET(request: NextRequest) {
	try {
		await connectDB();

		const { searchParams } = new URL(request.url);
		const locale = searchParams.get("locale") || "en";
		const isEditing = searchParams.get("edit") === "true";

		const values = await Values.findOne();

		if (!values) {
			// Return default content if no values exists yet
			const defaultContent = {
				title: { 
					en: 'Our Values', 
					no: 'Våre Verdier', 
					ne: 'हाम्रा मूल्यहरू' 
				},
				values: [
					{
						title: { 
							en: 'Cultural Preservation', 
							no: 'Kulturell Bevaring', 
							ne: 'सांस्कृतिक संरक्षण' 
						},
						description: { 
							en: 'Preserving and promoting our rich Nepali Hindu heritage through rituals, festivals, and cultural education.',
							no: 'Å bevare og fremme vår rike nepalsk-hinduiske arv gjennom ritualer, festivaler og kulturell opplæring.',
							ne: 'रीतिरिवाज, चाडपर्व र सांस्कृतिक शिक्षामार्फत हाम्रो समृद्ध नेपाली हिन्दू सम्पदालाई संरक्षण र प्रवर्द्धन गर्नु।'
						},
						icon: 'Landmark',
						order: 0
					},
					{
						title: { 
							en: 'Community Brotherhood', 
							no: 'Samfunnsfelleskap', 
							ne: 'सामुदायिक भातृत्व' 
						},
						description: { 
							en: 'Building strong bonds within our community through mutual support, cooperation, and shared values.',
							no: 'Å bygge sterke bånd innenfor vårt samfunn gjennom gjensidig støtte, samarbeid og delte verdier.',
							ne: 'परस्पर सहयोग, सहकार्य र साझा मूल्यहरू मार्फत हाम्रो समुदाय भित्र मजबुत सम्बन्धहरू निर्माण गर्नु।'
						},
						icon: 'Users',
						order: 1
					},
					{
						title: { 
							en: 'Social Integration', 
							no: 'Sosial Integrasjon', 
							ne: 'सामाजिक एकीकरण' 
						},
						description: { 
							en: 'Promoting understanding and integration between Nepali Hindu community and Norwegian society.',
							no: 'Å fremme forståelse og integrasjon mellom det nepalsk-hinduiske samfunnet og det norske samfunnet.',
							ne: 'नेपाली हिन्दू समुदाय र नर्वेजियन समाज बीच बुझाइश र एकीकरणलाई प्रोत्साहन गर्नु।'
						},
						icon: 'Globe',
						order: 2
					}
				]
			};

			if (isEditing) {
				return NextResponse.json(defaultContent);
			} else {
				// Return single locale version for frontend
				const localizedContent = {
					title: defaultContent.title[locale as keyof MultilingualField] || defaultContent.title.en,
					values: defaultContent.values.map(value => ({
						title: value.title[locale as keyof MultilingualField] || value.title.en,
						description: value.description[locale as keyof MultilingualField] || value.description.en,
						icon: value.icon,
						order: value.order
					}))
				};
				return NextResponse.json(localizedContent);
			}
		}

		// Transform for locale
		const valuesObj = values.toObject ? values.toObject() : values;

		if (isEditing) {
			// Return full multilingual data for editing
			return NextResponse.json(valuesObj);
		}

		// Return single locale version for frontend
		const localizedContent = {
			title: values.title?.[locale as keyof MultilingualField] || values.title?.en || "Our Values",
			values: values.values?.map(value => ({
				title: value.title?.[locale as keyof MultilingualField] || value.title?.en || "",
				description: value.description?.[locale as keyof MultilingualField] || value.description?.en || "",
				icon: value.icon || "Landmark",
				order: value.order || 0
			})) || []
		};

		return NextResponse.json(localizedContent);
	} catch (error) {
		console.error("Error fetching values content:", error);
		return NextResponse.json({ error: "Failed to fetch values content" }, { status: 500 });
	}
}

// POST - Create or update values content
export async function POST(request: Request) {
	try {
		const auth = await requireAdmin();
		if (auth.response) return auth.response;

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
			values: body.values?.map((value: { title?: MultilingualField | string; description?: MultilingualField | string; icon?: string; order?: number }, index: number) => ({
				title: normalizeMultilingualField(value.title || ""),
				description: normalizeMultilingualField(value.description || ""),
				icon: value.icon || "Landmark",
				order: value.order !== undefined ? value.order : index
			})) || []
		};

		// Validate required fields
		const titleEn = processedData.title?.en || "";
		if (!titleEn.trim()) {
			return NextResponse.json({ error: "English title is required" }, { status: 400 });
		}

		// Validate each value item
		for (let i = 0; i < processedData.values.length; i++) {
			const value = processedData.values[i];
			const valueTitleEn = value.title?.en || "";
			const valueDescEn = value.description?.en || "";
			
			if (!valueTitleEn.trim() || !valueDescEn.trim()) {
				return NextResponse.json({ 
					error: `English title and description are required for value item ${i + 1}` 
				}, { status: 400 });
			}
		}

		// Find existing values or create new one
		let values = await Values.findOne();

		if (values) {
			// Update existing values
			values.title = processedData.title;
			values.values = processedData.values;

			const updatedValues = await values.save();

			return NextResponse.json({
				message: "Values content updated successfully",
				data: updatedValues
			});
		} else {
			// Create new values
			values = await Values.create(processedData);

			return NextResponse.json({
				message: "Values content created successfully",
				data: values
			});
		}
	} catch (error) {
		console.error("Error saving values content:", error);
		return NextResponse.json({ error: "Failed to save values content" }, { status: 500 });
	}
}
