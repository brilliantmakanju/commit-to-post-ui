"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import CTASection from "@/components/landing/cta/cta-section";
import FAQSection from "@/components/landing/faq/faq-section";
import CoreFeaturesSection from "@/components/landing/feature_alternative/coreFeature/core-feature-section";
import HeroFeatureSectionAlt from "@/components/landing/feature_alternative/hero-feature-section-alt";
import HeroSection from "@/components/landing/micro/hero-section";
import Pricing from "@/components/landing/pricing/pricing";
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
		<div className="grid items-center justify-items-center gap-[10rem] font-[family-name:var(--font-geist-sans)] md:mt-20">
			<HeroSection />
			<HeroFeatureSectionAlt />
			<CoreFeaturesSection />
			<CTASection />
			<Pricing />
			<FAQSection />
		</div>
	);
}
