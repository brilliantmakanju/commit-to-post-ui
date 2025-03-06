"use client";

import { useState } from "react";

import { MagicLinkForm } from "./magic-link-form";
import { PasswordLoginForm } from "./password-login-form";

interface LoginFormProps {
	setView: (view: "login" | "signup" | "forgot") => void;
}

export default function LoginForm({ setView }: LoginFormProps) {
	const [isMagicLink, setIsMagicLink] = useState(true);

	return (
		<div className="grid gap-6">
			<div className="flex flex-col space-y-2 text-center">
				<h1 className="text-2xl font-semibold tracking-tight">Welcome back</h1>
				<p className="text-sm text-muted-foreground">
					Sign in to your account to continue
				</p>
			</div>
			<MagicLinkForm onToggleForm={() => setIsMagicLink(false)} />
			{/* {isMagicLink ? (
			) : (
				<PasswordLoginForm
					onToggleForm={() => setIsMagicLink(true)}
					onForgotPassword={() => setView("forgot")}
				/>
			)}
			<div className="relative">
				<div className="absolute inset-0 flex items-center">
					<span className="w-full border-t" />
				</div>
				<div className="relative flex justify-center text-xs uppercase">
					<span className="bg-background px-2 text-muted-foreground">
						Don&apos;t have an account?
					</span>
				</div>
			</div>
			<button
				onClick={() => setView("signup")}
				className="text-sm text-primary underline-offset-4 hover:underline"
			>
				Sign up
			</button> */}
		</div>
	);
}
