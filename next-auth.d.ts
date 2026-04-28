import { DefaultSession } from "next-auth";

declare module "next-auth" {
	interface Session {
		user: {
			id?: string;
			role?: string;
			fullName?: string;
			username?: string;
			phone?: string;
			// Member-specific fields
			isMember?: boolean;
			membershipType?: string;
			membershipStatus?: string;
		} & DefaultSession["user"];
	}

	interface User {
		role?: string;
		fullName?: string;
		username?: string;
		phone?: string;
		// Member-specific fields
		isMember?: boolean;
		membershipType?: string;
		membershipStatus?: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		role?: string;
		fullName?: string;
		username?: string;
		phone?: string;
		// Member-specific fields
		isMember?: boolean;
		membershipType?: string;
		membershipStatus?: string;
	}
}
