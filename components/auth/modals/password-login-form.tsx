"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FaEnvelope, FaLock } from "react-icons/fa";
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

const PasswordLoginForm = ({
	onToggleForm,
	onForgotPassword,
}: PasswordLoginFormProps) => {
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
		userStore.clearUser(); // Clear user information from Zustand store
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
		<div className="w-full space-y-6">
			<div className="flex flex-col space-y-2 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
				<p className="text-sm text-muted-foreground">
					Enter your credentials to sign in
				</p>
			</div>

			<Form {...form}>
				<form
					className="space-y-6"
					onSubmit={form.handleSubmit(submitPasswordLogin)}
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
					<FormField
						control={form.control}
						name="password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											type="password"
											placeholder="Enter your password"
											className="bg-neutral-100 pl-10 text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200"
											{...field}
										/>
										<FaLock className="absolute left-3 top-1/2 -translate-y-1/2 transform text-neutral-500" />
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
						Sign In
					</Button>
				</form>
			</Form>

			<div className="flex justify-between text-sm">
				<Button
					variant="link"
					onClick={onToggleForm}
					className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
				>
					Use Magic Link
				</Button>
				<Button
					variant="link"
					onClick={onForgotPassword}
					className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
				>
					Forgot Password?
				</Button>
			</div>
		</div>
	);
};

export default PasswordLoginForm;
