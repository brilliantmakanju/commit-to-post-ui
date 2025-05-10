"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
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
				} else {
					setStatus("error");
					setMessage("Connection failed. Please try again.");
				}
			} catch {
				setStatus("error");
				setMessage("Connection failed. Please try again.");
				setTimeout(() => closeModal(false), 3000);
			}
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
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
			<Card className="relative w-full max-w-md border border-[#232323] bg-[#121212] text-white shadow-lg shadow-[#4F46E5]/10">
				<button
					onClick={() => closeModal(false)}
					className="absolute right-4 top-4 rounded-full p-1 text-zinc-400 transition-colors hover:bg-[#232323] hover:text-white"
				>
					<X className="h-4 w-4" />
				</button>
				<CardHeader>
					<CardTitle className="flex items-center">
						{status === "success" && (
							<CheckCircle2 className="mr-2 h-5 w-5 text-emerald-500" />
						)}
						{status === "error" && (
							<AlertCircle className="mr-2 h-5 w-5 text-red-500" />
						)}
						Social Account Connection
					</CardTitle>
					<CardDescription className="text-zinc-400">
						{status === "connecting"
							? "We're processing your request"
							: message}
					</CardDescription>
				</CardHeader>
				<CardContent>
					{status === "connecting" && (
						<div className="flex flex-col items-center space-y-4 py-6">
							<div className="relative h-12 w-12">
								<Loader2 className="absolute inset-0 h-12 w-12 animate-spin text-[#4F46E5]" />
								<div className="absolute inset-0 h-12 w-12 animate-pulse rounded-full bg-[#4F46E5]/20"></div>
							</div>
							<p className="font-mono text-sm text-zinc-300">
								Connecting your account... Please wait.
							</p>
						</div>
					)}
					{status === "success" && (
						<div className="rounded-md border border-[#232323] bg-[#1A1A1A] p-4 py-6 text-center">
							<p className="font-mono text-sm text-zinc-300">
								Connection successful! You can now post your GitHub commits to
								LinkedIn.
							</p>
						</div>
					)}
					{status === "error" && (
						<div className="rounded-md border border-[#232323] bg-[#1A1A1A] p-4 py-6 text-center">
							<p className="font-mono text-sm text-zinc-300">{message}</p>
							<p className="mt-2 text-xs text-zinc-500">
								This dialog will close automatically.
							</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default SocialConnectCallback;
