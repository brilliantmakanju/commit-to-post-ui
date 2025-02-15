import { useQuery } from "@tanstack/react-query";

import { getOrganizationsTone } from "@/server-actions/organizations/get-organization-tone";

const useRetrieveOrganizationTone = () => {
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["retrieving_organization_tone"],
		queryFn: async () => {
			const hooks = await getOrganizationsTone();

			if (hooks.success) {
				return {
					selected_tone: hooks?.data?.selected_tone,
					shuffle_tone: hooks?.data?.shuffle_tones,
					available_tones: hooks?.data?.available_tones,
				};
			}

			return {
				selected_tone: undefined,
				shuffle_tone: false,
				available_tones: undefined,
			};
		},
		enabled: true,
	});

	return {
		selected_tone: data?.selected_tone,
		shuffle_tone: data?.shuffle_tone,
		available_tones: data?.available_tones,
		isWebhookLoading: isLoading,
		refetchWebhook: refetch,
	};
};

export default useRetrieveOrganizationTone;
