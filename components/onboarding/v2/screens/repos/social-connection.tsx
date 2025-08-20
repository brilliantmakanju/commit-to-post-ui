import { usePathname } from "next/navigation";
import React from "react";
import { FaDiscord, FaLinkedinIn, FaSlack, FaTimes } from "react-icons/fa";

import {
	Tooltip,
	TooltipContent,
	TooltipProvider,
	TooltipTrigger,
} from "@/components/ui/tooltip";

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg viewBox="0 0 24 24" className={className} fill="currentColor">
		<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z" />
	</svg>
);

const getIcon = (iconName: string, isRepoPage: boolean = false) => {
	const iconClass = isRepoPage
		? "h-5 w-5 text-zinc-300"
		: "h-5 w-5 text-gray-600";

	switch (iconName) {
		case "linkedin": {
			return <FaLinkedinIn className={iconClass} />;
		}
		case "x-twitter": {
			return <XIcon className={iconClass} />;
		}
		case "slack": {
			return <FaSlack className={iconClass} />;
		}
		case "discord": {
			return <FaDiscord className={iconClass} />;
		}
		default: {
			return <FaLinkedinIn className={iconClass} />;
		}
	}
};

interface SocialConnectionProps {
	socials: any[];
	onRemoveSocial: (index: number) => void;
	removingLoader?: boolean; // Optional loading state for specific social being removed
	loading?: boolean; // Optional loading state for the entire component
	connectedIntegrationIds?: string[]; // Add this to know which are actually connected
}

export const SocialConnection: React.FC<SocialConnectionProps> = ({
	socials,
	onRemoveSocial,
	removingLoader,
	loading = false,
	connectedIntegrationIds, // No default value - undefined means backwards compatibility
}) => {
	const pathname = usePathname();
	// Check if pathname matches repositories/[uuid] pattern
	const isRepoPage = /^\/repositories\/[a-f0-9-]{36}$/.test(pathname);

	// Helper function to check if a social is actually connected (saved)
	const isActuallyConnected = (socialId: string) => {
		// If connectedIntegrationIds is not provided, assume all socials are connected (backwards compatibility)
		if (!connectedIntegrationIds) return true;
		return connectedIntegrationIds.includes(socialId);
	};

	// Show loading state for entire component
	if (loading) {
		return isRepoPage ? (
			<div className="w-full rounded-2xl border border-zinc-800/50 bg-zinc-900/30 px-6 py-5 text-zinc-100 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-800/40">
				<div className="mb-4 flex items-center justify-between">
					<h4 className="text-sm font-medium text-zinc-200">
						Connected Accounts
					</h4>
					<span className="rounded-full border border-zinc-700/50 bg-zinc-800/30 px-3 py-1 text-xs text-zinc-400">
						<div className="h-3 w-8 animate-pulse rounded bg-zinc-600/50" />
					</span>
				</div>
				<div className="flex w-full flex-wrap gap-3">
					{Array.from({ length: 2 }).map((_, index) => (
						<div
							key={index}
							className="inline-flex items-center gap-2 rounded-full border border-zinc-700/50 bg-zinc-800/30 py-2 pl-2 pr-3 text-zinc-100"
						>
							<div className="h-[32px] w-[32px] animate-pulse rounded-full bg-zinc-600/50" />
							<div className="h-4 w-16 animate-pulse rounded bg-zinc-600/50" />
							<div className="h-4 w-4 animate-pulse rounded bg-zinc-600/50" />
						</div>
					))}
				</div>
			</div>
		) : (
			<div className="w-full">
				<div className="mb-2 flex items-center justify-between">
					<h4 className="text-sm font-medium text-gray-700">
						Connected Accounts
					</h4>
					<span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
						<div className="h-3 w-8 animate-pulse rounded bg-gray-300" />
					</span>
				</div>
				<div className="flex w-full flex-wrap gap-2">
					{Array.from({ length: 2 }).map((_, index) => (
						<div
							key={index}
							className="inline-flex items-center gap-2 rounded-full border border-gray-300 bg-gray-50 py-1 pl-1 pr-2"
						>
							<div className="h-[30px] w-[30px] animate-pulse rounded-full bg-gray-300" />
							<div className="h-4 w-16 animate-pulse rounded bg-gray-300" />
							<div className="h-4 w-4 animate-pulse rounded bg-gray-300" />
						</div>
					))}
				</div>
			</div>
		);
	}

	if (isRepoPage) {
		return (
			<TooltipProvider>
				<div className="w-full rounded-2xl border border-zinc-800/50 bg-zinc-900/30 px-6 py-5 text-zinc-100 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-800/40">
					<div className="mb-4 flex items-center justify-between">
						<h4 className="text-sm font-medium text-zinc-200">
							Connected Accounts
						</h4>
						<span className="rounded-full border border-zinc-700/50 bg-zinc-800/30 px-3 py-1 text-xs text-zinc-400">
							{socials?.length || 0} account
							{socials && socials.length > 1 && "s"}
						</span>
					</div>
					{!socials || socials.length === 0 ? (
						<div className="px-3 py-2 text-center">
							<p className="text-sm text-zinc-400">No accounts connected yet</p>
						</div>
					) : (
						<div className="flex w-full flex-wrap gap-3">
							{socials.map((social, index) => {
								const isRemoving = removingLoader;
								const isConnected = isActuallyConnected(social.id);

								const socialItem = (
									<div
										key={`${social.platform}-${social.name}-${index}`}
										className={`inline-flex items-center gap-2 rounded-full border py-2 pl-2 pr-3 text-zinc-100 transition-all duration-200 ${
											isRemoving
												? "border-zinc-600/30 bg-zinc-700/20 opacity-50"
												: isConnected
													? "border-zinc-700/50 bg-zinc-800/30 hover:border-zinc-600/70 hover:bg-zinc-700/40"
													: "border-blue-700/50 bg-blue-800/20 hover:border-blue-600/70 hover:bg-blue-700/30"
										}`}
									>
										<div className="flex h-[32px] w-[32px] items-center justify-center rounded-full border border-zinc-700/50 bg-zinc-800/50 p-2">
											{getIcon(social.platform, true)}
										</div>
										<span className="text-sm text-zinc-200">
											{social.handle &&
											!["null", "undefined", ""].includes(social.handle)
												? social.handle
												: social.name}
										</span>
										{/* Status indicator */}
										{!isConnected && (
											<span className="rounded-full border border-blue-700/50 bg-blue-800/30 px-2 py-1 text-xs text-blue-300">
												Pending
											</span>
										)}
										{/* Only show remove button for actually connected accounts */}
										{isConnected && (
											<button
												onClick={() => onRemoveSocial(index)}
												disabled={isRemoving}
												className="p-1 text-zinc-400 transition-colors hover:text-zinc-200 disabled:cursor-not-allowed disabled:opacity-50"
											>
												{isRemoving ? (
													<div className="h-4 w-4 animate-spin rounded-full border-2 border-zinc-400 border-t-transparent" />
												) : (
													<FaTimes className="h-4 w-4" />
												)}
											</button>
										)}
									</div>
								);

								// Wrap pending items with tooltip
								if (!isConnected) {
									return (
										<Tooltip key={`${social.platform}-${social.name}-${index}`}>
											<TooltipTrigger asChild>{socialItem}</TooltipTrigger>
											<TooltipContent>
												<p>Click &apos;Save&apos; to connect this account</p>
											</TooltipContent>
										</Tooltip>
									);
								}

								return socialItem;
							})}
						</div>
					)}
				</div>
			</TooltipProvider>
		);
	}

	// Default UI for other pages
	return (
		<TooltipProvider>
			<div className="w-full">
				<div className="mb-2 flex items-center justify-between">
					<h4 className="text-sm font-medium text-gray-700">
						Connected Accounts
					</h4>
					<span className="rounded-full bg-gray-100 px-2 py-1 text-xs text-gray-500">
						{socials?.length || 0} account{socials && socials.length > 1 && "s"}
					</span>
				</div>
				{!socials || socials.length === 0 ? (
					<div className="px-3 py-2 text-center">
						<p className="text-sm text-gray-500">No accounts connected yet</p>
					</div>
				) : (
					<div className="flex w-full flex-wrap gap-2">
						{socials.map((social, index) => {
							const isRemoving = removingLoader;
							const isConnected = isActuallyConnected(social.id);

							const socialItem = (
								<div
									key={`${social.platform}-${social.name}-${index}`}
									className={`inline-flex items-center gap-2 rounded-full border py-1 pl-1 pr-2 transition-colors ${
										isRemoving
											? "border-gray-200 bg-gray-100 opacity-50"
											: isConnected
												? "border-gray-300 bg-gray-50 hover:border-gray-400"
												: "border-blue-300 bg-blue-50 hover:border-blue-400"
									}`}
								>
									<div className="flex h-[30px] w-[30px] items-center justify-center rounded-full border border-gray-300 bg-white p-2">
										{getIcon(social.platform, false)}
									</div>
									<span className="text-sm">
										{social.handle &&
										!["null", "undefined", ""].includes(social.handle)
											? social.handle
											: social.name}
									</span>
									{/* Status indicator */}
									{!isConnected && (
										<span className="rounded-full border border-blue-200 bg-blue-100 px-2 py-1 text-xs text-blue-600">
											Pending
										</span>
									)}
									{/* Only show remove button for actually connected accounts */}
									{isConnected && (
										<button
											onClick={() => onRemoveSocial(index)}
											disabled={isRemoving}
											className="p-1 text-gray-400 transition-colors hover:text-gray-600 disabled:cursor-not-allowed disabled:opacity-50"
										>
											{isRemoving ? (
												<div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-400 border-t-transparent" />
											) : (
												<FaTimes className="h-4 w-4" />
											)}
										</button>
									)}
								</div>
							);

							// Wrap pending items with tooltip
							if (!isConnected) {
								return (
									<Tooltip key={`${social.platform}-${social.name}-${index}`}>
										<TooltipTrigger asChild>{socialItem}</TooltipTrigger>
										<TooltipContent>
											<p>Click &apos;Save&lsquo; to connect this account</p>
										</TooltipContent>
									</Tooltip>
								);
							}

							return socialItem;
						})}
					</div>
				)}
			</div>
		</TooltipProvider>
	);
};
