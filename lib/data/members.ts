import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";

export async function getMembers() {
	await connectDB();
	return Membership.find().lean();
}
