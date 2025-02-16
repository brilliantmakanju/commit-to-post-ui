import { useQuery } from "@tanstack/react-query";

import { getUnreadCount } from "@/server-actions/notifications/unread-count";

const useRetrieveUnreadCount = () => {
	const { data, isLoading, refetch } = useQuery({
		queryKey: ["unread_notification_counts"],
		queryFn: async () => {
			const hooks = await getUnreadCount();

			if (hooks.success) {
				return {
					has_unread: hooks.data?.has_unread,
				};
			}

			return {
				has_unread: false,
			};
		},
		enabled: true,
	});

	return {
		has_unread: data?.has_unread,
		isCountLoading: isLoading,
		refetchCount: refetch,
	};
};

export default useRetrieveUnreadCount;
