"use client";

import { Mail } from "lucide-react";

import {
	Card,
	CardContent,
	CardDescription,
	CardFooter,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import useAuthModalStore from "@/zustand/auth/use-auth-modal";

export default function CheckEmailModal() {
	const { openModal, isProcessing } = useAuthModalStore();

	return (
		<div className="flex items-center justify-center px-4">
			<Card className="w-full max-w-md">
				<CardHeader>
					<CardTitle className="text-2xl">Check your email</CardTitle>
					<CardDescription>
						We&apos;ve sent a magic link to your email address
					</CardDescription>
				</CardHeader>
				<CardContent className="flex flex-col items-center space-y-4 py-4">
					<div className="rounded-full bg-primary/10 p-6">
						<Mail className="h-12 w-12 text-primary" />
					</div>
					<p className="text-center text-sm text-muted-foreground">
						Click the link in the email to sign in to your account. If you
						don&apos;t see the email, check your spam folder.
					</p>
				</CardContent>
				<CardFooter className="flex flex-col space-y-4">
					<div className="text-center text-sm">
						<span
							onClick={() => !isProcessing && openModal("login")}
							className={`text-primary underline-offset-4 hover:underline ${
								isProcessing
									? "cursor-not-allowed opacity-50"
									: "cursor-pointer"
							}`}
						>
							Back to login
						</span>
					</div>
				</CardFooter>
			</Card>
		</div>
	);
}
