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
	productId: string;
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
	productId: string;
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
			id: "basic",
			name: "Starter",
			description: "Test drive the platform and see the magic in action",
			price: 0,
			credits: 10,
			priceLabel: "10 credits (one-time grant)",
			features: [
				{
					text: "GitHub commit tracking",
					tooltip: "Automatically track your GitHub commits for content ideas",
				},
				{
					text: "Post to LinkedIn, Twitter & Discord",
					tooltip: "Publish directly to all supported platforms",
				},
				{
					text: "AI-powered draft generation",
					tooltip:
						"Get AI assistance to create engaging posts from your commits",
				},
			],
			buttonText: "Start Free",
			buttonStyle: "secondary" as const,
			borderStyle: "border-gray-200",
			theme: "light" as const,
			productId: "",
		},
		{
			id: "pro",
			name: "Pro",
			description:
				"Unlock premium features for consistent content creation at scale",
			price: 19,
			credits: 500,
			priceLabel: "$19 One-time payment (Best Value)",
			features: [
				{
					text: "500 credits included",
					tooltip:
						"Generate 500 posts or distribute to 500 platforms - never expires",
				},
				{
					text: "Image uploads for LinkedIn & Discord",
					tooltip: "Add custom images to your posts for better engagement",
				},
				{
					text: "Advanced scheduling",
					tooltip: "Schedule posts in advance across all platforms",
				},
				{
					text: "Multiple tone styles",
					tooltip: "Choose from various writing tones to match your brand",
				},
			],
			buttonText: "Unlock Pro",
			buttonStyle: "primary" as const,
			borderStyle: "border-gray-300",
			theme: "dark" as const,
			productId: process.env.NEXT_PUBLIC_PADDLE_PRO_PRODUCT_ID || "",
		},
		{
			id: "studio",
			name: "Studio",
			description:
				"Everything in Pro + advanced features for power users and teams",
			price: 49,
			credits: 1500,
			priceLabel: "$49 One-time payment (Maximum Value)",
			features: [
				{
					text: "1,500 credits included",
					tooltip: "Massive credit bundle for high-volume content creators",
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
			buttonText: "Unlock Studio",
			buttonStyle: "inverse" as const,
			borderStyle: "border-gray-800",
			theme: "light" as const,
			productId: process.env.NEXT_PUBLIC_PADDLE_STUDIO_PRODUCT_ID || "",
		},
	],
	refillPacks: [
		{
			price: 9,
			credits: 150,
			id: "starter",
			name: "Starter Refill",
			description: "Perfect for testing or light usage",
			productId: process.env.NEXT_PUBLIC_PADDLE_STANDARD_REFILL_ID || "",
		},
		{
			price: 29,
			id: "growth",
			credits: 600,
			badge: "POPULAR",
			name: "Growth Refill",
			description: "Best value for regular content creators",
			productId: process.env.NEXT_PUBLIC_PADDLE_HIGH_VOLUME_REFILL_ID || "",
		},
		{
			price: 79,
			id: "scale",
			credits: 2000,
			name: "Scale Refill",
			badge: "BEST VALUE",
			description: "Maximum savings for power users and teams",
			productId: process.env.NEXT_PUBLIC_PADDLE_BULK_REFILL_ID || "",
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
		basic: 0,
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

function PlanButton({
	isCurrentPlan,
	isDowngrade,
	canUpgrade,
	pack,
}: PlanButtonProps) {
	const {
		id,
		name,
		price,
		credits,
		productId,
		buttonStyle,
		buttonText: packButtonText,
	} = pack;

	const buttonText = useMemo(() => {
		if (isCurrentPlan) return "Current Plan";
		if (id === "basic") return packButtonText;
		if (canUpgrade) return `Upgrade to ${name}`;
		if (isDowngrade) return "Change Plan";
		return packButtonText;
	}, [isCurrentPlan, id, packButtonText, name, canUpgrade, isDowngrade]);

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

		if (isDowngrade) {
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
					credits={credits}
					forceDisabled={true}
					disabledReason="has-access"
				>
					<button className="flex w-full cursor-not-allowed items-center justify-center rounded-full border-2 border-gray-300 bg-gray-100 px-5 py-3 opacity-50">
						<span className="font-sans text-sm font-semibold leading-5 text-gray-500">
							{buttonText}
						</span>
					</button>
				</PaddleCheckout>
			);
		}

		if (id === "basic" && buttonStyle === "secondary") {
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
					credits={credits}
				>
					<ButtonInner />
				</PaddleCheckout>
			);
		}

		return;
	}, [
		id,
		credits,
		productId,
		buttonText,
		buttonStyle,
		isDowngrade,
		isCurrentPlan,
	]);

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

	const isCurrentPlan = userPlanId === pack.id;

	const packTier = getPlanTier(pack.id);
	const userTier = getPlanTier(userPlanId || "basic");

	const canUpgrade = packTier > userTier;
	const shouldDisableButton = packTier < userTier;

	return (
		<div
			className={`relative flex min-w-0 flex-col justify-between gap-10 overflow-hidden rounded-2xl border-2 ${pack.borderStyle} ${bgClass} px-7 py-7 ${shadowClass} transition-shadow ${isCurrentPlan ? "ring-2 ring-blue-500 ring-offset-2" : ""}`}
		>
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
					isDowngrade={shouldDisableButton}
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
			pack.id === "starter"
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
							text: `${savings}% better value`,
							tooltip: `Save ${savings}% per credit compared to Starter pricing`,
						},
					]
				: [
						{
							text: "No commitment needed",
							tooltip: "Buy only what you need, when you need it",
						},
					]),
			{
				text: `${pack.credits.toLocaleString()} credits`,
				tooltip:
					pack.id === "starter"
						? "Great for trying out or occasional posting"
						: pack.id === "growth"
							? "Perfect for consistent weekly content creation"
							: "Ideal for daily posting and team collaboration",
			},
			{
				text: "Credits never expire",
				tooltip: "Use your credits at your own pace - no time pressure",
			},
		],
		[savings, pack.credits, pack.id],
	);

	const ButtonComponent = useMemo(() => {
		const buttonContent = (
			<button className="relative flex w-full items-center justify-center overflow-hidden rounded-full bg-black px-5 py-3 shadow-[0px_2px_8px_rgba(0,0,0,0.15)] transition-colors hover:bg-gray-800">
				<div className="pointer-events-none absolute left-0 top-[-0.5px] h-[45px] w-full bg-gradient-to-b from-[rgba(255,255,255,0.15)] to-[rgba(0,0,0,0.05)] mix-blend-overlay" />
				<span className="relative z-10 font-sans text-sm font-semibold leading-5 text-white">
					Buy Credits
				</span>
			</button>
		);

		if (!pack.productId) {
			return buttonContent;
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
				credits={pack.credits}
			>
				{buttonContent}
			</PaddleCheckout>
		);
	}, [pack.productId, pack.credits]);

	return (
		<div
			className={`relative flex min-w-0 flex-col justify-between gap-10 overflow-hidden rounded-2xl border-2 ${pack.badge && pack.id === "scale" ? "border-gray-300 shadow-md hover:shadow-lg" : pack.badge && pack.id === "growth" ? "border-blue-300 shadow-md hover:shadow-lg" : "border-gray-200 shadow-sm hover:shadow-md"} bg-white px-7 py-7 transition-shadow`}
		>
			{pack.badge && (
				<div
					className={`absolute right-5 top-5 rounded-full ${pack.id === "growth" ? "bg-blue-600" : "bg-black"} px-3 py-1 text-[10px] font-bold tracking-wider text-white`}
				>
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

export default function PricingSection() {
	const userStore = useUserStore();
	const userPlanId = userStore?.plan?.toLowerCase() || undefined;

	const creditWorkCards = useMemo(
		() => [
			{
				icon: Zap,
				title: "1 Credit = 1 Post Draft Generated",
				subtitle: "AI-powered from your commits",
			},
			{
				icon: Sparkles,
				title: "1 Credit = 1 Platform Distribution",
				subtitle: "LinkedIn, Twitter, or Discord",
			},
			{
				icon: Infinity,
				title: "Credits Never Expire",
				subtitle: "Use at your own pace",
			},
		],
		[],
	);

	const baseRefill = useMemo(() => PRICING_DATA.refillPacks[0], []);

	return (
		<section className="relative -mt-[160px] flex w-full flex-col items-center justify-center bg-white">
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
										pack={pack}
										key={pack.id}
										userPlanId={userPlanId || ""}
									/>
								))}
							</div>

							<DecorativePattern />
						</div>
					</div>
				</div>
			</div>

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
