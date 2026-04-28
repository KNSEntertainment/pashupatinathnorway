import connectDB from "@/lib/mongodb";
import ExecutiveMember from "@/models/ExecutiveMember.Model";

export async function getExecutiveMembers() {
	await connectDB();
	return ExecutiveMember.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
}
