"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaArrowRight, FaEnvelope, FaLock, FaMagic } from "react-icons/fa";
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
import { loginUser } from "@/server-actions/auth/signin";

type ViewType = "login" | "signup" | "forgot";

interface FormProps {
	setView: (view: ViewType) => void;
}

const loginSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
	password: z
		.string()
		.min(6, { message: "Password must be at least 6 characters" }),
});

const magicLinkSchema = z.object({
	email: z.string().email({ message: "Invalid email address" }),
});

const LoginForm: React.FC<FormProps> = ({ setView }) => {
	const [isMagicLink, setIsMagicLink] = useState(true);
	const router = useRouter();

	const passwordForm = useForm<z.infer<typeof loginSchema>>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: "",
		},
	});

	const magicLinkForm = useForm<z.infer<typeof magicLinkSchema>>({
		resolver: zodResolver(magicLinkSchema),
		defaultValues: {
			email: "",
		},
	});

	const submitPasswordLogin = async (values: z.infer<typeof loginSchema>) => {
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
				router.push("/dashboard");
			}
		} catch (error) {
			toast.error((error as Error).message);
		}
	};

	const submitMagicLink = async (values: z.infer<typeof magicLinkSchema>) => {
		toast.success("Magic link sent to your email!");
	};

	return (
		<div className="w-full max-w-md space-y-4 rounded-lg bg-neutral-50 p-8 shadow-md dark:bg-neutral-900">
			<h2 className="text-center text-2xl font-bold text-neutral-800 dark:text-neutral-200">
				Log In
			</h2>

			{isMagicLink ? (
				<Form {...magicLinkForm}>
					<form
						className="space-y-6"
						onSubmit={magicLinkForm.handleSubmit(submitMagicLink)}
					>
						<FormField
							control={magicLinkForm.control}
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
							className="w-full bg-neutral-700 text-neutral-100 hover:bg-neutral-600 dark:bg-neutral-300 dark:text-neutral-800 dark:hover:bg-neutral-400"
						>
							<FaMagic className="mr-2" />
							Send Magic Link
						</Button>
					</form>
				</Form>
			) : (
				<Form {...passwordForm}>
					<form
						className="space-y-6"
						onSubmit={passwordForm.handleSubmit(submitPasswordLogin)}
					>
						<FormField
							control={passwordForm.control}
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
							control={passwordForm.control}
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
							className="w-full bg-neutral-700 text-neutral-100 hover:bg-neutral-600 dark:bg-neutral-300 dark:text-neutral-800 dark:hover:bg-neutral-400"
						>
							<FaArrowRight className="mr-2" />
							Login
						</Button>
					</form>
				</Form>
			)}

			<div className="mt-4 flex items-center justify-between">
				<button
					onClick={() => setIsMagicLink(!isMagicLink)}
					className="text-sm text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
				>
					{isMagicLink ? "Use Password" : "Use Magic Link"}
				</button>
				<button
					onClick={() => setView("forgot")}
					className="text-sm text-neutral-600 hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-neutral-200"
				>
					Forgot password?
				</button>
			</div>

			<div className="mt-6 text-center">
				<span className="text-sm text-neutral-600 dark:text-neutral-400">
					Don&apos;t have an account?{" "}
				</span>
				<button
					onClick={() => setView("signup")}
					className="text-sm text-neutral-800 hover:underline dark:text-neutral-200"
				>
					Sign up
				</button>
			</div>
		</div>
	);
};

export default LoginForm;
