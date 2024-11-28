'use client';

import CTASection from '@/components/landing/cta/cta-section';
import FAQSection from '@/components/landing/faq/faq-section';
import CoreFeaturesSection from '@/components/landing/feature_alternative/coreFeature/core-feature-section';
import HeroFeatureSectionAlt from '@/components/landing/feature_alternative/hero-feature-section-alt';
import HeroSection from '@/components/landing/micro/hero-section';
import Pricing from '@/components/landing/pricing/pricing';

export default function Home() {
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
