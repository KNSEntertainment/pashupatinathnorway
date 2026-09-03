import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import { requireAdmin } from "@/lib/apiAuth";
import { archiveBoardMembers } from "@/lib/managementHistory";

export async function POST(req: NextRequest) {
	const auth = await requireAdmin();
	if (auth.response) return auth.response;

	await connectDB();
	const data = await req.json();
	const termEnd = data.termEnd ? new Date(data.termEnd) : new Date();
	const fallbackTermStart = data.termStart ? new Date(data.termStart) : null;

	const currentBoard = await Membership.find({ membershipType: { $in: ["Executive", "Advisor"] } });

	if (currentBoard.length === 0) {
		return NextResponse.json({ error: "No current board members to archive" }, { status: 400 });
	}

	const missingStart = currentBoard.find((member) => !member.boardTermStart && !fallbackTermStart);
	if (missingStart) {
		return NextResponse.json(
			{ error: `${missingStart.firstName} ${missingStart.lastName} has no recorded term start date. Please provide a fallback termStart.` },
			{ status: 400 }
		);
	}

	const created = await archiveBoardMembers(currentBoard, termEnd, fallbackTermStart, false);

	return NextResponse.json({ success: true, archivedCount: created.length, records: created });
}
