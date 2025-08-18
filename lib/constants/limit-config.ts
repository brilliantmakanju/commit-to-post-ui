import { FaDatabase, FaPlug, FaUsers } from "react-icons/fa";

// eslint-disable-next-line import/no-unresolved
import { LimitTypeConfig } from "@/types/feature-limits";

export const limitConfig: Record<string, LimitTypeConfig> = {
	repositories: {
		icon: FaDatabase,
		unit: "repositories",
		title: "GitHub Repositories",
		warningTitle: "Repository Limit Warning",
		reachedTitle: "Repository Limit Reached",
	},
	social_integrations: {
		icon: FaPlug,
		unit: "integrations",
		title: "Social Media Integrations",
		warningTitle: "Social Integration Limit Warning",
		reachedTitle: "Social Integration Limit Reached",
	},
	workspaces: {
		icon: FaUsers,
		unit: "workspaces",
		title: "Workspaces",
		warningTitle: "Workspace Limit Warning",
		reachedTitle: "Workspace Limit Reached",
	},
};
