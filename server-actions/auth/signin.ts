"use server";

import dotenv from "dotenv";
import { AuthError } from "next-auth";

import { signIn } from "@/auth";
import { createEncryptedCookie } from "@/lib/cookies/create-cookies";

dotenv.config();

// Function to register a user
export const loginUser = async ({
	email,
	password,
}: {
	email: string;
	password: string;
}) => {
	try {
		await createEncryptedCookie("firstLogin", {
			firstLogin: true,
		});
		await signIn("credentials", {
			email,
			password,
			magicLink: false,
			token: "",
			redirect: false,
		});
	} catch (error) {
		if (error instanceof AuthError) {
			switch (error.type) {
				case "CredentialsSignin": {
					return {
						message: "Invalid credentials.",
					};
				}
				default: {
					return {
						message: "Something went wrongsd.",
					};
				}
			}
		}
		throw error;
	}
};
