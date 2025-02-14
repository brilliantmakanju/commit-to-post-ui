/* eslint-disable unicorn/consistent-function-scoping */
"use client";

import { Linkedin, Twitter } from "lucide-react";
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

	return (
		<div className="flex w-full flex-col">
			<div className="w-full space-y-4 text-white">
				<h2 className="text-lg font-semibold">Connected Accounts</h2>
				<div className="flex flex-wrap gap-5 sm:space-x-4">
					{!isFetching && (
						<>
							<Button
								onClick={() => openConnectAccountDialog()}
								disabled={socialStatus !== false}
								className={`w-full flex-1 justify-start disabled:opacity-100 ${
									socialStatus ? "bg-[#058C42] text-white" : ""
								}`}
							>
								<Linkedin className="mr-2 h-4 w-4" />
								{socialStatus ? "LinkedIn Connected" : "Connect LinkedIn"}
							</Button>
							<Button
								disabled
								className="w-full flex-1 cursor-not-allowed justify-start opacity-50"
							>
								<Twitter className="mr-2 h-4 w-4" />
								Twitter (Coming Soon)
							</Button>
						</>
					)}
				</div>
				<div className="space-y-2">
					<h3 className="text-sm font-medium">How to connect your account</h3>
					<p className="text-sm text-muted-foreground">
						Learn how to connect your LinkedIn account:
					</p>
					<ul className="flex list-none flex-wrap items-start justify-start gap-3 text-sm text-muted-foreground md:gap-8">
						<li>
							<a
								href="http://www.youtube.com/watch?v=dQw4w9WgXcQ"
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-500 hover:underline"
							>
								Watch our tutorial video
							</a>
						</li>
						<li>
							<a
								href="http://example.com/blog/how-to-connect-linkedin"
								target="_blank"
								rel="noopener noreferrer"
								className="text-blue-500 hover:underline"
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
