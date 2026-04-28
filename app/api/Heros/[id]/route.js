import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Hero from "@/models/Hero.Model";
import { uploadToCloudinary, deleteFromCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export const config = {
	api: {
		bodyParser: false,
	},
};

export async function PUT(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		const formData = await request.formData();
		const heroId = id;
		const existingHero = await Hero.findById(heroId);

		if (!existingHero) {
			return NextResponse.json({ success: false, error: "Hero not found" }, { status: 404 });
		}

		const heroData = {};
		for (const [key, value] of formData.entries()) {
			if (key !== "heroimage") {
				heroData[key] = value;
			}
		}

		const heroimage = formData.get("heroimage");
		const oldHeroImage = existingHero.heroimage;
		if (heroimage) {
			heroData.heroimage = await uploadToCloudinary(heroimage, "hero_images");
		}

		const updatedhero = await Hero.findByIdAndUpdate(heroId, heroData, { new: true });

		if (!updatedhero) {
			return NextResponse.json({ success: false, error: "Hero not found" }, { status: 404 });
		}

		if (oldHeroImage && heroData.heroimage && oldHeroImage !== heroData.heroimage) {
			try {
				await deleteFromCloudinary(oldHeroImage, "image");
			} catch (error) {
				console.error("Failed to delete old hero image from Cloudinary:", error);
			}
		}

		return NextResponse.json({ success: true, Hero: updatedhero }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function DELETE(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		const heroId = id;

		const deletedhero = await Hero.findByIdAndDelete(heroId);

		if (!deletedhero) {
			return NextResponse.json({ success: false, error: "Hero not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, message: "Hero deleted successfully" }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}

export async function GET(request, { params }) {
	const { id } = await params;

	try {
		await connectDB();

		const heroId = id;
		const Hero = await Hero.findById(heroId);

		if (!Hero) {
			return NextResponse.json({ success: false, error: "Hero not found" }, { status: 404 });
		}

		return NextResponse.json({ success: true, Hero }, { status: 200 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
