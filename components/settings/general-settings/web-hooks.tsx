"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { useQuery } from "@tanstack/react-query";
import { AlertTriangle, Copy, Loader2 } from "lucide-react";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import useOrganizationStore from "@/lib/zustand/useorganization-store";
import { regenerateWebhookSchema } from "@/resolvers/organizations/organization-schema";
import { createRegenerateWebhook } from "@/server-actions/organizations/create-web-hook";
import { retriveWebhook } from "@/server-actions/organizations/retrieve-web-hook";

function copyToClipboard(text: string) {
	navigator.clipboard.writeText(text);
	toast.success("The Value has been copied to your clipboard.");
}

const blurWebhook = (url: string) => {
	const parts = url.split("/webhook/");
	if (parts.length !== 2) return url; // Return original if no token found

	const token = parts[1];

	// Truncate if more than 20 characters
	const truncatedToken = token.length > 20 ? token.slice(0, 20) : token;

	return (
		<span className="flex w-full items-center">
			{parts[0]}/token/
			<span className="w-full select-all blur-sm transition-all duration-200">
				{truncatedToken}*********************
			</span>
		</span>
	);
};

const blurSecretKey = (key: string) => {
	if (!key || key.length < 20) return key;
	const truncatedKey = key.slice(0, 22);
	return (
		<span className="flex items-center">
			<span className="select-all">{truncatedKey}</span>
			<span className="select-all blur-sm transition-all duration-200">
				*************************
			</span>
		</span>
	);
};

export function WebHookSettings() {
	const { organization } = useOrganizationStore();
	const [webhook, setWebhook] = useState<string | null>();
	const [isConnected, setIsConnected] = useState<boolean>(false);
	const [secretKey, setSecretKey] = useState<string | null>();
	const [isGeneratingWebhook, setIsGeneratingWebhook] = useState(false);
	const [isRegenerateWebhookDialogOpen, setIsRegenerateWebhookDialogOpen] =
		useState(false);
	// New state to track whether we're fetching webhook data
	const [isWebhookLoading, setIsWebhookLoading] = useState<boolean>(false);

	const { data } = useQuery({
		queryKey: ["retrieving_webhooks"],
		queryFn: async () => {
			const hooks = await retriveWebhook();
			setWebhook(undefined);
			setSecretKey(undefined);
			setIsWebhookLoading(false);
			console.log(hooks, "Hookes");

			if (hooks.success) {
				setWebhook(hooks.data.secret_key_url);
				setSecretKey(hooks.data.private_secret);
				setIsWebhookLoading(false);
				setIsConnected(true);
				return hooks;
			}

			if (hooks.error.message === "No webhook found for this organization.") {
				setIsConnected(true);
				setWebhook(undefined);
				setSecretKey(undefined);
				setIsWebhookLoading(false);
				return [];
			}

			if (!hooks.success) {
				setWebhook(undefined);
				setSecretKey(undefined);
				setIsWebhookLoading(false);
				setIsConnected(false);
				return [];
			}
			return hooks;
		},
		staleTime: Infinity, // Keep the data fresh indefinitely
		refetchOnMount: true,
		refetchOnWindowFocus: true,
		refetchOnReconnect: true,
	});

	const regenerateWebhookForm = useForm<
		z.infer<typeof regenerateWebhookSchema>
	>({
		resolver: zodResolver(regenerateWebhookSchema),
	});

	const regenerateWebhook = async () => {
		setIsGeneratingWebhook(true);
		try {
			const response = await createRegenerateWebhook();

			if (response.success) {
				setWebhook(response.data.secret_key_url);
				setSecretKey(response.data.private_secret);
				setIsGeneratingWebhook(false);
				setIsRegenerateWebhookDialogOpen(false);
				regenerateWebhookForm.reset();
				toast.success(response.data.message);
			} else {
				toast.error(response.error?.non_field_errors?.[0] || response.message);
			}
		} catch {
			toast.error("Failed to regenerate webhook, try again later");
		} finally {
			setIsGeneratingWebhook(false);
		}
	};

	const generateWebhook = async () => {
		setIsGeneratingWebhook(true);
		try {
			const response = await createRegenerateWebhook();
			if (response.success) {
				setWebhook(response.data.secret_key_url);
				setSecretKey(response.data.private_secret);
				toast.success(response.data.message);
			} else {
				toast.error(response.error?.non_field_errors?.[0] || response.message);
			}
		} catch {
			toast.error("Failed to create webhook, try again later");
		} finally {
			setIsGeneratingWebhook(false);
		}
	};

	const BlurredValue = ({ value, label }: { value: string; label: string }) => (
		<div className="w-full space-y-2 text-black">
			<Label className="text-white">{label}</Label>
			<div className="flex items-center space-x-2">
				<div className="w-full flex-grow overflow-hidden rounded-md bg-muted p-2 font-mono text-sm">
					<span className="flex items-center">
						{label === "Webhook URL" ? (
							<> {blurWebhook(value)} </>
						) : (
							<> {blurSecretKey(value)} </>
						)}
					</span>
				</div>
				<Button
					variant="outline"
					size="icon"
					onClick={() => copyToClipboard(value)}
				>
					<Copy className="h-4 w-4" />
				</Button>
			</div>
		</div>
	);

	// const getSocialStatus = async ({ connection }: { connection: boolean }) => {
	// 	setIsWebhookLoading(true);
	// 	// Retrieve the cached connection status.
	// 	// const connectionStatus = queryClient.getQueryData([
	// 	// 	"retrieving_social_status",
	// 	// ]) as boolean;
	// 	const connectionStatus = connection;
	// 	setIsConnected(connectionStatus);
	// 	setWebhook(undefined);
	// 	setSecretKey(undefined);
	// 	setIsWebhookLoading(false);

	// 	console.log("Devinsadasdaaaaaaaaaa");

	// 	// Only make the webhook request if the connection is true.
	// 	if (connectionStatus === true) {
	// 		const hooks = await retriveWebhook();
	// 		if (!hooks.success) {
	// 			setWebhook(undefined);
	// 			setSecretKey(undefined);
	// 			setIsWebhookLoading(false);
	// 			return [];
	// 		}
	// 		console.log(hooks);
	// 		setWebhook(hooks.data.secret_key_url);
	// 		setSecretKey(hooks.data.private_secret);
	// 		setIsWebhookLoading(false);
	// 		return hooks;
	// 	} else {
	// 		setWebhook(undefined);
	// 		setSecretKey(undefined);
	// 		setIsWebhookLoading(false);
	// 		return;
	// 	}
	// };

	// // Get the cached social status once (this value will update when the cache changes)
	// const socialStatus = queryClient.getQueryData([
	// 	"retrieving_social_status",
	// ]) as boolean;

	// // Run getSocialStatus() whenever the cached social status changes.
	// useEffect(() => {
	// 	getSocialStatus({
	// 		connection: socialStatus,
	// 	});
	// 	// eslint-disable-next-line react-hooks/exhaustive-deps
	// }, [socialStatus]);

	// Render a loading screen while the webhook data is being fetched
	if (isWebhookLoading) {
		return (
			<div className="flex h-full w-full items-center justify-center">
				{/* <LoadingScreen
					backgroundColor="#232528"
					iconColor="#fff"
					splashColor="rgba(255,255,255,0.3)"
					bubbleColor="rgba(255,255,255,0.2)"
					iconSize={80}
					bounceHeight={40}
					bounceDuration={1.8}
					splashDuration={1}
				/> */}
				Loading
			</div>
		);
	}

	console.log(isGeneratingWebhook, "Generating");
	console.log(isConnected, "Connected");

	return (
		<div className="flex w-full flex-col">
			<div className="w-full space-y-4 text-white">
				<h2 className="text-lg font-semibold">
					Webhook for {organization.name}
				</h2>
				{webhook && secretKey ? (
					<div className="space-y-4">
						<BlurredValue value={webhook} label="Webhook URL" />
						<BlurredValue value={secretKey} label="Secret Key" />
					</div>
				) : (
					<p>No webhook URL or secret key generated yet.</p>
				)}
				<div className="flex w-full justify-end pt-4">
					<Button
						onClick={
							isConnected && webhook
								? () => setIsRegenerateWebhookDialogOpen(true)
								: generateWebhook
						}
						disabled={isGeneratingWebhook || !isConnected}
					>
						{isGeneratingWebhook && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin text-black" />
						)}
						{webhook ? "Regenerate Webhook" : "Generate Webhook"}
					</Button>
				</div>
				{webhook && (
					<Alert>
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>Warning</AlertTitle>
						<AlertDescription>
							Regenerating the webhook will invalidate the previous URL. Only do
							this if you suspect the current webhook has been compromised or if
							you need to update your integrations.
						</AlertDescription>
					</Alert>
				)}
			</div>

			<Dialog
				open={isRegenerateWebhookDialogOpen}
				onOpenChange={setIsRegenerateWebhookDialogOpen}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Regenerate Webhook</DialogTitle>
						<DialogDescription>
							Are you sure you want to regenerate the webhook? This will
							invalidate the previous URL. Please enter the organization name to
							confirm.
						</DialogDescription>
					</DialogHeader>
					<div className="flex w-full items-center justify-start gap-[20px]">
						<Button
							type="submit"
							className="w-full"
							onClick={() => setIsRegenerateWebhookDialogOpen(false)}
							variant={"outline"}
							disabled={isGeneratingWebhook}
						>
							{isGeneratingWebhook && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							No
						</Button>
						<Button
							type="submit"
							className="w-full"
							onClick={() => regenerateWebhook()}
							disabled={isGeneratingWebhook}
						>
							{isGeneratingWebhook && (
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
							)}
							Confirm Regenerate
						</Button>
					</div>
				</DialogContent>
			</Dialog>
		</div>
	);
}
