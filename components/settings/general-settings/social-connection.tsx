/* eslint-disable unicorn/consistent-function-scoping */
"use client";

import { Linkedin, Loader2, Twitter } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { useSocialStatus } from "@/hooks/settings/use-social-status";
import { getLinkedInConnection } from "@/server-actions/organizations/get-linkedin-connection";

export function SocialConnectionSettings() {
	const { data: socialStatus, isFetching } = useSocialStatus();

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
					<h2 className="text-lg font-semibold">Connected Accounts</h2>
					<div className="flex flex-wrap gap-4">
						<Button
							disabled
							className="w-full flex-1 justify-start border border-white bg-transparent text-white opacity-50"
						>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Loading...
						</Button>
						<Button
							disabled
							className="w-full flex-1 cursor-not-allowed justify-start border border-white text-white opacity-50"
						>
							<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							Loading...
						</Button>
					</div>
					<div className="space-y-2">
						<h3 className="text-sm font-medium">How to connect your account</h3>
						<p className="text-sm text-gray-400">Loading instructions...</p>
						<ul className="flex list-none flex-wrap items-start justify-start gap-3 text-sm text-gray-400">
							<li className="opacity-50">Loading tutorial...</li>
							<li className="opacity-50">Loading guide...</li>
						</ul>
					</div>
				</div>
			</div>
		);
	}

	return (
		<div className="flex w-full flex-col text-white">
			<div className="w-full space-y-4">
				<h2 className="text-lg font-semibold">Connected Accounts</h2>
				<div className="flex flex-wrap gap-4">
					{!isFetching && (
						<>
							<Button
								onClick={() => openConnectAccountDialog()}
								disabled={socialStatus !== false}
								className={
									"w-full flex-1 justify-start border border-white bg-transparent text-white transition-all hover:bg-white hover:text-black disabled:opacity-50"
								}
							>
								<Linkedin className="mr-2 h-4 w-4" />
								{socialStatus ? "LinkedIn Connected" : "Connect LinkedIn"}
							</Button>
							<Button
								disabled
								className="w-full flex-1 cursor-not-allowed justify-start border border-white text-white opacity-50"
							>
								<Twitter className="mr-2 h-4 w-4" />
								Twitter (Coming Soon)
							</Button>
						</>
					)}
				</div>
				<div className="space-y-2">
					<h3 className="text-sm font-medium">How to connect your account</h3>
					<p className="text-sm text-gray-400">
						Learn how to connect your LinkedIn account:
					</p>
					<ul className="flex list-none flex-wrap items-start justify-start gap-3 text-sm text-gray-400">
						<li>
							<a
								href="http://www.youtube.com/watch?v=dQw4w9WgXcQ"
								target="_blank"
								rel="noopener noreferrer"
								className="text-white underline hover:text-gray-300"
							>
								Watch our tutorial video
							</a>
						</li>
						<li>
							<a
								href="http://example.com/blog/how-to-connect-linkedin"
								target="_blank"
								rel="noopener noreferrer"
								className="text-white underline hover:text-gray-300"
							>
								Read our step-by-step guide
							</a>
						</li>
					</ul>
				</div>
			</div>
		</div>
	);
}
