import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import { requireAdmin } from "@/lib/apiAuth";
import { archiveBoardMembers } from "@/lib/managementHistory";

export async function POST(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const auth = await requireAdmin();
	if (auth.response) return auth.response;

	await connectDB();
	const { id } = await context.params;
	const data = await req.json();
	const termEnd = data.resignedOn ? new Date(data.resignedOn) : new Date();
	const fallbackTermStart = data.termStart ? new Date(data.termStart) : null;

	const member = await Membership.findById(id);
	if (!member) {
		return NextResponse.json({ error: "Member not found" }, { status: 404 });
	}

	if (!["Executive", "Advisor"].includes(member.membershipType)) {
		return NextResponse.json({ error: "This member is not currently on the board" }, { status: 400 });
	}

	if (!member.boardTermStart && !fallbackTermStart) {
		return NextResponse.json({ error: "This member has no recorded term start date. Please provide a fallback termStart." }, { status: 400 });
	}

	const [created] = await archiveBoardMembers([member], termEnd, fallbackTermStart, true);

	return NextResponse.json({ success: true, record: created });
}
