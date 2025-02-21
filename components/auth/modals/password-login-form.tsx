"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { LockIcon, MailIcon } from "lucide-react";
import { useRouter } from "next/navigation";
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
import { deleteCookie } from "@/lib/cookies/create-cookies";
import useLogoutStore from "@/lib/zustand/logout-store";
import useOrganizationStore from "@/lib/zustand/useorganization-store";
import useUserStore from "@/lib/zustand/useuser-store";
import { loginSchema } from "@/resolvers/auth-resolvers";
import { loginUser } from "@/server-actions/auth/signin";
import { signOut } from "@/server-actions/auth/signout";

interface PasswordLoginFormProps {
	onToggleForm: () => void;
	onForgotPassword: () => void;
}

export function PasswordLoginForm({
	onToggleForm,
	onForgotPassword,
}: PasswordLoginFormProps) {
	const form = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const router = useRouter();
	const userStore = useUserStore();
	const logoutStore = useLogoutStore();
	const organizationStore = useOrganizationStore();

	const submitPasswordLogin = async (values: z.infer<typeof loginSchema>) => {
		await deleteCookie("firstLogin");
		userStore.clearUser();
		organizationStore.clearOrganization();
		logoutStore.clearLogout();
		await signOut();

		try {
			const apiRequest = await loginUser({
				email: values.email,
				password: values.password,
			});
			if (apiRequest?.message === "Invalid credentials.") {
				toast.error("Invalid credentials, please try again");
			} else if (apiRequest?.message === "Something went wrong.") {
				toast.error("Something went wrong. Please try again later.");
			} else {
				globalThis.window.location.reload();
				toast.success("Welcome back!");
			}
		} catch (error) {
			toast.error((error as Error).message);
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(submitPasswordLogin)}
				className="space-y-4"
			>
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
				<FormField
					control={form.control}
					name="password"
					render={({ field }) => (
						<FormItem>
							<FormLabel>Password</FormLabel>
							<FormControl>
								<div className="relative">
									<LockIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
									<Input
										type="password"
										placeholder="Enter your password"
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
					className="w-full"
					disabled={form.formState.isSubmitting}
				>
					Sign in
				</Button>
				<div className="flex items-center justify-between">
					<Button type="button" variant="link" onClick={onToggleForm}>
						Sign in with magic link
					</Button>
					<Button type="button" variant="link" onClick={onForgotPassword}>
						Forgot password?
					</Button>
				</div>
			</form>
		</Form>
	);
}
