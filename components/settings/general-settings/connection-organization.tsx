"use client";

import { useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { connectAccountSchema } from "@/resolvers/organizations/organization-schema";
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
		toast.error("Linkedin connection failed.");
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
					queryClient.fetchQuery({ queryKey: ["organization-ownership"] });
					queryClient.fetchQuery({ queryKey: ["retrieving_social_status"] });
					queryClient.invalidateQueries({
						queryKey: ["organization-ownership"],
					});
					queryClient.invalidateQueries({
						queryKey: ["retrieving_social_status"],
					});
				}
			} catch (error) {
				console.error("Failed to connect account:", error);
				closeModal(false);
			}
			closeModal(false);
		};

		handleConnection();
	}, [searchParams, code, router, pathname, closeModal, queryClient]);

	// useEffect(() => {
	// 	const token = searchParams.get("token");
	// 	if (token) {
	// 		// Simulate API call to backend
	// 		setTimeout(() => {
	// 			// For demonstration, we'll randomly succeed or fail
	// 			if (Math.random() > 0.5) {
	// 				setStatus("success");
	// 				setMessage("Your account has been successfully connected!");
	// 			} else {
	// 				setStatus("error");
	// 				setMessage(
	// 					"There was an error connecting your account. Please try again.",
	// 				);
	// 			}
	// 		}, 3000); // Simulate a 3-second delay
	// 	} else {
	// 		setStatus("error");
	// 		setMessage("No token provided. Unable to connect account.");
	// 	}
	// }, [searchParams]);

	useEffect(() => {
		document.body.style.overflow = "hidden";
		return () => {
			document.body.style.overflow = "auto"; // Restore scrolling when unmounting
		};
	}, []);

	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 p-4">
			<Card className="relative w-full max-w-md rounded-lg bg-white shadow-lg">
				<CardHeader>
					<CardTitle>Social Account Connection</CardTitle>
					<CardDescription>We&#39;re processing your request</CardDescription>
				</CardHeader>
				<CardContent>
					{status === "connecting" && (
						<div className="flex flex-col items-center space-y-4">
							<Loader2 className="h-8 w-8 animate-spin text-blue-500" />
							<p>Connecting your account... Please wait.</p>
						</div>
					)}
					{status === "success" && (
						<div className="text-center text-green-600">
							<p>{message}</p>
						</div>
					)}
					{status === "error" && (
						<div className="text-center text-red-600">
							<p>{message}</p>
						</div>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default SocialConnectCallback;
