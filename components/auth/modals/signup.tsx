"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { GithubIcon } from "lucide-react";
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
import { signupSchema } from "@/resolvers/auth-resolvers";
import { registerUser } from "@/server-actions/auth/signup";

interface SignupFormProps {
	setView: (view: "login" | "signup" | "forgot") => void;
}

export default function SignupForm({ setView }: SignupFormProps) {
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

	const onSubmit = async (values: z.infer<typeof signupSchema>) => {
		try {
			const apiRequest = await registerUser(values);
			if (apiRequest.success === true) {
				toast.success(
					"User successfully registered. Check your inbox to verify your account",
				);
				globalThis.window.history.pushState(undefined, "", "/auth?view=login");
			} else {
				toast.error(apiRequest.message);
			}
		} catch {
			toast.error("Something went wrong. Please try again later.");
		}
	};

	return (
		<div className="grid gap-6">
			<div className="flex flex-col space-y-2 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">
					Create an account
				</h1>
				<p className="text-sm text-muted-foreground">
					Enter your details below to create your account
				</p>
			</div>
			<Form {...form}>
				<form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
					<div className="grid gap-4 sm:grid-cols-2">
						<FormField
							control={form.control}
							name="first_name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>First name</FormLabel>
									<FormControl>
										<Input placeholder="John" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="last_name"
							render={({ field }) => (
								<FormItem>
									<FormLabel>Last name</FormLabel>
									<FormControl>
										<Input placeholder="Doe" {...field} />
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
					<FormField
						control={form.control}
						name="email"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Email</FormLabel>
								<FormControl>
									<Input
										placeholder="name@example.com"
										type="email"
										{...field}
									/>
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
									<Input type="password" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="re_password"
						render={({ field }) => (
							<FormItem>
								<FormLabel>Confirm Password</FormLabel>
								<FormControl>
									<Input type="password" {...field} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<Button type="submit" className="w-full">
						Create account
					</Button>
				</form>
			</Form>
			<div className="text-center text-sm text-muted-foreground">
				Already have an account?{" "}
				<button
					onClick={() => setView("login")}
					className="text-primary underline-offset-4 hover:underline"
				>
					Sign in
				</button>
			</div>
		</div>
	);
}
