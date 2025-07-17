import { ExternalLink, Github, GithubIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useGithubConnectedStatus } from "@/hooks/settings/use-github-connected";
import { disconnectGithub } from "@/server-actions/user-actions/disconnect-github";
import useUserStore from "@/zustand/useuser-store";

export function SocialConnectionSettings() {
	const router = useRouter();
	const userStore = useUserStore();
	const githubConnected = useGithubConnectedStatus();

	const disConnectGitHub = async () => {
		try {
			const response = await disconnectGithub();
			if (response.success) {
				userStore.setUser({ github_connected: false, hasHydratedUser: true });
				toast.success(response.message);
			} else {
				toast.error(response.message);
			}
		} catch {
			toast.error("Failed to disconnect github account, try again later");
		}
	};

	const authenticateWithGithub = async () => {
		router.push(
			`https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GIT_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_SITE_URL}/&scope=repo,admin:repo_hook,read:user&prompt=consent`,
		);
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
									<Github className="h-6 w-6 text-zinc-100" />
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
									githubConnected
										? disConnectGitHub()
										: authenticateWithGithub();
								}}
								className={
									githubConnected
										? "border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 backdrop-blur-sm hover:bg-emerald-500/20"
										: "bg-zinc-100 font-medium text-zinc-900 hover:bg-zinc-200"
								}
							>
								{githubConnected ? (
									<span className="flex items-center gap-2">
										<ExternalLink className="h-4 w-4" />
										Disconnect
									</span>
								) : (
									<span className="flex items-center gap-2">
										<GithubIcon className="h-4 w-4" />
										Connect
									</span>
								)}
							</Button>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
