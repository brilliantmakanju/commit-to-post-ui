// eslint-disable-next-line import/no-unresolved
import { Skeleton } from "@/components/ui/skeleton";

export default function RepoHeaderSkeleton() {
	return (
		<header className="border-b border-zinc-800 pb-8">
			{/* Back Navigation */}
			<div className="mb-6">
				<Skeleton className="h-8 w-20 rounded bg-zinc-900" />
			</div>

			{/* Main Header Content */}
			<div className="flex items-center justify-between">
				{/* Repository Info */}
				<div className="flex items-center gap-4">
					<Skeleton className="h-12 w-12 rounded-lg bg-zinc-900" />
					<div>
						<Skeleton className="mb-2 h-8 w-48 rounded bg-zinc-900" />
						<div className="flex items-center gap-6">
							{/* Social Connections */}
							<div className="flex items-center gap-3">
								{Array.from({ length: 3 }).map((_, index) => (
									<div key={index} className="flex items-center gap-1.5">
										<Skeleton className="h-4 w-4 rounded bg-zinc-900" />
										<Skeleton className="h-3 w-3 rounded-full bg-zinc-900" />
									</div>
								))}
							</div>
						</div>
					</div>
				</div>

				{/* Actions */}
				<div className="flex items-center gap-4">
					<Skeleton className="h-8 w-24 rounded bg-zinc-900" />
				</div>
			</div>
		</header>
	);
}
