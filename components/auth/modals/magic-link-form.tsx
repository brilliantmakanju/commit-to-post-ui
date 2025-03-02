"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	clearCookies,
	createEncryptedCookie,
} from "@/lib/cookies/create-cookies";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import useLogoutStore from "@/lib/zustand/logout-store";
import useOrganizationStore from "@/lib/zustand/useorganization-store";
import useUserStore from "@/lib/zustand/useuser-store";
import { magicLinkSchema } from "@/resolvers/auth-resolvers";
import { requestMagicLink } from "@/server-actions/auth/magic-link";
import { signOut } from "@/server-actions/auth/signout";

interface MagicLinkFormProps {
	onToggleForm: () => void;
}

export function MagicLinkForm({ onToggleForm }: MagicLinkFormProps) {
	const form = useForm<z.infer<typeof magicLinkSchema>>({
		resolver: zodResolver(magicLinkSchema),
		defaultValues: {
			email: "",
		},
	});

	const userStore = useUserStore();
	const organizationStore = useOrganizationStore();
	const logoutStore = useLogoutStore();

	const submitMagicLink = async (values: z.infer<typeof magicLinkSchema>) => {
		const planData = await getDecryptedCookie("subscribing");
		await clearCookies();
		await createEncryptedCookie("subscribing", {
			plan: planData?.plan,
			type: planData?.type,
		});
		userStore.clearUser();
		organizationStore.clearOrganization();
		logoutStore.clearLogout();
		await signOut();

		try {
			const apiRequest = await requestMagicLink(values);
			if (apiRequest.success) {
				toast.success("Magic link sent to your email!");
			} else {
				toast.error(
					apiRequest.message === "fetch failed"
						? "Failed to send magic link."
						: apiRequest.message || "Failed to send magic link.",
				);
			}
		} catch {
			toast.error("Something went wrong. Please try again later.");
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(submitMagicLink)} className="space-y-4">
				<FormField
					control={form.control}
					name="email"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Email</FormLabel>
							<FormControl>
								<div className="relative">
									<MailIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										disabled={form.formState.isSubmitting}
										placeholder="name@example.com"
										className="pl-10"
										{...field}
									/>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button
					type="submit"
					className="flex w-full items-center justify-center gap-2"
					disabled={form.formState.isSubmitting}
				>
					{form.formState.isSubmitting && (
						<Loader2 className="h-4 w-4 animate-spin" />
					)}
					Send Magic Link
				</Button>
				<Button
					type="button"
					variant="link"
					className="w-full"
					onClick={onToggleForm}
				>
					Sign in with password
				</Button>
			</form>
		</Form>
	);
}
