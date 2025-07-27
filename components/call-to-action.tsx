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
	const userEmail = userStore.email || data?.user?.email;

	const [localStatus, setLocalStatus] = useState("loading");
	const [loadingTimeout, setLoadingTimeout] = useState(false);
	const openModal = useAuthModalStore(state => state.openModal);

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
	}, [status, data, logoutStore.logout, loadingTimeout, userEmail]);

	return (
		<section className="shadow-fade relative mx-auto mb-1 w-full gap-8 overflow-hidden rounded-xl border border-[#969DAD] border-opacity-15 bg-[#0e0f11] px-2 py-12 font-sans md:px-2 md:py-12 lg:px-12 lg:py-20">
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

			<div className="relative z-10 mx-auto max-w-4xl text-center">
				{/* Heading */}
				<div className="mb-12 sm:mb-16">
					<Heading className="text-3xl font-bold leading-tight tracking-tight text-white sm:text-4xl lg:text-5xl">
						Keep building.
						<br />
						<span className="text-gray-300">We&lsquo;ll keep posting.</span>
					</Heading>
				</div>

				{/* CTA Button */}
				<div className="mb-12 sm:mb-16">
					{localStatus === "loading" && !loadingTimeout ? (
						<>
							<RainbowButton
								onClick={() => openModal("signup")}
								className="w-full rounded-full px-5 py-4 text-sm text-white hover:bg-white/10 sm:w-auto sm:px-6 sm:py-5 lg:px-7 lg:py-6 lg:text-base"
							>
								<TextAnimate animation="scaleUp" by="word" once>
									Generate My First Post
								</TextAnimate>
							</RainbowButton>
						</>
					) : localStatus === "authenticated" ||
					  (localStatus === "loading" && userEmail) ? (
						<Link href="/dashboard">
							<RainbowButton className="w-full rounded-full px-5 py-4 text-sm text-white hover:bg-white/10 sm:w-auto sm:px-6 sm:py-5 lg:px-7 lg:py-6 lg:text-base">
								<TextAnimate animation="scaleUp" by="word" once>
									Dashboard
								</TextAnimate>
							</RainbowButton>
						</Link>
					) : (
						<>
							<RainbowButton
								onClick={() => openModal("signup")}
								className="w-full rounded-full px-5 py-4 text-sm text-white hover:bg-white/10 sm:w-auto sm:px-6 sm:py-5 lg:px-7 lg:py-6 lg:text-base"
							>
								<TextAnimate animation="scaleUp" by="word" once>
									Generate My First Post
								</TextAnimate>
							</RainbowButton>
						</>
					)}
				</div>

				{/* Product Hunt Badge */}
				<div className="flex justify-center">
					<Link
						href="https://www.producthunt.com/posts/push-to-post?embed=true&utm_source=badge-featured&utm_medium=badge&utm_souce=badge-push&#0045;to&#0045;post"
						target="_blank"
						className="transition-transform duration-300 hover:scale-105"
					>
						<Image
							src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=941497&theme=dark&t=1741847658944"
							alt="Push&#0032;to&#0032;Post - Push&#0032;Code&#0046;&#0032;Post&#0032;Updates&#0046;&#0032;Automate&#0032;Your&#0032;Dev&#0032;Journey&#0046; | Product Hunt"
							width={250}
							height={54}
							className="h-12 w-auto sm:h-14"
						/>
					</Link>
				</div>
			</div>
		</section>
	);
}
