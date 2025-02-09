"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { forgotPasswordSchema } from "@/resolvers/auth-resolvers";
import { forgotPasswordAction } from "@/server-actions/auth/forgot-password";

type ViewType = "login" | "signup" | "forgot";

interface FormProps {
	setView: (view: ViewType) => void;
}

const ForgotPasswordForm: React.FC<FormProps> = ({ setView }) => {
	const form = useForm<z.infer<typeof forgotPasswordSchema>>({
		resolver: zodResolver(forgotPasswordSchema),
		defaultValues: {
			email: "",
		},
	});

	const submittin = async (values: z.infer<typeof forgotPasswordSchema>) => {
		try {
			const apiRequest = await forgotPasswordAction({
				data: {
					email: values.email,
				},
			});
			if (apiRequest.success == true) {
				toast.success(
					"If the email is associated with an account, you'll receive a reset link shortly. Please check your inbox.",
				);
			} else {
				toast.error("Something went wrong. Please try again later.");
			}
		} catch {
			toast.error("Something went wrong. Please try again later.");
		}
	};

	return (
		<div className="w-full max-w-md space-y-4 p-8">
			<h2 className="text-center text-2xl font-bold text-[#1E3A8A] dark:text-white">
				Forgot Password
			</h2>
			<p className="text-center text-sm text-[#4B5563] dark:text-[#E5E7EB]">
				Enter your email address and we&#39;ll send you a link to reset your
				password.
			</p>

			<Form {...form}>
				<form className={"space-y-6"} onSubmit={form.handleSubmit(submittin)}>
					<FormField
						name={"email"}
						control={form.control}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										type="email"
										autoComplete={"off"}
										placeholder="Enter your email"
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
						label={"Send Reset Link"}
					/>
				</form>
			</Form>
			<div className="text-center">
				<button
					onClick={() => setView("login")}
					className="text-sm text-[#3B82F6] hover:underline dark:text-[#60A5FA]"
				>
					Back to Log In
				</button>
			</div>
		</div>
	);
};

export default ForgotPasswordForm;
