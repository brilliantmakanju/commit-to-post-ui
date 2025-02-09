"use server";

import { jwtDecrypt } from "jose";
import { cookies } from "next/headers";

const ENCRYPTION_KEY =
	process.env.ENCRYPTION_KEY || "p2s5v8y/B?E(H+MbQeThWmZq4t6w9z$C";

// Function to get and decrypt the cookie
export const getDecryptedCookie = async (cookieName: string) => {
	try {
		const cookieStore = await cookies();
		const encryptedValue = cookieStore.get(cookieName);

		if (!encryptedValue) {
			return; // Cookie not found
		}

		const keyBuffer = new TextEncoder().encode(ENCRYPTION_KEY).slice(0, 16);
		const decryptedValue = await jwtDecrypt(encryptedValue.value, keyBuffer);

		return decryptedValue.payload; // Return the decrypted payload
	} catch {
		return; // Return null in case of error
	}
};
