// Legacy login route removed. Use NextAuth for authentication.
import { NextResponse } from "next/server";
export async function POST() {
	return NextResponse.json({ error: "This endpoint is deprecated. Use /api/auth/signin via NextAuth." }, { status: 410 });
}
