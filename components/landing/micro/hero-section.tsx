'use client';

import { FaRocket } from 'react-icons/fa';

import {
	Heading,
	Paragraph,
	Span,
} from '@/components/general/micro/typography';
import HeroBannerTop from '@/components/landing/micro/hero-banner-top';
import HeroButtons from '@/components/landing/micro/hero-cta';
import HeroImage from '@/components/landing/micro/hero-image';

const HeroSection = () => {
	return (
		<div className="container px-4 md:px-6">
			<div className="flex flex-col items-center space-y-8 text-center">
				{/* Badge */}
				<HeroBannerTop variant={'outline'} icon={FaRocket} />

				{/* Text Section */}
				<div className="max-w-3xl space-y-4">
					<Heading>
						Build in a weekend. <Span>Scale to millions.</Span>
					</Heading>
					<Paragraph>
						The modern platform for ambitious developers. Deploy faster, scale
						bigger, and stay ahead of the curve.
					</Paragraph>
					{/* Buttons */}
					<HeroButtons layout="row" />
				</div>

				{/* Image */}
				<HeroImage src="/Anime-Girl1.png" alt="Product screenshot" />
			</div>
		</div>
	);
};

export default HeroSection;
