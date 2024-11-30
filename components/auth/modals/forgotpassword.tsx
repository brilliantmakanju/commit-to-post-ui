"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type ViewType = "login" | "signup" | "forgot";

interface FormProps {
	setView: (view: ViewType) => void;
}

const ForgotPasswordForm: React.FC<FormProps> = ({ setView }) => (
	<div className="w-full max-w-md space-y-4 p-8">
		<h2 className="text-center text-2xl font-bold text-[#1E3A8A] dark:text-white">
			Forgot Password
		</h2>
		<p className="text-center text-sm text-[#4B5563] dark:text-[#E5E7EB]">
			Enter your email address and we&#39;ll send you a link to reset your
			password.
		</p>
		<form action="/api/auth/forgot-password" method="POST">
			<Input
				type="email"
				name="email"
				placeholder="Email"
				className="mb-4 bg-white text-[#4B5563] dark:bg-[#0A1930] dark:text-[#E5E7EB]"
				required
			/>
			<Button
				type="submit"
				className="w-full bg-[#3B82F6] text-white hover:bg-[#60A5FA]"
			>
				Send Reset Link
			</Button>
		</form>
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

export default ForgotPasswordForm;
