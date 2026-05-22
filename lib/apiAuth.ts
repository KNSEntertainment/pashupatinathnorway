import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/options";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";

export async function requireAdmin() {
	const session = await getServerSession(authOptions);

	if (!session?.user || session.user.role !== "admin") {
		return {
			session,
			response: NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 401 }),
		};
	}

	return { session, response: null };
}

export async function requireAuthenticatedMember() {
	const session = await getServerSession(authOptions);

	if (!session?.user?.email) {
		return {
			session,
			response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
		};
	}

	return { session, response: null };
}

export async function requireAdminOrExecutive() {
	const session = await getServerSession(authOptions);

	if (!session?.user?.email) {
		return {
			session,
			response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }),
		};
	}

	if (session.user.role === "admin") {
		return { session, response: null };
	}

	await connectDB();
	const membership = await Membership.findOne({
		email: session.user.email,
		membershipStatus: "approved",
		membershipType: "Executive",
	}).select("_id");

	if (!membership) {
		return {
			session,
			response: NextResponse.json({ error: "Unauthorized. Executive access required." }, { status: 403 }),
		};
	}

	return { session, response: null };
}
