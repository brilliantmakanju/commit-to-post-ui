/* eslint-disable import/no-unresolved */
import {
	ArrowRight,
	ChevronRight,
	Mail,
	Rocket,
	SendHorizonal,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

// import { HeroHeader } from "@/components/hero6-header";
import { AnimatedGroup } from "@/components/motion-primitives/animated-group";
import { TextEffect } from "@/components/motion-primitives/text-effect";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

import { BackgroundDots } from "./background-dots";
import { AnimatedBeamMultipleOutputDemo } from "./usage-flow";

const transitionVariants = {
	item: {
		hidden: {
			opacity: 0,
			filter: "blur(12px)",
			y: 12,
		},
		visible: {
			opacity: 1,
			filter: "blur(0px)",
			y: 0,
			transition: {
				type: "spring",
				bounce: 0.3,
				duration: 1.5,
			},
		},
	},
};

export default function HeroSection() {
	return (
		<>
			<section className="relative">
				<BackgroundDots />
				<div className="relative py-24 lg:py-28">
					<div className="mx-auto max-w-7xl px-6 md:px-12">
						<div className="text-center sm:mx-auto sm:w-10/12 lg:mr-auto lg:mt-0 lg:w-4/5">
							<h1 className="mt-8 text-4xl font-semibold text-gray-900 md:text-5xl xl:text-5xl xl:[line-height:1.125]">
								Turn Your Code <br /> Into Social Media Gold
							</h1>
							<p className="mx-auto mt-8 hidden max-w-2xl text-wrap text-lg text-gray-700 sm:block">
								Automate your Git commits into engaging social posts. No more
								struggling with captions—let AI handle it while you focus on
								coding.
							</p>
							<p className="mx-auto mt-6 max-w-2xl text-wrap text-gray-600 sm:hidden">
								Auto-generate social posts from your Git commits—effortless,
								AI-powered, and developer-friendly.
							</p>

							{/* <AnimatedGroup
								variants={{
									container: {
										visible: {
											transition: {
												staggerChildren: 0.05,
												delayChildren: 0.75,
											},
										},
									},
									...transitionVariants,
								}}
								className="mt-12"
							>
								<form action="" className="mx-auto max-w-sm">
									<div className="relative grid grid-cols-[1fr_auto] items-center rounded-[calc(var(--radius)+0.5rem)] border bg-background pr-2 shadow shadow-zinc-950/5 has-[input:focus]:ring-2 has-[input:focus]:ring-muted">
										<Mail className="pointer-events-none absolute inset-y-0 left-4 my-auto size-4" />

										<input
											placeholder="Your mail address"
											className="h-12 w-full bg-transparent pl-12 focus:outline-none"
											type="email"
										/>

										<div className="md:pr-1.5 lg:pr-0">
											<Button
												aria-label="submit"
												size="sm"
												className="rounded-(--radius)"
											>
												<span className="hidden md:block">Get Started</span>
												<SendHorizonal
													className="relative mx-auto size-5 md:hidden"
													strokeWidth={2}
												/>
											</Button>
										</div>
									</div>
								</form>
							</AnimatedGroup> */}
						</div>
					</div>
				</div>

				<AnimatedBeamMultipleOutputDemo />
			</section>
		</>
	);
}
