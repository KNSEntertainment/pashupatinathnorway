// import { NextRequest, NextResponse } from "next/server";
// import connectDB from "@/lib/mongodb";
// import Festivals from "@/models/Festivals.Model";
// import { requireAdmin } from "@/lib/apiAuth";
// import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";
// import mongoose from "mongoose";

// interface MultilingualField {
// 	en: string;
// 	no: string;
// 	ne: string;
// }

// interface MultilingualArray {
// 	en: string[];
// 	no: string[];
// 	ne: string[];
// }

// // GET festivals content
// export async function GET(request: NextRequest) {
// 	try {
// 		await connectDB();

// 		const { searchParams } = new URL(request.url);
// 		const locale = searchParams.get("locale") || "en";
// 		const isEditing = searchParams.get("edit") === "true";
// 		const id = searchParams.get("id");

// 		if (id) {
// 			// Get specific festival by ID
// 			const festival = await Festivals.findById(id);
// 			if (!festival) {
// 				return NextResponse.json({ error: "Festival not found" }, { status: 404 });
// 			}

// 			if (isEditing) {
// 				return NextResponse.json(festival);
// 			}

// 			// Return single locale version
// 			const festivalObj = festival.toObject ? festival.toObject() : festival;
// 			const localizedFestival = {
// 				...festivalObj,
// 				title: festivalObj.title?.[locale as keyof MultilingualField] || festivalObj.title?.en || "",
// 				description: festivalObj.description?.[locale as keyof MultilingualField] || festivalObj.description?.en || "",
// 				features: festivalObj.features?.[locale as keyof MultilingualArray] || festivalObj.features?.en || [],
// 				timing: festivalObj.timing?.[locale as keyof MultilingualField] || festivalObj.timing?.en || ""
// 			};

// 			return NextResponse.json(localizedFestival);
// 		}

// 		// Get all festivals (exclude deleted ones)
// 		const festivals = await Festivals.find({ isActive: true, isDeleted: false }).sort({ highlight: -1, order: 1, createdAt: 1 });

// 		// Only return default content if absolutely no festivals exist (including soft-deleted ones)
// 		const allFestivals = await Festivals.find({});
// 		if (allFestivals.length === 0) {
// 			// Return default content if no festivals exist yet
// 			const defaultContent = [
// 				{
// 					id: "maha-shivaratri",
// 					title: { 
// 						en: "Maha Shivaratri", 
// 						no: "Maha Shivaratri", 
// 						ne: "महा शिवरात्रि" 
// 					},
// 					description: { 
// 						en: "A grand celebration of Lord Shiva with night-long prayers and rituals. Annual General Meeting will be arranged on this occasion.",
// 						no: "En stor feiring av Lord Shiva med nattlange bønner og ritualer. Årsmøte vil bli arrangert i denne anledningen.",
// 						ne: "भगवान शिवको ठूलो उत्सव रातभरि प्रार्थना र अनुष्ठानहरूसहित। यस अवसरमा वार्षिक साधारण बैठक आयोजना गरिनेछ।"
// 					},
// 					icon: "Star",
// 					features: {
// 						en: ["Night-long prayers and meditation", "Sacred Shiva lingam abhishek", "Annual General Meeting"],
// 						no: ["Nattlange bønner og meditasjon", "Hellig Shiva lingam abhishek", "Årsmøte"],
// 						ne: ["रातभरि प्रार्थना र ध्यान", "पवित्र शिव लिङ्ग अभिषेक", "वार्षिक साधारण बैठक"]
// 					},
// 					timing: {
// 						en: "February/March annually",
// 						no: "Februar/mars årlig",
// 						ne: "फेब्रुअरी/मार्च वार्षिक"
// 					},
// 					highlight: true,
// 					order: 0,
// 					isActive: true
// 				},
// 				{
// 					id: "teej",
// 					title: { 
// 						en: "Teej", 
// 						no: "Teej", 
// 						ne: "तीज" 
// 					},
// 					description: { 
// 						en: "Celebrations of devotion, family, and the triumph of good over evil.",
// 						no: "Feiringer av fromhet, familie, og triumfen av godt over ondt.",
// 						ne: "भक्ति, परिवार, र असललाई बुरामाथि विजयको उत्सव।"
// 					},
// 					icon: "Heart",
// 					features: {
// 						en: ["Women's fasting and prayers", "Traditional dances and songs", "Family gatherings and blessings"],
// 						no: ["Kvinners faste og bønner", "Tradisjonelle danser og sanger", "Familiesamlinger og velsignelser"],
// 						ne: ["महिलाहरूको उपवास र प्रार्थना", "परम्परागत नृत्य र गीतहरू", "परिवारिक भेटघाट र आशीर्वाद"]
// 					},
// 					timing: {
// 						en: "August/September annually",
// 						no: "August/september årlig",
// 						ne: "अगस्ट/सेप्टेम्बर वार्षिक"
// 					},
// 					highlight: false,
// 					order: 1,
// 					isActive: true
// 				},
// 				{
// 					id: "dashain-tihar",
// 					title: { 
// 						en: "Dashain & Tihar", 
// 						no: "Dashain & Tihar", 
// 						ne: "दशैं र तिहार" 
// 					},
// 					description: { 
// 						en: "The Festival of Lights, celebrating victory and new beginnings.",
// 						no: "Lysenes festival, feirer seier og nye begynnelser.",
// 						ne: "उज्यालोको चाड, विजय र नयाँ सुरुवातको उत्सव।"
// 					},
// 					icon: "Sparkles",
// 					features: {
// 						en: ["Tika blessings and family reunions", "Diyo lighting and decorations", "Traditional feasts and celebrations"],
// 						no: ["Tika velsignelser og familiesammenkomster", "Diyo belysning og dekorasjoner", "Tradisjonelle fester og feiringer"],
// 						ne: ["टीका आशीर्वाद र परिवारिक पुनर्मिलन", "दियो बाल्ने र सजावट", "परम्परागत भोज र उत्सव"]
// 					},
// 					timing: {
// 						en: "October annually",
// 						no: "Oktober årlig",
// 						ne: "अक्टोबर वार्षिक"
// 					},
// 					highlight: false,
// 					order: 2,
// 					isActive: true
// 				},
// 				{
// 					id: "holi",
// 					title: { 
// 						en: "Holi", 
// 						no: "Holi", 
// 						ne: "होली" 
// 					},
// 					description: { 
// 						en: "The colorful festival of love, unity, and joy.",
// 						no: "Den fargerike festivalen av kjærlighet, enhet og glede.",
// 						ne: "प्रेम, एकता र खुशीको रंगीन चाड।"
// 					},
// 					icon: "PartyPopper",
// 					features: {
// 						en: ["Colorful powders and water play", "Traditional sweets and music", "Community celebration and joy"],
// 						no: ["Fargerike pulvere og vannlek", "Tradisjonelle søtsaker og musikk", "Samfunnsfeiring og glede"],
// 						ne: ["रंगीन पाउडर र पानी खेल", "परम्परागत मिठाई र संगीत", "सामुदायिक उत्सव र खुशी"]
// 					},
// 					timing: {
// 						en: "March annually",
// 						no: "Mars årlig",
// 						ne: "मार्च वार्षिक"
// 					},
// 					highlight: false,
// 					order: 3,
// 					isActive: true
// 				}
// 			];

// 			if (isEditing) {
// 				return NextResponse.json(defaultContent);
// 			} else {
// 				// Return single locale version for frontend
// 				const localizedContent = defaultContent.map(festival => ({
// 					...festival,
// 					title: festival.title[locale as keyof MultilingualField] || festival.title.en,
// 					description: festival.description[locale as keyof MultilingualField] || festival.description.en,
// 					features: festival.features[locale as keyof MultilingualArray] || festival.features.en,
// 					timing: festival.timing[locale as keyof MultilingualField] || festival.timing.en
// 				}));
// 				return NextResponse.json(localizedContent);
// 			}
// 		}

// 		// Transform for locale
// 		const festivalsObj = festivals.map(festival => {
// 			const festivalData = festival.toObject ? festival.toObject() : festival;
			
// 			if (isEditing) {
// 				return festivalData;
// 			}

// 			// Return single locale version for frontend
// 			return {
// 				...festivalData,
// 				title: festivalData.title?.[locale as keyof MultilingualField] || festivalData.title?.en || "",
// 				description: festivalData.description?.[locale as keyof MultilingualField] || festivalData.description?.en || "",
// 				features: festivalData.features?.[locale as keyof MultilingualArray] || festivalData.features?.en || [],
// 				timing: festivalData.timing?.[locale as keyof MultilingualField] || festivalData.timing?.en || ""
// 			};
// 		});

// 		return NextResponse.json(festivalsObj);
// 	} catch (error) {
// 		console.error("Error fetching festivals content:", error);
// 		return NextResponse.json({ error: "Failed to fetch festivals content" }, { status: 500 });
// 	}
// }

// // POST - Create new festival
// export async function POST(request: Request) {
// 	try {
// 		const auth = await requireAdmin();
// 		if (auth.response) return auth.response;

// 		await connectDB();

// 		const contentType = request.headers.get("content-type");
// 		let body: any;
// 		let imageUrl: string | null = null;

// 		if (contentType && contentType.includes("multipart/form-data")) {
// 			// Handle multipart/form-data for image uploads
// 			const formData = await request.formData();
			
// 			// Upload image if provided
// 			const image = formData.get("image") as File;
// 			if (image && image.size > 0) {
// 				imageUrl = await uploadToCloudinary(image, "festivals_images");
// 			}

// 			// Extract other fields from formData
// 			body = {
// 				title: formData.get("title"),
// 				description: formData.get("description"),
// 				features: formData.get("features"),
// 				timing: formData.get("timing"),
// 				highlight: formData.get("highlight"),
// 				order: formData.get("order"),
// 				isActive: formData.get("isActive")
// 			};

// 			// Parse JSON fields
// 			["title", "description", "features", "timing"].forEach(field => {
// 				if (body[field]) {
// 					try {
// 						body[field] = JSON.parse(body[field] as string);
// 					} catch (e) {
// 						// Keep as is if parsing fails
// 					}
// 				}
// 			});

// 			// Parse numeric and boolean fields
// 			if (body.order) body.order = parseInt(body.order);
// 			if (body.highlight !== undefined) body.highlight = body.highlight === "true";
// 			if (body.isActive !== undefined) body.isActive = body.isActive === "true";

// 		} else {
// 			// Handle regular JSON request
// 			body = await request.json();
// 		}

// 		// Helper function to normalize multilingual field
// 		const normalizeMultilingualField = (field: MultilingualField | string): MultilingualField => {
// 			if (typeof field === "string") {
// 				return { en: field, no: field, ne: field };
// 			} else if (typeof field === "object" && field !== null) {
// 				return {
// 					en: field.en || field.no || field.ne || "",
// 					no: field.no || field.en || field.ne || "",
// 					ne: field.ne || field.en || field.no || "",
// 				};
// 			} else {
// 				return { en: "", no: "", ne: "" };
// 			}
// 		};

// 		// Helper function to normalize multilingual array
// 		const normalizeMultilingualArray = (field: MultilingualArray | string[]): MultilingualArray => {
// 			if (Array.isArray(field)) {
// 				return { en: field, no: field, ne: field };
// 			} else if (typeof field === "object" && field !== null) {
// 				return {
// 					en: field.en || [],
// 					no: field.no || [],
// 					ne: field.ne || []
// 				};
// 			} else {
// 				return { en: [], no: [], ne: [] };
// 			}
// 		};

// 		// Process the data
// 		const processedData = {
// 			title: normalizeMultilingualField(body.title),
// 			description: normalizeMultilingualField(body.description),
// 			imageUrl: imageUrl || body.imageUrl || null,
// 			features: normalizeMultilingualArray(body.features),
// 			timing: normalizeMultilingualField(body.timing),
// 			highlight: body.highlight || false,
// 			order: body.order || 0,
// 			isActive: body.isActive !== undefined ? body.isActive : true
// 		};

// 		// Validate required fields
// 		const titleEn = processedData.title?.en || "";
// 		const descEn = processedData.description?.en || "";

// 		if (!titleEn.trim() || !descEn.trim()) {
// 			return NextResponse.json({ error: "English title and description are required" }, { status: 400 });
// 		}

// 		// Create new festival
// 		const festival = await Festivals.create(processedData);

// 		return NextResponse.json({
// 			message: "Festival created successfully",
// 			data: festival
// 		});
// 	} catch (error) {
// 		console.error("Error creating festival:", error);
// 		return NextResponse.json({ error: "Failed to create festival" }, { status: 500 });
// 	}
// }

// // PUT - Update festival
// export async function PUT(request: Request) {
// 	try {
// 		console.log("🔄 PUT request received for festivals");
		
// 		const auth = await requireAdmin();
// 		if (auth.response) {
// 			console.log("❌ Authentication failed");
// 			return auth.response;
// 		}

// 		await connectDB();

// 		const contentType = request.headers.get("content-type");
// 		console.log("📋 Content-Type:", contentType);
		
// 		let body: any;
// 		let imageUrl: string | null = null;
// 		let id: string;

// 		if (contentType && contentType.includes("multipart/form-data")) {
// 			// Handle multipart/form-data for image uploads
// 			const formData = await request.formData();
			
// 			// Upload image if provided
// 			const image = formData.get("image") as File;
// 			if (image && image.size > 0) {
// 				imageUrl = await uploadToCloudinary(image, "festivals_images");
// 			}

// 			// Extract other fields from formData
// 			body = {
// 				title: formData.get("title"),
// 				description: formData.get("description"),
// 				features: formData.get("features"),
// 				timing: formData.get("timing"),
// 				highlight: formData.get("highlight"),
// 				order: formData.get("order"),
// 				isActive: formData.get("isActive")
// 			};

// 			// Parse JSON fields
// 			["title", "description", "features", "timing"].forEach(field => {
// 				if (body[field]) {
// 					try {
// 						body[field] = JSON.parse(body[field] as string);
// 					} catch (e) {
// 						// Keep as is if parsing fails
// 					}
// 				}
// 			});

// 			// Parse numeric and boolean fields
// 			if (body.order) body.order = parseInt(body.order);
// 			if (body.highlight !== undefined) body.highlight = body.highlight === "true";
// 			if (body.isActive !== undefined) body.isActive = body.isActive === "true";

// 			// Get ID from formData
// 			id = formData.get("id") as string;
// 			console.log("📝 ID from FormData:", id);

// 		} else {
// 			// Handle regular JSON request
// 			body = await request.json();
// 			id = body.id;
// 			console.log("📝 ID from JSON:", id);
// 		}

// 		console.log("🆔 Final ID:", id);

// 		if (!id) {
// 			console.log("❌ No ID provided");
// 			return NextResponse.json({ error: "Festival ID is required" }, { status: 400 });
// 		}

// 		// Helper function to normalize multilingual field
// 		const normalizeMultilingualField = (field: MultilingualField | string): MultilingualField => {
// 			if (typeof field === "string") {
// 				return { en: field, no: field, ne: field };
// 			} else if (typeof field === "object" && field !== null) {
// 				return {
// 					en: field.en || field.no || field.ne || "",
// 					no: field.no || field.en || field.ne || "",
// 					ne: field.ne || field.en || field.no || "",
// 				};
// 			} else {
// 				return { en: "", no: "", ne: "" };
// 			}
// 		};

// 		// Helper function to normalize multilingual array
// 		const normalizeMultilingualArray = (field: MultilingualArray | string[]): MultilingualArray => {
// 			if (Array.isArray(field)) {
// 				return { en: field, no: field, ne: field };
// 			} else if (typeof field === "object" && field !== null) {
// 				return {
// 					en: field.en || [],
// 					no: field.no || [],
// 					ne: field.ne || []
// 				};
// 			} else {
// 				return { en: [], no: [], ne: [] };
// 			}
// 		};

// 		// Get existing festival to preserve current imageUrl if no new image is uploaded
// 		console.log("🔍 Looking for festival with ID:", id);
		
// 		let existingFestival;
// 		try {
// 			// Use string comparison approach consistently
// 			const allFestivals = await Festivals.find({});
// 			existingFestival = allFestivals.find(f => f._id.toString() === id);
			
// 			if (existingFestival) {
// 				console.log("✅ Festival found:", existingFestival.title.en);
// 				console.log("📋 Festival ObjectId:", existingFestival._id);
// 			} else {
// 				console.log("❌ Festival not found");
// 				// List available festivals for debugging
// 				console.log("📋 Available festival IDs:", allFestivals.map(f => ({ id: f._id.toString(), title: f.title.en })));
// 				return NextResponse.json({ error: "Festival not found" }, { status: 404 });
// 			}
			
// 		} catch (error) {
// 			console.error("❌ Error finding festival:", error);
// 			return NextResponse.json({ error: "Database error when finding festival" }, { status: 500 });
// 		}

// 		// Process the data
// 		const processedData = {
// 			title: normalizeMultilingualField(body.title),
// 			description: normalizeMultilingualField(body.description),
// 			imageUrl: imageUrl || body.imageUrl || existingFestival.imageUrl,
// 			features: normalizeMultilingualArray(body.features),
// 			timing: normalizeMultilingualField(body.timing),
// 			highlight: body.highlight !== undefined ? body.highlight : existingFestival.highlight,
// 			order: body.order || existingFestival.order,
// 			isActive: body.isActive !== undefined ? body.isActive : existingFestival.isActive
// 		};

// 		console.log("🖼️ Processed data imageUrl:", processedData.imageUrl);
// 		console.log("🖼️ ImageUrl from upload:", imageUrl);
// 		console.log("🖼️ ImageUrl from body:", body.imageUrl);
// 		console.log("🖼️ Existing festival imageUrl:", existingFestival.imageUrl);

// 		// Validate required fields
// 		const titleEn = processedData.title?.en || "";
// 		const descEn = processedData.description?.en || "";

// 		if (!titleEn.trim() || !descEn.trim()) {
// 			return NextResponse.json({ error: "English title and description are required" }, { status: 400 });
// 		}

// 		// Update festival using direct field assignment on existing document
// 		let festival;
// 		try {
// 			console.log("🔄 Updating festival with ID:", existingFestival._id);
// 			console.log("🔄 Update data:", JSON.stringify(processedData, null, 2));
			
// 			// Use direct field assignment on the existing document
// 			console.log("🔄 Using direct field assignment method");
			
// 			// Update fields directly on the existing document
// 			existingFestival.title = processedData.title;
// 			existingFestival.description = processedData.description;
// 			existingFestival.imageUrl = processedData.imageUrl;
// 			existingFestival.features = processedData.features;
// 			existingFestival.timing = processedData.timing;
// 			existingFestival.highlight = processedData.highlight;
// 			existingFestival.order = processedData.order;
// 			existingFestival.isActive = processedData.isActive;
// 			existingFestival.updatedAt = new Date();
			
// 			// Mark fields as modified to ensure Mongoose tracks changes
// 			existingFestival.markModified('title');
// 			existingFestival.markModified('description');
// 			existingFestival.markModified('imageUrl');
// 			existingFestival.markModified('features');
// 			existingFestival.markModified('timing');
// 			existingFestival.markModified('highlight');
// 			existingFestival.markModified('order');
// 			existingFestival.markModified('isActive');
// 			existingFestival.markModified('updatedAt');
			
// 			// Save the existing document
// 			festival = await existingFestival.save();
			
// 			console.log("✅ Festival update completed successfully");
// 			console.log("📊 Updated festival data:", festival ? {
// 				_id: festival._id,
// 				title: festival.title?.en,
// 				imageUrl: festival.imageUrl,
// 				updatedAt: festival.updatedAt
// 			} : "No festival returned");
			
// 		} catch (error) {
// 			console.error("❌ Error updating festival:", error);
// 			console.error("❌ Error details:", error instanceof Error ? error.message : String(error));
// 			console.error("❌ Error stack:", error instanceof Error ? error.stack : 'No stack available');
// 		}

// 		if (!festival) {
// 			console.error("❌ All update methods failed");
// 			return NextResponse.json({ error: "Failed to update festival - database operation failed" }, { status: 500 });
// 		}

// 		return NextResponse.json({
// 			message: "Festival updated successfully",
// 			data: festival
// 		});
// 	} catch (error) {
// 		console.error("Error updating festival:", error);
// 		return NextResponse.json({ error: "Failed to update festival" }, { status: 500 });
// 	}
// }

// // DELETE - Delete festival
// export async function DELETE(request: NextRequest) {
// 	try {
// 		const auth = await requireAdmin();
// 		if (auth.response) return auth.response;

// 		await connectDB();

// 		const { searchParams } = new URL(request.url);
// 		const id = searchParams.get("id");

// 		if (!id) {
// 			return NextResponse.json({ error: "Festival ID is required" }, { status: 400 });
// 		}

// 		const festival = await Festivals.findByIdAndUpdate(
// 			id,
// 			{
// 				isDeleted: true,
// 				deletedAt: new Date(),
// 				isActive: false
// 			},
// 			{ new: true }
// 		);

// 		if (!festival) {
// 			return NextResponse.json({ error: "Festival not found" }, { status: 404 });
// 		}

// 		return NextResponse.json({
// 			message: "Festival deleted successfully"
// 		});
// 	} catch (error) {
// 		console.error("Error deleting festival:", error);
// 		return NextResponse.json({ error: "Failed to delete festival" }, { status: 500 });
// 	}
// }

import { NextRequest, NextResponse } from "next/server";
import mongoose from "mongoose";
import connectDB from "@/lib/mongodb";
import Festivals from "@/models/Festivals.Model";
import { requireAdmin } from "@/lib/apiAuth";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

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

type FestivalRawDocument = Record<string, unknown> & {
	_id: mongoose.Types.ObjectId | string;
};

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
	}
	return { en: "", no: "", ne: "" };
};

// Helper function to normalize multilingual array
const normalizeMultilingualArray = (field: MultilingualArray | string[]): MultilingualArray => {
	if (Array.isArray(field)) {
		return { en: field, no: field, ne: field };
	} else if (typeof field === "object" && field !== null) {
		return {
			en: Array.isArray(field.en) ? field.en : [],
			no: Array.isArray(field.no) ? field.no : [],
			ne: Array.isArray(field.ne) ? field.ne : [],
		};
	}
	return { en: [], no: [], ne: [] };
};

/**
 * Parse request body from either multipart/form-data or JSON.
 * Returns { body, imageUrl } where imageUrl is set only if a new file was uploaded.
 * BUG FIX: Previously body.imageUrl was never read from FormData, so existing
 * images were lost on every PUT that didn't include a new file upload.
 */
async function parseRequestBody(request: Request): Promise<{
	body: Record<string, unknown>;
	newImageUrl: string | null;
	existingImageUrl: string | null;
}> {
	const contentType = request.headers.get("content-type") || "";

	if (contentType.includes("multipart/form-data")) {
		const formData = await request.formData();

		// Upload new image if provided
		let newImageUrl: string | null = null;
		const image = formData.get("image") as File | null;
		if (image && image.size > 0) {
			newImageUrl = await uploadToCloudinary(image, "festivals_images");
		}

		// FIX: Read existingImageUrl that the frontend sends so we can preserve it
		const existingImageUrl = (formData.get("existingImageUrl") as string) || null;

		// Parse all other fields
		const body: Record<string, unknown> = {};
		for (const field of ["title", "description", "features", "timing"]) {
			const raw = formData.get(field) as string | null;
			if (raw) {
				try {
					body[field] = JSON.parse(raw);
				} catch {
					body[field] = raw;
				}
			}
		}

		const orderRaw = formData.get("order") as string | null;
		body.order = orderRaw ? parseInt(orderRaw, 10) : 0;

		const highlightRaw = formData.get("highlight") as string | null;
		body.highlight = highlightRaw === "true";

		const isActiveRaw = formData.get("isActive") as string | null;
		body.isActive = isActiveRaw !== null ? isActiveRaw === "true" : true;

		body.id = formData.get("id") as string | null;

		return { body, newImageUrl, existingImageUrl };
	}

	// JSON body — no image upload possible
	const body = await request.json();
	return { body, newImageUrl: null, existingImageUrl: body.imageUrl || null };
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
			const festival = await Festivals.findById(id);
			if (!festival) {
				return NextResponse.json({ error: "Festival not found" }, { status: 404 });
			}

			if (isEditing) {
				return NextResponse.json(festival);
			}

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

		const festivals = await Festivals.find({ isActive: true, isDeleted: false }).sort({ order: 1, highlight: -1, createdAt: 1 });

		const allFestivals = await Festivals.find({});
		if (allFestivals.length === 0) {
			const defaultContent = [
				{
					id: "maha-shivaratri",
					title: { en: "Maha Shivaratri", no: "Maha Shivaratri", ne: "महा शिवरात्रि" },
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
					timing: { en: "February/March annually", no: "Februar/mars årlig", ne: "फेब्रुअरी/मार्च वार्षिक" },
					highlight: true,
					order: 0,
					isActive: true
				},
				{
					id: "teej",
					title: { en: "Teej", no: "Teej", ne: "तीज" },
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
					timing: { en: "August/September annually", no: "August/september årlig", ne: "अगस्ट/सेप्टेम्बर वार्षिक" },
					highlight: false,
					order: 1,
					isActive: true
				},
				{
					id: "dashain-tihar",
					title: { en: "Dashain & Tihar", no: "Dashain & Tihar", ne: "दशैं र तिहार" },
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
					timing: { en: "October annually", no: "Oktober årlig", ne: "अक्टोबर वार्षिक" },
					highlight: false,
					order: 2,
					isActive: true
				},
				{
					id: "holi",
					title: { en: "Holi", no: "Holi", ne: "होली" },
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
					timing: { en: "March annually", no: "Mars årlig", ne: "मार्च वार्षिक" },
					highlight: false,
					order: 3,
					isActive: true
				}
			];

			if (isEditing) {
				return NextResponse.json(defaultContent);
			}

			const localizedContent = defaultContent.map(festival => ({
				...festival,
				title: festival.title[locale as keyof MultilingualField] || festival.title.en,
				description: festival.description[locale as keyof MultilingualField] || festival.description.en,
				features: festival.features[locale as keyof MultilingualArray] || festival.features.en,
				timing: festival.timing[locale as keyof MultilingualField] || festival.timing.en
			}));
			return NextResponse.json(localizedContent);
		}

		const festivalsObj = festivals.map(festival => {
			const festivalData = festival.toObject ? festival.toObject() : festival;

			if (isEditing) return festivalData;

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

		const { body, newImageUrl, existingImageUrl } = await parseRequestBody(request);

		const processedData = {
			title: normalizeMultilingualField(body.title as MultilingualField | string),
			description: normalizeMultilingualField(body.description as MultilingualField | string),
			// FIX: use newly uploaded URL, fall back to existing URL sent from client
			imageUrl: newImageUrl || existingImageUrl || null,
			features: normalizeMultilingualArray(body.features as MultilingualArray | string[]),
			timing: normalizeMultilingualField(body.timing as MultilingualField | string),
			highlight: Boolean(body.highlight),
			order: Number(body.order) || 0,
			isActive: body.isActive !== undefined ? Boolean(body.isActive) : true
		};

		const titleEn = processedData.title?.en || "";
		const descEn = processedData.description?.en || "";

		if (!titleEn.trim() || !descEn.trim()) {
			return NextResponse.json({ error: "English title and description are required" }, { status: 400 });
		}

		const festival = await Festivals.create(processedData);

		return NextResponse.json({ message: "Festival created successfully", data: festival });
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

		console.log("🔄 PUT request received for festivals");
		const { body, newImageUrl, existingImageUrl } = await parseRequestBody(request);
		const id = body.id as string;

		console.log("📥 Request data:", {
			id,
			newImageUrl: newImageUrl ? "has_new_image" : "no_new_image",
			existingImageUrl: existingImageUrl ? "has_existing_image" : "no_existing_image",
			title: typeof body.title === 'object' && body.title !== null ? (body.title as MultilingualField).en : (body.title as string),
			hasImageFile: !!newImageUrl
		});

		if (!id) {
			return NextResponse.json({ error: "Festival ID is required" }, { status: 400 });
		}

		// Find existing festival - try multiple approaches to handle model caching issues
		console.log("🔍 Looking for festival with ID:", id);
		
		let existingFestival = null;
		
		// Try 1: Direct findById
		try {
			existingFestival = await Festivals.findById(id);
			console.log("✅ Found festival via findById:", existingFestival?._id.toString());
		} catch (error) {
			console.log("⚠️ findById failed, trying alternative approach:", error instanceof Error ? error.message : String(error));
		}
		
		// Try 2: Use raw MongoDB collection if findById fails
		if (!existingFestival) {
			try {
				const db = mongoose.connection.db;
				if (!db) {
					console.log("⚠️ Database connection not available");
					return;
				}
				const collection = db.collection('festivals');
				const doc = await collection.findOne({ _id: new mongoose.Types.ObjectId(id) });
				if (doc) {
					// Convert to Mongoose document
					existingFestival = new Festivals(doc);
					console.log("✅ Found festival via raw collection:", existingFestival._id.toString());
				}
			} catch (error) {
				console.log("⚠️ Raw collection approach failed:", error instanceof Error ? error.message : String(error));
			}
		}
		
		// Try 3: Find all and filter as last resort
		if (!existingFestival) {
			try {
				const allFestivals = await Festivals.find({});
				existingFestival = allFestivals.find(f => f._id.toString() === id);
				if (existingFestival) {
					console.log("✅ Found festival via array filter:", existingFestival._id.toString());
					console.log("🔍 Festival details:", {
						_id: existingFestival._id,
						_idType: typeof existingFestival._id,
						_idToString: existingFestival._id.toString(),
						isObjectId: existingFestival._id instanceof mongoose.Types.ObjectId,
						title: existingFestival.title?.en
					});
				}
			} catch (error) {
				console.log("⚠️ Array filter approach failed:", error instanceof Error ? error.message : String(error));
			}
		}

		if (!existingFestival) {
			console.error("❌ Festival not found with ID:", id);
			// Show all available IDs for debugging
			try {
				const allFestivals = await Festivals.find({});
				console.error("📋 Available festival IDs:", allFestivals.map(f => f._id.toString()));
			} catch (error) {
				console.error("Could not fetch available IDs:", error instanceof Error ? error.message : String(error));
			}
			return NextResponse.json({ error: "Festival not found" }, { status: 404 });
		}

		console.log("✅ Successfully found festival:", existingFestival._id.toString());

		// FIX: Priority: 1) newly uploaded image, 2) existing URL sent from frontend,
		// 3) what's already stored in DB. This prevents wiping images on every save.
		const resolvedImageUrl = newImageUrl || existingImageUrl || existingFestival.imageUrl || null;

		const processedData = {
			title: normalizeMultilingualField(body.title as MultilingualField | string),
			description: normalizeMultilingualField(body.description as MultilingualField | string),
			imageUrl: resolvedImageUrl,
			features: normalizeMultilingualArray(body.features as MultilingualArray | string[]),
			timing: normalizeMultilingualField(body.timing as MultilingualField | string),
			highlight: body.highlight !== undefined ? Boolean(body.highlight) : existingFestival.highlight,
			order: body.order !== undefined ? Number(body.order) : existingFestival.order,
			isActive: body.isActive !== undefined ? Boolean(body.isActive) : existingFestival.isActive
		};

		const titleEn = processedData.title?.en || "";
		const descEn = processedData.description?.en || "";

		if (!titleEn.trim() || !descEn.trim()) {
			return NextResponse.json({ error: "English title and description are required" }, { status: 400 });
		}

		// Update all fields and mark Mixed types as modified
		existingFestival.title = processedData.title;
		existingFestival.description = processedData.description;
		existingFestival.imageUrl = processedData.imageUrl;
		existingFestival.features = processedData.features;
		existingFestival.timing = processedData.timing;
		existingFestival.highlight = processedData.highlight;
		existingFestival.order = processedData.order;
		existingFestival.isActive = processedData.isActive;

		// Required for Mixed schema type fields
		existingFestival.markModified("title");
		existingFestival.markModified("description");
		existingFestival.markModified("features");
		existingFestival.markModified("timing");

		console.log("💾 Saving festival with data:", {
			_id: existingFestival._id.toString(),
			title: processedData.title?.en,
			imageUrl: processedData.imageUrl,
			highlight: processedData.highlight
		});

		let festival = null;
		
		// Try 1: Use Mongoose save
		try {
			festival = await existingFestival.save();
			console.log("✅ Festival saved via Mongoose:", festival._id.toString());
		} catch (mongooseError) {
			console.log("⚠️ Mongoose save failed, trying raw MongoDB update:", mongooseError instanceof Error ? mongooseError.message : String(mongooseError));
			
			// Try 2: Use raw MongoDB collection update
			try {
				const db = mongoose.connection.db;
				if (!db) {
					throw new Error("Database connection not available");
				}
				
				console.log("🔍 Raw MongoDB debug:", {
					inputId: id,
					objectIdCreated: new mongoose.Types.ObjectId(id),
					objectIdString: new mongoose.Types.ObjectId(id).toString()
				});
				
				const collection = db.collection('festivals');
				const updateData = {
					...processedData,
					updatedAt: new Date()
				};
				
				// Try both ObjectId and string _id since collection has mixed types
				let result = null;
				let usedFilter = null;
				
				// Try with ObjectId first
				try {
					const objectIdFilter = { _id: new mongoose.Types.ObjectId(id) };
					console.log("🔍 Trying ObjectId filter:", objectIdFilter);
					result = await collection.updateOne(objectIdFilter, { $set: updateData });
					usedFilter = "ObjectId";
				} catch {
					console.log("⚠️ ObjectId filter failed, trying string filter");
				}
				
				// If ObjectId failed, try with string
				if (!result || result.matchedCount === 0) {
					const stringFilter = { _id: id } as { _id: string };
					console.log("🔍 Trying string filter:", stringFilter);
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					result = await collection.updateOne(stringFilter as any, { $set: updateData });
					usedFilter = "string";
				}
				
				console.log("🔍 Update query:", {
					filterType: usedFilter,
					filter: usedFilter === "ObjectId" ? { _id: new mongoose.Types.ObjectId(id) } : { _id: id },
					updateData: { $set: updateData }
				});
				
				console.log("🔍 Update result:", {
					matchedCount: result.matchedCount,
					modifiedCount: result.modifiedCount,
					acknowledged: result.acknowledged
				});
				
				if (result.matchedCount === 0) {
					// Try to find the document to see what's in the collection
					const debugDoc = await collection.findOne({ _id: new mongoose.Types.ObjectId(id) });
					console.log("🔍 Debug - document found in collection:", !!debugDoc);
					
					// Try to find all documents to see their _id structure
					const allDocs = await collection.find({}).limit(3).toArray();
					console.log("🔍 Sample documents in collection:", allDocs.map(doc => ({
						_id: doc._id,
						_idType: typeof doc._id,
						_idToString: doc._id.toString(),
						title: doc.title?.en
					})));
					
					throw new Error("No document matched the update query");
				}
				
				// Fetch the updated document using the same filter type that worked
				let updatedDoc = null;
				if (usedFilter === "ObjectId") {
					updatedDoc = await collection.findOne({ _id: new mongoose.Types.ObjectId(id) });
				} else {
					// eslint-disable-next-line @typescript-eslint/no-explicit-any
					updatedDoc = await collection.findOne({ _id: id } as { _id: string } as any);
				}
				
				if (updatedDoc) {
					festival = new Festivals(updatedDoc);
					console.log("✅ Festival saved via raw MongoDB:", festival._id.toString());
				}
			} catch (rawError) {
				console.error("❌ Raw MongoDB update failed:", rawError instanceof Error ? rawError.message : String(rawError));
				throw rawError;
			}
		}

		if (!festival) {
			throw new Error("Failed to save festival using all methods");
		}

		console.log("✅ Festival saved successfully:", {
			_id: festival._id.toString(),
			title: festival.title?.en,
			imageUrl: festival.imageUrl,
			updatedAt: festival.updatedAt
		});

		return NextResponse.json({ message: "Festival updated successfully", data: festival });
	} catch (error) {
		console.error("Error updating festival:", error);
		return NextResponse.json({ error: "Failed to update festival" }, { status: 500 });
	}
}

export async function PATCH(request: NextRequest) {
	try {
		const auth = await requireAdmin();
		if (auth.response) return auth.response;

		await connectDB();

		const body = await request.json();
		const festivals = body.festivals as Array<{ id: string; order: number }>;

		if (!Array.isArray(festivals)) {
			return NextResponse.json({ error: "Festivals reorder list is required" }, { status: 400 });
		}

		const db = mongoose.connection.db;
		if (!db) {
			return NextResponse.json({ error: "Database connection not available" }, { status: 500 });
		}

		const collection = db.collection<FestivalRawDocument>("festivals");

		await Promise.all(
			festivals.map(async (festival) => {
				if (!festival.id || typeof festival.order !== "number") return;

				let result = null;
				if (mongoose.Types.ObjectId.isValid(festival.id)) {
					result = await collection.updateOne(
						{ _id: new mongoose.Types.ObjectId(festival.id) },
						{ $set: { order: festival.order, updatedAt: new Date() } }
					);
				}

				if (!result || result.matchedCount === 0) {
					await collection.updateOne(
						{ _id: festival.id },
						{ $set: { order: festival.order, updatedAt: new Date() } }
					);
				}
			})
		);

		return NextResponse.json({ message: "Festival order updated successfully" });
	} catch (error) {
		console.error("Error reordering festivals:", error);
		return NextResponse.json({ error: "Failed to reorder festivals" }, { status: 500 });
	}
}

// DELETE - Soft delete festival
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

		const festival = await Festivals.findByIdAndUpdate(
			id,
			{ isDeleted: true, deletedAt: new Date(), isActive: false },
			{ new: true }
		);

		if (!festival) {
			return NextResponse.json({ error: "Festival not found" }, { status: 404 });
		}

		return NextResponse.json({ message: "Festival deleted successfully" });
	} catch (error) {
		console.error("Error deleting festival:", error);
		return NextResponse.json({ error: "Failed to delete festival" }, { status: 500 });
	}
}