"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Label } from "@radix-ui/react-label";
import { AlertTriangle, Copy, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useSocialStatus } from "@/hooks/settings/use-social-status";
import useRetrieveWebhook from "@/hooks/settings/use-webhook";
import useOrganizationStore from "@/lib/zustand/useorganization-store";
import { regenerateWebhookSchema } from "@/resolvers/organizations/organization-schema";
import { createRegenerateWebhook } from "@/server-actions/organizations/create-web-hook";

import WebHookOptions from "./webhook-options";

const copyToClipboard = (text: string) => {
	navigator.clipboard.writeText(text);
	toast.success("The value has been copied to your clipboard.");
};

const blurValue = (value: string, type: string) => {
	if (!value || value.length < 20) return value;
	const truncated = value.slice(0, 20);
	return (
		<span className="flex items-center">
			<span className="select-all">
				{type === "Webhook" ? `/token/${truncated}` : truncated}
			</span>
			<span className="select-all blur-sm transition-all duration-200">
				***************
			</span>
		</span>
	);
};

const BlurredValue = ({ value, label }: { value: string; label: string }) => (
	<div className="w-full space-y-2 text-black">
		<Label className="text-white">{label}</Label>
		<div className="flex items-center space-x-2">
			<div className="w-full flex-grow overflow-hidden rounded-md bg-muted p-2 font-mono text-sm">
				<span className="flex items-center">{blurValue(value, label)}</span>
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
			<div className="flex h-full w-full items-center justify-center">
				Loading...
			</div>
		);
	}

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

				{webhook && (
					<Alert>
						<AlertTriangle className="h-4 w-4" />
						<AlertTitle>Warning</AlertTitle>
						<AlertDescription>
							Regenerating the webhook will invalidate the previous URL. Only do
							this if you suspect it has been compromised.
						</AlertDescription>
					</Alert>
				)}

				<div className="flex w-full justify-end pt-4">
					<Button
						onClick={() => handleWebhook(!!webhook)}
						disabled={isGeneratingWebhook || !isConnected}
					>
						{isGeneratingWebhook && (
							<Loader2 className="mr-2 h-4 w-4 animate-spin text-black" />
						)}
						{webhook ? "Regenerate Webhook" : "Generate Webhook"}
					</Button>
				</div>

				<Separator />

				{isConnected && <WebHookOptions />}
			</div>
		</div>
	);
}
