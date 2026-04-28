import connectDB from "@/lib/mongodb";
import Event from "@/models/Event.Model";

export async function getEvents() {
	await connectDB();
	return Event.find().sort({ eventdate: -1 }).lean();
}
