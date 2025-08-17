// types/repo.ts
import { UUID } from "node:crypto";

export interface GitHubRepo {
	id: number;
	name: string;
	full_name: string;
	private: boolean;
	stargazers_count: number;
	language: string | undefined;
	description: string | undefined;
	updated_at: string;
	permissions: {
		admin: boolean;
		maintain: boolean;
		push: boolean;
		triage: boolean;
		pull: boolean;
	};
	owner: {
		login: string;
		id: number;
	};
	html_url: string;
	default_branch: string;
	is_connected: boolean;
	status: string | undefined;
	connected_repo_id: number | undefined;
	connected_by_user_id: number | undefined;
}

export interface GitHubReposResponse {
	page: number;
	has_next: boolean;
	repos: GitHubRepo[];
}

export type RepoSetting = {
	tone: string;
	branch: string;
	aiEnabled: boolean;
	socials: {
		id: UUID;
		name: string;
		handle: string;
		profile_image_url: string;
		platform: "linkedin" | "x-twitter" | "slack" | "discord";
	}[];
};
