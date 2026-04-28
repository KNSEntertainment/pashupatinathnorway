import connectDB from "@/lib/mongodb";
import Settings from "@/models/Setting.Model";

export async function getSettings() {
	await connectDB();
	return Settings.find().lean();
}
