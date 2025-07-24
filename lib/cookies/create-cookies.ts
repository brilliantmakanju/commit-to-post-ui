"use server";
import { EncryptJWT } from "jose";
import { nanoid } from "nanoid";
import { cookies } from "next/headers";

// Generated a secure 32+ character encryption key
const ENCRYPTION_KEY =
	process.env.ENCRYPTION_KEY || "p2s5v8y/B?E(H+MbQeThWmZq4t6w9z$C";
const COOKIE_NAME = "session";

// Utility function to encrypt data with all encryption logic encapsulated
const encrypt = async (payload: any): Promise<string> => {
	// For A128GCM, we need a 16-byte (128-bit) key
	const keyBuffer = new TextEncoder().encode(ENCRYPTION_KEY).slice(0, 16);

	const encryptJwt = new EncryptJWT(payload)
		.setProtectedHeader({ alg: "dir", enc: "A128GCM" })
		.setIssuedAt()
		.setExpirationTime("24h")
		.setJti(nanoid());

	const encryptedValue = await encryptJwt.encrypt(keyBuffer);
	return encryptedValue;
};
// Simplified cookie creation function that uses the encryption service
export async function createEncryptedCookie(
	name: string = COOKIE_NAME,
	value: any,
	options: {
		maxAge?: number;
		expires?: Date;
		path?: string;
		domain?: string;
		secure?: boolean;
		httpOnly?: boolean;
	} = {},
) {
	try {
		const defaultOptions = {
			maxAge: 86400,
			path: "/",
			secure: process.env.NODE_ENV === "production",
			httpOnly: process.env.NODE_ENV === "production",
			sameSite: "lax" as const,
		};

		const cookieOptions = {
			...defaultOptions,
			...options,
		};
		const cookieStore = await cookies();
		const encryptedValue = await encrypt(value);
		cookieStore.set(name, encryptedValue, cookieOptions);

		return true;
	} catch {
		return false;
	}
}

// Example usage:
// await createEncryptedCookie("sessionId", { userId: "123", role: "admin" });
// await createEncryptedCookie("userPrefs", { theme: "dark" }, { maxAge: 7 * 24 * 60 * 60 }); // 7 days

// Function to delete a cookie
export async function deleteCookie(name: string) {
	try {
		const cookieStore = await cookies();
		cookieStore.delete(name); // Use delete() to completely remove the cookie
	} catch {}
}

// Function to update a cookie
export async function updateCookie(name: string, newValue: any) {
	await deleteCookie(name); // Delete the old cookie
	await createEncryptedCookie(name, newValue); // Create a new cookie with the new value
}

export const clearCookies = async () => {
	try {
		const cookieStore = await cookies();
		const allCookies = cookieStore.getAll();

		for (const cookie of allCookies) {
			await deleteCookie(cookie.name);
		}
	} catch {
		return;
	}
};
