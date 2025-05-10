"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";

import { Heading, Span } from "@/components/general/micro/typography";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { TextAnimate } from "@/components/magicui/text-animate";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useAuthModalStore from "@/lib/zustand/auth/use-auth-modal";

import Flow from "./flow";

const HeroSection = () => {
	const openModal = useAuthModalStore(state => state.openModal);
	const { status } = useSession();
	return (
		<section
			id="home"
			className="shadow-fade relative mx-auto mb-1 w-full max-w-[1200px] gap-8 overflow-hidden rounded-xl border border-[#969DAD] border-opacity-15 bg-[#FFFFFF] px-1 py-12 font-sans md:px-0 md:py-0 md:pt-12 lg:py-20 lg:pl-12"
		>
			<AnimatedGridPattern
				numSquares={30}
				maxOpacity={0.4}
				duration={3}
				repeatDelay={1}
				className={cn(
					"[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
					"inset-x-0 inset-y-[-35%] h-[200%] skew-y-0",
					"w-full",
				)}
			/>

			{/* Main content grid */}
			<div className="grid w-full grid-cols-1 items-center justify-start gap-4 py-0 md:gap-[6%] lg:grid-cols-[45%_auto] lg:items-start">
				{/* Left column - Text content */}
				<div className="z-[3] w-full flex-col items-center p-4 text-center lg:items-start lg:text-left">
					<div className="flex flex-col items-center pb-3.5 text-center lg:items-start lg:text-left">
						{/* Badge */}
						{/* <HeroBannerTop
							variant="default"
							title="New Feature"
							content="Team Collaboration coming soon"
							icon={FaRocket}
							customStyles="border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 text-gray-700 dark:text-gray-300 rounded-full px-3 py-1 text-sm my-3 mb-4"
						/> */}

						{/* Text Section */}
						<div className="flex max-w-3xl flex-col items-center space-y-4 text-center lg:items-start lg:text-left">
							<Heading className="font-cal text-wrap-balance inline-block pb-3 align-top text-[40px] leading-none text-[#1E1E1E] no-underline sm:text-[78px] md:text-[78px] lg:text-[60px] xl:text-[69px]">
								{/* <Span className="text-wrap-balance"> */}
								<TextAnimate animation="blurInUp" by="character" once>
									Build in public —
								</TextAnimate>
								<TextAnimate animation="blurInUp" by="character" once>
									without lifting
								</TextAnimate>
								<TextAnimate animation="blurInUp" by="character" once>
									a finger.
								</TextAnimate>

								{/* </Span> */}
							</Heading>
							<TextAnimate
								className="w-[460px] text-sm text-gray-600 dark:text-gray-400"
								animation="blurInDown"
								by="word"
								once
							>
								Auto-generate social media posts from your Git commits — share
								progress, ship updates, and grow your brand effortlessly.
							</TextAnimate>

							{/* CTA Section */}
							<div className="flex w-full flex-col space-y-6">
								<div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 lg:justify-start">
									<div className="flex flex-col items-center text-center">
										{status === "loading" ? (
											<>
												<RainbowButton
													onClick={() => openModal("signup")}
													className="text-md w-full rounded-full px-7 py-8 text-white hover:bg-gray-800 sm:w-auto"
												>
													<TextAnimate animation="scaleUp" by="word" once>
														Sign Up – It&#39;s Free
													</TextAnimate>
												</RainbowButton>
												<span className="mt-3 text-xs text-gray-500">
													30 seconds or less
												</span>
											</>
										) : status === "authenticated" ? (
											<Link href="/dashboard">
												<RainbowButton className="text-md w-full rounded-full px-7 py-8 text-white hover:bg-gray-800 sm:w-auto">
													<TextAnimate animation="scaleUp" by="word" once>
														Dashboard
													</TextAnimate>
												</RainbowButton>
											</Link>
										) : (
											<>
												<RainbowButton
													onClick={() => openModal("signup")}
													className="text-md w-full rounded-full px-7 py-8 text-white hover:bg-gray-800 sm:w-auto"
												>
													<TextAnimate animation="scaleUp" by="word" once>
														Sign Up – It&#39;s Free
													</TextAnimate>
												</RainbowButton>
												<span className="mt-3 text-xs text-gray-500">
													30 seconds or less
												</span>
											</>
										)}
									</div>
								</div>

								<div className="flex justify-center gap-2 text-sm text-gray-600 sm:flex-row sm:gap-4 lg:justify-start">
									<span className="flex items-center">
										<svg
											className="mr-1 h-4 w-4 text-green-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										Free Plan Available
									</span>
									<span className="flex items-center">
										<svg
											className="mr-1 h-4 w-4 text-green-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										No Credit Card Required
									</span>
									<span className="flex items-center">
										<svg
											className="mr-1 h-4 w-4 text-green-500"
											fill="none"
											stroke="currentColor"
											viewBox="0 0 24 24"
											xmlns="http://www.w3.org/2000/svg"
										>
											<path
												strokeLinecap="round"
												strokeLinejoin="round"
												strokeWidth={2}
												d="M5 13l4 4L19 7"
											/>
										</svg>
										Cancel Anytime
									</span>
								</div>
							</div>

							{/* Buttons */}
							{/* <HeroButtons
								onPrimaryClick={() => router.push("/auth")}
								layout="row"
							/> */}
						</div>
					</div>
				</div>

				{/* Right column - Animated Flow Diagram */}
				<div className="relative top-4 z-[2] mx-auto origin-top-left self-center justify-self-center px-3 md:top-0 md:block">
					{/*<motion.div*/}
					{/*	className="relative flex origin-center transform items-center justify-center rounded-xl border bg-[#f4f4f4] transition-all duration-500 md:rounded-l-xl md:rounded-r-none md:p-2"*/}
					{/*	initial={{ opacity: 0, y: 20 }}*/}
					{/*	animate={{ opacity: 1, y: 0 }}*/}
					{/*	transition={{ duration: 0.5 }}*/}
					{/*>*/}
					{/*	<AnimatedBeamMultipleOutputDemo />*/}

					{/*	/!* <AnimatedBeamMultipleOutputDemo /> *!/*/}
					{/*</motion.div>*/}
					<Flow />
				</div>
			</div>
		</section>
	);
};

export default HeroSection;
