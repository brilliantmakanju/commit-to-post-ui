"use client";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaGithub } from "react-icons/fa";
import { toast } from "sonner";

import SocialConnectionInterface from "@/components/onboarding/v2/screens/connect-socials";
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
		<div className="w-full overflow-hidden">
			<div className="mb-6">
				<h3 className="text-lg font-medium text-zinc-100">
					Connected Accounts
				</h3>
				<p className="text-sm text-zinc-400">
					Manage your external integrations
				</p>
			</div>

			<div className="flex w-full flex-col items-start justify-start gap-4">
				<div className="w-full rounded-2xl border border-zinc-800/50 bg-zinc-900/30 px-6 py-5 text-zinc-100 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/50 hover:bg-zinc-800/40">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/50">
								<FaGithub className="h-6 w-6 text-zinc-100" />
							</div>
							<div>
								<h3 className="text-md font-semibold text-zinc-100">GitHub</h3>
								<p className="text-sm text-zinc-400">
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
									? "bg-red-100 text-red-600 hover:bg-red-200"
									: "border border-zinc-700/50 bg-zinc-800/30 px-6 py-2 text-zinc-100 hover:border-zinc-600/70 hover:bg-zinc-700/40"
							}
						>
							{isConnecting || isDisconnecting ? (
								<span className="flex items-center gap-2">
									<Loader2 className="h-4 w-4 animate-spin" />
									{isConnecting ? "Connecting..." : "Disconnecting..."}
								</span>
							) : githubConnected ? (
								<span className="flex items-center gap-2">Disconnect</span>
							) : (
								<>
									<span className="flex items-center gap-2">Connect</span>
								</>
							)}
						</Button>
					</div>
				</div>
				<div className="w-full space-y-4">
					<SocialConnectionInterface />
				</div>
			</div>
		</div>
	);
}
