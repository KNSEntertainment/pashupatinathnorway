import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Download from "@/models/Download.Model";

export async function POST(request, context) {
	try {
		await connectDB();
		const { id } = await context.params;
		const updated = await Download.findByIdAndUpdate(id, { $inc: { downloadCount: 1 } }, { new: true });
		if (!updated) {
			return NextResponse.json({ success: false, error: "Download not found" }, { status: 404 });
		}
		return NextResponse.json({ success: true, downloadCount: updated.downloadCount }, { status: 200 });
	} catch (error) {
		return NextResponse.json({ success: false, error: error.message }, { status: 500 });
	}
}
