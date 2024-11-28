'use client';
import { FileText, Lock, Sparkles } from 'lucide-react';
import { ReactNode } from 'react';

import { featuresData } from '@/components/landing/feature_alternative/feature-section';

// Mapping icon names to components
const iconMap: Record<string, ReactNode> = {
	FileText: <FileText className="h-8 w-8 text-[#D35400]" />,
	Sparkles: <Sparkles className="h-8 w-8 text-[#D35400]" />,
	Lock: <Lock className="h-8 w-8 text-[#D35400]" />,
};

const HeroFeatureSectionAlt = () => {
	return (
		<section className="container px-4 md:px-6">
			<div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-6">
				{featuresData.map((feature, index) => (
					<div
						key={index}
						className="rounded-lg border-none bg-white p-6 shadow-lg transition-shadow hover:shadow-xl"
					>
						<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50">
							{iconMap[feature.icon]}
						</div>
						<h3 className="text-xl font-semibold text-[#8B4513]">
							{feature.title}
						</h3>
						<p className="text-[#666666]">{feature.description}</p>
					</div>
				))}
			</div>
		</section>
	);
};

export default HeroFeatureSectionAlt;
