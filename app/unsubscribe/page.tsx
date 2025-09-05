"use client";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, useTransition } from "react";
import {
	FaArrowLeft,
	FaCheck,
	FaCog,
	FaDiscord,
	FaEnvelope,
	FaGithub,
	FaHeart,
	FaLinkedin,
	FaRocket,
	FaSpinner,
	FaStar,
	FaTimes,
} from "react-icons/fa";

import {
	unsubscribeUser,
	validateUnsubscribeToken,
} from "@/server-actions/emails/unsubscribe";

const XIcon: React.FC<{ className?: string }> = ({ className }) => (
	<svg viewBox="0 0 24 24" className={className} fill="currentColor">
		<path d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932L18.901 1.153ZM17.61 20.644h2.039L6.486 3.24H4.298L17.61 20.644Z" />
	</svg>
);

const UnsubscribePage = () => {
	const searchParams = useSearchParams();
	const [state, setState] = useState("loading");
	const [isPending, startTransition] = useTransition();

	const token = searchParams.get("token");
	const userId = searchParams.get("pops");

	useEffect(() => {
		if (!token || !userId) {
			setState("invalid");
			return;
		}

		startTransition(async () => {
			try {
				await validateUnsubscribeToken(token, userId);
				setState("confirm");
			} catch {
				setState("invalid");
			}
		});
	}, [token, userId]);

	const handleUnsubscribe = async () => {
		if (!token || !userId) return;

		setState("loading");
		startTransition(async () => {
			try {
				const formData = new FormData();
				formData.append("token", token);
				formData.append("user_id", userId);

				const result = await unsubscribeUser(formData);
				if (result.success) {
					setState("success");
				} else {
					setState("error");
				}
			} catch {
				setState("error");
			}
		});
	};

	// All supported integrations
	const integrations = [
		{ icon: FaLinkedin, name: "LinkedIn", color: "text-blue-700" },
		{ icon: FaDiscord, name: "Discord", color: "text-indigo-600" },
	];

	const handleStaySubscribed = () => {
		setState("stay");
	};

	const handleTryAgain = () => {
		setState("confirm");
	};

	const renderConfirmStep = () => (
		<div className="space-y-6 text-center">
			{/* Animated Icon */}
			<div className="relative mx-auto mb-8 h-20 w-20">
				<div className="absolute inset-0 rotate-12 transform rounded-2xl bg-gray-100"></div>
				<div className="relative flex items-center justify-center rounded-2xl border-2 border-gray-200 bg-white p-4 shadow-sm">
					<FaEnvelope className="text-2xl text-gray-700" />
				</div>
			</div>

			{/* Content */}
			<div className="space-y-4">
				<h1 className="text-2xl font-semibold text-gray-900">
					Unsubscribe from Push to Post?
				</h1>
				<p className="mx-auto max-w-md leading-relaxed text-gray-600">
					You&apos;ll no longer receive notifications about your git commits
					being auto-posted to your connected social platforms.
				</p>
			</div>

			{/* Integration Icons Grid */}
			<div className="grid grid-cols-3 gap-3 py-6">
				{integrations.slice(0, 2).map((integration, index) => (
					<div
						key={integration.name}
						className="flex flex-col items-center gap-2"
					>
						<div className="rounded-xl bg-gray-50 p-2 transition-colors hover:bg-gray-100">
							<integration.icon className={`text-lg ${integration.color}`} />
						</div>
						<span className="text-xs font-medium text-gray-500">
							{integration.name}
						</span>
					</div>
				))}
				<div className="flex flex-col items-center gap-2">
					<div className="rounded-xl bg-gray-50 p-2 transition-colors hover:bg-gray-100">
						<XIcon className="h-6 w-6" />
					</div>
					<span className="text-xs font-medium text-gray-500">X (Twitter)</span>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="space-y-3 pt-4">
				<button
					onClick={handleUnsubscribe}
					disabled={isPending}
					className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition-all duration-200 hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-70"
				>
					<FaTimes className="text-sm" />
					Yes, unsubscribe me
				</button>

				<button
					onClick={handleStaySubscribed}
					className="flex w-full items-center justify-center gap-2 rounded-lg px-6 py-3 font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
				>
					<FaHeart className="text-sm text-red-500" />
					Keep me subscribed
				</button>
			</div>
		</div>
	);

	const renderLoadingStep = () => (
		<div className="space-y-6 text-center">
			{/* Loading Animation */}
			<div className="relative mx-auto mb-8 h-20 w-20">
				<div className="absolute inset-0 rounded-2xl bg-gray-100"></div>
				<div className="relative flex items-center justify-center rounded-2xl border-2 border-gray-200 bg-white p-4 shadow-sm">
					<FaSpinner className="animate-spin text-2xl text-gray-700" />
				</div>
			</div>

			{/* Content */}
			<div className="space-y-4">
				<h1 className="text-2xl font-semibold text-gray-900">Processing...</h1>
				<p className="mx-auto max-w-md leading-relaxed text-gray-600">
					We&apos;re updating your notification preferences. This will only take
					a moment.
				</p>
			</div>

			{/* Progress bar */}
			<div className="mx-auto h-2 w-full max-w-xs rounded-full bg-gray-200">
				<div
					className="h-2 animate-pulse rounded-full bg-gray-900"
					style={{ width: "70%" }}
				></div>
			</div>
		</div>
	);

	const renderSuccessStep = () => (
		<div className="space-y-6 text-center">
			{/* Success Icon */}
			<div className="relative mx-auto mb-8 h-20 w-20">
				<div className="absolute inset-0 rounded-2xl bg-green-50"></div>
				<div className="relative flex items-center justify-center rounded-2xl border-2 border-green-200 bg-white p-4 shadow-sm">
					<FaCheck className="text-2xl text-green-600" />
				</div>
			</div>

			{/* Content */}
			<div className="space-y-4">
				<h1 className="text-2xl font-semibold text-gray-900">
					Successfully Unsubscribed
				</h1>
				<p className="mx-auto max-w-md leading-relaxed text-gray-600">
					You&apos;ve been removed from Push to Post notifications.
				</p>
			</div>

			{/* What they'll miss */}
			<div className="space-y-2 rounded-xl bg-gray-50 p-4 text-left">
				<p className="mb-3 text-sm font-medium text-gray-700">
					You&apos;ll no longer receive:
				</p>
				<div className="space-y-2">
					<div className="flex items-center gap-2 text-sm text-gray-600">
						<FaTimes className="text-xs text-red-500" />
						Commit notifications
					</div>
					<div className="flex items-center gap-2 text-sm text-gray-600">
						<FaTimes className="text-xs text-red-500" />
						Social media posting updates
					</div>
					<div className="flex items-center gap-2 text-sm text-gray-600">
						<FaTimes className="text-xs text-red-500" />
						Integration status alerts
					</div>
				</div>
			</div>

			{/* Action Button */}
			<div className="pt-4">
				<button
					onClick={() => window.close()}
					className="w-full rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-gray-800"
				>
					Close Window
				</button>
			</div>
		</div>
	);

	const renderStayStep = () => (
		<div className="space-y-6 text-center">
			{/* Happy Icon */}
			<div className="relative mx-auto mb-8 h-20 w-20">
				<div className="absolute inset-0 -rotate-6 transform rounded-2xl bg-blue-50"></div>
				<div className="relative flex items-center justify-center rounded-2xl border-2 border-blue-200 bg-white p-4 shadow-sm">
					<FaRocket className="text-2xl text-blue-600" />
				</div>
			</div>

			{/* Content */}
			<div className="space-y-4">
				<h1 className="text-2xl font-semibold text-gray-900">
					Excellent choice!
				</h1>
				<p className="mx-auto max-w-md leading-relaxed text-gray-600">
					Keep showcasing your development journey! Your git commits will
					continue being shared across your social platforms automatically.
				</p>
			</div>

			{/* Feature highlights */}
			<div className="space-y-3 rounded-xl bg-gradient-to-r from-blue-50 to-indigo-50 p-4">
				<div className="flex items-center gap-3 text-sm text-gray-700">
					<FaCheck className="text-xs text-green-500" />
					Smart commit message formatting
				</div>
				<div className="flex items-center gap-3 text-sm text-gray-700">
					<FaCheck className="text-xs text-green-500" />
					Build your developer brand automatically
				</div>
				<div className="flex items-center gap-3 text-sm text-gray-700">
					<FaCheck className="text-xs text-green-500" />
					Customizable posting schedules
				</div>
			</div>
			{/* Action Button */}
			<div className="pt-4">
				<button
					onClick={() =>
						globalThis.location.replace("https://commit.jolexhive.com")
					}
					className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-gray-800"
				>
					<FaStar className="text-sm" />
					Continue with Push to Post
				</button>
			</div>
		</div>
	);

	const renderErrorStep = () => (
		<div className="space-y-6 text-center">
			{/* Error Icon */}
			<div className="relative mx-auto mb-8 h-20 w-20">
				<div className="absolute inset-0 rounded-2xl bg-red-50"></div>
				<div className="relative flex items-center justify-center rounded-2xl border-2 border-red-200 bg-white p-4 shadow-sm">
					<FaTimes className="text-2xl text-red-600" />
				</div>
			</div>

			{/* Content */}
			<div className="space-y-4">
				<h1 className="text-2xl font-semibold text-gray-900">
					Something went wrong
				</h1>
				<p className="mx-auto max-w-md leading-relaxed text-gray-600">
					We couldn&apos;t process your unsubscribe request. Please try again or
					contact our support team.
				</p>
			</div>

			{/* Action Buttons */}
			<div className="space-y-3 pt-4">
				<button
					onClick={handleTryAgain}
					className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-gray-800"
				>
					<FaArrowLeft className="text-sm" />
					Try Again
				</button>

				<button
					onClick={() => window.close()}
					className="w-full rounded-lg px-6 py-3 font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
				>
					Close Window
				</button>
			</div>
		</div>
	);

	const renderInvalidStep = () => (
		<div className="space-y-6 text-center">
			{/* Invalid Icon */}
			<div className="relative mx-auto mb-8 h-20 w-20">
				<div className="absolute inset-0 rounded-2xl bg-yellow-50"></div>
				<div className="relative flex items-center justify-center rounded-2xl border-2 border-yellow-200 bg-white p-4 shadow-sm">
					<FaCog className="text-2xl text-yellow-600" />
				</div>
			</div>

			{/* Content */}
			<div className="space-y-4">
				<h1 className="text-2xl font-semibold text-gray-900">Invalid Link</h1>
				<p className="mx-auto max-w-md leading-relaxed text-gray-600">
					This unsubscribe link is invalid or has expired. Please use the latest
					unsubscribe link from your most recent email.
				</p>
			</div>

			{/* Help info */}
			<div className="rounded-xl bg-yellow-50 p-4 text-left">
				<p className="mb-2 text-sm font-medium text-gray-700">Need help?</p>
				<div className="space-y-1 text-sm text-gray-600">
					<p>• Check your email for the latest unsubscribe link</p>
					<p>• Contact support at brilliant@jolexhive.com</p>
					<p>• Visit your account settings to manage preferences</p>
				</div>
			</div>

			{/* Action Buttons */}
			<div className="space-y-3 pt-4">
				<button
					onClick={() => window.open("mailto:brilliant@jolexhive.com")}
					className="flex w-full items-center justify-center gap-2 rounded-lg bg-gray-900 px-6 py-3 font-medium text-white transition-colors duration-200 hover:bg-gray-800"
				>
					<FaEnvelope className="text-sm" />
					Contact Support
				</button>

				<button
					onClick={() => window.close()}
					className="w-full rounded-lg px-6 py-3 font-medium text-gray-600 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-900"
				>
					Close Window
				</button>
			</div>
		</div>
	);

	return (
		<div className="flex min-h-screen items-center justify-center p-4">
			{/* Background Pattern */}
			<div className="absolute inset-0 overflow-hidden">
				<div className="absolute -right-40 -top-40 h-80 w-80 rounded-full bg-gray-100 opacity-50"></div>
				<div className="absolute -bottom-40 -left-40 h-80 w-80 rounded-full bg-gray-50 opacity-30"></div>
			</div>

			<div className="relative w-full max-w-md">
				{/* Header */}
				<div className="mb-8 text-center">
					<div className="mb-4 inline-flex items-center gap-2">
						<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-900">
							<FaGithub className="text-white" />
						</div>
						<span className="font-semibold text-gray-900">Push to Post</span>
					</div>
					<p className="text-xs font-medium uppercase tracking-wide text-gray-500">
						Developer Social Automation
					</p>
				</div>

				{/* Main Card */}
				<div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-xl backdrop-blur-sm">
					{state === "stay" && renderStayStep()}
					{state === "error" && renderErrorStep()}
					{state === "confirm" && renderConfirmStep()}
					{state === "success" && renderSuccessStep()}
					{state === "loading" && renderLoadingStep()}
					{state === "invalid" && renderInvalidStep()}
				</div>

				{/* Footer */}
				<div className="mt-6 text-center">
					<p className="text-xs text-gray-500">
						Questions? Contact us at{" "}
						<a
							href="mailto:brilliant@jolexhive.com"
							className="text-gray-700 transition-colors hover:text-gray-900"
						>
							brilliant@jolexhive.com
						</a>
					</p>
				</div>
			</div>
		</div>
	);
};

export default UnsubscribePage;
