import { FaDatabase, FaPlug } from "react-icons/fa";

// eslint-disable-next-line import/no-unresolved
import { LimitTypeConfig } from "@/types/feature-limits";

export const limitConfig: Record<string, LimitTypeConfig> = {
	repositories: {
		icon: FaDatabase,
		title: "GitHub Repositories",
		warningTitle: "Repository Limit Warning",
		reachedTitle: "Repository Limit Reached",
		unit: "repositories",
	},
	social_integrations: {
		icon: FaPlug,
		title: "Social Media Accounts",
		warningTitle: "Social Account Limit Warning",
		reachedTitle: "Social Account Limit Reached",
		unit: "accounts",
	},
};
