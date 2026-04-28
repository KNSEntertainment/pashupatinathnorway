import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Hero from "@/models/Hero.Model";
import { uploadToCloudinary } from "@/utils/saveFileToCloudinaryUtils";

export const config = {
	api: {
		bodyParser: false,
	},
};

export async function POST(request) {
	try {
		await connectDB();

		// Parse the incoming form data
		const formData = await request.formData();
		console.log("Received form data");

		const mainheading = formData.get("mainheading");
		const subheading = formData.get("subheading");
		const heroimage = formData.get("heroimage");

		console.log("Parsed form data:", { mainheading, subheading, heroimage });

		// Validate input
		if (!mainheading || !subheading || !heroimage) {
			return NextResponse.json({ success: false, error: "All fields are required to create a testimonial" }, { status: 400 });
		}

		// Save the image to the uploads directory
		const heroimageUrl = await uploadToCloudinary(heroimage, "hero_images");

		// Save the testimonial to MongoDB
		console.log("Saving testimonial to database");
		const hero = await Hero.create({
			mainheading,
			subheading,
			heroimage: heroimageUrl,
		});
		console.log("Hero content saved successfully:", hero);

		return NextResponse.json({ success: true, hero }, { status: 201 });
	} catch (error) {
		console.error("Error in API route:", error);
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
