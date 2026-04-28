import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Membership from "@/models/Membership.Model";
import User from "@/models/User.Model";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
	try {
		console.log("=== RESET PASSWORD API CALLED ===");
		await connectDB();
		const { token, password } = await req.json();

		console.log("Reset password request received:", { 
			token: token?.substring(0, 10) + "...", 
			passwordLength: password?.length,
			fullToken: token
		});

		if (!token || !password) {
			return NextResponse.json({ error: "Missing token or password" }, { status: 400 });
		}

		if (password.length < 6) {
			return NextResponse.json({ error: "Password must be at least 6 characters long" }, { status: 400 });
		}

		// First try to find user with reset token
		let user = await User.findOne({
			resetToken: token,
			resetTokenExpiry: { $gt: Date.now() },
		});

		// If not found with reset token, try setup token
		if (!user) {
			user = await User.findOne({
				setupToken: token,
				setupTokenExpiry: { $gt: Date.now() },
			});
		}

		// If not found in User model, try Membership model with setup token
		if (!user) {
			console.log("Checking membership with setup token...");
			const membership = await Membership.findOne({
				passwordSetupToken: token,
				passwordSetupTokenExpiry: { $gt: Date.now() },
			});

			if (!membership) {
				console.log("Setup token not found, checking reset token...");
				// Try reset token for membership
				console.log("=== LOOKING FOR RESET TOKEN ===");
				console.log("Looking for reset token:", token.substring(0, 10) + "...");
				console.log("Full token being searched:", token);
				
				// First, let's see all members with reset tokens
				const allMembersWithResetTokens = await Membership.find({ passwordResetToken: { $exists: true, $ne: null } });
				console.log("All members with reset tokens:", allMembersWithResetTokens.length);
				
				if (allMembersWithResetTokens.length > 0) {
					console.log("Members with reset tokens:");
					allMembersWithResetTokens.forEach((member, index) => {
						console.log(`  ${index + 1}. Email: ${member.email}`);
						console.log(`      Full Token: ${member.passwordResetToken}`);
						console.log(`      Token Length: ${member.passwordResetToken?.length}`);
						console.log(`      Expiry: ${member.passwordResetTokenExpiry}`);
						console.log(`      Searched Token: ${token}`);
						console.log(`      Searched Length: ${token.length}`);
						console.log(`      Tokens Match: ${member.passwordResetToken === token}`);
					});
				}
				
				// First, find the token without expiry check
				const membershipWithResetToken = await Membership.findOne({
					passwordResetToken: token
				});

				console.log("Found membership with reset token (no expiry check):", !!membershipWithResetToken);

				if (!membershipWithResetToken) {
					console.log("=== TOKEN NOT FOUND ===");
					console.log("No membership found with this reset token");
					return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
				}

				// Now check expiry manually
				const currentTime = new Date();
				const tokenExpiry = membershipWithResetToken.passwordResetTokenExpiry;
				
				console.log("Token expiry details:");
				console.log("- Current time:", currentTime.toISOString());
				console.log("- Token expiry:", tokenExpiry?.toISOString());
				console.log("- Is token still valid?", tokenExpiry && currentTime < tokenExpiry);
				console.log("- Time difference (ms):", tokenExpiry ? tokenExpiry.getTime() - currentTime.getTime() : "N/A");

				if (!tokenExpiry || currentTime >= tokenExpiry) {
					console.log("Token has expired or has no expiry date");
					// Clear expired token
					await Membership.findByIdAndUpdate(membershipWithResetToken._id, {
						passwordResetToken: undefined,
						passwordResetTokenExpiry: undefined,
					});
					return NextResponse.json({ error: "Token has expired. Please request a new password reset." }, { status: 400 });
				}

				// Hash the password
				const hashedPassword = await bcrypt.hash(password, 10);

				// Update membership with password and clear reset token
				membershipWithResetToken.password = hashedPassword;
				membershipWithResetToken.passwordResetToken = undefined;
				membershipWithResetToken.passwordResetTokenExpiry = undefined;
				await membershipWithResetToken.save();

				console.log("Password reset successfully for member:", membershipWithResetToken.email);
				return NextResponse.json({ success: true, message: "Password reset successfully" }, { status: 200 });
			}

			// Hash the password
			const hashedPassword = await bcrypt.hash(password, 10);

			// Update membership with password and clear setup token
			membership.password = hashedPassword;
			membership.passwordSetupToken = undefined;
			membership.passwordSetupTokenExpiry = undefined;
			await membership.save();

			console.log("Password set successfully for member:", membership.email);
			return NextResponse.json({ success: true, message: "Password set successfully" }, { status: 200 });
		}

		// Handle User model password reset (existing logic)
		const hashedPassword = await bcrypt.hash(password, 10);

		// Update user with password and clear appropriate token
		user.password = hashedPassword;
		// Clear both reset and setup tokens to be safe
		user.resetToken = undefined;
		user.resetTokenExpiry = undefined;
		user.setupToken = undefined;
		user.setupTokenExpiry = undefined;
		await user.save();

		console.log("Password reset successfully for user:", user.email);
		return NextResponse.json({ success: true, message: "Password reset successfully" }, { status: 200 });
	} catch (error: unknown) {
		console.error("Error resetting password:", error);
		return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to reset password" }, { status: 500 });
	}
}
