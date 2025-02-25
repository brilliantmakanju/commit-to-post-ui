"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import FAQSection from "@/components/landing/faq/faq-section";
import BenefitCards from "@/components/landing/feature/benefit-cards";
import HeroSection from "@/components/landing/micro/hero-section";
import Pricing from "@/components/landing/pricing/pricing-alt";
import { deleteCookie } from "@/lib/cookies/create-cookies";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";

export default function Home() {
	const router = useRouter();
	// eslint-disable-next-line react-hooks/exhaustive-deps
	async function getCookies() {
		const paid = await getDecryptedCookie("payment_success");
		if (paid?.paid) {
			router.refresh();
			await deleteCookie("payment_success");
		}
	}

	useEffect(() => {
		getCookies();
	}, [getCookies, router]);

	return (
		<div className="container mx-auto grid items-center justify-items-center gap-[10rem] font-[family-name:var(--font-geist-sans)] md:mt-20">
			<HeroSection />
			<BenefitCards />
			<Pricing />
			<FAQSection />
		</div>
	);
}
