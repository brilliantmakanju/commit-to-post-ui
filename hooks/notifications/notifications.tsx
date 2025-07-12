import { useQuery } from "@tanstack/react-query";

import { getNotifications } from "@/server-actions/notifications/get-notifications";

const useRetrieveNotifications = () => {
	const { data, isLoading, refetch, isFetching } = useQuery({
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
		refetchOnMount: true,
		refetchOnWindowFocus: true,
	});

	return {
		refetchNotifications: refetch,
		isNotificationLoading: isLoading,
		isNotificationFetching: isFetching,
		total_count: data?.total_count || 0,
		unread_count: data?.unread_count || 0,
		notifications: data?.notifications || [],
	};
};

export default useRetrieveNotifications;
