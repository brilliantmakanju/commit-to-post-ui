/* eslint-disable import/no-unresolved */
"use client";
import { Check, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { FaBitbucket, FaGithub, FaGitlab } from "react-icons/fa";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { reconnectGithub } from "@/server-actions/user-actions/reconnect-github";
import useOrganizationStore from "@/zustand/useorganization-store";

const ConnectGithub = () => {
	const router = useRouter();
	const [isLoading, setIsLoading] = useState(false);
	const { organization, updateInstallationStatus } = useOrganizationStore();

	const githubConnected = useOrganizationStore(
		state =>
			state.organization.github_installation_status === "active" &&
			!!state.organization.github_installation_id,
	);

	const handleConnectGitHub = async () => {
		setIsLoading(true);
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
			setIsLoading(false);
		} catch {
			toast.error("Failed to initiate GitHub connection.");
			setIsLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div className="mb-6 overflow-hidden rounded-2xl border border-gray-200">
				<div className="border-b border-gray-200 bg-gray-50 px-6 py-5">
					<div className="flex items-center justify-between">
						<div className="flex items-center gap-4">
							<div className="flex h-12 w-12 items-center justify-center rounded-xl border border-gray-300 bg-white">
								<FaGithub className="h-6 w-6 text-gray-600" />
							</div>
							<div>
								<h3 className="text-lg font-semibold text-gray-900">GitHub</h3>
								<p className="mt-0.5 text-sm text-gray-600">
									World&#39;s leading development platform
								</p>
							</div>
						</div>
						<div className="flex items-center gap-3">
							{githubConnected ? (
								<div className="flex items-center gap-2 rounded-full border border-green-200 bg-green-50 px-3 py-1">
									<Check className="h-4 w-4 text-green-600" />
									<span className="text-sm font-medium text-green-700">
										Connected
									</span>
								</div>
							) : (
								<Button
									onClick={handleConnectGitHub}
									disabled={isLoading || githubConnected}
									className={`px-6 ${
										githubConnected
											? "cursor-not-allowed bg-gray-100 text-gray-400 hover:bg-gray-100"
											: "bg-arch-black text-white hover:bg-arch-dark"
									}`}
								>
									{isLoading ? (
										<>
											<Loader2 className="mr-2 h-4 w-4 animate-spin" />
											Connecting...
										</>
									) : githubConnected ? (
										"Connected"
									) : (
										<>
											<FaGithub className="mr-2 h-4 w-4" />
											Connect
										</>
									)}
								</Button>
							)}
						</div>
					</div>
				</div>

				{githubConnected && (
					<div className="border-b border-green-100 bg-green-50 px-6 py-4">
						<div className="flex items-center gap-2">
							<Check className="h-4 w-4 text-green-600" />
							<span className="text-sm font-medium text-green-700">
								Successfully connected to GitHub
							</span>
						</div>
						<p className="mt-1 text-xs text-green-600">
							You can now access your repositories and manage your code
							deployments
						</p>
					</div>
				)}
			</div>

			{/* Coming Soon Providers */}
			<div className="space-y-4">
				<div className="mb-4 flex items-center gap-3">
					<div className="h-px flex-1 bg-gray-200"></div>
					<span className="px-3 text-xs font-medium uppercase tracking-wider text-gray-500">
						Coming Soon
					</span>
					<div className="h-px flex-1 bg-gray-200"></div>
				</div>

				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					{/* GitLab */}
					<div className="rounded-xl border border-gray-200 bg-gray-50 p-5 opacity-60">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white">
									<FaGitlab className="h-5 w-5 text-gray-400" />
								</div>
								<div>
									<h4 className="font-medium text-gray-500">GitLab</h4>
									<p className="mt-0.5 text-xs text-gray-400">
										DevOps platform
									</p>
								</div>
							</div>
							<Button
								variant="outline"
								disabled
								className="cursor-not-allowed border-gray-300 bg-transparent px-4 py-2 text-gray-400"
							>
								Coming Soon
							</Button>
						</div>
					</div>

					{/* Bitbucket */}
					<div className="rounded-xl border border-gray-200 bg-gray-50 p-5 opacity-60">
						<div className="flex items-center justify-between">
							<div className="flex items-center gap-3">
								<div className="flex h-10 w-10 items-center justify-center rounded-lg border border-gray-300 bg-white">
									<FaBitbucket className="h-5 w-5 text-gray-400" />
								</div>
								<div>
									<h4 className="font-medium text-gray-500">Bitbucket</h4>
									<p className="mt-0.5 text-xs text-gray-400">
										Atlassian Git solution
									</p>
								</div>
							</div>
							<Button
								variant="outline"
								disabled
								className="cursor-not-allowed border-gray-300 bg-transparent px-4 py-2 text-gray-400"
							>
								Coming Soon
							</Button>
						</div>
					</div>
				</div>
			</div>

			{/* Footer Note */}
			<div className="mt-8 text-center">
				<p className="text-xs text-gray-500">
					More providers will be added soon. Stay tuned for updates.
				</p>
			</div>
		</div>
	);
};

export default ConnectGithub;
