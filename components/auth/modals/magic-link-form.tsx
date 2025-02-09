"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { FaEnvelope } from "react-icons/fa";
import { toast } from "sonner";
import { z } from "zod";

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
import { clearCookies } from "@/lib/cookies/create-cookies";
import useLogoutStore from "@/lib/zustand/logout-store";
import useOrganizationStore from "@/lib/zustand/useorganization-store";
import useUserStore from "@/lib/zustand/useuser-store";
import { magicLinkSchema } from "@/resolvers/auth-resolvers";
import { requestMagicLink } from "@/server-actions/auth/magic-link";
import { signOut } from "@/server-actions/auth/signout";

interface MagicLinkFormProps {
	onToggleForm: () => void;
}

const MagicLinkForm = ({ onToggleForm }: MagicLinkFormProps) => {
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
		await clearCookies(); // Clear all cookies
		userStore.clearUser(); // Clear user information from Zustand store
		organizationStore.clearOrganization();
		logoutStore.clearLogout();
		await signOut();

		try {
			const apiRequest = await requestMagicLink(values);
			if (apiRequest.success) {
				toast.success("Magic link sent to your email!");
			} else {
				toast.error(apiRequest.message || "Failed to send magic link.");
			}
		} catch {
			toast.error("Something went wrong. Please try again later.");
		}
	};

	return (
		<div className="w-full space-y-6">
			<div className="flex flex-col space-y-2 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">
					Magic Link Login
				</h1>
				<p className="text-sm text-muted-foreground">
					Enter your email to receive a magic link
				</p>
			</div>

			<Form {...form}>
				<form
					className="space-y-6"
					onSubmit={form.handleSubmit(submitMagicLink)}
				>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											type="email"
											placeholder="Enter your email"
											className="bg-neutral-100 pl-10 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
											{...field}
										/>
										<FaEnvelope className="absolute left-3 top-1/2 -translate-y-1/2 transform text-neutral-500" />
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button
						type="submit"
						className="w-full"
						disabled={form.formState.isSubmitting}
					>
						Send Magic Link
					</Button>
				</form>
			</Form>

			<div className="text-center">
				<Button
					variant="link"
					onClick={onToggleForm}
					className="text-sm text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
				>
					Use Password Instead
				</Button>
			</div>
		</div>
	);
};

export default MagicLinkForm;
