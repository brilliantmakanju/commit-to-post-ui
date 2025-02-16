import { useQuery } from "@tanstack/react-query";

import { getNotifications } from "@/server-actions/notifications/get-notifications";

const useRetrieveNotifications = () => {
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => {
			const hooks = await getNotifications();

			if (hooks.success) {
				return {
					total_count: hooks.data?.total_count,
					unread_count: hooks.data?.unread_count,
					notifications: hooks.data?.notifications,
				};
			}

			return {
				total_count: undefined,
				unread_count: undefined,
				notifications: undefined,
			};
		},
		enabled: true,
	});

	return {
		total_count: data?.total_count,
		unread_count: data?.unread_count,
		notifications: data?.notifications,
		isNotificationLoading: isLoading,
		refetchNotifications: refetch,
	};
};

export default useRetrieveNotifications;
