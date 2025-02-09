"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { Linkedin, Twitter } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { connectAccountSchema } from "@/resolvers/organizations/organization-schema";
import { getLinkedInConnection } from "@/server-actions/organizations/get-linkedin-connection";
import { getSocialStatus } from "@/server-actions/organizations/get-social-status";
import { postLinkedInConnection } from "@/server-actions/organizations/post-linkedin-connection";

export function SocialConnectionSettings() {
	const [isConnectAccountDialogOpen, setIsConnectAccountDialogOpen] =
		useState(false);

	const connectAccountForm = useForm<z.infer<typeof connectAccountSchema>>({
		resolver: zodResolver(connectAccountSchema),
	});

	const openConnectAccountDialog = async () => {
		try {
			const response = await getLinkedInConnection();

			if (response.success) {
				// Clear previous state

				// Set new state
				setIsConnectAccountDialogOpen(true);
				window.open(response.url, "_blank");
			} else {
				toast.error(response.message);
			}
		} catch {
			toast.error("Failed to connect LinkedIn account, try again later");
		}
	};

	async function onConnectAccount(
		values: z.infer<typeof connectAccountSchema>,
	) {
		try {
			const response = await postLinkedInConnection(values);

			if (response.success) {
				setIsLinkedInConnected(true);
				setIsConnectAccountDialogOpen(false);
				connectAccountForm.reset();
				toast.success("Your LinkedIn account has been connected successfully.");
			} else {
				toast.error(response.message);
			}
		} catch {
			toast.error("Linkedin connection failed.");
		}
	}

	const {
		data: social_status,
		isFetching,
		isLoading,
	} = useQuery({
		queryKey: ["retrieving_social_status"],
		queryFn: async () => {
			const result = await getSocialStatus();

			if (!result.success) {
				return false;
			}

			if (!result.data) {
				return false;
			}

			return result.data.has_linkedin;
		},
		staleTime: Infinity, // Keep the data fresh indefinitely
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});

	console.log(isFetching, "IS fetching");
	console.log(isLoading, "IS Loading");
	console.log(social_status, "Datas");

	const [isLinkedInConnected, setIsLinkedInConnected] = useState<
		boolean | undefined
	>(social_status);

	return (
		<div className="flex w-full flex-col">
			<div className="w-full space-y-4 text-white">
				<h2 className="text-lg font-semibold">Connected Accounts</h2>
				<div className="flex flex-wrap gap-5 sm:space-x-4">
					<Button
						onClick={() => openConnectAccountDialog()}
						disabled={social_status !== false}
						className={`w-full flex-1 justify-start ${
							social_status ? "bg-green-500 text-white hover:bg-green-600" : ""
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

			<Dialog
				open={isConnectAccountDialogOpen}
				onOpenChange={setIsConnectAccountDialogOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Connect LinkedIn Account</DialogTitle>
						<DialogDescription>
							Please enter the 6-digit code you received from LinkedIn.
						</DialogDescription>
					</DialogHeader>
					<Form {...connectAccountForm}>
						<form
							onSubmit={connectAccountForm.handleSubmit(onConnectAccount)}
							className="space-y-4"
						>
							<FormField
								control={connectAccountForm.control}
								name="code"
								render={({ field }) => (
									<FormItem>
										<FormControl>
											<Input {...field} />
										</FormControl>
										<FormMessage />
									</FormItem>
								)}
							/>
							<Button>Submit</Button>
						</form>
					</Form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
