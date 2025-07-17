import { CheckCircle, FileText, XCircle } from "lucide-react";
import Link from "next/link";
import { FaHourglassEnd } from "react-icons/fa";

import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
	// eslint-disable-next-line import/no-unresolved
} from "@/components/ui/table";

const mockRepos = [
	{
		name: "openai-devkit",
		posts: {
			published: 12,
			scheduled: 4,
			drafted: 2,
		},
		webhook: "active",
	},
	{
		name: "commit-companion",
		posts: {
			published: 8,
			scheduled: 3,
			drafted: 5,
		},
		webhook: "inactive",
	},
];

export function RepoTable() {
	// const data: any[] = [];
	const data = Array.from({ length: 5 }).map((_, index) => {
		const base = mockRepos[index % mockRepos.length]; // alternate between the 2
		return {
			...base,
			name: `${base.name}-${index + 1}`,
		};
	});

	if (data.length === 0) {
		return (
			<div className="flex h-[234px] items-center justify-center rounded-lg border border-zinc-800">
				<p className="text-sm text-zinc-400">
					No repositories found. Add one to get started.
				</p>
			</div>
		);
	}

	return (
		<div className="h-full w-full">
			<Table>
				<TableHeader>
					<TableRow className="border-zinc-800 hover:bg-transparent">
						<TableHead className="text-start font-medium text-zinc-300">
							Repo
						</TableHead>
						<TableHead className="w-[270px] font-medium text-zinc-300">
							<span className="hidden lg:block">Posts</span>
							<span className="block">(Draft/Scheduled/Published)</span>
						</TableHead>
						<TableHead className="text-start font-medium text-zinc-300">
							Webhook
						</TableHead>
					</TableRow>
				</TableHeader>
				<TableBody>
					{data.map((repo: any) => (
						<TableRow
							key={repo.name}
							className="group border-zinc-800/50 hover:bg-zinc-900/30"
						>
							<TableCell className="font-mono text-sm">
								<Link
									href="#"
									className="block max-w-xs truncate text-zinc-200 transition-colors hover:text-white hover:underline"
								>
									{repo.name}
								</Link>
							</TableCell>
							<TableCell>
								<div className="flex items-center gap-4">
									<div
										className="flex items-center gap-1.5"
										title={`${repo.posts.drafted} drafted`}
									>
										<FileText className="h-4 w-4 text-zinc-400" />
										<span className="text-sm font-medium text-zinc-300">
											{repo.posts.drafted}
										</span>
									</div>
									<div
										className="flex items-center gap-1.5"
										title={`${repo.posts.scheduled} scheduled`}
									>
										<FaHourglassEnd className="h-4 w-4 text-zinc-400" />
										<span className="text-sm font-medium text-zinc-300">
											{repo.posts.scheduled}
										</span>
									</div>
									<div
										className="flex items-center gap-1.5"
										title={`${repo.posts.published} published`}
									>
										<CheckCircle className="h-4 w-4 text-zinc-400" />
										<span className="text-sm font-medium text-zinc-300">
											{repo.posts.published}
										</span>
									</div>
								</div>
							</TableCell>
							<TableCell className="text-start">
								{repo.webhook === "active" ? (
									<span className="flex w-full items-center justify-start gap-2 text-zinc-300">
										<CheckCircle className="inline-block h-5 w-5 text-zinc-400" />
										Healthy
									</span>
								) : (
									<span className="flex w-full items-center justify-start gap-2 text-zinc-300">
										<XCircle className="inline-block h-5 w-5 text-red-500" />
										Last ping failed
									</span>
								)}
							</TableCell>
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
