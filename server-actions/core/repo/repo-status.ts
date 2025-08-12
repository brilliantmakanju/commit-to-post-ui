"use server";

import { z } from "zod";

// eslint-disable-next-line import/no-unresolved
import { apiClient } from "@/lib/utils/api-client";

const updateRepoStatusSchema = z.object({
	repoId: z.string().uuid({ message: "Invalid repository ID." }),
	status: z.enum(["connected", "paused"], {
		errorMap: () => ({
			message: "Status must be either 'connected' or 'paused'.",
		}),
	}),
});

const deleteRepoSchema = z.object({
	repoId: z.string().uuid({ message: "Invalid repository ID." }),
});

/**
 * Update the repository status to either 'connected' or 'paused'.
 */
export const updateRepoStatus = async ({
	repoId,
	status,
}: {
	repoId: string;
	status: "connected" | "paused";
}): Promise<{
	success: boolean;
	message: string;
}> => {
	// Validate input
	const validation = updateRepoStatusSchema.safeParse({ repoId, status });

	if (!validation.success) {
		return {
			success: false,
			message: validation.error.errors[0]?.message ?? "Invalid input.",
		};
	}

	try {
		const response = await apiClient.put(
			`/api/v1/repositories/${repoId}/status/`,
			{ status },
		);

		if (response.status !== 200) {
			return {
				success: false,
				message: `Unable to ${status === "paused" ? "pause" : "resume"} the repository. Please try again.`,
			};
		}

		return {
			success: true,
			message:
				status === "paused"
					? "Repository paused successfully."
					: "Repository resumed and reconnected.",
		};
	} catch {
		return {
			success: false,
			message: "Something went wrong. Please try again later.",
		};
	}
};

/**
 * Delete repository.
 */
export const deleteRepo = async ({
	repoId,
}: {
	repoId: string;
}): Promise<{
	success: boolean;
	message: string;
}> => {
	// Validate input
	const validation = deleteRepoSchema.safeParse({ repoId });

	if (!validation.success) {
		return {
			success: false,
			message: validation.error.errors[0]?.message ?? "Invalid input.",
		};
	}

	try {
		const response = await apiClient.delete(
			`/api/v1/repositories/${repoId}/status/`,
		);

		if (response.status !== 200) {
			return {
				success: false,
				message: "Unable to delete the repository. Please try again.",
			};
		}

		return {
			success: true,
			message: "Repository deleted successfully.",
		};
	} catch {
		return {
			success: false,
			message: "Something went wrong. Please try again later.",
		};
	}
};
