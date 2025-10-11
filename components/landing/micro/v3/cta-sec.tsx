"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { memo, useCallback, useEffect, useMemo, useState } from "react";

import PaddleCheckout from "../../pricing/v4/paddle-overlay";

// ============================================
// TYPES
// ============================================
interface TrustIndicator {
	mobile: string;
	desktop: string;
}

// ============================================
// MEMOIZED DIAGONAL PATTERN COMPONENT
// ============================================
const DiagonalPattern = memo(() => {
	const lines = useMemo(
		() => Array.from({ length: 300 }, (_, index) => index),
		[],
	);

	return (
		<div className="pointer-events-none absolute inset-0 h-full w-full overflow-hidden">
			<div className="relative h-full w-full">
				{lines.map(index => (
					<div
						key={index}
						className="absolute h-4 w-full origin-top-left rotate-[-45deg] outline outline-[0.5px] outline-offset-[-0.25px] outline-gray-200"
						style={{
							top: `${index * 16 - 120}px`,
							left: "-100%",
							width: "300%",
						}}
					/>
				))}
			</div>
		</div>
	);
});

DiagonalPattern.displayName = "DiagonalPattern";

// ============================================
// MEMOIZED TRUST INDICATOR COMPONENT
// ============================================
interface TrustIndicatorItemProps {
	indicator: TrustIndicator;
}

const TrustIndicatorItem = memo(({ indicator }: TrustIndicatorItemProps) => (
	<div className="flex items-center gap-1.5 sm:gap-2.5">
		<svg
			className="h-4 w-4 flex-shrink-0 text-black sm:h-5 sm:w-5"
			fill="currentColor"
			viewBox="0 0 20 20"
			aria-hidden="true"
		>
			<path
				fillRule="evenodd"
				d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
				clipRule="evenodd"
			/>
		</svg>
		<span className="whitespace-nowrap font-medium">
			<span className="inline sm:hidden">{indicator.mobile}</span>
			<span className="hidden sm:inline">{indicator.desktop}</span>
		</span>
	</div>
));

TrustIndicatorItem.displayName = "TrustIndicatorItem";

// ============================================
// MEMOIZED CTA BUTTON COMPONENTS
// ============================================
const CTAButtonSkeleton = memo(() => (
	<div className="flex w-full items-center justify-center sm:w-auto">
		<div className="h-14 w-full animate-pulse rounded-full bg-gray-200 sm:w-64" />
	</div>
));

CTAButtonSkeleton.displayName = "CTAButtonSkeleton";

const DashboardButton = memo(() => (
	<Link href="/dashboard" className="w-full sm:w-auto">
		<button
			className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-black px-9 py-4 shadow-[0px_0px_0px_3px_rgba(255,255,255,0.1)_inset] transition-all duration-200 hover:scale-[1.02] hover:bg-gray-800 active:scale-[0.98] sm:w-auto"
			aria-label="Go to Dashboard"
		>
			<div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-b from-[rgba(255,255,255,0.15)] to-[rgba(0,0,0,0.05)] mix-blend-overlay" />
			<span className="relative z-10 font-sans text-base font-semibold leading-5 text-white">
				Go to Dashboard
			</span>
			<ArrowRight
				className="relative z-10 h-5 w-5 text-white transition-transform group-hover:translate-x-1"
				strokeWidth={2}
				aria-hidden="true"
			/>
		</button>
	</Link>
));

DashboardButton.displayName = "DashboardButton";

const ProAccessButtonComponent = () => {
	const { status } = useSession();
	const isAuthenticated = status === "authenticated";

	return (
		<PaddleCheckout
			theme="dark"
			locale="en"
			credits={500}
			displayMode="overlay"
			forceDisabled={isAuthenticated}
			disabledReason={isAuthenticated ? "has-access" : undefined}
			productId={process.env.NEXT_PUBLIC_PADDLE_PRO_UNLOCK_ID || ""}
			environment={
				process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as "sandbox" | "production"
			}
		>
			<button
				className="group relative flex w-full items-center justify-center gap-3 overflow-hidden rounded-full bg-black px-9 py-4 shadow-[0px_0px_0px_3px_rgba(255,255,255,0.1)_inset] transition-all duration-200 hover:scale-[1.02] hover:bg-gray-800 active:scale-[0.98] sm:w-auto"
				aria-label="Get Pro Access for $19"
				disabled={isAuthenticated}
			>
				<div className="pointer-events-none absolute left-0 top-0 h-full w-full bg-gradient-to-b from-[rgba(255,255,255,0.15)] to-[rgba(0,0,0,0.05)] mix-blend-overlay" />
				<span className="relative z-10 font-sans text-base font-semibold leading-5 text-white">
					Get Pro Access Now ($19)
				</span>
				<ArrowRight
					className="relative z-10 h-5 w-5 text-white transition-transform group-hover:translate-x-1"
					strokeWidth={2}
					aria-hidden="true"
				/>
			</button>
		</PaddleCheckout>
	);
};

export const ProAccessButton = memo(ProAccessButtonComponent);

ProAccessButton.displayName = "ProAccessButton";

// ============================================
// MEMOIZED CONTENT SECTION
// ============================================
interface CTAContentProps {
	localStatus: string;
	indicators: TrustIndicator[];
}

const CTAContent = memo(({ localStatus, indicators }: CTAContentProps) => {
	const renderCTAButton = useCallback(() => {
		if (localStatus === "loading") {
			return <CTAButtonSkeleton />;
		}
		if (localStatus === "authenticated") {
			return <DashboardButton />;
		}
		return <ProAccessButton />;
	}, [localStatus]);

	return (
		<div className="relative z-10 flex items-center justify-center self-stretch border-b border-t border-gray-200 px-6 py-16 md:px-24 md:py-20">
			<div className="flex w-full max-w-[720px] flex-col items-center justify-start gap-8 py-6 md:py-10">
				{/* Heading & Description */}
				<div className="flex flex-col items-center justify-start gap-5 self-stretch">
					<h2 className="self-stretch px-6 text-center font-sans text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-6xl md:leading-[68px]">
						Unlock Your Full <br />
						Co-Pilot Advantage
					</h2>
					<p className="self-stretch px-4 text-center font-sans text-base font-normal leading-7 text-gray-600 md:text-lg md:leading-8">
						Start with the Pro Unlock Pack and get 500 credits to create and
						distribute your content across all platforms without worrying about
						running out
					</p>
				</div>

				{/* CTA Buttons - Dynamic based on auth */}
				<div className="mt-2 flex w-full flex-col items-center justify-center gap-4 sm:flex-row">
					{renderCTAButton()}
				</div>

				{/* Trust Indicators */}
				<div className="mt-4 flex items-center justify-center gap-3 font-sans text-sm text-gray-600 sm:gap-6 md:gap-8 lg:gap-10">
					{indicators.map(indicator => (
						<TrustIndicatorItem key={indicator.mobile} indicator={indicator} />
					))}
				</div>
			</div>
		</div>
	);
});

CTAContent.displayName = "CTAContent";

// ============================================
// MAIN CTA SECTION COMPONENT
// ============================================
export default function CTASection() {
	const { data, status } = useSession();
	const [localStatus, setLocalStatus] = useState("loading");

	// Memoize indicators array
	const indicators = useMemo<TrustIndicator[]>(
		() => [
			{
				mobile: "No subscription",
				desktop: "No subscription required",
			},
			{
				mobile: "Never expire",
				desktop: "Credits never expire",
			},
			{
				mobile: "Instant access",
				desktop: "Instant access",
			},
		],
		[],
	);

	// Auth state management
	useEffect(() => {
		if (status === "authenticated" && data) {
			setLocalStatus("authenticated");
		} else if (status === "unauthenticated") {
			setLocalStatus("unauthenticated");
		} else if (status === "loading") {
			setLocalStatus("loading");
		}
	}, [status, data]);

	return (
		<section
			id="cta"
			className="relative -mt-[180px] flex w-full scroll-mt-20 flex-col items-center justify-center bg-gray-50"
		>
			{/* Background Pattern */}
			<DiagonalPattern />

			{/* Content */}
			<CTAContent localStatus={localStatus} indicators={indicators} />

			<div
				className="absolute bottom-[-162px] h-[162px] w-full bg-white"
				aria-hidden="true"
			/>
		</section>
	);
}
