"use client";

import { useQueryClient } from "@tanstack/react-query";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { z } from "zod";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import type { connectAccountSchema } from "@/resolvers/organizations/organization-schema";
// import { postLinkedInConnection } from "@/server-actions/organizations/post-linkedin-connection";
import { connectGithub } from "@/server-actions/user-actions/connect-github";
import useUserStore from "@/zustand/useuser-store";

interface ConnectionStatus {
	code: string;
	connecting: boolean;
	closeModal: (value: boolean) => void;
	type: "github" | "linkedin" | "twitter" | "slack" | "discord";
}

// ----- Shared connection logic -----
const connectSocialAccount = async (
	type: "github" | "linkedin" | "twitter" | "slack" | "discord",
	code: string,
	setMessage: (message: string) => void,
	setStatus: (status: "success" | "error") => void,
	closeModal: (value: boolean) => void,
	queryClient: ReturnType<typeof useQueryClient>,
	pathname: string,
	searchParams: URLSearchParams,
	router: ReturnType<typeof useRouter>,
	userStore: any,
) => {
	try {
		const values = { code };
		const response = await connectGithub(
			values as z.infer<typeof connectAccountSchema>,
		);
		// type === "github"
		// 	?
		// : await postLinkedInConnection(values);

		if (response?.success) {
			// Create a copy of current search params
			const nextSearchParams = new URLSearchParams(searchParams.toString());

			// Always remove `code`
			nextSearchParams.delete("code");

			// Remove `github` only if it exists
			// if (nextSearchParams.has("github")) {
			// 	nextSearchParams.delete("github");
			// }

			// Replace current URL with cleaned-up one
			router.replace(`${pathname}?${nextSearchParams.toString()}`);
			userStore.setUser({
				hasHydratedUser: true,
				github_connected: true,
			});

			// Set connection status
			setStatus("success");

			setMessage("Your Github account connected successfully!");
			// type === "github"
			// ?
			// : "Your LinkedIn account has been connected successfully!",

			// Invalidate relevant queries
			// if (type === "linkedin") {
			// 	await queryClient.invalidateQueries({
			// 		queryKey: ["retrieving_webhooks"],
			// 	});
			// 	await queryClient.invalidateQueries({
			// 		queryKey: ["organization-ownership"],
			// 	});
			// 	await queryClient.invalidateQueries({
			// 		queryKey: ["retrieving_social_status"],
			// 	});
			// }

			closeModal(false);
		} else {
			setStatus("error");
			setMessage(response?.message || "Connection failed");
			setTimeout(() => closeModal(false), 3000);
		}
	} catch {
		setStatus("error");
		setMessage("Connection failed. Please try again.");
		setTimeout(() => closeModal(false), 3000);
	}
};

// ----- Main component -----
const SocialConnectCallback = ({
	code,
	type,
	connecting,
	closeModal,
}: ConnectionStatus) => {
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const queryClient = useQueryClient();
	const userStore = useUserStore();

	const [status, setStatus] = useState<"connecting" | "success" | "error">(
		"connecting",
	);
	const [message, setMessage] = useState("");

	// Prevent double-execution in development
	const hasRunRef = useRef(false);

	useEffect(() => {
		if (hasRunRef.current) return;
		hasRunRef.current = true;

		if (code && type) {
			connectSocialAccount(
				type,
				code,
				setMessage,
				setStatus,
				closeModal,
				queryClient,
				pathname,
				searchParams,
				router,
				userStore,
			);
		}
	}, [
		code,
		type,
		closeModal,
		queryClient,
		userStore,
		pathname,
		searchParams,
		router,
	]);

	// Prevent background scroll when modal is open
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
