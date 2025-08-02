"use client";
import { ExternalLink, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { disconnectGithub } from "@/server-actions/user-actions/disconnect-github";
import { reconnectGithub } from "@/server-actions/user-actions/reconnect-github";
import useOrganizationStore from "@/zustand/useorganization-store";

export function SocialConnectionSettings() {
	const router = useRouter();
	const [isConnecting, setIsConnecting] = useState(false);
	const [isDisconnecting, setIsDisconnecting] = useState(false);

	const { organization, updateInstallationStatus } = useOrganizationStore();

	const githubConnected = useOrganizationStore(
		state =>
			state.organization.github_installation_status === "active" &&
			!!state.organization.github_installation_id,
	);

	const disConnectGitHub = async () => {
		setIsDisconnecting(true);
		try {
			const response = await disconnectGithub();
			if (response.success) {
				updateInstallationStatus(
					organization.id,
					"disconnected",
					organization.id,
				);
				toast.success(response.message);
			} else {
				toast.error(response.message);
			}
		} catch {
			toast.error("Failed to disconnect GitHub account. Try again later.");
		} finally {
			setIsDisconnecting(false);
		}
	};

	const authenticateWithGithub = async () => {
		setIsConnecting(true);
		try {
			if (organization.github_installation_status === "disconnected") {
				const response = await reconnectGithub();
				if (response.success) {
					updateInstallationStatus(organization.id, "active", organization.id);
					toast.success(response.message);
				} else {
					router.push("https://github.com/apps/push-to-post/installations/new");
					toast.error(response.message);
				}
			} else if (organization.github_installation_status === "unknown") {
				router.push("https://github.com/apps/push-to-post/installations/new");
			} else {
			}
			setIsConnecting(false);
		} catch {
			toast.error("Failed to initiate GitHub connection.");
			setIsConnecting(false);
		}
	};

	return (
		<div className="group relative overflow-hidden rounded-2xl border border-zinc-800/50 bg-zinc-900/30 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-800/40">
			<div className="absolute inset-0 bg-gradient-to-br from-zinc-800/10 via-transparent to-zinc-900/10 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
			<div className="relative p-8">
				<div className="mb-6">
					<h3 className="text-lg font-medium text-zinc-100">
						Connected Accounts
					</h3>
					<p className="text-sm text-zinc-400">
						Manage your external integrations
					</p>
				</div>

				<div className="space-y-4">
					<div className="group/item relative overflow-hidden rounded-xl border border-zinc-800/50 bg-zinc-800/30 backdrop-blur-sm transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-800/50">
						<div className="absolute inset-0 bg-gradient-to-r from-zinc-700/5 via-transparent to-zinc-800/5 opacity-0 transition-opacity duration-300 group-hover/item:opacity-100" />
						<div className="relative flex items-center justify-between p-6">
							<div className="flex items-center gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700/50 bg-zinc-800/50 backdrop-blur-sm">
									<FaGithub className="h-6 w-6 text-zinc-100" />
								</div>
								<div>
									<h4 className="text-sm font-medium text-zinc-100">GitHub</h4>
									<p className="text-xs text-zinc-400">
										Required for commit tracking
									</p>
								</div>
							</div>

							<Button
								onClick={() => {
									if (githubConnected) {
										disConnectGitHub();
									} else {
										authenticateWithGithub();
									}
								}}
								disabled={isConnecting || isDisconnecting}
								className={
									githubConnected
										? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 backdrop-blur-sm hover:bg-emerald-500/20"
										: "bg-zinc-100 font-medium text-zinc-900 hover:bg-zinc-200"
								}
							>
								{isConnecting || isDisconnecting ? (
									<span className="flex items-center gap-2">
										<Loader2 className="h-4 w-4 animate-spin" />
										{isConnecting ? "Connecting..." : "Disconnecting..."}
									</span>
								) : githubConnected ? (
									<span className="flex items-center gap-2">
										<ExternalLink className="h-4 w-4" />
										Disconnect
									</span>
								) : (
									<>
										{organization.github_installation_status ===
										"disconnected" ? (
											<span className="flex items-center gap-2">
												<FaGithub className="h-4 w-4" />
												Re-Connect
											</span>
										) : (
											<span className="flex items-center gap-2">
												<FaGithub className="h-4 w-4" />
												Connect
											</span>
										)}
									</>
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
