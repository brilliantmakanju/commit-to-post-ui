"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import {
	AlertTriangle,
	Code,
	Copy,
	Loader2,
	RefreshCw,
	Webhook,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSocialStatus } from "@/hooks/settings/use-social-status";
import useRetrieveWebhook from "@/hooks/settings/use-webhook";
import useOrganizationStore from "@/lib/zustand/useorganization-store";
import { regenerateWebhookSchema } from "@/resolvers/organizations/organization-schema";
import { createRegenerateWebhook } from "@/server-actions/organizations/create-web-hook";

import WebHookOptions from "./webhook-options";
import AISettingsLoader from "./webhook-options-loader";

const copyToClipboard = (text: string) => {
	navigator.clipboard.writeText(text);
	toast.success("The value has been copied to your clipboard.");
};

const blurValue = (value: string, type: string) => {
	if (!value || value.length < 20) return value;
	const truncated = value.slice(0, 20);
	return (
		<span className="flex items-center">
			<span className="select-all font-mono">
				{type === "Webhook" ? `/token/${truncated}` : truncated}
			</span>
			<span className="select-all font-mono blur-sm transition-all duration-200">
				***************
			</span>
		</span>
	);
};

const BlurredValue = ({ value, label }: { value: string; label: string }) => (
	<div className="w-full space-y-2">
		<label className="text-sm font-medium text-zinc-300">{label}</label>
		<div className="flex items-center space-x-2">
			<div className="w-full flex-grow overflow-hidden rounded-md border border-[#232323] bg-[#121212] p-2 text-sm text-zinc-300">
				<span className="flex items-center">{blurValue(value, label)}</span>
			</div>
			<Button
				variant="outline"
				size="icon"
				onClick={() => copyToClipboard(value)}
				className="border-[#232323] bg-[#1A1A1A] text-white hover:bg-[#232323]"
			>
				<Copy className="h-4 w-4" />
			</Button>
		</div>
	</div>
);

const BlurredValueLoader = ({ label }: { label: string }) => (
	<div className="w-full space-y-2">
		<label className="text-sm font-medium text-zinc-300">{label}</label>
		<div className="flex items-center space-x-2">
			<div className="w-full flex-grow overflow-hidden rounded-md border border-[#232323] bg-[#121212] p-2 text-sm text-zinc-500">
				<span className="flex items-center">
					<span className="select-all font-mono">••••••••••••••••••••</span>
					<span className="select-all font-mono blur-sm transition-all duration-200">
						***************
					</span>
				</span>
			</div>
			<Button
				variant="outline"
				size="icon"
				disabled
				className="border-[#232323] bg-[#1A1A1A] text-zinc-500"
			>
				<Loader2 className="h-4 w-4 animate-spin" />
			</Button>
		</div>
	</div>
);

const WebhookLoader = () => (
	<div className="space-y-4">
		<Alert className="border border-[#232323] bg-[#121212]">
			<AlertTriangle className="h-4 w-4 text-amber-500" />
			<AlertTitle className="text-zinc-300">Loading Webhook</AlertTitle>
			<AlertDescription className="text-zinc-400">
				Retrieving webhook information...
			</AlertDescription>
		</Alert>

		<div className="flex w-full justify-end pt-4">
			<Button
				variant="outline"
				disabled
				className="border-[#232323] bg-[#1A1A1A] text-zinc-500"
			>
				<Loader2 className="mr-2 h-4 w-4 animate-spin" />
				Loading...
			</Button>
		</div>
	</div>
);

export function WebHookSettings() {
	const { organization } = useOrganizationStore();
	const [isGeneratingWebhook, setIsGeneratingWebhook] = useState(false);
	const { data: socialStatus } = useSocialStatus();
	const {
		webhook: webhookKey,
		secretKey: secretHookKey,
		isWebhookLoading,
		refetchWebhook,
	} = useRetrieveWebhook();

	const isConnected = !!socialStatus;

	const [webhook, setWebhook] = useState<string | null>(webhookKey);
	const [secretKey, setSecretKey] = useState<string | null>(secretHookKey);

	const regenerateWebhookForm = useForm({
		resolver: zodResolver(regenerateWebhookSchema),
	});

	useEffect(() => {
		setWebhook(webhookKey);
		setSecretKey(secretHookKey);
	}, [webhookKey, secretHookKey]);

	const handleWebhook = async (isRegenerate = false) => {
		setIsGeneratingWebhook(true);
		try {
			const response = await createRegenerateWebhook();
			if (response.success) {
				setWebhook(response.data.secret_key_url);
				setSecretKey(response.data.private_secret);
				toast.success(response.data.message);
				await refetchWebhook();
				if (isRegenerate) {
					regenerateWebhookForm.reset();
				}
			} else {
				toast.error(response.error?.non_field_errors?.[0] || response.message);
			}
		} catch {
			toast.error("Failed to process webhook, try again later");
		} finally {
			setIsGeneratingWebhook(false);
		}
	};

	if (isWebhookLoading) {
		return (
			<div className="flex w-full flex-col">
				<div className="w-full space-y-4 text-white">
					<div className="mb-2 flex items-center gap-2">
						<Webhook className="h-5 w-5 text-[#4F46E5]" />
						<h2 className="text-xl font-semibold text-white">
							Webhook Configuration
						</h2>
					</div>

					<Card className="border-[#232323] bg-[#121212] p-4">
						<CardHeader className="px-0 pt-0">
							<CardTitle className="text-lg font-medium text-white">
								Webhook for {organization.name}
							</CardTitle>
						</CardHeader>
						<CardContent className="px-0 pb-0">
							<div className="w-full space-y-4">
								<BlurredValueLoader label="Webhook URL" />
								<BlurredValueLoader label="Secret Key" />
							</div>

							<WebhookLoader />
						</CardContent>
					</Card>

					{isConnected && <AISettingsLoader />}
				</div>
			</div>
		);
	}

	return (
		<div className="flex w-full flex-col">
			<div className="w-full space-y-4 text-white">
				<div className="mb-2 flex items-center gap-2">
					<Webhook className="h-5 w-5 text-[#4F46E5]" />
					<h2 className="text-xl font-semibold text-white">
						Webhook Configuration
					</h2>
				</div>

				<Card className="border-[#232323] bg-[#121212] p-4">
					<CardHeader className="px-0 pt-0">
						<CardTitle className="text-lg font-medium text-white">
							Webhook for {organization.name}
						</CardTitle>
					</CardHeader>
					<CardContent className="px-0 pb-0">
						{webhook && secretKey ? (
							<div className="space-y-4">
								<BlurredValue value={webhook} label="Webhook URL" />
								<BlurredValue value={secretKey} label="Secret Key" />
							</div>
						) : (
							<div className="mb-4 rounded-md border border-[#232323] bg-[#1A1A1A] p-4">
								<div className="mb-2 flex items-center">
									<Code className="mr-2 h-5 w-5 text-amber-500" />
									<p className="font-medium text-zinc-300">
										No webhook configured
									</p>
								</div>
								<p className="text-sm text-zinc-400">
									Generate a webhook to automatically create posts from your
									commits.
								</p>
							</div>
						)}

						{webhook && (
							<Alert className="mt-4 border border-[#232323] bg-[#1A1A1A]">
								<AlertTriangle className="h-4 w-4 text-amber-500" />
								<AlertTitle className="font-medium text-zinc-300">
									Warning
								</AlertTitle>
								<AlertDescription className="text-zinc-400">
									Regenerating the webhook will invalidate the previous URL.
									Only do this if you suspect it has been compromised.
								</AlertDescription>
							</Alert>
						)}

						<div className="flex w-full justify-end pt-4">
							<Button
								variant="default"
								onClick={() => handleWebhook(!!webhook)}
								disabled={isGeneratingWebhook || !isConnected}
								className="bg-[#4F46E5] text-white hover:bg-[#4338CA] disabled:bg-[#232323] disabled:text-zinc-500"
							>
								{isGeneratingWebhook ? (
									<div className="flex items-center">
										<Loader2 className="mr-2 h-4 w-4 animate-spin" />
										<span>{webhook ? "Regenerating..." : "Generating..."}</span>
									</div>
								) : (
									<div className="flex items-center">
										<RefreshCw className="mr-2 h-4 w-4" />
										<span>
											{webhook ? "Regenerate Webhook" : "Generate Webhook"}
										</span>
									</div>
								)}
							</Button>
						</div>
					</CardContent>
				</Card>

				{isConnected && <WebHookOptions />}
			</div>
		</div>
	);
}
