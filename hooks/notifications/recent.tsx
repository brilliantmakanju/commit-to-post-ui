import { useQuery } from "@tanstack/react-query";

// eslint-disable-next-line import/no-unresolved
import { fetchRecentNotifications } from "@/server-actions/notifications/recent";

const useRetrieveRecentNotifications = () => {
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["recent_notifications"],
		queryFn: async () => {
			const response = await fetchRecentNotifications();

			if (response.success) {
				return {
					notifications: response.data?.notifications ?? [],
				};
			}

			return {
				total_count: 0,
				unread_count: 0,
				notifications: [],
			};
		},
		enabled: true,
	});

	return {
		notifications: data?.notifications,
		isNotificationLoading: isLoading,
		refetchNotifications: refetch,
	};
};

export default useRetrieveRecentNotifications;
