"use client";

import { ExternalLink, Github, GithubIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useGithubConnectedStatus } from "@/hooks/settings/use-github-connected";
import { disconnectGithub } from "@/server-actions/user-actions/disconnect-github";
import useUserStore from "@/zustand/useuser-store";

// const openConnectAccountDialog = async () => {
// 	try {
// 		const response = await getLinkedInConnection();

// 		if (response.success) {
// 			window.open(response.url);
// 		} else {
// 			toast.error(response.message);
// 		}
// 	} catch {
// 		toast.error("Failed to connect LinkedIn account, try again later");
// 	}
// };

export function SocialConnectionSettings() {
	const router = useRouter();
	const userStore = useUserStore();
	// const { isFetching } = useSocialStatus();
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
			`https://github.com/login/oauth/authorize?client_id=${process.env.NEXT_PUBLIC_GIT_CLIENT_ID}&redirect_uri=${process.env.NEXT_PUBLIC_SITE_URL}/&scope=repo:read,read:user,admin:repo_hook`,
		);
	};

	// if (isFetching) {
	// 	return (
	// 		<div className="flex w-full flex-col text-white">
	// 			<div className="w-full space-y-4">
	// 				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
	// 					{/* <Card className="flex items-center justify-between border-[#232323] bg-[#121212] p-4">
	// 						<div className="flex items-center">
	// 							<div className="mr-3 flex h-10 w-10 items-center justify-center rounded-md border border-[#232323] bg-[#1A1A1A]">
	// 								<Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
	// 							</div>
	// 							<div>
	// 								<h3 className="text-sm font-medium text-zinc-300">
	// 									Loading...
	// 								</h3>
	// 								<p className="text-xs text-zinc-500">
	// 									Checking connection status
	// 								</p>
	// 							</div>
	// 						</div>
	// 						<Button disabled className="bg-[#232323] text-zinc-400">
	// 							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
	// 							Loading...
	// 						</Button>
	// 					</Card>

	// 					<Card className="flex items-center justify-between border-[#232323] bg-[#121212] p-4">
	// 						<div className="flex items-center">
	// 							<div className="mr-3 flex h-10 w-10 items-center justify-center rounded-md border border-[#232323] bg-[#1A1A1A]">
	// 								<Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
	// 							</div>
	// 							<div>
	// 								<h3 className="text-sm font-medium text-zinc-300">
	// 									Loading...
	// 								</h3>
	// 								<p className="text-xs text-zinc-500">
	// 									Checking connection status
	// 								</p>
	// 							</div>
	// 						</div>
	// 						<Button disabled className="bg-[#232323] text-zinc-400">
	// 							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
	// 							Loading...
	// 						</Button>
	// 					</Card> */}

	// 					<Card className="flex items-center justify-between border-[#232323] bg-[#121212] p-4">
	// 						<div className="flex items-center">
	// 							<div className="mr-3 flex h-10 w-10 items-center justify-center rounded-md border border-[#232323] bg-[#1A1A1A]">
	// 								<Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
	// 							</div>
	// 							<div>
	// 								<h3 className="text-sm font-medium text-zinc-300">
	// 									Loading...
	// 								</h3>
	// 								<p className="text-xs text-zinc-500">
	// 									Checking connection status
	// 								</p>
	// 							</div>
	// 						</div>
	// 						<Button disabled className="bg-[#232323] text-zinc-400">
	// 							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
	// 							Loading...
	// 						</Button>
	// 					</Card>
	// 				</div>

	// 				{/* <Card className="border-[#232323] bg-[#121212] p-4">
	// 					<h3 className="mb-2 text-sm font-medium text-zinc-300">
	// 						How to connect your accounts
	// 					</h3>
	// 					<p className="mb-3 text-sm text-zinc-500">
	// 						Connect your social accounts to automatically share your GitHub
	// 						commits as engaging posts.
	// 					</p>
	// 					<div className="rounded-md border border-[#232323] bg-[#1A1A1A] p-4">
	// 						<ol className="space-y-3 text-left text-sm text-zinc-400">
	// 							<li className="flex items-start">
	// 								<span className="mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-white">
	// 									1
	// 								</span>
	// 								<span>Click &#34;Connect LinkedIn&#34;</span>
	// 							</li>
	// 							<li className="flex items-start">
	// 								<span className="mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-white">
	// 									2
	// 								</span>
	// 								<span>
	// 									Once connected, you&#39;ll be redirected back to the app
	// 								</span>
	// 							</li>
	// 							<li className="flex items-start">
	// 								<span className="mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-white">
	// 									3
	// 								</span>
	// 								<span>Click &#34;Generate Webhook&#34;</span>
	// 							</li>
	// 							<li className="flex items-start">
	// 								<span className="mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-white">
	// 									4
	// 								</span>
	// 								<span>You&#39;ll see your Webhook URL and Secret Key</span>
	// 							</li>
	// 							<li className="flex items-start">
	// 								<span className="mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-white">
	// 									5
	// 								</span>
	// 								<span>
	// 									Copy the Webhook URL → head to your GitHub repo → Settings →
	// 									Webhooks
	// 								</span>
	// 							</li>
	// 							<li className="flex items-start">
	// 								<span className="mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-white">
	// 									6
	// 								</span>
	// 								<span>Click &#34;Add Webhook&#34;</span>
	// 							</li>
	// 							<li className="flex items-start">
	// 								<span className="mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-white">
	// 									7
	// 								</span>
	// 								<span>
	// 									Paste the URL, then copy the Secret Key from the app
	// 								</span>
	// 							</li>
	// 							<li className="flex items-start">
	// 								<span className="mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-white">
	// 									8
	// 								</span>
	// 								<span>
	// 									Paste it into GitHub&#39;s &#34;Secret&#34; field and save
	// 								</span>
	// 							</li>
	// 							<li className="flex items-start">
	// 								<span className="mr-2 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-zinc-800 text-xs font-medium text-white">
	// 									9
	// 								</span>
	// 								<span>
	// 									Back in the app, choose the branch you want to track
	// 								</span>
	// 							</li>
	// 						</ol>
	// 					</div>
	// 				</Card> */}
	// 			</div>
	// 		</div>
	// 	);
	// }

	return (
		<div className="flex w-full flex-col text-white">
			<div className="w-full space-y-4">
				<div className="flex w-full items-start justify-start">
					{/* <Card className="flex items-center justify-between border-[#232323] bg-[#121212] p-4">
						<div className="flex items-center">
							<div className="mr-3 flex h-10 w-10 items-center justify-center rounded-md border border-[#232323] bg-[#1A1A1A]">
								<Linkedin className="h-5 w-5 text-[#0A66C2]" />
							</div>
							<div>
								<h3 className="text-sm font-medium text-zinc-300">LinkedIn</h3>
								<p className="text-xs text-zinc-500">
									{socialStatus ? "Connected" : "Not connected"}
								</p>
							</div>
						</div>
						<Button
							onClick={() => openConnectAccountDialog()}
							disabled={socialStatus !== false}
							className={
								socialStatus
									? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
									: "bg-[#4F46E5] text-white hover:bg-[#4338CA]"
							}
						>
							{socialStatus ? (
								<span className="flex items-center">
									<ExternalLink className="mr-2 h-4 w-4" />
									Connected
								</span>
							) : (
								<span className="flex items-center">
									<Linkedin className="mr-2 h-4 w-4" />
									Connect
								</span>
							)}
						</Button>
					</Card>

					<Card className="flex items-center justify-between border-[#232323] bg-[#121212] p-4">
						<div className="flex items-center">
							<div className="mr-3 flex h-10 w-10 items-center justify-center rounded-md border border-[#232323] bg-[#1A1A1A]">
								<Twitter className="h-5 w-5 text-[#1DA1F2]" />
							</div>
							<div>
								<h3 className="text-sm font-medium text-zinc-300">Twitter</h3>
								<p className="text-xs text-zinc-500">Coming soon</p>
							</div>
						</div>
						<Button disabled className="bg-[#232323] text-zinc-400">
							Coming Soon
						</Button>
					</Card> */}

					<Card className="flex w-full items-center justify-between border-[#232323] bg-[#121212] p-4">
						<div className="flex items-center">
							<div className="mr-3 flex h-10 w-10 items-center justify-center rounded-md border border-[#232323] bg-[#1A1A1A]">
								<Github className="h-5 w-5 text-white" />
							</div>
							<div>
								<h3 className="text-sm font-medium text-zinc-300">GitHub</h3>
								<p className="text-xs text-zinc-500">
									Required for commit tracking
								</p>
							</div>
						</div>
						<Button
							onClick={() => {
								githubConnected ? disConnectGitHub() : authenticateWithGithub();
							}}
							className={
								githubConnected
									? "border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20"
									: "bg-[#4F46E5] text-white hover:bg-[#4338CA]"
							}
						>
							{githubConnected ? (
								<span className="flex items-center">
									<ExternalLink className="mr-2 h-4 w-4" />
									Disconnect
								</span>
							) : (
								<span className="flex items-center">
									<GithubIcon className="mr-2 h-4 w-4" />
									Connect
								</span>
							)}
						</Button>
					</Card>
				</div>
			</div>
		</div>
	);
}
