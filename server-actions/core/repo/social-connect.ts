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
	platform: z.enum(["slack", "discord"], {
		errorMap: () => ({
			message: "Platform must be either 'slack' or 'discord'.",
		}),
	}),
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
	platform: "slack" | "discord",
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
