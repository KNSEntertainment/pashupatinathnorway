import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Cause from "@/models/Cause.Model";
import User from "@/models/User.Model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";

// interface MultilingualField {
// 	en: string;
// 	no: string;
// 	ne: string;
// }

// interface CauseData {
// 	title: MultilingualField;
// 	description: MultilingualField;
// 	category: 'health' | 'education' | 'emergency' | 'infrastructure' | 'community' | 'other';
// 	goalAmount: number;
// 	status: 'active' | 'completed' | 'paused' | 'cancelled';
// 	urgency: 'low' | 'medium' | 'high' | 'critical';
// 	poster?: string;
// 	endDate?: string;
// 	featured?: boolean;
// }

// GET all causes
export async function GET(request: NextRequest) {
	try {
		await connectDB();
		
		const { searchParams } = new URL(request.url);
		const locale = searchParams.get('locale') || 'en';
		const status = searchParams.get('status');
		const category = searchParams.get('category');
		const featured = searchParams.get('featured');
		const limit = searchParams.get('limit');
		
		// Build query
		const query: { status?: string; category?: string; featured?: boolean } = {};
		if (status) query.status = status;
		if (category) query.category = category;
		if (featured === 'true') query.featured = true;
		
		// Build sort
		const sort: { [key: string]: 1 | -1 } = { featured: -1, urgency: -1, createdAt: -1 };
		
		let causesQuery = Cause.find(query).sort(sort);
		
		if (limit) {
			causesQuery = causesQuery.limit(parseInt(limit));
		}
		
		const causes = await causesQuery;
		
		// Transform for locale
		const transformedCauses = causes.map(cause => {
			const causeObj = cause.toObject();
			return {
				...causeObj,
				title: cause.title[locale] || cause.title.en || '',
				description: cause.description[locale] || cause.description.en || '',
				progressPercentage: cause.progressPercentage,
				remainingAmount: cause.remainingAmount,
				currentAmount: cause.currentAmount,
				donationCount: cause.donationCount
			};
		});
		
		return NextResponse.json({ causes: transformedCauses });
	} catch (error) {
		console.error("Error fetching causes:", error);
		return NextResponse.json(
			{ error: "Failed to fetch causes" },
			{ status: 500 }
		);
	}
}

// POST - Create new cause
export async function POST(request: NextRequest) {
	try {
		// Check authentication and admin role
		const session = await getServerSession(authOptions);
		if (!session || !session.user?.role || session.user.role !== 'admin') {
			return NextResponse.json(
				{ error: "Unauthorized - Admin access required" },
				{ status: 401 }
			);
		}
		
		await connectDB();
		
		// Find user by email to get their actual ObjectId
		const user = await User.findOne({ email: session.user.email });
		if (!user) {
			return NextResponse.json(
				{ error: "User not found" },
				{ status: 404 }
			);
		}
		
		console.log("Found user with ObjectId:", user._id);
		
		const body = await request.json();
		const { title, description, category, goalAmount, status, urgency, endDate, featured, poster } = body;
		
		// Validate required fields
		if (!title || !description || !category || !goalAmount) {
			return NextResponse.json(
				{ error: "Missing required fields: title, description, category, goalAmount" },
				{ status: 400 }
			);
		}
		
		// Validate multilingual fields
		if (!title.en || !title.no || !title.ne) {
			return NextResponse.json(
				{ error: "Title is required in all languages (English, Norwegian, Nepali)" },
				{ status: 400 }
			);
		}
		
		if (!description.en || !description.no || !description.ne) {
			return NextResponse.json(
				{ error: "Description is required in all languages (English, Norwegian, Nepali)" },
				{ status: 400 }
			);
		}
		
		// Create new cause
		const newCause = new Cause({
			title,
			description,
			category,
			goalAmount,
			status: status || 'active',
			urgency: urgency || 'medium',
			poster: poster || '',
			endDate: endDate ? new Date(endDate) : undefined,
			featured: featured || false,
			createdBy: user._id, // Use actual MongoDB ObjectId
		});
		
		await newCause.save();
		
		return NextResponse.json({
			message: "Cause created successfully",
			cause: newCause
		}, { status: 201 });
		
	} catch (error) {
		console.error("Error creating cause:", error);
		return NextResponse.json(
			{ error: "Failed to create cause" },
			{ status: 500 }
		);
	}
}
