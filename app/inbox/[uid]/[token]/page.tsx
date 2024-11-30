"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { motion } from "framer-motion";
import { CheckCircle, XCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import ButtonLoader from "@/components/general/button/button-loader";
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
import { resendActivationToken } from "@/resolvers/auth-resolvers";
import {
	activateAccount,
	resendActivationEmail,
} from "@/server-actions/auth/activate-account";

interface PageProps {
	params: {
		uid: string;
		token: string;
	};
}

export default function VerifyEmailPage({ params }: PageProps) {
	const [verificationStatus, setVerificationStatus] = useState<
		"verifying" | "success" | "error"
	>("verifying");
	const router = useRouter();

	const verifyEmail = useCallback(async () => {
		const { uid, token } = await params;

		try {
			const verifyTokenActivate = await activateAccount({
				data: { token, uid },
			});

			if (verifyTokenActivate.success) {
				setVerificationStatus("success");
			} else {
				setVerificationStatus("error");
			}
		} catch {
			setVerificationStatus("error");
		}
	}, [params]); // Dependency array includes `params`

	useEffect(() => {
		verifyEmail();
	}, [verifyEmail]); // Now it won't re-run unnecessarily

	const form = useForm<z.infer<typeof resendActivationToken>>({
		resolver: zodResolver(resendActivationToken),
		defaultValues: {
			email: "",
		},
	});

	const resendActivationLink = async (
		values: z.infer<typeof resendActivationToken>,
	) => {
		try {
			// console.log(values);
			const apiRequest = await resendActivationEmail({
				data: {
					email: values.email,
				},
			});
			if (apiRequest.success == true) {
				toast.success("Check your Inbox to verify your account");
			} else {
				toast.error("Something went wrong, please try again");
			}
		} catch {}
	};

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			<div className="w-full max-w-md rounded-2xl bg-zinc-900 p-8">
				<div className="mb-6 flex justify-center">
					{verificationStatus === "verifying" && (
						<motion.div
							className="relative h-8 w-8"
							animate={{ rotate: 360 }}
							transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
						>
							<div className="absolute left-1/2 top-0 h-2 w-2 -translate-x-1/2 rounded-full bg-blue-400" />
							<div className="absolute bottom-0 left-1/2 h-2 w-2 -translate-x-1/2 rounded-full bg-violet-400" />
						</motion.div>
					)}
					{verificationStatus === "success" && (
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: "spring", stiffness: 260, damping: 20 }}
						>
							<CheckCircle className="h-12 w-12 text-green-500" />
						</motion.div>
					)}
					{verificationStatus === "error" && (
						<motion.div
							initial={{ scale: 0 }}
							animate={{ scale: 1 }}
							transition={{ type: "spring", stiffness: 260, damping: 20 }}
						>
							<XCircle className="h-12 w-12 text-red-500" />
						</motion.div>
					)}
				</div>

				<h2 className="mb-3 text-center text-xl font-medium text-white">
					{verificationStatus === "verifying" && "Verifying your email"}
					{verificationStatus === "success" && "Email verified successfully"}
					{verificationStatus === "error" && "Email verification failed"}
				</h2>

				<p className="mb-6 text-center text-sm text-zinc-400">
					{verificationStatus === "verifying" &&
						"Please wait while we confirm your email address..."}
					{verificationStatus === "success" &&
						"Your email has been successfully verified. You can now access your account."}
				</p>

				{verificationStatus === "error" && (
					<div className={"flex w-full flex-col justify-items-center"}>
						<p className="mb-6 text-center text-sm text-zinc-400">
							We encountered an issue while verifying your email. Please try
							again or contact support.
						</p>
						<Form {...form}>
							<form
								className={"w-full space-y-6"}
								onSubmit={form.handleSubmit(resendActivationLink)}
							>
								<FormField
									name={"email"}
									control={form.control}
									render={({ field }) => (
										<FormItem>
											<FormLabel className={"hidden text-white"}>
												Email
											</FormLabel>
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

								<div className="flex w-full justify-center gap-3">
									<Button
										variant="secondary"
										className="w-full bg-white text-black hover:bg-zinc-200"
										type={"submit"}
										disabled={form.formState.isSubmitting}
									>
										{form.formState.isSubmitting ? (
											<ButtonLoader />
										) : (
											<>Resend Link</>
										)}
									</Button>
									<Button
										variant="outline"
										className="border-zinc-700 bg-transparent text-white hover:bg-zinc-800 hover:text-white"
										onClick={() =>
											(globalThis.window.location.href = "/support")
										}
									>
										Contact Support
									</Button>
								</div>
							</form>
						</Form>
					</div>
				)}

				<div className="flex justify-center gap-3">
					{verificationStatus === "success" && (
						<Button
							variant="secondary"
							className="bg-white text-black hover:bg-zinc-200"
							onClick={() => router.push("/auth?view-login")}
						>
							Login
						</Button>
					)}
					{verificationStatus === "success" && (
						<Button
							variant="outline"
							className="border-zinc-700 bg-transparent text-white hover:bg-zinc-800 hover:text-white"
							onClick={() => (globalThis.window.location.href = "/support")}
						>
							Contact Support
						</Button>
					)}
				</div>
			</div>
		</div>
	);
}
