"use client";

import { Clock, Code, GitBranch } from "lucide-react";
import { useEffect, useState } from "react";

// eslint-disable-next-line import/no-unresolved
import { Card } from "@/components/ui/card";

interface Commit {
	hash: string;
	message: string;
	time: string;
	files: number;
	author: string;
}

interface RecentCommitsProps {
	provider: string;
}

const COMMIT_TEMPLATES = [
	{
		messages: [
			"feat: implement OAuth integration flow",
			"fix: resolve race condition in async handler",
			"refactor: optimize database queries for performance",
			"docs: update API documentation with examples",
			"style: improve responsive design on mobile",
			"test: add comprehensive unit tests for auth",
			"chore: update dependencies to latest versions",
			"feat: add real-time notifications system",
			"fix: handle edge case in user validation",
			"perf: reduce bundle size by 30%",
		],
		authors: [
			"john_dev",
			"sarah_code",
			"alex_build",
			"dev_ninja",
			"code_master",
		],
	},
];

export function RecentCommits({ provider }: RecentCommitsProps) {
	const [commits, setCommits] = useState<Commit[]>([]);

	useEffect(() => {
		const generateCommits = () => {
			const template = COMMIT_TEMPLATES[0];
			const newCommits: Commit[] = [];

			for (let index = 0; index < 3; index++) {
				const randomMessage =
					template.messages[
						Math.floor(Math.random() * template.messages.length)
					];
				const randomAuthor =
					template.authors[Math.floor(Math.random() * template.authors.length)];
				const timeAgo = [
					`${Math.floor(Math.random() * 60)} minutes ago`,
					`${Math.floor(Math.random() * 12) + 1} hours ago`,
					`${Math.floor(Math.random() * 7) + 1} days ago`,
				][index];

				newCommits.push({
					hash: Math.random().toString(36).slice(2, 9),
					message: randomMessage,
					time: timeAgo,
					files: Math.floor(Math.random() * 15) + 1,
					author: randomAuthor,
				});
			}

			setCommits(newCommits);
		};

		generateCommits();
		const interval = setInterval(generateCommits, 8000); // Update every 8 seconds

		return () => clearInterval(interval);
	}, []);

	return (
		<Card className="border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
			<div className="mb-4 flex items-center gap-2">
				<GitBranch className="h-4 w-4 text-gray-600 dark:text-gray-400" />
				<h3 className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
					Recent Commits
				</h3>
				<div className="ml-auto">
					<div className="h-2 w-2 animate-pulse rounded-full bg-green-400"></div>
				</div>
			</div>
			<div className="space-y-3">
				{commits.map((commit, index) => (
					<div
						key={`${commit.hash}-${index}`}
						className="rounded border border-gray-200 bg-gray-50 p-3 transition-all duration-300 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
					>
						<div className="mb-2 flex items-center gap-2">
							<code className="rounded bg-gray-200 px-2 py-1 font-mono text-xs text-gray-700 dark:bg-gray-800 dark:text-gray-300">
								{commit.hash}
							</code>
							<span className="flex items-center gap-1 text-xs text-gray-500">
								<Clock className="h-3 w-3" />
								{commit.time}
							</span>
						</div>
						<div className="mb-2 text-sm leading-relaxed text-gray-900 dark:text-gray-100">
							{commit.message}
						</div>
						<div className="flex items-center justify-between text-xs text-gray-500">
							<span className="flex items-center gap-1">
								<Code className="h-3 w-3" />
								{commit.files} files
							</span>
							<span className="font-mono">@{commit.author}</span>
						</div>
					</div>
				))}
			</div>
			<div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-800">
				<div className="text-center text-xs text-gray-500">
					🎯 These commits will automatically become social posts
				</div>
			</div>
		</Card>
	);
}
