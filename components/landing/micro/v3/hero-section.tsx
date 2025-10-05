/* eslint-disable import/no-unresolved */
"use client";

import Image from "next/image";
import { useSession } from "next-auth/react";
import type React from "react";
import { memo, useEffect, useMemo, useState } from "react";

// eslint-disable-next-line import/no-unresolved
import { CustomButton } from "@/components/navigation/top_navigation/top-navigation";
import useAuthModalStore from "@/zustand/auth/use-auth-modal";
import useLogoutStore from "@/zustand/logout-store";
import useUserStore from "@/zustand/useuser-store";

// ============================================
// MEMOIZED FEATURE CARD COMPONENT
// ============================================
interface FeatureCardProps {
	title: string;
	description: string;
}

const FeatureCard = memo(({ title, description }: FeatureCardProps) => {
	return (
		<div className="relative flex w-full cursor-pointer flex-col items-start justify-start gap-2 self-stretch overflow-hidden border-b border-l-0 border-r-0 border-gray-200 bg-white px-6 py-5 shadow-[0px_0px_0px_0.75px_rgba(0,0,0,0.04)_inset] transition-colors last:border-b-0 hover:bg-gray-50 md:flex-1 md:border md:border-b-0">
			<div className="flex flex-col justify-center self-stretch text-sm font-semibold leading-6 text-black md:text-sm md:leading-6">
				{title}
			</div>
			<div className="self-stretch text-[13px] font-normal leading-[22px] text-gray-600 md:text-[13px] md:leading-[22px]">
				{description}
			</div>
		</div>
	);
});

FeatureCard.displayName = "FeatureCard";

// ============================================
// MEMOIZED DIAGONAL PATTERN COMPONENT
// ============================================
const DiagonalPattern = memo(() => {
	// Generate pattern once, not on every render
	const pattern = useMemo(
		() => Array.from({ length: 50 }, (_, index) => index),
		[],
	);

	return (
		<div className="relative w-4 self-stretch overflow-hidden sm:w-6 md:w-8 lg:w-12">
			<div className="absolute left-[-40px] top-[-120px] flex w-[120px] flex-col items-start justify-start sm:left-[-50px] sm:w-[140px] md:left-[-58px] md:w-[162px]">
				{pattern.map(index => (
					<div
						key={index}
						className="h-3 origin-top-left rotate-[-45deg] self-stretch outline outline-[0.5px] outline-offset-[-0.25px] outline-gray-200 sm:h-4"
					/>
				))}
			</div>
		</div>
	);
});

DiagonalPattern.displayName = "DiagonalPattern";

// ============================================
// MEMOIZED CTA BUTTONS COMPONENT
// ============================================
interface CTAButtonsProps {
	openModal: any;
	localStatus: string;
}

const CTAButtons = memo(({ localStatus, openModal }: CTAButtonsProps) => {
	if (localStatus === "loading") {
		return (
			<>
				<CustomButton
					onClick={() => openModal("signup")}
					className="w-full rounded-full bg-black px-6 py-3 font-sans text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-800 sm:w-auto sm:px-8"
				>
					Start for free
				</CustomButton>
				<CustomButton
					href="/playground"
					className="w-full rounded-full border-2 border-gray-900 bg-white px-6 py-3 font-sans text-sm font-semibold text-gray-900 transition-all duration-200 hover:bg-gray-900 hover:text-white sm:w-auto sm:px-8"
				>
					Try Playground
				</CustomButton>
			</>
		);
	}

	if (localStatus === "authenticated") {
		return (
			<>
				<CustomButton
					href="/dashboard"
					className="w-full rounded-full bg-black px-6 py-3 font-sans text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-800 sm:w-auto sm:px-8"
				>
					Dashboard
				</CustomButton>
				<CustomButton
					href="/playground"
					className="w-full rounded-full border-2 border-gray-900 bg-white px-4 py-3 font-sans text-sm font-semibold text-gray-900 transition-all duration-200 hover:bg-gray-900 hover:text-white"
				>
					Try Playground
				</CustomButton>
			</>
		);
	}

	return (
		<>
			<CustomButton
				onClick={() => openModal("signup")}
				className="w-full rounded-full bg-black px-6 py-3 font-sans text-sm font-semibold text-white transition-all duration-200 hover:bg-gray-800 sm:w-auto sm:px-8"
			>
				Start for free
			</CustomButton>
			<CustomButton
				href="/playground"
				className="w-auto rounded-full border-2 border-gray-900 bg-white px-4 py-3 font-sans text-sm font-semibold text-gray-900 transition-all duration-200 hover:bg-gray-900 hover:text-white"
			>
				Try Playground
			</CustomButton>
		</>
	);
});

CTAButtons.displayName = "CTAButtons";

// ============================================
// MAIN HERO SECTION COMPONENT
// ============================================
export default function HeroSection() {
	const userStore = useUserStore();
	const logoutStore = useLogoutStore();
	const { data, status } = useSession();
	const [localStatus, setLocalStatus] = useState("loading");

	const openModal = useAuthModalStore(state => state.openModal);

	// Memoized cards data - prevents recreation on every render
	const cards = useMemo(
		() => [
			{
				title: "Real-Time Preview",
				description:
					"See exactly how your post looks on LinkedIn, Twitter, and Discord before publishing.",
			},
			{
				title: "Built-In Editor",
				description:
					"Quickly edit text and images in a fast, minimal editor without leaving the dashboard.",
			},
			{
				title: "Image Upload",
				description:
					"Attach screenshots, demos, or diagrams directly to your drafts.",
			},
		],
		[],
	);

	// Optimized status sync with dependency array
	useEffect(() => {
		if (logoutStore.logout) {
			setLocalStatus("unauthenticated");
		} else if (status === "authenticated" && data && userStore.email) {
			setLocalStatus("authenticated");
		} else if (status === "unauthenticated") {
			setLocalStatus("unauthenticated");
		} else if (status === "loading") {
			setLocalStatus("loading");
		}
	}, [status, data?.user, logoutStore.logout, userStore.email, data]);

	return (
		<div className="relative flex flex-col items-start justify-start gap-4 pt-8 lg:pt-5">
			<div className="flex w-full flex-col items-center justify-center gap-8 px-4 sm:px-6 md:px-8 lg:flex-row lg:gap-12 lg:px-0 lg:pl-3 xl:gap-16">
				{/* Left Side - Copy */}
				<div className="flex w-full flex-col items-start justify-center gap-6 lg:w-1/2 lg:gap-8">
					<div className="flex flex-col gap-4 sm:gap-5 md:gap-6">
						<h1 className="text-left text-[28px] font-normal leading-[1.1] text-black sm:text-[36px] sm:leading-[1.15] md:text-[48px] md:leading-[1.2] lg:text-[62px]">
							The AI Co-Pilot That
							<br />
							Eliminates the Blank Page Problem.
						</h1>
						<p className="max-w-[540px] text-left text-base font-medium leading-[1.5] text-gray-600 sm:text-lg md:text-xl">
							Stop wasting hours crafting marketing posts. Push to Draft helps
							developers and indie hackers turn Git commits into authentic,
							ready-to-edit social media drafts.
						</p>
					</div>

					<div className="flex w-full flex-col items-center gap-3 sm:items-start sm:gap-4">
						<div className="flex w-full items-start gap-3 sm:w-auto sm:flex-row sm:items-center sm:gap-4">
							<CTAButtons localStatus={localStatus} openModal={openModal} />
						</div>

						<p className="text-center font-sans text-xs font-medium text-gray-500 sm:text-sm">
							<span className="inline sm:hidden">No CC • 10 free credits</span>
							<span className="hidden sm:inline">
								No credit card required • 10 free credits to start
							</span>
						</p>
					</div>
				</div>

				{/* Right Side - Image with lazy loading and priority */}
				<div className="relative flex w-full items-center justify-center lg:w-1/2">
					<div className="w-full bg-transparent">
						<div className="flex h-[300px] w-full flex-col items-start justify-start overflow-hidden rounded-l-[8px] bg-transparent sm:h-[400px] md:h-[500px] lg:h-[600px] lg:rounded-l-[9.06px] xl:h-[695px]">
							<div className="flex flex-1 items-start justify-start self-stretch">
								<div className="flex h-full w-full items-center justify-center">
									<div className="relative h-full w-full overflow-hidden">
										<Image
											width={999}
											height={999}
											src="/undraw_dev-productivity_16K.png"
											className="h-full w-full object-contain"
											alt="Schedules Dashboard - Customer Subscription Management"
											priority
											loading="eager"
											quality={85}
											sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 50vw"
										/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			<div className="flex items-start justify-center self-stretch border-b border-t border-gray-200">
				<DiagonalPattern />

				<div className="flex flex-1 flex-col items-stretch justify-center gap-0 px-0 sm:px-2 md:flex-row md:px-0">
					{cards.map(card => (
						<FeatureCard
							key={card.title}
							title={card.title}
							description={card.description}
						/>
					))}
				</div>

				<DiagonalPattern />
			</div>

			<div className="absolute bottom-[-166px] h-[166px] w-full bg-white" />
		</div>
	);
}
