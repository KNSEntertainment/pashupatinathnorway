import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";

export async function POST(request: Request) {
	try {
		await connectDB();
		
		const { membershipId } = await request.json();
		
		if (!membershipId) {
			return NextResponse.json({ 
				valid: false, 
				error: "Membership ID is required" 
			}, { status: 400 });
		}

		// Validate format
		if (!/^MEM-\d{4}-\d{6}$/.test(membershipId)) {
			return NextResponse.json({ 
				valid: false, 
				error: "Invalid membership ID format. Expected format: MEM-YYYY-XXXXXX" 
			}, { status: 400 });
		}

		// Check if membership exists
		const membership = await Membership.findOne({ membershipId });
		
		if (!membership) {
			return NextResponse.json({ 
				valid: false, 
				error: "Membership ID not found in system" 
			}, { status: 404 });
		}

		return NextResponse.json({ 
			valid: true, 
			message: "Membership ID is valid",
			memberInfo: {
				name: `${membership.firstName} ${membership.lastName}`,
				email: membership.email,
				membershipStatus: membership.membershipStatus
			}
		}, { status: 200 });

	} catch (error) {
		console.error("Error validating membership ID:", error);
		return NextResponse.json({ 
			valid: false, 
			error: "Failed to validate membership ID" 
		}, { status: 500 });
	}
}
