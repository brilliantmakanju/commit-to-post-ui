"use client";

import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

import AuthButtons from "./auth-buttons";
import Logo from "./logo";
import NavLinks from "./nav-links";

const TopNavigation = () => {
	const { status } = useSession();
	const [isVisible, setIsVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);
	const [isScrolled, setIsScrolled] = useState(false);

	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;

			// Set isScrolled based on whether we've scrolled at all
			setIsScrolled(currentScrollY > 50);

			// Determine if scrolling up or down
			if (currentScrollY > lastScrollY) {
				// Scrolling down - hide the navbar
				setIsVisible(false);
			} else {
				// Scrolling up - show the navbar
				setIsVisible(true);
			}

			// Update the last scroll position
			setLastScrollY(currentScrollY);
		};

		// Add scroll event listener
		window.addEventListener("scroll", handleScroll, { passive: true });

		// Clean up
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [lastScrollY]);

	return (
		<AnimatePresence>
			{(isVisible || !isScrolled) && (
				<motion.header
					initial={{ y: 0, opacity: 1 }}
					animate={{
						y: 0,
						opacity: 1,
						position: isScrolled ? "fixed" : "relative",
					}}
					exit={{ y: -100, opacity: 0 }}
					transition={{ duration: 0.3 }}
					className={`${
						isScrolled ? "fixed left-0 right-0 top-4 z-20" : "relative lg:py-3"
					} mx-auto w-[95%] max-w-7xl lg:px-10`}
				>
					<div
						className={`mx-auto rounded-xl ${
							isScrolled
								? "border border-[#969DAD] bg-white/70 shadow-lg backdrop-blur-xl dark:border-slate-700/30 dark:bg-slate-800/70"
								: "bg-transparent"
						}`}
					>
						<div className="mx-auto px-4 sm:px-6 lg:px-8">
							<div className="flex items-center justify-between py-2">
								{/* Left Section: Logo + Nav Links */}
								<div className="flex items-center space-x-4">
									<Logo />
								</div>
								<NavLinks />
								{/* Right Section: Auth Buttons */}
								<div className="flex items-center">
									{status === "loading" ? (
										<Skeleton className="h-[40px] w-[100px] rounded-md" />
									) : status === "authenticated" ? (
										<Link href="/dashboard">
											<Button variant="default">Dashboard</Button>
										</Link>
									) : (
										<AuthButtons />
									)}
								</div>
							</div>
						</div>
					</div>
				</motion.header>
			)}
		</AnimatePresence>
	);
};

export default TopNavigation;
