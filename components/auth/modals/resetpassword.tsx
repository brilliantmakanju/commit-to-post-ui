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
					router.push("/auth?view=login");
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
		<div className="w-full max-w-md space-y-4 p-8">
			<h2 className="text-center text-2xl font-bold text-[#1E3A8A] dark:text-white">
				Reset Password
			</h2>
			<p className="text-center text-sm text-[#4B5563] dark:text-[#E5E7EB]">
				Enter your new password below. Make sure it&#39;s strong and unique.
			</p>

			<Form {...form}>
				<form className={"space-y-6"} onSubmit={form.handleSubmit(submittin)}>
					<FormField
						name={"new_password"}
						control={form.control}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Password</FormLabel>
								<FormControl>
									<Input
										type="password"
										autoComplete={"off"}
										placeholder="Enter your password"
										className="mb-4 bg-white text-[#4B5563] dark:bg-[#0A1930] dark:text-[#E5E7EB]"
										{...field}
									/>
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
									<Input
										type="password"
										autoComplete={"off"}
										placeholder="Confirm your password"
										className="mb-4 bg-white text-[#4B5563] dark:bg-[#0A1930] dark:text-[#E5E7EB]"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<LoadingButton
						pending={form.formState.isSubmitting}
						label={"Reset Password"}
					/>
				</form>
			</Form>
		</div>
	);
};

export default ResetPasswordForm;
