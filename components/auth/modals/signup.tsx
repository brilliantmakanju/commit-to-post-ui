"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaGithub, FaGoogle } from "react-icons/fa";
// import { useToast } from "@/hooks/use-toast";
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
import { signupSchema } from "@/resolvers/auth-resolvers";
import { registerUser } from "@/server-actions/auth/signup";

type ViewType = "login" | "signup" | "forgot";

interface FormProps {
	setView: (view: ViewType) => void;
}

const SignupForm = ({ setView }: FormProps) => {
	const form = useForm<z.infer<typeof signupSchema>>({
		resolver: zodResolver(signupSchema),
		defaultValues: {
			first_name: "",
			last_name: "",
			email: "",
			password: "",
			re_password: "",
		},
	});
	const [showSocial, setShowSocial] = useState(false);

	const submittin = async (values: z.infer<typeof signupSchema>) => {
		try {
			const apiRequest = await registerUser(values);
			if (apiRequest.success == true) {
				toast.success(
					"User successfully registered, Check your Inbox to verify your account",
				);
				globalThis.globalThis.window.history.pushState(
					undefined,
					"",
					"/auth?view=login",
				);
			} else {
				toast.error(apiRequest.message);
			}
		} catch {
			toast.error("Something went wrong. Please try again later.");
		}
	};

	return (
		<div className="w-full max-w-md space-y-4 p-8">
			<h2 className="text-center text-2xl font-bold text-[#1E3A8A] dark:text-white">
				Sign Up
			</h2>
			{showSocial && (
				<>
					<Button
						className="w-full bg-white text-[#4B5563] hover:bg-[#F3F4F6] dark:bg-[#3B82F6] dark:text-white dark:hover:bg-[#60A5FA]"
						variant="outline"
						onClick={() =>
							(globalThis.window.location.href =
								"/api/auth/login?connection=google-oauth2")
						}
					>
						<FaGoogle className="mr-2" /> Continue with Google
					</Button>
					<Button
						className="w-full bg-white text-[#4B5563] hover:bg-[#F3F4F6] dark:bg-[#3B82F6] dark:text-white dark:hover:bg-[#60A5FA]"
						variant="outline"
						onClick={() =>
							(globalThis.window.location.href =
								"/api/auth/login?connection=github")
						}
					>
						<FaGithub className="mr-2" /> Continue with GitHub
					</Button>
				</>
			)}
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t border-[#4B5563] dark:border-[#E5E7EB]" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-[#F0F4F8] px-2 text-[#4B5563] dark:bg-[#1E3A8A] dark:text-[#E5E7EB]">
						Or continue with
					</span>
				</div>
			</div>
			<Form {...form}>
				<form className={"space-y-6"} onSubmit={form.handleSubmit(submittin)}>
					<FormField
						name={"first_name"}
						control={form.control}
						render={({ field }) => (
							<FormItem>
								<FormLabel>First Name</FormLabel>
								<FormControl>
									<Input
										type="text"
										autoComplete={"off"}
										placeholder="Enter your first name"
										className="mb-4 bg-white text-[#4B5563] dark:bg-[#0A1930] dark:text-[#E5E7EB]"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

					<FormField
						name={"last_name"}
						control={form.control}
						render={({ field }) => (
							<FormItem>
								<FormLabel>Last Name</FormLabel>
								<FormControl>
									<Input
										type="text"
										autoComplete={"off"}
										placeholder="Enter your last name"
										className="mb-4 bg-white text-[#4B5563] dark:bg-[#0A1930] dark:text-[#E5E7EB]"
										{...field}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>

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

					<FormField
						name={"password"}
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
						label={"Sign up"}
					/>
				</form>
			</Form>
			<div className="text-center">
				<span className="text-sm">Already have an account? </span>
				<button
					onClick={() => setView("login")}
					className="text-sm text-[#3B82F6] hover:underline dark:text-[#60A5FA]"
				>
					Log in
				</button>
			</div>
		</div>
	);
};

export default SignupForm;
