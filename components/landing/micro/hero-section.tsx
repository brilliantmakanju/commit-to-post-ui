"use client";

import { motion } from "framer-motion";
import { CheckCircle, Zap } from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { Heading, Span } from "@/components/general/micro/typography";
import { RainbowButton } from "@/components/magicui/rainbow-button";
import { TextAnimate } from "@/components/magicui/text-animate";
import { Badge } from "@/components/ui/badge";
import useAuthModalStore from "@/zustand/auth/use-auth-modal";
import useLogoutStore from "@/zustand/logout-store";
import useUserStore from "@/zustand/useuser-store";

import { GitFlowAnimation } from "./v2/gitflow-animation";

const HeroSection = () => {
	const userStore = useUserStore();
	const logoutStore = useLogoutStore();
	const { data, status } = useSession();
	const userEmail = userStore.email || data?.user?.email;
	const [localStatus, setLocalStatus] = useState("loading");
	const openModal = useAuthModalStore(state => state.openModal);
	const [loadingTimeout, setLoadingTimeout] = useState(false);

	// Set a maximum loading time to prevent infinite loading
	useEffect(() => {
		// If we're still showing loading after 1 second, force a status decision
		const timer = setTimeout(() => {
			setLoadingTimeout(true);
		}, 1000);

		return () => clearTimeout(timer);
	}, []);

	// Sync the status with both next-auth and our zustand store
	useEffect(() => {
		if (logoutStore.logout) {
			// If user has logged out through our custom process
			setLocalStatus("unauthenticated");
		} else if (status === "authenticated" && data) {
			// If next-auth says we're authenticated
			setLocalStatus("authenticated");
		} else if (status === "unauthenticated") {
			// If next-auth says we're not authenticated
			setLocalStatus("unauthenticated");
		} else if (status === "loading" && !loadingTimeout) {
			// Still loading, but respect timeout
			setLocalStatus("loading");
		} else if (loadingTimeout) {
			// Loading timed out, make a best guess based on available data
			setLocalStatus(userEmail ? "authenticated" : "unauthenticated");
		}
	}, [status, data, userEmail, logoutStore.logout, loadingTimeout]);

	const features = [
		"Free Plan Available",
		"No Credit Card Required",
		"Cancel Anytime",
	];

	const targetAudience = [
		"For solo devs & indie hackers building in public",
		"Schedule, edit, rewrite and grow your personal brand",
		"Zero-effort audience building from your GitHub activity",
	];

	return (
		<section className="relative w-full bg-white px-4 py-20 sm:px-6 lg:px-12">
			{/* Subtle background pattern */}
			<div className="absolute inset-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:6rem_4rem] opacity-30" />

			{/* Main content grid */}
			<div className="relative z-10 grid grid-cols-1 items-center gap-12 lg:grid-cols-2 lg:gap-16">
				{/* Left column - Content */}
				<div className="flex flex-col items-center justify-center space-y-6 lg:items-start lg:justify-start lg:space-y-8">
					{/* Badge */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5 }}
						className="flex justify-center lg:justify-start"
					>
						<Badge
							variant="secondary"
							className="hover:bg-zince-800/80 inline-flex items-center gap-2 border border-black/10 bg-black px-3 py-1.5 text-sm text-white sm:px-4 sm:py-2"
						>
							<Zap className="h-3 w-3" />
							First AI-powered Git-to-Social Tool
						</Badge>
					</motion.div>

					{/* Headline */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.1 }}
						className="space-y-4 text-center lg:space-y-6 lg:text-left"
					>
						<Heading className="text-5xl font-bold leading-[1] text-gray-900 lg:text-[48px]">
							Push code.
							<br />
							Build audience.
							<br />
							<span className="text-gray-500">No extra thinking.</span>
						</Heading>

						<Span className="max-w-lg text-[18px] leading-tight text-gray-600">
							The first and fastest way to auto-post your Git commits. Ship
							code, skip the writing.
						</Span>
					</motion.div>

					{/* Target audience */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.2 }}
						className="w-full max-w-md lg:max-w-none"
					>
						<div className="space-y-3 text-[18px]">
							{targetAudience.map((item, index) => (
								<div key={index} className="flex items-start gap-3">
									<CheckCircle className="mt-1 h-4 w-4 flex-shrink-0 text-green-500" />
									<span className="text-gray-600">{item}</span>
								</div>
							))}
						</div>
					</motion.div>

					{/* CTA Button */}
					<div className="flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4 lg:justify-start lg:gap-6">
						<div className="flex flex-col items-center text-center lg:items-start lg:text-left">
							{localStatus === "loading" && !loadingTimeout ? (
								<>
									<RainbowButton
										onClick={() => openModal("signup")}
										className="w-full rounded-full px-5 py-4 text-sm text-white hover:bg-gray-800 sm:w-auto sm:px-6 sm:py-5 lg:px-7 lg:py-6 lg:text-base"
									>
										<TextAnimate animation="scaleUp" by="word" once>
											Sign Up – It&#39;s Free
										</TextAnimate>
									</RainbowButton>
									<span className="mt-2 text-xs text-gray-500 lg:mt-3">
										30 seconds or less
									</span>
								</>
							) : localStatus === "authenticated" ||
							  (localStatus === "loading" && userEmail) ? (
								<Link href="/dashboard">
									<RainbowButton className="w-full rounded-full px-5 py-4 text-sm text-white hover:bg-gray-800 sm:w-auto sm:px-6 sm:py-5 lg:px-7 lg:py-6 lg:text-base">
										<TextAnimate animation="scaleUp" by="word" once>
											Dashboard
										</TextAnimate>
									</RainbowButton>
								</Link>
							) : (
								<>
									<RainbowButton
										onClick={() => openModal("signup")}
										className="w-full rounded-full px-5 py-4 text-sm text-white hover:bg-gray-800 sm:w-auto sm:px-6 sm:py-5 lg:px-7 lg:py-6 lg:text-base"
									>
										<TextAnimate animation="scaleUp" by="word" once>
											Sign Up – It&#39;s Free
										</TextAnimate>
									</RainbowButton>
									<span className="mt-2 text-xs text-gray-500 lg:mt-3">
										30 seconds or less
									</span>
								</>
							)}
						</div>

						{/* Watch Demo Button */}
						<div className="flex flex-col items-center lg:items-start">
							<button
								// onClick={openDemoModal}
								className="group relative flex items-center gap-2 px-0 py-2 text-gray-700 transition-all duration-300 hover:text-black focus:outline-none lg:gap-3"
							>
								{/* Text with developer brackets */}
								<span className="text-sm font-medium lg:text-base">
									<span className="text-gray-400 transition-colors duration-300 group-hover:text-gray-600">
										{"{"}
									</span>
									<span className="relative mx-1">
										Watch Demo
										{/* Animated underline */}
										<span className="absolute -bottom-0.5 left-0 h-px w-0 bg-gray-700 transition-all duration-300 group-hover:w-full"></span>
									</span>
									<span className="text-gray-400 transition-colors duration-300 group-hover:text-gray-600">
										{"}"}
									</span>
								</span>
							</button>
						</div>
					</div>

					{/* Features */}
					<motion.div
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.5, delay: 0.4 }}
						className="flex flex-wrap justify-center gap-4 lg:justify-start lg:gap-6"
					>
						{features.map((feature, index) => (
							<div key={index} className="flex items-center gap-2">
								<svg
									className="h-3 w-3 text-black sm:h-4 sm:w-4"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="3"
									strokeLinecap="round"
									strokeLinejoin="round"
								>
									<path d="M20 6L9 17L4 12"></path>
								</svg>
								<span className="text-xs text-black/70 sm:text-sm">
									{feature}
								</span>
							</div>
						))}
					</motion.div>
				</div>

				{/* Right column - Animation */}
				<motion.div
					initial={{ opacity: 0, scale: 0.9 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className="relative hidden sm:hidden lg:flex lg:justify-center"
				>
					<div className="relative w-full max-w-md">
						{/* Background circle for emphasis */}
						<div className="absolute inset-0 rounded-full bg-black/5 blur-3xl" />
						<GitFlowAnimation />
					</div>
				</motion.div>
			</div>
		</section>
	);
};

export default HeroSection;
// "use client";

// import { motion } from "framer-motion";
// import { ChevronDown } from "lucide-react";
// import Link from "next/link";
// import { useSession } from "next-auth/react";
// import { useEffect, useState } from "react";
// import { FaFire, FaHandSparkles, FaLinkedinIn } from "react-icons/fa";

// import { Heading, Span } from "@/components/general/micro/typography";
// import { AnimatedGridPattern } from "@/components/magicui/animated-grid-pattern";
// import { RainbowButton } from "@/components/magicui/rainbow-button";
// import { TextAnimate } from "@/components/magicui/text-animate";
// import { Badge } from "@/components/ui/badge";
// import { cn } from "@/lib/utils";
// import useAuthModalStore from "@/zustand/auth/use-auth-modal";
// import useLogoutStore from "@/zustand/logout-store";
// import useUserStore from "@/zustand/useuser-store";

// import Flow from "./flow";
// import HeroBannerTop from "./hero-banner-top";
// import { GitFlowAnimation } from "./v2/gitflow-animation";

// const staggerContainer = {
// 	visible: {
// 		transition: {
// 			staggerChildren: 0.2,
// 		},
// 	},
// };

// const flowVariants = {
// 	hidden: { opacity: 0, scale: 0.8 },
// 	visible: { opacity: 1, scale: 1 },
// };

// const HeroSection = () => {
// 	const userStore = useUserStore();
// 	const logoutStore = useLogoutStore();
// 	const { data, status } = useSession();
// 	const [localStatus, setLocalStatus] = useState("loading");

// 	const openModal = useAuthModalStore(state => state.openModal);

// 	// Sync the status with both next-auth and our zustand store
// 	useEffect(() => {
// 		if (logoutStore.logout) {
// 			// If user has logged out through our custom process
// 			setLocalStatus("unauthenticated");
// 		} else if (status === "authenticated" && data && userStore.email) {
// 			// If next-auth says we're authenticated
// 			setLocalStatus("authenticated");
// 		} else if (status === "unauthenticated") {
// 			// If next-auth says we're not authenticated
// 			setLocalStatus("unauthenticated");
// 		} else if (status === "loading") {
// 			// Still loading
// 			setLocalStatus("loading");
// 		}
// 	}, [status, data, logoutStore, userStore]);

// 	return (
// 		<section
// 			id="home"
// 			className="shadow-fade relative mx-auto mb-1 w-full max-w-[1200px] gap-8 overflow-hidden rounded-xl border border-[#969DAD] border-opacity-15 bg-[#FFFFFF] px-1 py-12 font-sans md:px-0 md:py-0 md:pt-12 lg:py-20 lg:pl-12"
// 		>
// 			<AnimatedGridPattern
// 				numSquares={30}
// 				maxOpacity={0.4}
// 				duration={3}
// 				repeatDelay={1}
// 				className={cn(
// 					"[mask-image:radial-gradient(400px_circle_at_center,white,transparent)]",
// 					"inset-x-0 inset-y-[-35%] h-[200%] skew-y-0",
// 					"w-full",
// 				)}
// 			/>

// 			{/* Main content grid */}
// 			<div className="grid w-full grid-cols-1 items-center justify-start gap-4 py-0 md:gap-0 lg:grid-cols-[55%_auto] lg:items-start">
// 				{/* Left column - Text content */}
// 				<div className="z-[3] w-full flex-col items-center p-4 text-center lg:items-start lg:text-left">
// 					<div className="flex flex-col items-center pb-3.5 text-center lg:items-start lg:text-left">
// 						{/* Badge */}
// 						<HeroBannerTop
// 							title=""
// 							icon={FaFire}
// 							variant="default"
// 							content="First AI-powered Git-to-Social Tool"
// 							contentStyles="bg-[red]"
// 							customStyles="bg-[yellow]"
// 						/>

// 						{/* Text Section */}
// 						<div className="flex flex-col items-center space-y-4 text-center lg:items-start lg:text-left">
// 							<Heading className="font-cal text-wrap-balance mt-[16px] inline-block pb-3 align-top text-[40px] leading-[65px] text-[#1E1E1E] no-underline">
// 								{/* <Span className="text-wrap-balance"> */}
// 								Push code. <br /> Build audience. <br /> No extra thinking.
// 								{/* #1 Git Powered Scheduler{" "}
// 								<mark className="bg-transparent text-[red]">
// 									That Saves Your Time
// 								</mark> */}
// 								{/* <TextAnimate animation="blurInUp" by="character" once>
// 									Grow your
// 								</TextAnimate>
// 								<TextAnimate animation="blurInUp" by="character" once>
// 									audience
// 								</TextAnimate>
// 								<TextAnimate animation="blurInUp" by="character" once>
// 									while you code.
// 								</TextAnimate> */}
// 							</Heading>
// 							<Span
// 								className="mt-[24px] w-[460px] text-sm text-gray-600 dark:text-gray-400"
// 								// animation="blurInDown"
// 								// by="word"
// 								// once-
// 							>
// 								Auto-generate social media posts from your Git commits — share
// 								progress, ship updates, and grow your brand effortlessly.
// 							</Span>
// 							<div className="flex w-full flex-col items-start justify-start gap-3">
// 								For solo devs & indie hackers building in public Schedule, edit,
// 								rewrite and grow your personal brand. Zero-effoer audience
// 								building from your github activity
// 							</div>

// 							{/* CTA Section */}
// 							<div className="flex w-full flex-col space-y-6">
// 								{/* <div className="flex flex-col items-center justify-center gap-4 sm:flex-row sm:gap-6 lg:justify-start">
// 									<div className="flex flex-col items-center text-center">
// 										{localStatus === "loading" ? (
// 											<>
// 												<RainbowButton
// 													onClick={() => openModal("signup")}
// 													className="text-md w-full rounded-full px-7 py-8 text-white hover:bg-gray-800 sm:w-auto"
// 												>
// 													<TextAnimate animation="scaleUp" by="word" once>
// 														Sign Up – It&#39;s Free
// 													</TextAnimate>
// 												</RainbowButton>
// 												<span className="mt-3 text-xs text-gray-500">
// 													30 seconds or less
// 												</span>
// 											</>
// 										) : localStatus === "authenticated" ? (
// 											<Link href="/dashboard">
// 												<RainbowButton className="text-md w-full rounded-full px-7 py-8 text-white hover:bg-gray-800 sm:w-auto">
// 													<TextAnimate animation="scaleUp" by="word" once>
// 														Dashboard
// 													</TextAnimate>
// 												</RainbowButton>
// 											</Link>
// 										) : (
// 											<>
// 												<RainbowButton
// 													onClick={() => openModal("signup")}
// 													className="text-md w-full rounded-full px-7 py-8 text-white hover:bg-gray-800 sm:w-auto"
// 												>
// 													<TextAnimate animation="scaleUp" by="word" once>
// 														Sign Up – It&#39;s Free
// 													</TextAnimate>
// 												</RainbowButton>
// 												<span className="mt-3 text-xs text-gray-500">
// 													30 seconds or less
// 												</span>
// 											</>
// 										)}
// 									</div>
// 								</div> */}

// 								<div className="flex justify-center gap-2 text-sm text-gray-600 sm:flex-row sm:gap-4 lg:justify-start">
// 									<span className="flex items-center">
// 										<svg
// 											className="mr-1 h-4 w-4 text-green-500"
// 											fill="none"
// 											stroke="currentColor"
// 											viewBox="0 0 24 24"
// 											xmlns="http://www.w3.org/2000/svg"
// 										>
// 											<path
// 												strokeLinecap="round"
// 												strokeLinejoin="round"
// 												strokeWidth={2}
// 												d="M5 13l4 4L19 7"
// 											/>
// 										</svg>
// 										Free Plan Available
// 									</span>
// 									<span className="flex items-center">
// 										<svg
// 											className="mr-1 h-4 w-4 text-green-500"
// 											fill="none"
// 											stroke="currentColor"
// 											viewBox="0 0 24 24"
// 											xmlns="http://www.w3.org/2000/svg"
// 										>
// 											<path
// 												strokeLinecap="round"
// 												strokeLinejoin="round"
// 												strokeWidth={2}
// 												d="M5 13l4 4L19 7"
// 											/>
// 										</svg>
// 										No Credit Card Required
// 									</span>
// 									<span className="flex items-center">
// 										<svg
// 											className="mr-1 h-4 w-4 text-green-500"
// 											fill="none"
// 											stroke="currentColor"
// 											viewBox="0 0 24 24"
// 											xmlns="http://www.w3.org/2000/svg"
// 										>
// 											<path
// 												strokeLinecap="round"
// 												strokeLinejoin="round"
// 												strokeWidth={2}
// 												d="M5 13l4 4L19 7"
// 											/>
// 										</svg>
// 										Cancel Anytime
// 									</span>
// 								</div>
// 							</div>
// 						</div>
// 					</div>
// 				</div>

// 				{/* Right column - Animated Flow Diagram */}
// 				<div className="relative top-4 z-[2] mx-auto flex h-full w-full origin-top-left flex-col self-center justify-self-center px-3 md:top-0 md:block">
// 					<GitFlowAnimation />
// 				</div>
// 			</div>
// 		</section>
// 	);
// };

// export default HeroSection;
