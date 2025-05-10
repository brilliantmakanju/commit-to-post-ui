"use client";

import { ExternalLink, Github, Linkedin, Loader2, Twitter } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useSocialStatus } from "@/hooks/settings/use-social-status";
import { getLinkedInConnection } from "@/server-actions/organizations/get-linkedin-connection";

export function SocialConnectionSettings() {
	const { data: socialStatus, isFetching } = useSocialStatus();

	// eslint-disable-next-line unicorn/consistent-function-scoping
	const openConnectAccountDialog = async () => {
		try {
			const response = await getLinkedInConnection();

			if (response.success) {
				window.open(response.url);
			} else {
				toast.error(response.message);
			}
		} catch {
			toast.error("Failed to connect LinkedIn account, try again later");
		}
	};

	if (isFetching) {
		return (
			<div className="flex w-full flex-col text-white">
				<div className="w-full space-y-4">
					<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
						<Card className="flex items-center justify-between border-[#232323] bg-[#121212] p-4">
							<div className="flex items-center">
								<div className="mr-3 flex h-10 w-10 items-center justify-center rounded-md border border-[#232323] bg-[#1A1A1A]">
									<Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
								</div>
								<div>
									<h3 className="text-sm font-medium text-zinc-300">
										Loading...
									</h3>
									<p className="text-xs text-zinc-500">
										Checking connection status
									</p>
								</div>
							</div>
							<Button disabled className="bg-[#232323] text-zinc-400">
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Loading...
							</Button>
						</Card>

						<Card className="flex items-center justify-between border-[#232323] bg-[#121212] p-4">
							<div className="flex items-center">
								<div className="mr-3 flex h-10 w-10 items-center justify-center rounded-md border border-[#232323] bg-[#1A1A1A]">
									<Loader2 className="h-5 w-5 animate-spin text-zinc-400" />
								</div>
								<div>
									<h3 className="text-sm font-medium text-zinc-300">
										Loading...
									</h3>
									<p className="text-xs text-zinc-500">
										Checking connection status
									</p>
								</div>
							</div>
							<Button disabled className="bg-[#232323] text-zinc-400">
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Loading...
							</Button>
						</Card>
					</div>

					<Card className="border-[#232323] bg-[#121212] p-4">
						<h3 className="mb-2 text-sm font-medium text-zinc-300">
							How to connect your accounts
						</h3>
						<p className="mb-3 text-sm text-zinc-500">
							Connect your social accounts to automatically share your GitHub
							commits as engaging posts.
						</p>
						<div className="rounded-md border border-[#232323] bg-[#1A1A1A] p-3">
							<p className="text-xs text-zinc-400">
								Loading connection instructions...
							</p>
						</div>
					</Card>
				</div>
			</div>
		);
	}

	return (
		<div className="flex w-full flex-col text-white">
			<div className="w-full space-y-4">
				<div className="grid grid-cols-1 gap-4 md:grid-cols-2">
					<Card className="flex items-center justify-between border-[#232323] bg-[#121212] p-4">
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
					</Card>

					{/* <Card className="flex items-center justify-between border-[#232323] bg-[#121212] p-4">
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
						<Button className="border border-emerald-500/20 bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20">
							<span className="flex items-center">
								<ExternalLink className="mr-2 h-4 w-4" />
								Connected
							</span>
						</Button>
					</Card> */}
				</div>

				<Card className="border-[#232323] bg-[#121212] p-4">
					<h3 className="mb-2 text-sm font-medium text-zinc-300">
						How to connect your accounts
					</h3>
					<p className="mb-3 text-sm text-zinc-500">
						Connect your social accounts to automatically share your GitHub
						commits as engaging posts.
					</p>
					<div className="rounded-md border border-[#232323] bg-[#1A1A1A] p-3">
						<p className="mb-2 text-xs text-zinc-400">
							<span className="text-[#4F46E5]">1.</span> Click the
							&ldquo;Connect&#34; button for the platform you want to use
						</p>
						<p className="mb-2 text-xs text-zinc-400">
							<span className="text-[#4F46E5]">2.</span> Authorize Push to Post
							to access your account
						</p>
						<p className="text-xs text-zinc-400">
							<span className="text-[#4F46E5]">3.</span> Your commits will
							automatically be formatted for that platform
						</p>
						<div className="mt-3 border-t border-[#232323] pt-3">
							<a
								href="https://youtu.be/sKM3s-ZLXfo?si=haMyzRqDVMgeYWCr"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center text-xs text-[#4F46E5] hover:text-[#4338CA]"
							>
								<ExternalLink className="mr-1 h-3 w-3" />
								Watch our tutorial video
							</a>
						</div>
					</div>
				</Card>
			</div>
		</div>
	);
}
