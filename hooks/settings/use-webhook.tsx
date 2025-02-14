import { useQuery } from "@tanstack/react-query";

import { retriveWebhook } from "@/server-actions/organizations/retrieve-web-hook";

const useRetrieveWebhook = () => {
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["retrieving_webhooks"],
		queryFn: async () => {
			const hooks = await retriveWebhook();

			if (hooks.success) {
				return {
					webhook: hooks.data.secret_key_url,
					secretKey: hooks.data.private_secret,
				};
			}

			return { webhook: undefined, secretKey: undefined };
		},
		enabled: true,
	});

	return {
		webhook: data?.webhook,
		secretKey: data?.secretKey,
		isWebhookLoading: isLoading,
		refetchWebhook: refetch,
	};
};

export default useRetrieveWebhook;
