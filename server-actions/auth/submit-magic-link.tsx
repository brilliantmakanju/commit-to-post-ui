/* eslint-disable import/no-unresolved */
import { toast } from "sonner";
import { z } from "zod";

import { magicLinkSchemaToken } from "@/resolvers/auth-resolvers";

import { verifyAndLogin } from "./magic-link";

export const submitMagicLink = async (
	values: z.infer<typeof magicLinkSchemaToken>,
) => {
	try {
		const apiRequest = await verifyAndLogin({
			token: values.token,
		});
		if (apiRequest?.message === "Invalid credentials.") {
			toast.error("Invalid credentials, please try again");
		} else if (apiRequest?.message === "Something went wrong.") {
			toast.error("Something went wrong. Please try again later.");
		} else {
			globalThis.window.location.replace("/dashboard");
		}
	} catch (error) {
		toast.error((error as Error).message);
	}
};
