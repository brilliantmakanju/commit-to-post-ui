import { useQuery } from "@tanstack/react-query";

import {
	getChannelMetrics,
	getHeatMapMetrics,
} from "@/server-actions/core/chart/dashboard-chart";

export type HeatmapData = Record<string, number>;

const useDashboardMetrics = () => {
	const {
		data: heatmapData,
		isLoading: isHeatmapLoading,
		error: heatmapError,
		refetch: refetchHeatmapData,
	} = useQuery<HeatmapData>({
		queryKey: ["dashboard_heatmap_data"],
		queryFn: async () => {
			const response = await getHeatMapMetrics();
			return typeof response.data === "object" ? response.data : {};
		},
		enabled: true,
		refetchOnMount: true,
		refetchOnWindowFocus: false,
	});

	const {
		data: channelData,
		isLoading: isChannelLoading,
		error: channelError,
		refetch: refetchChannelData,
	} = useQuery({
		queryKey: ["dashboard_channel_data"],
		queryFn: async () => {
			const response = await getChannelMetrics();
			return response.data ?? {};
		},
		enabled: true,
		refetchOnMount: true,
		refetchOnWindowFocus: false,
	});

	return {
		// heatmap
		heatmapData: heatmapData ?? {},
		isHeatmapLoading,
		heatmapError,
		refetchHeatmapData,

		// channel
		channelData: channelData ?? {},
		isChannelLoading,
		channelError,
		refetchChannelData,
	};
};

export default useDashboardMetrics;
