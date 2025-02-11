"use client";

import { useQuery } from "@tanstack/react-query";
import { Linkedin, Twitter } from "lucide-react";
import { useEffect } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { getLinkedInConnection } from "@/server-actions/organizations/get-linkedin-connection";
import { getSocialStatus } from "@/server-actions/organizations/get-social-status";

const openConnectAccountDialog = async () => {
	try {
		const response = await getLinkedInConnection();

		if (response.success) {
			window.open(response.url, "_blank");
		} else {
			toast.error(response.message);
		}
	} catch {
		toast.error("Failed to connect LinkedIn account, try again later");
	}
};
const SocialConnectionSettings = () => {
	const { data: social_status, isFetching } = useQuery({
		queryKey: ["retrieving_social_status"],
		queryFn: async () => {
			console.log("Query function is running...");
			const result = await getSocialStatus();
			console.log(result, "Results");

			if (!result.success || !result.data) {
				return false;
			}

			return result.data.has_linkedin;
		},
		enabled: true,
		staleTime: Infinity,
	});

	return (
		<div className="flex w-full flex-col">
			<div className="w-full space-y-4 text-white">
				<h2 className="text-lg font-semibold">Connected Accounts</h2>
				<div className="flex flex-wrap gap-5 sm:space-x-4">
					{!isFetching && (
						<>
							<Button
								onClick={() => openConnectAccountDialog()}
								disabled={social_status !== false}
								className={`w-full flex-1 justify-start ${
									social_status
										? "bg-green-500 text-white hover:bg-green-600"
										: ""
								}`}
							>
								<Linkedin className="mr-2 h-4 w-4" />
								{social_status ? "LinkedIn Connected" : "Connect LinkedIn"}
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
};

export default SocialConnectionSettings;
