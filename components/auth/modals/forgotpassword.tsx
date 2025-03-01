"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { MailIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import LoadingButton from "@/components/general/button/pending-button";
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
		<div className="grid gap-6">
			<div className="flex flex-col space-y-2 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">
					Forgot Password
				</h1>
				<p className="text-sm text-muted-foreground">
					Enter your email address and we&#39;ll send you a link to reset your
					password.
				</p>
			</div>

			<Form {...form}>
				<form className={"space-y-6"} onSubmit={form.handleSubmit(submittin)}>
					<FormField
						name={"email"}
						control={form.control}
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

					<LoadingButton
						pending={form.formState.isSubmitting}
						label={"Send Reset Link"}
					/>
				</form>
			</Form>
			<div className="text-center">
				<Button
					type="button"
					variant="link"
					className="w-full"
					onClick={() => setView("login")}
				>
					Sign in with password
				</Button>
			</div>
		</div>
	);
};

export default ForgotPasswordForm;
