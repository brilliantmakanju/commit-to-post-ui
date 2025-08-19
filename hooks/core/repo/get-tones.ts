import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

// eslint-disable-next-line import/no-unresolved
import { fetchTones } from "@/server-actions/core/repo/get-tones";
// eslint-disable-next-line import/no-unresolved
import { ToneSchema } from "@/server-actions/core/repo/type";

// Inferred type from schema
export type Tone = z.infer<typeof ToneSchema>;

const useRetrieveTones = () => {
	const { data, isLoading, refetch, isError, error } = useQuery<{
		tones: Tone[];
	}>({
		queryKey: ["tones"],
		queryFn: async () => {
			const response = await fetchTones();

			//our fetchTones already validates via Zod
			if (!response?.data || !Array.isArray(response.data)) {
				return { tones: [] };
			}

			return { tones: response.data as Tone[] };
		},
		enabled: true,
	});

	return {
		isTonesLoading: isLoading,
		tones: data?.tones ?? [],
		refetchTones: refetch,
		isTonesError: isError,
		tonesError: error,
	};
};

export default useRetrieveTones;
