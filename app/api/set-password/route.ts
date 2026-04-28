import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
	try {
		console.log("=== SET PASSWORD API CALLED ===");
		await connectDB();
		const { token, password } = await req.json();

		console.log("Password set request received:", { 
			token: token?.substring(0, 10) + "...", 
			passwordLength: password?.length
		});

		if (!token || !password) {
			return NextResponse.json({ error: "Missing token or password" }, { status: 400 });
		}

		if (password.length < 6) {
			return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
		}

		// Try setup token first
		let membership = await Membership.findOne({
			passwordSetupToken: token,
			passwordSetupTokenExpiry: { $gt: Date.now() },
		});

		if (membership) {
			console.log("Found membership with valid setup token");
			
			// Hash the password
			const hashedPassword = await bcrypt.hash(password, 10);

			// Update membership with password and clear setup token
			membership.password = hashedPassword;
			membership.passwordSetupToken = undefined;
			membership.passwordSetupTokenExpiry = undefined;
			await membership.save();

			return NextResponse.json({ success: true, message: "Password set successfully" }, { status: 200 });
		}

		// Try reset token
		membership = await Membership.findOne({
			passwordResetToken: token,
			passwordResetTokenExpiry: { $gt: Date.now() },
		});

		if (membership) {
			console.log("Found membership with valid reset token");
			
			// Hash the password
			const hashedPassword = await bcrypt.hash(password, 10);

			// Update membership with password and clear reset token
			membership.password = hashedPassword;
			membership.passwordResetToken = undefined;
			membership.passwordResetTokenExpiry = undefined;
			await membership.save();

			return NextResponse.json({ success: true, message: "Password reset successfully" }, { status: 200 });
		}

		console.log("No valid token found");
		return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });

	} catch (error: unknown) {
		console.error("Error setting password:", error);
		return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to set password" }, { status: 500 });
	}
}
