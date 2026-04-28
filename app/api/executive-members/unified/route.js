import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ExecutiveMember from "@/models/ExecutiveMember.Model";
import Membership from "@/models/Membership.Model";

export async function GET() {
	try {
		await connectDB();
		
		// Get executive members from ExecutiveMember collection (admin-added)
		const adminExecutiveMembers = await ExecutiveMember.find({ isActive: true }).sort({ order: 1, createdAt: -1 });
		
		// Get executive members from Membership collection (self-registered)
		const selfRegisteredExecutiveMembers = await Membership.find({
			membershipType: "executive",
			membershipStatus: "approved"
		}).sort({ createdAt: -1 });
		
		// Transform self-registered members to match ExecutiveMember format
		const transformedSelfRegistered = selfRegisteredExecutiveMembers.map(member => ({
			_id: member._id,
			name: member.fullName,
			email: member.email,
			phone: member.phone,
			position: member.profession || "Executive Member",
			department: "",
			subdepartment: "",
			imageUrl: member.profilePhoto || "",
			order: 999, // Put self-registered after admin-added
			isActive: true,
			createdBy: "self-registered",
			createdAt: member.createdAt,
			updatedAt: member.updatedAt || member.createdAt,
			source: "membership" // Track source for debugging
		}));
		
		// Combine both arrays, admin-added members first
		const allExecutiveMembers = [...adminExecutiveMembers, ...transformedSelfRegistered];
		
		return NextResponse.json(allExecutiveMembers);
	} catch (error) {
		console.error("Error fetching unified executive members:", error);
		return NextResponse.json({ error: "Failed to fetch executive members." }, { status: 500 });
	}
}
