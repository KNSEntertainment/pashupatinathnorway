// Legacy logout route removed. Use NextAuth for sign out.
import { NextResponse } from "next/server";
export async function POST() {
	return NextResponse.json({ error: "This endpoint is deprecated. Use /api/auth/signout via NextAuth." }, { status: 410 });
}
