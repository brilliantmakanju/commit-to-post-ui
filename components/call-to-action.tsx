/* eslint-disable import/no-unresolved */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { cn } from "@/lib/utils";
import useAuthModalStore from "@/zustand/auth/use-auth-modal";
import useLogoutStore from "@/zustand/logout-store";
import useUserStore from "@/zustand/useuser-store";

import { Heading } from "./general/micro/typography";
import { AnimatedGridPattern } from "./magicui/animated-grid-pattern";
import { RainbowButton } from "./magicui/rainbow-button";
import { TextAnimate } from "./magicui/text-animate";

export default function CtaSection() {
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
		<section className="shadow-fade relative mx-auto mb-1 w-full max-w-[1200px] gap-8 overflow-hidden rounded-xl border border-[#969DAD] border-opacity-15 bg-[#FFFFFF] px-2 py-12 font-sans md:px-2 md:py-12 lg:px-12 lg:py-20">
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

			<div className="relative z-10 text-center md:max-w-none">
				<Heading
					as="h2"
					className="md:!leading-xl mx-auto max-w-[800px] text-wrap text-center text-[32px] font-bold tracking-[-0.002em] md:text-[45px]"
				>
					<TextAnimate animation="blurInUp" by="character" once>
						Turn your commits into
					</TextAnimate>
					<TextAnimate animation="blurInUp" by="character" once>
						content — automatically.
					</TextAnimate>
				</Heading>

				<div className="mb-9 mt-8 flex flex-row items-center justify-center">
					<div className="flex flex-col justify-center gap-4 sm:flex-row sm:gap-6 lg:justify-start">
						<div className="flex flex-col items-center">
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
				</div>

				<div className="mx-auto flex w-full flex-row items-center justify-center">
					<Link
						href="https://www.producthunt.com/posts/push-to-post?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-push&#0045;to&#0045;post"
						target="_blank"
					>
						<Image
							src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=941497&theme=dark&t=1741847658944"
							alt="Push&#0032;to&#0032;Post - Push&#0032;Code&#0046;&#0032;Post&#0032;Updates&#0046;&#0032;Automate&#0032;Your&#0032;Dev&#0032;Journey&#0046; | Product Hunt"
							width={250}
							height={54}
							className="h-[54px] w-[250px]"
						/>
					</Link>
				</div>
			</div>
		</section>
	);
}
