"use client";
import Image from "next/image";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import {
	FaBars,
	FaClock,
	FaCoins,
	FaExclamationTriangle,
	FaTimes,
	FaUser,
} from "react-icons/fa";

import { LogoOnly } from "@/components/navigation/top_navigation/logo";
import { ChatContainer } from "@/components/playground/chat-container";
import { ChatInput } from "@/components/playground/chat-input";
import { ChatSidebar } from "@/components/playground/chat-sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useChatStore } from "@/zustand/chat-store";

// Credit/Usage Component with Black & White Theme
const CreditDisplay = ({ session }: { session: any }) => {
	const store = useChatStore();
	const { generationLimits, isLoadingLimits, limitsError } = store;

	// Get functions from store
	const loadGenerationLimits = useChatStore.getState().loadGenerationLimits;
	const refreshLimitsIfStale = useChatStore.getState().refreshLimitsIfStale;
	const getRemainingGenerations =
		useChatStore.getState().getRemainingGenerations;

	useEffect(() => {
		// Load limits on mount and when session changes
		if (generationLimits) {
			// Refresh if stale
			refreshLimitsIfStale();
		} else {
			loadGenerationLimits();
		}
	}, [session, generationLimits, refreshLimitsIfStale, loadGenerationLimits]);

	if (isLoadingLimits) {
		return (
			<div className="flex items-center gap-2">
				<div className="h-4 w-16 animate-pulse rounded bg-gray-300"></div>
			</div>
		);
	}

	if (limitsError) {
		return (
			<div className="flex items-center gap-2">
				<FaExclamationTriangle className="h-4 w-4 text-gray-600" />
				<span className="text-sm text-gray-600">Error loading limits</span>
			</div>
		);
	}

	if (!generationLimits?.limits) {
		return (
			<div className="flex items-center gap-2">
				<span className="text-sm text-gray-600">No data</span>
			</div>
		);
	}

	const { limits } = generationLimits;
	const remaining = getRemainingGenerations();

	if (limits.is_authenticated) {
		// Authenticated user - show monthly limits + credits
		const planName = limits.plan_type || limits.plan || "USER";

		return (
			<div className="flex items-center gap-2">
				<FaCoins className="h-4 w-4 text-black" />
				<div className="flex items-center gap-1">
					<span className="text-sm font-medium text-black">{remaining}</span>
					<span className="text-xs text-gray-600">remaining</span>
				</div>
				<Badge
					variant={
						remaining > 50
							? "default"
							: remaining > 10
								? "outline"
								: "destructive"
					}
					className={`text-xs ${
						remaining > 50
							? "border-black bg-black text-white"
							: remaining > 10
								? "border-gray-500 bg-gray-500 text-white"
								: "border-black bg-[#f4f4f4] text-black"
					}`}
				>
					{planName.toUpperCase()}
				</Badge>
			</div>
		);
	}

	// Anonymous user - show daily usage
	const dailyRemaining = limits.daily_remaining || 0;
	const dailyUsed = limits.daily_usage || 0;
	const dailyLimit = limits.daily_limit || 3;
	const isLimited = dailyRemaining === 0;

	return (
		<div className="flex items-center gap-2">
			<FaClock className="h-4 w-4 text-black" />
			<div className="flex items-center gap-1">
				<span className="text-sm font-medium text-black">{dailyRemaining}</span>
				<span className="text-xs text-gray-600">left today</span>
			</div>
			<Badge
				variant={
					dailyRemaining > 2
						? "default"
						: dailyRemaining > 0
							? "outline"
							: "destructive"
				}
				className={`text-xs ${
					dailyRemaining > 2
						? "border-black bg-black text-white"
						: dailyRemaining > 0
							? "border-gray-500 bg-gray-500 text-white"
							: "border-black bg-[#f4f4f4] text-black"
				}`}
			>
				{isLimited ? "LIMIT REACHED" : `${dailyUsed}/${dailyLimit}`}
			</Badge>
		</div>
	);
};

// User Info Component with Black & White Theme
const UserInfo = ({ session }: { session: any }) => {
	if (!session?.user) {
		return (
			<div className="flex items-center gap-2">
				<div className="flex h-8 w-8 items-center justify-center rounded-full border border-gray-300 bg-gray-200">
					<FaUser className="h-3 w-3 text-gray-600" />
				</div>
				<div className="hidden sm:block">
					<span className="text-sm text-gray-600">Guest</span>
				</div>
			</div>
		);
	}

	return (
		<div className="flex items-center gap-2">
			{session.user.image ? (
				<Image
					width={999}
					height={999}
					src={session.user.image}
					alt={session.user.name || "User"}
					className="h-8 w-8 rounded-full border border-gray-300"
				/>
			) : (
				<div className="flex h-8 w-8 items-center justify-center rounded-full border border-black bg-black">
					<span className="text-sm font-medium text-white">
						{session.user.name?.charAt(0).toUpperCase() || "U"}
					</span>
				</div>
			)}
			<div className="hidden sm:block">
				<span className="text-sm font-medium text-black">
					{session.user.name}
				</span>
			</div>
		</div>
	);
};

const PlayGroundContainer = () => {
	const { data: session } = useSession();
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);

	const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

	return (
		<div className="flex h-screen w-full bg-[#f4f4f4] text-black">
			{/* Main Chat Area */}
			<div className="flex min-w-0 flex-1 flex-col">
				{/* Header - Black & White Theme */}
				<header className="flex-shrink-0 border-b border-gray-300 bg-[#f4f4f4] px-4 py-4 md:px-6">
					<div className="flex items-center justify-between">
						<LogoOnly />

						<div className="flex items-center gap-3 md:gap-6">
							{/* Credit/Usage Display */}
							<div className="hidden sm:block">
								<CreditDisplay session={session} />
							</div>

							{/* User Info */}
							<UserInfo session={session} />

							{/* Mobile Sidebar Toggle */}
							<Button
								variant="ghost"
								size="sm"
								onClick={toggleSidebar}
								className="border border-gray-300 p-2 hover:bg-gray-100 md:hidden"
								aria-label="Toggle sidebar"
							>
								{isSidebarOpen ? (
									<FaTimes className="h-4 w-4 text-black" />
								) : (
									<FaBars className="h-4 w-4 text-black" />
								)}
							</Button>
						</div>
					</div>

					{/* Mobile Credit Display - Show below header on small screens */}
					<div className="mt-3 block border-t border-gray-300 pt-3 sm:hidden">
						<CreditDisplay session={session} />
					</div>
				</header>

				{/* Chat Content - Proper height distribution */}
				<div className="flex min-h-0 flex-1 flex-col bg-[#f4f4f4]">
					{/* Scrollable Chat Container - Give it explicit height */}
					<div className="min-h-0 w-full flex-1">
						<ChatContainer />
					</div>
					{/* Fixed Input Container */}
					<div className="mb-2 flex-shrink-0 border-none bg-[#f4f4f4]">
						<ChatInput />
					</div>
				</div>
			</div>

			{/* Right Sidebar - Desktop */}
			<div className="hidden border-l border-gray-300 md:block">
				<ChatSidebar session={session} />
			</div>

			{/* Mobile Sidebar Overlay */}
			{isSidebarOpen && (
				<div className="fixed inset-0 z-50 flex md:hidden">
					{/* Overlay */}
					<div
						className="absolute inset-0 bg-black bg-opacity-50"
						onClick={toggleSidebar}
					/>
					{/* Sidebar */}
					<div className="relative ml-auto border-l border-gray-300 bg-[#f4f4f4]">
						<ChatSidebar session={session} isMobile onClose={toggleSidebar} />
					</div>
				</div>
			)}
		</div>
	);
};

export default PlayGroundContainer;
