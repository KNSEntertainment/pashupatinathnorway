import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Cause from "@/models/Cause.Model";
import User from "@/models/User.Model";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import { deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";

interface MultilingualField {
	en: string;
	no: string;
	ne: string;
}

interface CauseData {
	title?: MultilingualField;
	description?: MultilingualField;
	category?: 'health' | 'education' | 'emergency' | 'infrastructure' | 'community' | 'other';
	goalAmount?: number;
	status?: 'active' | 'completed' | 'paused' | 'cancelled';
	urgency?: 'low' | 'medium' | 'high' | 'critical';
	poster?: string;
	endDate?: string;
	featured?: boolean;
}

// GET single cause by ID
export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
	try {
		await connectDB();
		
		const cause = await Cause.findById(id);
		
		if (!cause) {
			return NextResponse.json(
				{ error: "Cause not found" },
				{ status: 404 }
			);
		}
		
		// Return full cause data for admin editing (no locale transformation)
		const causeData = cause.toObject();
		
		// Add virtual fields
		causeData.progressPercentage = cause.progressPercentage;
		causeData.remainingAmount = cause.remainingAmount;
		
		return NextResponse.json({ cause: causeData });
	} catch (error) {
		console.error("Error fetching cause:", error);
		return NextResponse.json(
			{ error: "Failed to fetch cause" },
			{ status: 500 }
		);
	}
}

// PUT - Update a single cause
export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
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
		
		const body: CauseData = await request.json();
		const { title, description, category, goalAmount, status, urgency, poster, endDate, featured } = body;
		
		const cause = await Cause.findById(id);
		
		if (!cause) {
			return NextResponse.json(
				{ error: "Cause not found" },
				{ status: 404 }
			);
		}
		
		// Update cause fields
		if (title !== undefined) cause.title = title;
		if (description !== undefined) cause.description = description;
		if (category !== undefined) cause.category = category;
		if (goalAmount !== undefined) cause.goalAmount = goalAmount;
		if (status !== undefined) cause.status = status;
		if (urgency !== undefined) cause.urgency = urgency;
		if (poster !== undefined) cause.poster = poster;
		if (endDate !== undefined) cause.endDate = endDate ? new Date(endDate) : undefined;
		if (featured !== undefined) cause.featured = featured;
		
		cause.updatedBy = user._id;
		
		await cause.save();
		
		return NextResponse.json({ 
			message: "Cause updated successfully",
			cause 
		});
	} catch (error) {
		console.error("Error updating cause:", error);
		return NextResponse.json(
			{ error: "Failed to update cause" },
			{ status: 500 }
		);
	}
}

// DELETE - Remove a cause
export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
	const { id } = await params;
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
		
		const cause = await Cause.findById(id);
		
		if (!cause) {
			return NextResponse.json(
				{ error: "Cause not found" },
				{ status: 404 }
			);
		}
		
		// Delete image from Cloudinary if it exists
		if (cause.image) {
			try {
				await deleteFromCloudinary(cause.image, "image");
			} catch (error) {
				console.error("Failed to delete image from Cloudinary:", error);
			}
		}
		
		// Delete the cause
		await Cause.findByIdAndDelete(id);
		
		return NextResponse.json({ 
			message: "Cause deleted successfully" 
		});
	} catch (error) {
		console.error("Error deleting cause:", error);
		return NextResponse.json(
			{ error: "Failed to delete cause" },
			{ status: 500 }
		);
	}
}
