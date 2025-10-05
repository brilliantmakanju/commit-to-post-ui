"use client";

import type { LucideIcon } from "lucide-react";
import { Check, Infinity, Info, Sparkles, Zap } from "lucide-react";
import { memo, useCallback, useMemo, useState } from "react";

import useUserStore from "@/zustand/useuser-store";

import PaddleCheckout from "../../pricing/v4/paddle-overlay";

// ============================================
// TYPES
// ============================================
interface Feature {
	text: string;
	tooltip: string;
}

interface UnlockPack {
	id: string;
	name: string;
	description: string;
	price: number;
	credits: number;
	priceLabel: string;
	features: Feature[];
	buttonText: string;
	buttonStyle: "secondary" | "primary" | "inverse";
	borderStyle: string;
	theme: "light" | "dark";
	productId: string; // Added for Paddle
}

interface UnlockPackCardProps {
	pack: UnlockPack;
	userPlanId: string | null;
}

interface RefillPack {
	id: string;
	name: string;
	description: string;
	price: number;
	credits: number;
	badge?: string;
	productId: string; // Added for Paddle
}

type PlanButtonProps = {
	isCurrentPlan: boolean;
	isDowngrade: boolean;
	canUpgrade: boolean;
	pack: UnlockPack;
};

// ============================================
// PRICING DATA
// ============================================
const PRICING_DATA = {
	unlockPacks: [
		{
			id: "free",
			name: "Basic Tier",
			description: "Frictionless onboarding to test the core concept",
			price: 0,
			credits: 10,
			priceLabel: "10 credits (one-time grant)",
			features: [
				{
					text: "10 credits included",
					tooltip: "Get started with 50 free credits to test the platform",
				},
				{
					text: "1 tone only",
					tooltip: "Access to one content tone style",
				},
				{
					text: "Multi-platform publishing",
					tooltip: "Publish to multiple social media platforms",
				},
			],
			buttonText: "Sign Up Free",
			buttonStyle: "secondary" as const,
			borderStyle: "border-gray-200",
			theme: "light" as const,
			productId: "", // No product ID for free tier
		},
		{
			id: "pro",
			name: "Pro Unlock",
			description:
				"Permanently unlock all solo features for authentic content scaling.",
			price: 25,
			credits: 625,
			priceLabel: "$25 One-time payment (Best Solo Value)",
			features: [
				{
					text: "500 credits included",
					tooltip: "Receive 500 credits with your unlock purchase",
				},
				{
					text: "Image upload",
					tooltip: "Upload custom images for your content",
				},
				{
					text: "Content scheduling",
					tooltip: "Schedule posts for automatic publishing",
				},
				{
					text: "Multi-tone support",
					tooltip: "Access multiple content tone styles",
				},
			],
			buttonText: "Get Pro Unlock",
			buttonStyle: "primary" as const,
			borderStyle: "border-gray-300",
			theme: "light" as const,
			productId: process.env.NEXT_PUBLIC_PADDLE_PRO_PRODUCT_ID || "dao",
		},
		{
			id: "studio",
			name: "Studio Unlock",
			description:
				"Everything in Pro + permanent team scaling and collaboration tools.",
			price: 75,
			credits: 2500,
			priceLabel: "$75 One-time payment (Maximum Solo Value)",
			features: [
				{
					text: "2,500 credits included",
					tooltip: "Receive 2,500 credits with your unlock purchase",
				},
				{
					text: "All Pro features",
					tooltip: "Access to all Pro tier features and capabilities",
				},
				{
					text: "Priority support",
					tooltip: "Get faster response times from our support team",
				},
				{
					text: "Team workspaces (coming soon)",
					tooltip: "Collaborate with your team in shared workspaces",
				},
			],
			buttonText: "Get Studio Unlock",
			buttonStyle: "inverse" as const,
			borderStyle: "border-gray-800",
			theme: "dark" as const,
			productId: process.env.NEXT_PUBLIC_PADDLE_STUDIO_PRODUCT_ID || "sss",
		},
	],
	refillPacks: [
		{
			id: "standard",
			name: "Standard Refill",
			description: "Good for light users or quick top-ups",
			price: 10,
			credits: 200,
			productId: process.env.NEXT_PUBLIC_PADDLE_STANDARD_REFILL_ID || "ssas",
		},
		{
			id: "high-volume",
			name: "High-Volume Refill",
			description: "Better value for regular users",
			price: 50,
			credits: 1250,
			productId: process.env.NEXT_PUBLIC_PADDLE_HIGH_VOLUME_REFILL_ID || "sacd",
		},
		{
			id: "bulk",
			name: "Bulk/Team Refill",
			description: "Maximum value for teams and power users",
			price: 100,
			credits: 3333,
			badge: "BEST VALUE",
			productId: process.env.NEXT_PUBLIC_PADDLE_BULK_REFILL_ID || "dadfad",
		},
	],
};

// ============================================
// HELPER FUNCTIONS
// ============================================
const calculateCostPerCredit = (price: number, credits: number): string => {
	return (price / credits).toFixed(3);
};

const calculateSavings = (
	currentPrice: number,
	currentCredits: number,
	basePrice: number,
	baseCredits: number,
): number => {
	const currentRate = currentPrice / currentCredits;
	const baseRate = basePrice / baseCredits;
	const savingsPercent = ((baseRate - currentRate) / baseRate) * 100;
	return Math.round(savingsPercent);
};

const getPlanTier = (planId: string): number => {
	const tiers: Record<string, number> = {
		free: 0,
		pro: 1,
		studio: 2,
	};
	return tiers[planId] || 0;
};

// ============================================
// MEMOIZED COMPONENTS
// ============================================
interface TooltipProps {
	content: string;
	children: React.ReactNode;
}

const Tooltip = memo(({ content, children }: TooltipProps) => {
	const [show, setShow] = useState(false);

	const handleMouseEnter = useCallback(() => setShow(true), []);
	const handleMouseLeave = useCallback(() => setShow(false), []);

	return (
		<div className="relative inline-flex items-center">
			<div
				onMouseEnter={handleMouseEnter}
				onMouseLeave={handleMouseLeave}
				className="cursor-help"
			>
				{children}
			</div>
			{show && (
				<div className="absolute bottom-full left-1/2 z-10 mb-2 -translate-x-1/2 transform whitespace-nowrap rounded-lg bg-gray-900 px-3 py-2 text-xs text-white shadow-lg">
					{content}
					<div className="absolute left-1/2 top-full -mt-1 -translate-x-1/2 transform border-4 border-transparent border-t-gray-900" />
				</div>
			)}
		</div>
	);
});

Tooltip.displayName = "Tooltip";

const DecorativePattern = memo(() => {
	const pattern = useMemo(
		() => Array.from({ length: 100 }, (_, index) => index),
		[],
	);

	return (
		<div className="relative hidden w-12 flex-shrink-0 self-stretch overflow-hidden lg:block">
			<div className="absolute left-[-58px] top-[-120px] flex w-[162px] flex-col items-start justify-start">
				{pattern.map(index => (
					<div
						key={index}
						className="h-4 origin-top-left rotate-[-45deg] self-stretch outline outline-[0.5px] outline-offset-[-0.25px] outline-gray-200"
					/>
				))}
			</div>
		</div>
	);
});

DecorativePattern.displayName = "DecorativePattern";

interface FeatureItemProps {
	text: string;
	tooltip: string;
	checkColor?: string;
	textColor?: string;
}

const FeatureItem = memo(
	({
		text,
		tooltip,
		checkColor = "#6B7280",
		textColor = "#374151",
	}: FeatureItemProps) => (
		<div className="flex items-center gap-3">
			<div className="relative flex h-4 w-4 flex-shrink-0 items-center justify-center">
				<Check
					className="h-3 w-3"
					style={{ stroke: checkColor, strokeWidth: 1.5 }}
					aria-hidden="true"
				/>
			</div>
			<div className="flex flex-1 items-center gap-2">
				<span
					className="font-sans text-[12.5px] font-normal leading-5"
					style={{ color: textColor }}
				>
					{text}
				</span>
				<Tooltip content={tooltip}>
					<Info
						className="h-3 w-3 opacity-40 transition-opacity hover:opacity-60"
						style={{ stroke: textColor }}
						aria-label="More information"
					/>
				</Tooltip>
			</div>
		</div>
	),
);

FeatureItem.displayName = "FeatureItem";

interface CreditWorkCardProps {
	icon: LucideIcon;
	title: string;
	subtitle: string;
}

const CreditWorkCard = memo(
	({ icon: Icon, title, subtitle }: CreditWorkCardProps) => (
		<div className="flex flex-col items-center gap-5 text-center">
			<div className="flex h-24 w-24 items-center justify-center rounded-3xl border-2 border-gray-200 bg-white shadow-sm">
				<Icon
					className="h-12 w-12 text-black"
					strokeWidth={1.5}
					aria-hidden="true"
				/>
			</div>
			<div className="flex flex-col gap-2">
				<p className="font-sans text-lg font-semibold text-black">{title}</p>
				<p className="font-sans text-sm text-gray-600">{subtitle}</p>
			</div>
		</div>
	),
);

CreditWorkCard.displayName = "CreditWorkCard";

// Separated button component inside same file
function PlanButton({
	isCurrentPlan,
	isDowngrade,
	canUpgrade,
	pack,
}: PlanButtonProps) {
	const { id, buttonText: packButtonText, buttonStyle, productId, name } = pack;

	const buttonText = useMemo(() => {
		if (isCurrentPlan) return "Current Plan";
		if (id === "free") return packButtonText;
		if (canUpgrade) return `Upgrade to ${name}`;
		return packButtonText;
	}, [isCurrentPlan, id, packButtonText, name, canUpgrade]);

	const ButtonComponent = useMemo(() => {
		if (isCurrentPlan) {
			return (
				<button
					disabled
					className="flex w-full cursor-not-allowed items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100 px-5 py-3 opacity-60"
				>
					<span className="font-sans text-sm font-semibold leading-5 text-gray-600">
						{buttonText}
					</span>
				</button>
			);
		}

		if (isDowngrade) return;

		if (id === "free" && buttonStyle === "secondary") {
			return (
				<button className="flex w-full items-center justify-center rounded-full border-2 border-black bg-white px-5 py-3 shadow-[0px_2px_8px_rgba(0,0,0,0.08)] transition-colors hover:bg-gray-50">
					<span className="font-sans text-sm font-semibold leading-5 text-black">
						{buttonText}
					</span>
				</button>
			);
		}

		if (productId) {
			const ButtonInner = () =>
				buttonStyle === "inverse" ? (
					<button className="relative flex w-full items-center justify-center overflow-hidden rounded-full bg-white px-5 py-3 shadow-[0px_2px_8px_rgba(0,0,0,0.2)] transition-colors hover:bg-gray-100">
						<div className="pointer-events-none absolute left-0 top-[-0.5px] h-[45px] w-full bg-gradient-to-b from-[rgba(255,255,255,0)] to-[rgba(0,0,0,0.05)] mix-blend-multiply" />
						<span className="relative z-10 font-sans text-sm font-semibold leading-5 text-black">
							{buttonText}
						</span>
					</button>
				) : (
					<button className="relative flex w-full items-center justify-center overflow-hidden rounded-full bg-black px-5 py-3 shadow-[0px_2px_8px_rgba(0,0,0,0.15)] transition-colors hover:bg-gray-800">
						<div className="pointer-events-none absolute left-0 top-[-0.5px] h-[45px] w-full bg-gradient-to-b from-[rgba(255,255,255,0.15)] to-[rgba(0,0,0,0.05)] mix-blend-overlay" />
						<span className="relative z-10 font-sans text-sm font-semibold leading-5 text-white">
							{buttonText}
						</span>
					</button>
				);

			return (
				<PaddleCheckout
					locale="en"
					theme="light"
					displayMode="overlay"
					environment={
						process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as
							| "sandbox"
							| "production"
					}
					productId={productId}
				>
					<ButtonInner />
				</PaddleCheckout>
			);
		}

		return;
	}, [isCurrentPlan, isDowngrade, id, buttonStyle, productId, buttonText]);

	return ButtonComponent;
}

const UnlockPackCard = memo(({ pack, userPlanId }: UnlockPackCardProps) => {
	const isDark = pack.theme === "dark";
	const bgClass = isDark ? "bg-black" : "bg-white";
	const textClass = isDark ? "text-white" : "text-gray-900";
	const subTextClass = isDark ? "text-gray-400" : "text-gray-600";
	const priceClass = isDark ? "text-white" : "text-black";
	const shadowClass =
		pack.id === "pro"
			? "shadow-md hover:shadow-lg"
			: pack.id === "studio"
				? "shadow-lg hover:shadow-xl"
				: "shadow-sm hover:shadow-md";

	// Determine if this is the user's current plan
	const isCurrentPlan = userPlanId === pack.id;

	// Determine if user can upgrade (user is on a lower tier)
	const userTier = getPlanTier(userPlanId || "free");
	const packTier = getPlanTier(pack.id);
	const canUpgrade = packTier > userTier;
	const isDowngrade = packTier < userTier;

	// Don't render downgrade plans at all
	if (isDowngrade && !isCurrentPlan) {
		return;
	}

	return (
		<div
			className={`relative flex min-w-0 flex-col justify-between gap-10 overflow-hidden rounded-2xl border-2 ${pack.borderStyle} ${bgClass} px-7 py-7 ${shadowClass} transition-shadow ${isCurrentPlan ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
		>
			{/* Current Plan Badge */}
			{isCurrentPlan && (
				<div className="absolute right-5 top-5 rounded-full bg-blue-600 px-3 py-1 text-[10px] font-bold tracking-wider text-white">
					ACTIVE
				</div>
			)}

			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-3">
					<h3
						className={`font-sans text-xl font-semibold leading-7 ${textClass}`}
					>
						{pack.name}
					</h3>
					<p
						className={`font-sans text-sm font-normal leading-6 ${subTextClass}`}
					>
						{pack.description}
					</p>
				</div>

				<div className="flex flex-col gap-2">
					<div
						className={`font-sans text-5xl font-bold leading-[60px] ${priceClass}`}
					>
						${pack.price}
					</div>
					<div className={`font-sans text-sm font-medium ${subTextClass}`}>
						{pack.priceLabel}
					</div>
				</div>

				<PlanButton
					isCurrentPlan={isCurrentPlan}
					isDowngrade={isDowngrade}
					canUpgrade={canUpgrade}
					pack={pack}
				/>
			</div>

			<div className="flex flex-col gap-3">
				{pack.features.map(feature => (
					<FeatureItem
						key={feature.text}
						text={feature.text}
						tooltip={feature.tooltip}
						checkColor={isDark ? "#FFFFFF" : "#6B7280"}
						textColor={isDark ? "#FFFFFF" : "#374151"}
					/>
				))}
			</div>
		</div>
	);
});

UnlockPackCard.displayName = "UnlockPackCard";

interface RefillPackCardProps {
	pack: RefillPack;
	baseRefill: RefillPack;
}

const RefillPackCard = memo(({ pack, baseRefill }: RefillPackCardProps) => {
	const costPerCredit = useMemo(
		() => calculateCostPerCredit(pack.price, pack.credits),
		[pack.price, pack.credits],
	);

	const savings = useMemo(
		() =>
			pack.id === "standard"
				? 0
				: calculateSavings(
						pack.price,
						pack.credits,
						baseRefill.price,
						baseRefill.credits,
					),
		[pack.id, pack.price, pack.credits, baseRefill.price, baseRefill.credits],
	);

	const features = useMemo(
		() => [
			...(savings > 0
				? [
						{
							text: `${savings}% savings`,
							tooltip: `Save ${savings}% compared to standard pricing`,
						},
					]
				: [
						{
							text: "Use anytime",
							tooltip: "No time restrictions on credit usage",
						},
					]),
			{
				text: `${pack.credits.toLocaleString()} credits`,
				tooltip:
					pack.id === "standard"
						? "Perfect for occasional content creators"
						: pack.id === "high-volume"
							? "Ideal for regular content creators"
							: "Perfect for teams and high-volume creators",
			},
			{
				text: "Never expires",
				tooltip: "Use your credits whenever you need them",
			},
		],
		[savings, pack.credits, pack.id],
	);

	const ButtonComponent = useMemo(() => {
		if (!pack.productId) {
			return (
				<button className="relative flex w-full items-center justify-center overflow-hidden rounded-full bg-black px-5 py-3 shadow-[0px_2px_8px_rgba(0,0,0,0.15)] transition-colors hover:bg-gray-800">
					<div className="pointer-events-none absolute left-0 top-[-0.5px] h-[45px] w-full bg-gradient-to-b from-[rgba(255,255,255,0.15)] to-[rgba(0,0,0,0.05)] mix-blend-overlay" />
					<span className="relative z-10 font-sans text-sm font-semibold leading-5 text-white">
						Buy Credits
					</span>
				</button>
			);
		}

		return (
			<PaddleCheckout
				locale="en"
				theme="light"
				displayMode="overlay"
				environment={
					process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as "sandbox" | "production"
				}
				productId={pack.productId}
			>
				<button className="relative flex w-full items-center justify-center overflow-hidden rounded-full bg-black px-5 py-3 shadow-[0px_2px_8px_rgba(0,0,0,0.15)] transition-colors hover:bg-gray-800">
					<div className="pointer-events-none absolute left-0 top-[-0.5px] h-[45px] w-full bg-gradient-to-b from-[rgba(255,255,255,0.15)] to-[rgba(0,0,0,0.05)] mix-blend-overlay" />
					<span className="relative z-10 font-sans text-sm font-semibold leading-5 text-white">
						Buy Credits
					</span>
				</button>
			</PaddleCheckout>
		);
	}, [pack.productId]);

	return (
		<div
			className={`relative flex min-w-0 flex-col justify-between gap-10 overflow-hidden rounded-2xl border-2 ${pack.badge ? "border-gray-300 shadow-md hover:shadow-lg" : "border-gray-200 shadow-sm hover:shadow-md"} bg-white px-7 py-7 transition-shadow`}
		>
			{pack.badge && (
				<div className="absolute right-5 top-5 rounded-full bg-black px-3 py-1 text-[10px] font-bold tracking-wider text-white">
					{pack.badge}
				</div>
			)}

			<div className="flex flex-col gap-6">
				<div className="flex flex-col gap-3">
					<h3 className="font-sans text-xl font-semibold leading-7 text-gray-900">
						{pack.name}
					</h3>
					<p className="font-sans text-sm font-normal leading-6 text-gray-600">
						{pack.description}
					</p>
				</div>

				<div className="flex flex-col gap-2">
					<div className="font-sans text-5xl font-bold leading-[60px] text-black">
						${pack.price}
					</div>
					<div className="font-sans text-sm font-medium text-gray-500">
						{pack.credits.toLocaleString()} credits • ${costPerCredit}/credit
					</div>
				</div>

				{ButtonComponent}
			</div>

			<div className="flex flex-col gap-3">
				{features.map(feature => (
					<FeatureItem
						key={feature.text}
						text={feature.text}
						tooltip={feature.tooltip}
					/>
				))}
			</div>
		</div>
	);
});

RefillPackCard.displayName = "RefillPackCard";

// ============================================
// MAIN PRICING SECTION
// ============================================
export default function PricingSection() {
	// Get user plan from Zustand store
	const userStore = useUserStore();
	const userPlanId = userStore?.plan?.toLowerCase() || undefined;

	const creditWorkCards = useMemo(
		() => [
			{
				icon: Zap,
				title: "1 Credit = 1 Unique Post Generated",
				subtitle: "Creation cost",
			},
			{
				icon: Sparkles,
				title: "1 Credit = 1 Platform Published To",
				subtitle: "Distribution cost",
			},
			{
				icon: Infinity,
				title: "Credits Never Expire",
				subtitle: "Use at your pace",
			},
		],
		[],
	);

	const baseRefill = useMemo(() => PRICING_DATA.refillPacks[0], []);

	return (
		<section className="relative -mt-[160px] flex w-full flex-col items-center justify-center bg-white">
			{/* Header Section */}
			<header className="flex items-center justify-center self-stretch border-b border-gray-200 px-6 py-16 md:px-24 md:pb-10">
				<div className="flex w-full max-w-[720px] flex-col items-center justify-start gap-5 px-6 py-5">
					<h2 className="flex flex-col justify-center self-stretch text-center font-sans text-4xl font-bold leading-tight tracking-tight text-gray-900 md:text-6xl md:leading-[72px]">
						Fair & Predictable Pricing
					</h2>

					<p className="self-stretch text-center font-sans text-base font-normal leading-7 text-gray-600 md:text-lg">
						Buy once, control your budget. No subscriptions. No surprises.
						<br />
						Credits never expire—use them at your own pace.
					</p>
				</div>
			</header>

			{/* How Credits Work Section */}
			<div className="flex items-center justify-center self-stretch border-b border-l border-r border-gray-200 bg-gray-50 px-6 py-10 md:px-16">
				<div className="flex w-full max-w-[1100px] flex-col gap-12">
					<h3 className="text-center font-sans text-3xl font-bold text-black">
						How Credits Work
					</h3>

					<div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3">
						{creditWorkCards.map(card => (
							<CreditWorkCard
								key={card.title}
								icon={card.icon}
								title={card.title}
								subtitle={card.subtitle}
							/>
						))}
					</div>
				</div>
			</div>

			{/* Unlock Packs Section */}
			<div
				id="pricing"
				className="scroll-mt-20 self-stretch border-b border-gray-200 bg-white py-16"
			>
				<div className="flex flex-col gap-12">
					<div className="text-center">
						<h3 className="mb-3 font-sans text-3xl font-bold text-black">
							Unlock Packs
						</h3>
						<p className="font-sans text-base text-gray-600">
							Get permanent access to premium features + bonus credits
						</p>
					</div>

					<div className="flex w-full items-center justify-center">
						<div className="flex w-full items-start justify-center">
							<DecorativePattern />

							<div className="grid w-full min-w-0 flex-1 gap-8 lg:grid-cols-3">
								{PRICING_DATA.unlockPacks.map(pack => (
									<UnlockPackCard
										key={pack.id}
										pack={pack}
										userPlanId={userPlanId || ""}
									/>
								))}
							</div>

							<DecorativePattern />
						</div>
					</div>
				</div>
			</div>

			{/* Refill Packs Section */}
			<div
				id="refill"
				className="scroll-mt-20 self-stretch border-b border-l border-r border-gray-200 bg-gray-50 px-2 py-10"
			>
				<div className="flex flex-col gap-12">
					<div className="text-center">
						<h3 className="mb-3 font-sans text-3xl font-bold text-black">
							Refill Packs
						</h3>
						<p className="font-sans text-base text-gray-600">
							Top up credits anytime with volume discounts and best value for
							bulk purchases
						</p>
					</div>

					<div className="flex w-full items-center justify-center">
						<div className="flex w-full max-w-[1400px] items-start justify-center">
							<DecorativePattern />

							<div className="grid min-w-0 flex-1 gap-8 lg:grid-cols-3">
								{PRICING_DATA.refillPacks.map(pack => (
									<RefillPackCard
										pack={pack}
										key={pack.id}
										baseRefill={baseRefill}
									/>
								))}
							</div>

							<DecorativePattern />
						</div>
					</div>
				</div>
			</div>

			<div
				className="absolute bottom-[-158px] h-[158px] w-full bg-white"
				aria-hidden="true"
			/>
		</section>
	);
}
