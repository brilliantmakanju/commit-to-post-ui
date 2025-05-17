"use client";
import { AnimatePresence, motion } from "framer-motion";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import useLogoutStore from "@/lib/zustand/logout-store";
import useUserStore from "@/lib/zustand/useuser-store";

import AuthButtons from "./auth-buttons";
import Logo from "./logo";
import NavLinks from "./nav-links";

const TopNavigation = () => {
	const userStore = useUserStore();
	const logoutStore = useLogoutStore();
	const { data, status } = useSession();
	const [isVisible, setIsVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);
	const [isScrolled, setIsScrolled] = useState(false);
	const [localStatus, setLocalStatus] = useState("loading");
	const [loadingTimeout, setLoadingTimeout] = useState(false);
	const userEmail = userStore.email || data?.user?.email;

	// Handle navbar visibility based on scroll
	useEffect(() => {
		const handleScroll = () => {
			const currentScrollY = window.scrollY;
			setIsScrolled(currentScrollY > 50);

			if (currentScrollY > lastScrollY) {
				setIsVisible(false);
			} else {
				setIsVisible(true);
			}

			setLastScrollY(currentScrollY);
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => {
			window.removeEventListener("scroll", handleScroll);
		};
	}, [lastScrollY]);

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

	// Determine what to show in the auth area
	const renderAuthContent = () => {
		if (localStatus === "loading" && !loadingTimeout) {
			return <Skeleton className="h-[40px] w-[100px] rounded-md" />;
		} else if (
			localStatus === "authenticated" ||
			(localStatus === "loading" && userEmail)
		) {
			return (
				<Link href="/dashboard">
					<Button variant="default">Dashboard</Button>
				</Link>
			);
		} else {
			return <AuthButtons />;
		}
	};

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
					} mx-auto w-[100%] max-w-7xl py-[5.6px] lg:px-10`}
				>
					<div
						className={`mx-auto rounded-xl ${
							isScrolled
								? "border border-[#969DAD] border-opacity-15 bg-white/70 shadow-lg backdrop-blur-xl dark:border-slate-700/30 dark:bg-slate-800/70"
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
								<div className="flex items-center">{renderAuthContent()}</div>
							</div>
						</div>
					</div>
				</motion.header>
			)}
		</AnimatePresence>
	);
};

export default TopNavigation;
