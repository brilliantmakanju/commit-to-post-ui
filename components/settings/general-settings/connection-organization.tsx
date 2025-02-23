"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { connectAccountSchema } from "@/resolvers/organizations/organization-schema";
import { postLinkedInConnection } from "@/server-actions/organizations/post-linkedin-connection";

interface connectionStatus {
	connecting: boolean;
	code: string;
	closeModal: (value: boolean) => void;
}

const onConnectAccount = async (
	values: z.infer<typeof connectAccountSchema>,
) => {
	try {
		const response = await postLinkedInConnection(values);

		if (response.success) {
			toast.success("Your LinkedIn account has been connected successfully.");
			return response;
		} else {
			toast.error(response.message);
			return {
				success: false,
			};
		}
	} catch {
		toast.error("LinkedIn connection failed.");
		return {
			success: false,
		};
	}
};

const SocialConnectCallback = ({
	connecting,
	code,
	closeModal,
}: connectionStatus) => {
	const router = useRouter();
	const pathname = usePathname();
	const queryClient = useQueryClient();
	const searchParams = useSearchParams();

	const [status, setStatus] = useState<"connecting" | "success" | "error">(
		"connecting",
	);
	const [message, setMessage] = useState<string>("");

	useEffect(() => {
		const handleConnection = async () => {
			try {
				const connectionRequest = await onConnectAccount({ code });

				if (connectionRequest?.success) {
					const nextSearchParams = new URLSearchParams(searchParams.toString());
					nextSearchParams.delete("code");

					router.replace(`${pathname}?${nextSearchParams}`);
					setStatus("success");
					setMessage("Your account has been successfully connected!");
					closeModal(false);

					// Refresh queries
					queryClient.fetchQuery({ queryKey: ["organization-ownership"] });
					queryClient.fetchQuery({ queryKey: ["retrieving_social_status"] });
					queryClient.fetchQuery({ queryKey: ["retrieving_webhooks"] });
					queryClient.invalidateQueries({ queryKey: ["retrieving_webhooks"] });
					queryClient.invalidateQueries({
						queryKey: ["organization-ownership"],
					});
					queryClient.invalidateQueries({
						queryKey: ["retrieving_social_status"],
					});
				}
			} catch {
				closeModal(false);
			}
			closeModal(false);
		};

		handleConnection();
	}, [searchParams, code, router, pathname, closeModal, queryClient]);

	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "auto";
		};
	}, []);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
			<Card className="relative w-full max-w-md bg-white shadow-lg">
				<CardHeader>
					<CardTitle className="text-gray-900">
						Social Account Connection
					</CardTitle>
					<CardDescription className="text-gray-600">
						We&apos;re processing your request
					</CardDescription>
				</CardHeader>
				<CardContent>
					{status === "connecting" && (
						<div className="flex flex-col items-center space-y-4">
							<Loader2 className="h-8 w-8 animate-spin text-gray-600" />
							<p className="text-gray-200">
								Connecting your account... Please wait.
							</p>
						</div>
					)}
					{status === "success" && (
						<div className="text-center">
							<p className="text-gray-900">{message}</p>
						</div>
					)}
					{status === "error" && (
						<div className="text-center">
							<p className="text-gray-900">{message}</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default SocialConnectCallback;
