import { useQuery } from "@tanstack/react-query";

import { retriveWebhookSettings } from "@/server-actions/organizations/retrieve-hook-options";

const useRetrieveWebhookSettings = () => {
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["retrieving_webhooks_settings"],
		queryFn: async () => {
			const hooks = await retriveWebhookSettings();

			if (hooks.success) {
				return {
					branch: hooks.data.branch,
				};
			}

			return { branch: undefined };
		},
		enabled: true,
	});

	return {
		branch: data?.branch,
		isWebhookLoading: isLoading,
		refetchWebhook: refetch,
	};
};

export default useRetrieveWebhookSettings;
