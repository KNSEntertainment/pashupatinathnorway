import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcrypt";
import User from "@/models/User.Model";
import Membership from "@/models/Membership.Model";
import ConnectDB from "@/lib/mongodb";
import NextAuth from "next-auth";

/** @type {import('next-auth').AuthOptions} */
export const authOptions = {
	session: {
		strategy: "jwt",
		maxAge: 24 * 60 * 60, // 24 hours
	},
	providers: [
		CredentialsProvider({
			id: "credentials",
			name: "Credentials",
			credentials: {
				email: { label: "Email", type: "text" },
				password: { label: "Password", type: "password" },
			},
			async authorize(credentials) {
				console.log("=== AUTHORIZE FUNCTION CALLED ===");
				console.log("Email from credentials:", credentials?.email);

				await ConnectDB();

				try {
					if (!credentials?.email) {
						throw new Error("Email is required");
					}

					// First check if it's an admin user in User model
					const user = await User.findOne({ email: credentials.email });
					
					if (user) {
						console.log("Found admin user in User model");
						
						// Validate admin password
						const isValid = await bcrypt.compare(credentials.password, user.password);
						if (!isValid) {
							throw new Error("Invalid credentials");
						}
						
						// Return admin user data
						return {
							_id: user._id,
							email: user.email,
							fullName: user.fullName,
							phone: user.phone,
							role: user.role,
							isMember: false, // Flag to identify this is an admin user
						};
					}

					// If not admin, check if it's a member in Membership model
					const member = await Membership.findOne({ 
						email: credentials.email,
						membershipStatus: "approved" // Only allow approved members to login
					});
					
					if (!member) {
						throw new Error("No approved member found with this email");
					}
					
					// Check if member has a password set
					if (!member.password) {
						throw new Error("Please set your password first. Check your email for the setup link.");
					}
					
					// Validate member password
					const isValid = await bcrypt.compare(credentials.password, member.password);
					if (!isValid) {
						throw new Error("Invalid credentials");
					}
					
					// Return member data for NextAuth
					return {
						_id: member._id,
						email: member.email,
						fullName: member.fullName,
						phone: member.phone,
						role: "member", // All members get "member" role
						membershipType: member.membershipType,
						membershipStatus: member.membershipStatus,
						isMember: true, // Flag to identify this is a member
					};
				} catch (error) {
					throw new Error(error.message);
				}
			},
		}),
	],
	pages: {
		signIn: "/login",
		signOut: "/logout",
		error: "/error",
		verifyRequest: "/verify-request",
		newUser: null,
	},
	callbacks: {
		async jwt({ token, user }) {
			if (user) {
				token._id = user._id;
				token.isVerified = user.isVerified;
				token.isAcceptingMessages = user.isAcceptingMessages;
				token.username = user.username;
				token.fullName = user.fullName;
				token.role = user.role;
				token.phone = user.phone;
				// Member-specific fields
				token.isMember = user.isMember;
				token.membershipType = user.membershipType;
				token.membershipStatus = user.membershipStatus;
			}
			return token;
		},
		async session({ session, token }) {
			if (token) {
				session.user = {
					_id: token._id,
					email: token.email,
					isVerified: token.isVerified,
					isAcceptingMessages: token.isAcceptingMessages,
					username: token.username,
					fullName: token.fullName,
					role: token.role,
					phone: token.phone,
					// Member-specific fields
					isMember: token.isMember,
					membershipType: token.membershipType,
					membershipStatus: token.membershipStatus,
				};
			}

			return session;
		},
		async redirect({ url, baseUrl }) {
			// If logging in from /login page, redirect based on user role
			if (url === "/login" || url.includes("/login")) {
				// This will be handled by the client-side logic
				return `${baseUrl}/en`; // Fallback to home
			}
			// Allows relative callback URLs
			if (url.startsWith("/")) return `${baseUrl}${url}`;
			// Allows callback URLs on the same origin
			else if (new URL(url).origin === baseUrl) return url;
			return baseUrl;
		},
	},
	secret: process.env.NEXTAUTH_SECRET,
};

export const { GET, POST } = NextAuth(authOptions);
