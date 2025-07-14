"use client";

import { Eye, Hash, MessageCircle, Sparkles, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";

// eslint-disable-next-line import/no-unresolved
import { Card } from "@/components/ui/card";

interface Post {
	content: string;
	engagement: {
		likes: number;
		shares: number;
		comments: number;
	};
	platform: string;
	timeAgo: string;
}

interface GeneratedPostsProps {
	provider: string;
}

const POST_TEMPLATES = {
	github: [
		{
			content:
				"Just shipped OAuth integration! The async flow was tricky but clean implementation pays off. #oauth #webdev #github",
			platform: "Twitter",
		},
		{
			content:
				"Spent the morning optimizing database queries - 40% performance improvement! Sometimes simple solutions are the best ones.",
			platform: "LinkedIn",
		},
		{
			content:
				"Race conditions in async code are the worst. Finally tracked down that elusive bug! #debugging #async",
			platform: "Twitter",
		},
	],
	linkedin: [
		{
			content:
				"Excited to share our latest dashboard analytics feature! Data-driven decisions are game-changers for product development.",
			platform: "LinkedIn",
		},
		{
			content:
				"The importance of good documentation cannot be overstated. Spent today updating our API docs - future developers will thank us!",
			platform: "LinkedIn",
		},
		{
			content:
				"Reflecting on the OAuth integration project - clean architecture and thorough testing made all the difference.",
			platform: "LinkedIn",
		},
	],
	twitter: [
		{
			content:
				"That moment when you fix a rate limiting bug that's been haunting production 🐛➡️✨ #debugging #twitter #api",
			platform: "Twitter",
		},
		{
			content:
				"Thread generation is live! Now you can turn long commits into engaging Twitter threads automatically 🧵",
			platform: "Twitter",
		},
		{
			content:
				"OAuth flows: simple in theory, complex in practice. But when they work... *chef's kiss* #oauth #webdev",
			platform: "Twitter",
		},
	],
};

export function GeneratedPosts({ provider }: GeneratedPostsProps) {
	const [posts, setPosts] = useState<Post[]>([]);

	useEffect(() => {
		const generatePosts = () => {
			const templates =
				POST_TEMPLATES[provider as keyof typeof POST_TEMPLATES] ||
				POST_TEMPLATES.github;
			const newPosts: Post[] = [];

			for (let index = 0; index < 2; index++) {
				const template =
					templates[Math.floor(Math.random() * templates.length)];
				newPosts.push({
					...template,
					engagement: {
						likes: Math.floor(Math.random() * 300) + 50,
						shares: Math.floor(Math.random() * 80) + 10,
						comments: Math.floor(Math.random() * 50) + 5,
					},
					timeAgo: [
						`${Math.floor(Math.random() * 24)} hours ago`,
						`${Math.floor(Math.random() * 7)} days ago`,
					][index],
				});
			}

			setPosts(newPosts);
		};

		generatePosts();
		const interval = setInterval(generatePosts, 12000); // Update every 12 seconds

		return () => clearInterval(interval);
	}, [provider]);

	return (
		<Card className="border-gray-200 bg-white p-4 dark:border-gray-800 dark:bg-gray-950">
			<div className="mb-4 flex items-center gap-2">
				<Hash className="h-4 w-4 text-gray-600 dark:text-gray-400" />
				<h3 className="font-mono text-sm font-semibold text-gray-900 dark:text-gray-100">
					Auto-Generated Posts
				</h3>
				<Sparkles className="h-3 w-3 animate-pulse text-yellow-500" />
			</div>
			<div className="space-y-4">
				{posts.map((post, index) => (
					<div
						key={index}
						className="rounded border border-gray-200 bg-gray-50 p-3 transition-all duration-300 hover:border-gray-300 dark:border-gray-800 dark:bg-gray-900 dark:hover:border-gray-700"
					>
						<div className="mb-3 text-sm leading-relaxed text-gray-900 dark:text-gray-100">
							{post.content}
						</div>
						<div className="flex items-center justify-between text-xs">
							<div className="flex items-center gap-1">
								<span className="font-mono text-gray-600 dark:text-gray-400">
									{post.platform}
								</span>
								<span className="text-gray-400">•</span>
								<span className="text-gray-500">{post.timeAgo}</span>
							</div>
							<div className="flex items-center gap-3 text-gray-500">
								<span className="flex items-center gap-1 transition-colors hover:text-red-500">
									<Eye className="h-3 w-3" />
									{post.engagement.likes}
								</span>
								<span className="flex items-center gap-1 transition-colors hover:text-green-500">
									<TrendingUp className="h-3 w-3" />
									{post.engagement.shares}
								</span>
								<span className="flex items-center gap-1 transition-colors hover:text-blue-500">
									<MessageCircle className="h-3 w-3" />
									{post.engagement.comments}
								</span>
							</div>
						</div>
					</div>
				))}
			</div>
			<div className="mt-3 border-t border-gray-200 pt-3 dark:border-gray-800">
				<div className="text-center text-xs text-gray-500">
					✨ AI-powered posts from your commit messages
				</div>
			</div>
		</Card>
	);
}
