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
	platform: z.enum(["slack", "discord", "linkedin", "twitter"], {
		errorMap: () => ({
			message:
				"Platform must be either 'slack', 'discord', 'linkedin' or 'twitter'.",
		}),
	}),
});

const disconnectIntegrationSchemas = z.object({
	connection_id: z.string().uuid({ message: "Invalid Connection ID." }),
});

const getConnectLinkedinOauthSchema = z.object({
	redirect_uri: z.string(),
});

const getConnectTwitterOauthSchema = z.object({
	redirect_uri: z.string(),
});

const socialConnectOauthSchema = z.object({
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
	platform: "slack" | "discord" | "linkedin" | "twitter",
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
	redirect_uri: string,
): Promise<{
	message?: string;
	success: boolean;
	data?: {
		authorization_url: string;
	};
}> => {
	const validation = getConnectLinkedinOauthSchema.safeParse({ redirect_uri });

	if (!validation.success) {
		return {
			success: false,
			message: "Invalid. Please refresh and try again.",
		};
	}

	try {
		const url = `/api/v1/repositories/integrations/linkedin/connect/?redirect_uri=${redirect_uri}`;
		const response = await apiClient.get(url, {}, 10000);

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

interface LinkedInProfile {
	handle: string;
	profile_url: string;
	display_name: string;
}

interface ExistingConnection {
	connected_by: string;
	connected_at: string;
	profile_name: string;
}

export interface OauthResponse {
	success: boolean;
	message?: string;
	// GitHub special case: top-level installation_id
	installation_id?: string;
	data?: {
		url?: string;
		action?: string;
		redirect_uri?: string;
		integration_id?: string;
		organization_id?: string;
		installation_id?: string; // ← add this line
		profile?: LinkedInProfile;
		repo_id?: string;
		existing_connection?: ExistingConnection;
	};
}

/**
 * Initiates the LinkedIn OAuth connection process by exchanging the code and state.
 */
export const socialConnectLinkedinOauth = async (
	code: string,
	state: string,
): Promise<OauthResponse> => {
	// Validate inputs
	// console.log(code, "Code", state, "State");
	const parsed = socialConnectOauthSchema.safeParse({ code, state });
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
		const { status, data } = response;

		// Handle HTTP errors explicitly
		if (status === 409) {
			return {
				success: false,
				message: data?.error ?? "This LinkedIn account is already connected.",
				data: {
					existing_connection: data?.existing_connection,
				},
			};
		}

		if (status !== 200 || !data) {
			return {
				success: false,
				message:
					"We couldn’t connect your LinkedIn account. Please try again or contact support.",
			};
		}

		// --- New API success path ---
		if (data.organization_id && data.integration_id) {
			return {
				success: true,
				message: data?.message ?? "LinkedIn connection successful.",
				data: {
					profile: data.profile,
					redirect_uri: data.redirect_uri,
					integration_id: data.integration_id,
					organization_id: data.organization_id,
				},
			};
		}

		// Fallback if no known shape matches
		return {
			success: false,
			message: "Unexpected response format from LinkedIn connection.",
		};
	} catch (error: any) {
		const fallback =
			"Something went wrong while connecting to LinkedIn. Please try again later.";

		const message =
			error?.response?.data?.message ??
			error?.response?.data?.error ??
			error?.message ??
			fallback;

		return {
			success: false,
			message,
		};
	}
};

export const socialConnectTwitterOauth = async (
	code: string,
	state: string,
): Promise<OauthResponse> => {
	// Validate inputs
	const parsed = socialConnectOauthSchema.safeParse({ code, state });

	if (!parsed.success) {
		return {
			success: false,
			message: "Invalid request. Please refresh the page and try again.",
		};
	}

	try {
		const { code: validatedCode, state: validatedState } = parsed.data;

		const url = `/api/v1/repositories/integrations/twitter/connect/?code=${validatedCode}&state=${validatedState}`;

		const response = await apiClient.post(url, {}, {}, 10000);
		const { status, data } = response;

		// Handle HTTP errors explicitly
		if (status === 409) {
			return {
				success: false,
				message: data?.error ?? "This Twitter account is already connected.",
				data: {
					existing_connection: data?.existing_connection,
				},
			};
		}

		if (status !== 200 || !data) {
			return {
				success: false,
				message:
					"We couldn’t connect your Twitter account. Please try again or contact support.",
			};
		}

		// --- New API success path ---
		if (data.organization_id && data.integration_id) {
			return {
				success: true,
				message: data?.message ?? "Twitter connection successful.",
				data: {
					profile: data.profile,
					redirect_uri: data.redirect_uri,
					integration_id: data.integration_id,
					organization_id: data.organization_id,
				},
			};
		}

		// Fallback if no known shape matches
		return {
			success: false,
			message: "Unexpected response format from Twitter connection.",
		};
	} catch (error: any) {
		const fallback =
			"Something went wrong while connecting to Twitter. Please try again later.";

		const message =
			error?.response?.data?.message ??
			error?.response?.data?.error ??
			error?.message ??
			fallback;

		return {
			success: false,
			message,
		};
	}
};

export const getConnectTwitterOauth = async (
	redirect_uri: string,
): Promise<{
	message?: string;
	success: boolean;
	data?: {
		authorization_url: string;
	};
}> => {
	const validation = getConnectTwitterOauthSchema.safeParse({ redirect_uri });

	if (!validation.success) {
		return {
			success: false,
			message: "Invalid request. Please refresh and try again.",
		};
	}

	try {
		const url = `/api/v1/repositories/integrations/twitter/connect/?redirect_uri=${redirect_uri}`;
		const response = await apiClient.get(url, {}, 10000);

		const authUrl = response?.data?.authorization_url;

		if (response.status !== 200 || !authUrl) {
			return {
				success: false,
				message:
					"We couldn’t start the Twitter connection. Please try again or contact support.",
			};
		}

		return {
			success: true,
			data: {
				authorization_url: authUrl,
			},
			message: "Twitter connection initialized. Redirecting...",
		};
	} catch (error: any) {
		const fallbackMessage =
			"An unexpected error occurred while connecting to Twitter.";

		const detailedMessage =
			error?.response?.data?.message ?? error?.message ?? fallbackMessage;

		return {
			success: false,
			message: detailedMessage,
		};
	}
};

export const disconnectIntegration = async (
	connection_id: string,
): Promise<{
	success: boolean;
	message: string;
	details?: {
		platform: string;
		profile_name: string;
		repositories_affected: number;
	};
}> => {
	const validation = disconnectIntegrationSchemas.safeParse({
		connection_id,
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
		const url = `/api/v1/integrations/disconnect/${connection_id}/`;
		const response = await apiClient.delete(url);

		if (response.status !== 200) {
			return {
				success: false,
				message: "Failed to disconnect integration.",
			};
		}

		const responseData = response.data;

		return {
			success: true,
			message: responseData.message || "Integration disconnected successfully.",
			details: responseData.details,
		};
	} catch (error: any) {
		const fallbackMessage = "Unexpected error while disconnecting integration.";
		const detailedMessage =
			error?.response?.data?.message ?? error?.message ?? fallbackMessage;

		return {
			success: false,
			message: detailedMessage,
		};
	}
};
