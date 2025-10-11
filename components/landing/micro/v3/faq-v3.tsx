/* eslint-disable import/no-unresolved */
"use client";

import { MessageCircle } from "lucide-react";
import { memo, useMemo } from "react";

import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

// ============================================
// TYPES
// ============================================
interface FAQItem {
	question: string;
	answer: string;
}

// ============================================
// CONSTANT DATA
// ============================================
const FAQ_DATA: FAQItem[] = [
	{
		question: "How does the credit system work?",
		answer:
			"Credits are pay-as-you-go tokens. 1 credit = 1 post generated OR 1 platform published to. Buy credits once, use them whenever you need. No expiration dates, no surprises.",
	},
	{
		question: "Why is there an unlock fee?",
		answer:
			"The unlock fee ($19 Pro, $49 Studio) permanently enables premium features like multiple tones, image uploads, and scheduling. It includes bonus credits and is a one-time payment—pay once, keep access forever.",
	},
	{
		question: "Do credits expire?",
		answer:
			"Nope. Credits never expire. Use them all at once or spread them over months—totally your choice.",
	},
	{
		question: "What if I run out of credits?",
		answer:
			"Just grab a refill pack anytime. We offer volume discounts up to 27% off on bulk purchases. No pressure, no recurring billing.",
	},
	{
		question: "Is my data secure?",
		answer:
			"Absolutely. All data is encrypted end-to-end. Your posts, GitHub activity, and credentials stay private. We never sell or share your information with third parties.",
	},
	{
		question: "Can I cancel or get a refund?",
		answer:
			"Unlock fees are one-time and non-refundable since they grant permanent feature access. Credits never expire, so there's no rush to use them. We recommend testing the free tier first.",
	},
	{
		question: "Which platforms can I publish to?",
		answer:
			"Currently: Twitter/X, LinkedIn, and Discord. Each publish costs 1 credit. More platforms (like Dev.to and Hashnode) coming soon based on community feedback.",
	},
];

// ============================================
// MEMOIZED FAQ ITEM COMPONENT
// ============================================
interface FAQItemComponentProps {
	item: FAQItem;
	index: number;
}

const FAQItemComponent = memo(({ item, index }: FAQItemComponentProps) => (
	<AccordionItem value={`item-${index}`} className="border-b border-gray-200">
		<AccordionTrigger className="group flex w-full items-start justify-between gap-6 px-6 py-6 text-left transition-colors duration-200 hover:bg-gray-50 hover:no-underline [&[data-state=open]>svg]:rotate-180">
			<div className="flex flex-1 flex-col gap-1">
				<h3 className="font-sans text-base font-semibold leading-6 text-gray-900 transition-colors group-hover:text-black md:text-lg">
					{item.question}
				</h3>
			</div>
		</AccordionTrigger>
		<AccordionContent className="px-6 pb-6 font-sans text-sm font-normal leading-7 text-gray-600 md:text-base">
			{item.answer}
		</AccordionContent>
	</AccordionItem>
));

FAQItemComponent.displayName = "FAQItemComponent";

// ============================================
// MEMOIZED HEADER SECTION
// ============================================
const FAQHeader = memo(() => (
	<div className="flex w-full flex-shrink-0 flex-col items-start justify-start gap-6 lg:sticky lg:top-24 lg:w-[420px]">
		<h2 className="flex w-full flex-col justify-center font-sans text-3xl font-bold leading-tight tracking-tight text-gray-900 md:text-4xl md:leading-[48px]">
			Frequently Asked Questions
		</h2>
		<p className="w-full font-sans text-base font-normal leading-7 text-gray-600">
			Everything you need to know about credits, pricing, and features. Still
			have questions? We&apos;re here to help.
		</p>
		{/* Contact Support Button */}
		<a
			href="mailto:support@yourapp.com"
			className="group mt-2 inline-flex items-center gap-2.5 rounded-full border-2 border-gray-900 bg-white px-5 py-3 transition-all duration-200 hover:bg-gray-900 hover:text-white"
		>
			<MessageCircle
				className="h-4 w-4 text-gray-900 transition-colors group-hover:text-white"
				strokeWidth={2}
				aria-hidden="true"
			/>
			<span className="font-sans text-sm font-semibold text-gray-900 transition-colors group-hover:text-white">
				Contact Support
			</span>
		</a>
	</div>
));

FAQHeader.displayName = "FAQHeader";

// ============================================
// MAIN FAQ SECTION COMPONENT
// ============================================
export default function FAQSection() {
	// Memoize FAQ items with indices
	const faqItems = useMemo(
		() => FAQ_DATA.map((item, index) => ({ item, index })),
		[],
	);

	return (
		<section
			id="faq"
			className="flex w-full scroll-mt-[200px] items-start justify-center border-b border-gray-200 bg-white pb-[10rem]"
		>
			<div className="flex flex-1 flex-col items-start justify-start gap-10 lg:flex-row lg:gap-20">
				{/* Left Column - Header */}
				<FAQHeader />

				{/* Right Column - FAQ Items with shadcn Accordion */}
				<div className="flex w-full flex-1 flex-col items-center justify-center">
					<Accordion type="multiple" className="w-full">
						{faqItems.map(({ item, index }) => (
							<FAQItemComponent key={item.question} item={item} index={index} />
						))}
					</Accordion>
				</div>
			</div>
		</section>
	);
}
