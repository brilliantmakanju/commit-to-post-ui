import { useQuery } from "@tanstack/react-query";
import { z } from "zod";

// eslint-disable-next-line import/no-unresolved
import { fetchTemplates } from "@/server-actions/core/repo/get-templates";
// eslint-disable-next-line import/no-unresolved
import { TemplateSchema } from "@/server-actions/core/repo/type";

// Inferred type from schema
export type Template = z.infer<typeof TemplateSchema>;

const useRetrieveTemplates = () => {
	const { data, isLoading, refetch, isError, error } = useQuery<Template[]>({
		queryKey: ["templates"],
		queryFn: fetchTemplates,
	});

	return {
		templates: data ?? [],
		templatesError: error,
		isTemplatesError: isError,
		refetchTemplates: refetch,
		isTemplatesLoading: isLoading,
	};
};

export default useRetrieveTemplates;
