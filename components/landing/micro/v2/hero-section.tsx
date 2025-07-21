/* eslint-disable import/no-unresolved */
"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { Heading } from "@/components/general/micro/typography";
import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { TextAnimate } from "@/components/magicui/text-animate";
import { cn } from "@/lib/utils";
import useAuthModalStore from "@/zustand/auth/use-auth-modal";
import useLogoutStore from "@/zustand/logout-store";
import useUserStore from "@/zustand/useuser-store";

const HeroSection = () => {
	const userStore = useUserStore();
	const logoutStore = useLogoutStore();
	const { data, status } = useSession();
	const [localStatus, setLocalStatus] = useState("loading");

	const openModal = useAuthModalStore(state => state.openModal);

	// Sync the status with both next-auth and our zustand store
	useEffect(() => {
		if (logoutStore.logout) {
			// If user has logged out through our custom process
			setLocalStatus("unauthenticated");
		} else if (status === "authenticated" && data && userStore.email) {
			// If next-auth says we're authenticated
			setLocalStatus("authenticated");
		} else if (status === "unauthenticated") {
			// If next-auth says we're not authenticated
			setLocalStatus("unauthenticated");
		} else if (status === "loading") {
			// Still loading
			setLocalStatus("loading");
		}
	}, [status, data, logoutStore, userStore]);

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
						{/* Text Section */}
						<div className="flex max-w-3xl flex-col items-center space-y-4 text-center lg:items-start lg:text-left">
							<Heading className="font-cal text-wrap-balance inline-block pb-3 align-top text-[40px] leading-none text-[#1E1E1E] no-underline sm:text-[78px] md:text-[78px] lg:text-[60px] xl:text-[69px]">
								{/* <Span className="text-wrap-balance"> */}
								<TextAnimate
									animation="blurInUp"
									by="character"
									once
									className="text-[40px]"
								>
									Push code.
								</TextAnimate>
								<TextAnimate
									animation="blurInUp"
									by="character"
									once
									className="text-[60px]"
								>
									Get noticed.
								</TextAnimate>
								<TextAnimate
									animation="blurInUp"
									by="character"
									once
									className="text-[80px]"
								>
									Grow your audience.
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
										{localStatus === "loading" ? (
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
										) : localStatus === "authenticated" ? (
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
			</div>
		</section>
	);
};

export default HeroSection;
