import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message.Model";

export async function GET(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params;

	await connectDB();

	const message = await Message.findById(id);

	if (!message) {
		return NextResponse.json({ error: "Not found" }, { status: 404 });
	}

	return NextResponse.json(message);
}

export async function PUT(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params;
	await connectDB();
	const data = await req.json();
	const message = await Message.findByIdAndUpdate(id, data, { new: true });
	if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json(message);
}

export async function DELETE(req: NextRequest, context: { params: Promise<{ id: string }> }) {
	const { id } = await context.params;
	await connectDB();
	const message = await Message.findByIdAndDelete(id);
	if (!message) return NextResponse.json({ error: "Not found" }, { status: 404 });
	return NextResponse.json({ message: "Deleted successfully" });
}
