// eslint-disable-next-line import/no-unresolved
import { Skeleton } from "@/components/ui/skeleton";

export default function RepoHeaderSkeleton() {
	return (
		<header className="flex flex-col justify-between gap-6 border-b border-zinc-800 pb-6 sm:flex-row sm:items-start sm:gap-6">
			{/* Left */}
			<div className="flex flex-col gap-4">
				<div className="flex items-center gap-3">
					<Skeleton className="h-8 w-20 rounded bg-zinc-900" />
					<div className="flex items-center gap-2">
						<Skeleton className="h-8 w-8 rounded-full bg-zinc-900" />
						<Skeleton className="h-6 w-32 rounded bg-zinc-900" />
					</div>
				</div>
				<Skeleton className="h-4 w-40 rounded bg-zinc-900" />
			</div>

			{/* Right */}
			<div className="flex flex-col items-start gap-4 sm:items-end">
				<Skeleton className="h-10 w-28 rounded bg-zinc-900" />
				<div className="flex flex-wrap items-center gap-2">
					{Array.from({ length: 4 }).map((_, index) => (
						<Skeleton
							key={index}
							className="h-5 w-5 rounded-full bg-zinc-900"
						/>
					))}
				</div>
			</div>
		</header>
	);
}
