import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Message from "@/models/Message.Model";

export async function GET() {
	await connectDB();
	const messages = await Message.find().sort({ createdAt: -1 });
	return NextResponse.json(messages);
}

export async function POST(req: NextRequest) {
	await connectDB();
	const data = await req.json();
	const message = await Message.create(data);
	return NextResponse.json(message, { status: 201 });
}
