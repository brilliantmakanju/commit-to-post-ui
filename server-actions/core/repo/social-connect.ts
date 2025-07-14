"use server";

import { z } from "zod";

// eslint-disable-next-line import/no-unresolved
import { apiClient } from "@/lib/utils/api-client";

const socialIntegrationSchema = z.object({
	repo_id: z.string().uuid({ message: "Invalid repository ID." }),
	platform: z.enum(["slack", "discord"], {
		errorMap: () => ({
			message: "Platform must be either 'slack' or 'discord'.",
		}),
	}),
	webhook_url: z
		.string()
		.url({ message: "Webhook URL must be a valid URL." })
		.min(1, { message: "Webhook URL cannot be empty." }),
});

const disconnectIntegrationSchema = z.object({
	repo_id: z.string().uuid({ message: "Invalid repository ID." }),
	platform: z.enum(["slack", "discord", "linkedin"], {
		errorMap: () => ({
			message: "Platform must be either 'slack' or 'discord'.",
		}),
	}),
});

const getConnectLinkedinOauthSchema = z.object({
	repo_id: z.string().uuid({ message: "Invalid repository ID." }),
});

const socialConnectLinkedinOauthSchema = z.object({
	code: z.string(),
	state: z.string(),
});

export const socialConnectSlackAndDiscord = async (
	repo_id: string,
	webhook_url: string,
	platform: "slack" | "discord",
): Promise<{
	success: boolean;
	message: string;
	data?: any;
}> => {
	const validation = socialIntegrationSchema.safeParse({
		repo_id,
		platform,
		webhook_url,
	});

	if (!validation.success) {
		const errorMessage =
			validation.error.errors[0]?.message ?? "Invalid input provided.";
		return {
			success: false,
			message: errorMessage,
		};
	}

	try {
		const url = `/api/v1/repositories/${repo_id}/integrations/connect/`;

		const response = await apiClient.post(url, {
			platform,
			webhook_url,
		});

		if (response.status !== 200) {
			return {
				success: false,
				message: `Failed to connect ${platform}.`,
			};
		}

		return {
			success: true,
			data: response.data,
			message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} integration successful.`,
		};
	} catch (error: any) {
		const fallbackMessage = `Unexpected error while connecting to ${platform}.`;
		const detailedMessage =
			error?.response?.data?.message ?? error?.message ?? fallbackMessage;

		return {
			success: false,
			message: detailedMessage,
		};
	}
};

export const disconnectSlackAndDiscord = async (
	repo_id: string,
	platform: "slack" | "discord" | "linkedin",
): Promise<{
	success: boolean;
	message: string;
}> => {
	const validation = disconnectIntegrationSchema.safeParse({
		repo_id,
		platform,
	});

	if (!validation.success) {
		const errorMessage =
			validation.error.errors[0]?.message ?? "Invalid input provided.";
		return {
			success: false,
			message: errorMessage,
		};
	}

	try {
		const url = `/api/v1/repositories/${repo_id}/integrations/disconnect/`;

		const response = await apiClient.post(url, {
			platform,
		});

		if (response.status !== 200) {
			return {
				success: false,
				message: `Failed to disconnect ${platform}.`,
			};
		}

		return {
			success: true,
			message: `${platform.charAt(0).toUpperCase() + platform.slice(1)} integration disconnected successfully.`,
		};
	} catch (error: any) {
		const fallbackMessage = `Unexpected error while disconnecting ${platform}.`;
		const detailedMessage =
			error?.response?.data?.message ?? error?.message ?? fallbackMessage;

		return {
			success: false,
			message: detailedMessage,
		};
	}
};

export const getConnectLinkedinOauth = async (
	repo_id: string,
): Promise<{
	message?: string;
	success: boolean;
	data?: {
		authorization_url: string;
	};
}> => {
	const validation = getConnectLinkedinOauthSchema.safeParse({ repo_id });

	if (!validation.success) {
		return {
			success: false,
			message: "Invalid repository. Please refresh and try again.",
		};
	}

	try {
		const url = `/api/v1/repositories/integrations/linkedin/connect/?repo_id=${repo_id}`;
		const response = await apiClient.get(url);

		const authUrl = response?.data?.authorization_url;

		if (response.status !== 200 || !authUrl) {
			return {
				success: false,
				message:
					"We couldn’t start the LinkedIn connection. Please try again or contact support.",
			};
		}

		return {
			success: true,
			data: {
				authorization_url: authUrl,
			},
			message: "LinkedIn connection initialized. Redirecting...",
		};
	} catch (error: any) {
		const fallbackMessage =
			"An unexpected error occurred while connecting to LinkedIn.";

		const detailedMessage =
			error?.response?.data?.message ?? error?.message ?? fallbackMessage;

		return {
			success: false,
			message: detailedMessage,
		};
	}
};

interface LinkedInOauthResponse {
	success: boolean;
	message?: string;
	data?: {
		repo_id: string;
	};
}

/**
 * Initiates the LinkedIn OAuth connection process by exchanging the code and state.
 */
export const socialConnectLinkedinOauth = async (
	code: string,
	state: string,
): Promise<LinkedInOauthResponse> => {
	// Validate inputs
	// console.log(code, "Code", state, "State");
	const parsed = socialConnectLinkedinOauthSchema.safeParse({ code, state });
	// console.log(parsed, "Parsed");

	if (!parsed.success) {
		return {
			success: false,
			message: "Invalid request. Please refresh the page and try again.",
		};
	}

	try {
		const { code: validatedCode, state: validatedState } = parsed.data;

		const url = `/api/v1/repositories/integrations/linkedin/connect/?code=${validatedCode}&state=${validatedState}`;

		const response = await apiClient.post(url, {}, {}, 10000);
		// console.log(response, "Response");

		if (response.status !== 200 || !response.data?.repo_id) {
			return {
				success: false,
				message:
					"We couldn’t connect your LinkedIn account. Please try again or contact support.",
			};
		}

		return {
			success: true,
			data: {
				repo_id: response.data.repo_id,
			},
			message: "LinkedIn connection successful. Redirecting...",
		};
	} catch (error: any) {
		const fallback =
			"Something went wrong while connecting to LinkedIn. Please try again later.";

		// Extract message from backend if available
		const message =
			error?.response?.data?.message ?? error?.message ?? fallback;

		return {
			success: false,
			message,
		};
	}
};
