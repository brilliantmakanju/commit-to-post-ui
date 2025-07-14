interface ProviderBackgroundProps {
	provider: string;
}

export function ProviderBackground({ provider }: ProviderBackgroundProps) {
	const getBackgroundPattern = () => {
		switch (provider) {
			case "github": {
				return "bg-[radial-gradient(circle_at_50%_50%,rgba(34,197,94,0.08),transparent_50%)]";
			}
			case "linkedin": {
				return "bg-[radial-gradient(circle_at_50%_50%,rgba(59,130,246,0.08),transparent_50%)]";
			}
			case "twitter": {
				return "bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.08),transparent_50%)]";
			}
			default: {
				return "bg-[radial-gradient(circle_at_50%_50%,rgba(107,114,128,0.08),transparent_50%)]";
			}
		}
	};

	const getProviderElements = () => {
		switch (provider) {
			case "github": {
				return (
					<>
						<div className="absolute left-20 top-20 h-32 w-32 animate-pulse rounded border border-green-200 opacity-20 dark:border-green-800" />
						<div
							className="absolute bottom-20 right-20 h-24 w-24 animate-pulse rounded border border-green-300 opacity-30 dark:border-green-700"
							style={{ animationDelay: "1s" }}
						/>
						<div
							className="absolute left-10 top-1/2 h-16 w-16 animate-pulse rounded border border-green-400 opacity-25 dark:border-green-600"
							style={{ animationDelay: "2s" }}
						/>
					</>
				);
			}
			case "linkedin": {
				return (
					<>
						<div className="absolute right-32 top-32 h-40 w-40 animate-pulse rounded-lg border border-blue-200 opacity-20 dark:border-blue-800" />
						<div
							className="absolute bottom-32 left-32 h-28 w-28 animate-pulse rounded-lg border border-blue-300 opacity-30 dark:border-blue-700"
							style={{ animationDelay: "1.5s" }}
						/>
						<div
							className="absolute left-1/4 top-1/3 h-20 w-20 animate-pulse rounded-lg border border-blue-400 opacity-25 dark:border-blue-600"
							style={{ animationDelay: "2.5s" }}
						/>
					</>
				);
			}
			case "twitter": {
				return (
					<>
						<div className="absolute left-1/4 top-24 h-36 w-36 animate-pulse rounded-full border border-cyan-200 opacity-20 dark:border-cyan-800" />
						<div
							className="absolute bottom-24 right-1/4 h-20 w-20 animate-pulse rounded-full border border-cyan-300 opacity-30 dark:border-cyan-700"
							style={{ animationDelay: "2s" }}
						/>
						<div
							className="absolute right-10 top-1/2 h-12 w-12 animate-pulse rounded-full border border-cyan-400 opacity-25 dark:border-cyan-600"
							style={{ animationDelay: "3s" }}
						/>
					</>
				);
			}
			default: {
				return;
			}
		}
	};

	return (
		<>
			{/* Main background gradient */}
			<div className={`absolute inset-0 ${getBackgroundPattern()}`} />

			{/* Provider-specific elements */}
			<div className="absolute inset-0 overflow-hidden">
				{getProviderElements()}
			</div>

			{/* Subtle grid pattern */}
			<div className="absolute inset-0 bg-[linear-gradient(rgba(0,0,0,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.01)_1px,transparent_1px)] bg-[size:32px_32px] dark:bg-[linear-gradient(rgba(255,255,255,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.01)_1px,transparent_1px)]" />
		</>
	);
}
