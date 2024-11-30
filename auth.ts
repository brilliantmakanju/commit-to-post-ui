import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signOut, signIn, auth } = NextAuth({
	providers: [
		Credentials({
			credentials: {
				email: { label: "Email", type: "email", placeholder: "Email" },
				password: {
					label: "Password",
					type: "password",
					placeholder: "Password",
				},
			},
			authorize: async credentials => {
				let user;

				user = {};

				return user;
			},
		}),
	],
});
