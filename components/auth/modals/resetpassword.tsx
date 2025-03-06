"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import LoadingButton from "@/components/general/button/pending-button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { resetPasswordSchema } from "@/resolvers/auth-resolvers";
import { resetPasswordAction } from "@/server-actions/auth/reset-password";

const ResetPasswordForm = ({ uid, token }: { uid: string; token: string }) => {
	const router = useRouter();
	const form = useForm<z.infer<typeof resetPasswordSchema>>({
		resolver: zodResolver(resetPasswordSchema),
		defaultValues: {
			new_password: "",
			re_password: "",
		},
	});

	const submittin = async (values: z.infer<typeof resetPasswordSchema>) => {
		try {
			const apiRequest = await resetPasswordAction({
				data: {
					uid: uid,
					token: token,
					new_password: values.new_password,
					re_password: values.re_password,
				},
			});
			if (apiRequest.success) {
				toast.success(
					"Your password has been successfully reset. You can now log in with your new password.",
				);
				setTimeout(() => {
					router.push("/auth");
					// router.push("/auth?view=login");
				}, 5000);
			} else {
				toast.error(
					"Failed to reset password. Please try again or request a new reset link.",
				);
			}
		} catch {
			toast.error("Something went wrong. Please try again later.");
		}
	};

	return (
		<div className="grid gap-6">
			<div className="flex flex-col space-y-2 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">
					Reset Password
				</h1>
				<p className="text-sm text-muted-foreground">
					Enter your new password below. Make sure it&#39;s strong and unique.
				</p>
			</div>

			<Form {...form}>
				<form className={"space-y-6"} onSubmit={form.handleSubmit(submittin)}>
					<FormField
						name={"new_password"}
						control={form.control}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											type="password"
											autoComplete={"off"}
											placeholder="Enter your password"
											disabled={form.formState.isSubmitting}
											{...field}
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						name={"re_password"}
						control={form.control}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Confirm Password</FormLabel>
								<FormControl>
									<div className="relative">
										<Input
											type="password"
											disabled={form.formState.isSubmitting}
											autoComplete={"off"}
											placeholder="Enter your password"
											{...field}
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<LoadingButton
						pending={form.formState.isSubmitting}
						label={"Reset Passwords"}
					/>
				</form>
			</Form>
		</div>
	);
};

export default ResetPasswordForm;
