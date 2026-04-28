import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export async function GET(req: NextRequest) {
	try {
		await connectDB();

		const email = req.nextUrl.searchParams.get("email");
		if (!email) {
			return NextResponse.json({ error: "Email parameter is required" }, { status: 400 });
		}

		// Fetch membership with the given email
		const membership = await Membership.findOne({ email });
		if (!membership) {
			return NextResponse.json({ error: "Membership not found" }, { status: 404 });
		}

		return NextResponse.json({
			success: true,
			profilePhoto: membership.profilePhoto || null,
		});
	} catch (error: unknown) {
		console.error("Error fetching profile photo:", error);
		return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to fetch profile photo" }, { status: 500 });
	}
}

export async function POST(req: NextRequest) {
	try {
		const session = await getServerSession(authOptions);
		if (!session || !session.user) {
			return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
		}

		await connectDB();

		const formData = await req.formData();
		const file = formData.get("photo") as File;

		if (!file) {
			return NextResponse.json({ error: "No file provided" }, { status: 400 });
		}

		// Validate file type
		if (!file.type.startsWith("image/")) {
			return NextResponse.json({ error: "Only image files are allowed" }, { status: 400 });
		}

		// Validate file size (max 300KB)
		if (file.size > 300 * 1024) {
			return NextResponse.json({ error: "File size must be less than 300KB" }, { status: 400 });
		}

		// Get existing membership to retrieve old photo URL
		const existingMembership = await Membership.findOne({ email: session.user.email });
		if (!existingMembership) {
			console.error("Membership not found for email:", session.user.email);
			return NextResponse.json({ error: "Membership not found" }, { status: 404 });
		}

		const oldPhotoUrl = existingMembership.profilePhoto;

		// Upload new photo to Cloudinary
		const photoUrl = await uploadToCloudinary(file, "profile-photos");

		// Update membership's profile photo in database
		const membership = await Membership.findOneAndUpdate({ email: session.user.email }, { profilePhoto: photoUrl }, { new: true });

		if (!membership) {
			console.error("Membership not found for email:", session.user.email);
			return NextResponse.json({ error: "Membership not found" }, { status: 404 });
		}

		// Delete old photo from Cloudinary if it exists
		if (oldPhotoUrl) {
			try {
				await deleteFromCloudinary(oldPhotoUrl, "image");
			} catch (deleteError) {
				console.error("Error deleting old photo from Cloudinary:", deleteError);
				// Don't fail the request if deletion fails - the new photo is already uploaded
			}
		}

		return NextResponse.json({
			success: true,
			profilePhoto: photoUrl,
		});
	} catch (error: unknown) {
		console.error("Error uploading profile photo:", error);
		return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to upload photo" }, { status: 500 });
	}
}
