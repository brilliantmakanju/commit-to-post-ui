"use client";

import { useRouter } from "next/navigation";
import { FaRocket } from "react-icons/fa";

import {
	Heading,
	Paragraph,
	Span,
} from "@/components/general/micro/typography";
import HeroBannerTop from "@/components/landing/micro/hero-banner-top";
import HeroButtons from "@/components/landing/micro/hero-cta";
import HeroImage from "@/components/landing/micro/hero-image";

const HeroSection = () => {
	const router = useRouter();
	return (
		<section id="home" className="w-full bg-gray-50 dark:bg-gray-900 lg:pt-32">
			<div className="container mx-auto px-4">
				<div className="flex flex-col items-center space-y-6 text-center">
					{/* Badge */}
					<HeroBannerTop
						variant="outline"
						title="New Feature"
						content="Team Collaboration coming soon"
						icon={FaRocket}
						customStyles="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full px-3 py-1 text-sm"
					/>

					{/* Text Section */}
					<div className="flex max-w-3xl flex-col items-center space-y-4">
						<Heading className="text-4xl font-semibold text-gray-900 dark:text-gray-100">
							Effortless Updates for Your{" "}
							<Span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
								GitHub Projects.
							</Span>
						</Heading>
						<Paragraph className="max-w-2xl text-gray-600 dark:text-gray-400">
							Transform your Git commits into{" "}
							<Span className="bg-gradient-to-r from-emerald-600 to-emerald-400 bg-clip-text text-transparent">
								engaging social media content{" "}
							</Span>
							automatically. Keep your audience updated while you focus on
							coding.
						</Paragraph>

						{/* Buttons */}
						<HeroButtons
							onPrimaryClick={() => router.push("/auth")}
							layout="row"
						/>
					</div>

					{/* Image */}
					<div className="relative w-full max-w-7xl">
						<HeroImage
							src="/Dashboard_mock2.png"
							alt="Product screenshot"
							className="rounded-lg shadow-2xl"
						/>
					</div>
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
