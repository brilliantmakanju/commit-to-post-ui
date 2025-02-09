// types/next-auth.d.ts

import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
	interface User {
		first_name: string;
		last_name: string;
		email: string;
		bio?: string | null;
		preferences: Record<string, any>;
		github_connected: boolean;
		access: string;
		refresh: string;
		google_connected: boolean;
		new_user: boolean;
		type: string;
	}

	interface Session {
		// user: {
			access: string;
			refresh: string;
			user: User; // This is the actual user data
			id: string;
		// };
		expires: string;
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		id: string;
		role: string;
	}
}
