"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, MailIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { deleteCookie } from "@/lib/cookies/create-cookies";
import { requestMagicLink } from "@/server-actions/auth/magic-link";
import { signOut } from "@/server-actions/auth/signout";
import useAuthModalStore from "@/zustand/auth/use-auth-modal";
import useLogoutStore from "@/zustand/logout-store";
import useOrganizationStore from "@/zustand/useorganization-store";
import useUserStore from "@/zustand/useuser-store";

const REMEMBERED_EMAIL_KEY = "remembered_email";

const magicLinkSchema = z.object({
	email: z.string().email("Please enter a valid email address"),
	rememberMe: z.boolean().default(false),
});

export function MagicLinkForm() {
	const userStore = useUserStore();
	const logoutStore = useLogoutStore();
	const organizationStore = useOrganizationStore();
	const { openModal, setProcessing, isProcessing } = useAuthModalStore();

	const form = useForm<z.infer<typeof magicLinkSchema>>({
		resolver: zodResolver(magicLinkSchema),
		defaultValues: {
			email: "",
			rememberMe: false,
		},
	});

	// Load remembered email on mount
	useEffect(() => {
		const rememberedEmail = localStorage.getItem(REMEMBERED_EMAIL_KEY);
		if (rememberedEmail) {
			form.setValue("email", rememberedEmail);
			form.setValue("rememberMe", true);
		}
	}, [form]);

	const submitMagicLink = async (values: z.infer<typeof magicLinkSchema>) => {
		setProcessing(true);

		// Clear stores before login attempt
		organizationStore.clearOrganization();
		deleteCookie("firstLogin");
		logoutStore.clearLogout();
		userStore.clearUser();
		await signOut();

		try {
			const apiRequest = await requestMagicLink({ email: values.email });

			if (apiRequest.success) {
				// Handle remember me
				if (values.rememberMe) {
					localStorage.setItem(REMEMBERED_EMAIL_KEY, values.email);
				} else {
					localStorage.removeItem(REMEMBERED_EMAIL_KEY);
				}

				form.reset({ email: "", rememberMe: false });
				openModal("check-email");
			} else {
				toast.error(
					apiRequest.message === "fetch failed"
						? "Failed to send magic link."
						: apiRequest.message || "Failed to send magic link.",
				);
			}
		} catch {
			toast.error("Something went wrong. Please try again later.");
		} finally {
			setProcessing(false);
		}
	};

	const isSubmitting = form.formState.isSubmitting || isProcessing;

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
										disabled={isSubmitting}
										placeholder="name@example.com"
										className="pl-10"
										autoComplete="email"
										{...field}
									/>
								</div>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>

				<FormField
					control={form.control}
					name="rememberMe"
					render={({ field }) => (
						<FormItem className="flex flex-row items-start space-x-3 space-y-0">
							<FormControl>
								<Checkbox
									checked={field.value}
									onCheckedChange={field.onChange}
									disabled={isSubmitting}
								/>
							</FormControl>
							<div className="space-y-1 leading-none">
								<FormLabel className="text-sm font-normal">
									Remember my email
								</FormLabel>
							</div>
						</FormItem>
					)}
				/>

				<Button
					type="submit"
					className="flex w-full items-center justify-center gap-2"
					disabled={isSubmitting}
				>
					{isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
					Send Magic Link
				</Button>
			</form>
		</Form>
	);
}
