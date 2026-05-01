import connectDB from "@/lib/mongodb";
import Settings from "@/models/Setting.Model";

export async function getSettings() {
	try {
		await connectDB();
		return Settings.find().lean();
	} catch (error) {
		console.error("Error fetching settings:", error);
		// Return empty array as fallback to prevent page crashes
		return [];
	}
}
