"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import {
	MobileNav,
	MobileNavHeader,
	MobileNavMenu,
	MobileNavToggle,
	Navbar,
	NavbarButton,
	NavbarLogo,
	NavBody,
} from "@/components/ui/resizable-navbar";
import { Skeleton } from "@/components/ui/skeleton";
import useAuthModalStore from "@/zustand/auth/use-auth-modal";
import useLogoutStore from "@/zustand/logout-store";
import useUserStore from "@/zustand/useuser-store";

import AuthButtons from "./auth-buttons";

const TopNavigation = () => {
	const userStore = useUserStore();
	const logoutStore = useLogoutStore();
	const { data, status } = useSession();

	const [isVisible, setIsVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);
	const [isScrolled, setIsScrolled] = useState(false);
	const [localStatus, setLocalStatus] = useState("loading");
	const [loadingTimeout, setLoadingTimeout] = useState(false);
	const openModal = useAuthModalStore(state => state.openModal);

	const userEmail = userStore.email || data?.user?.email;

	// Smooth scroll handler with optimized performance
	useEffect(() => {
		let ticking = false;

		const handleScroll = () => {
			if (!ticking) {
				requestAnimationFrame(() => {
					const currentScrollY = window.scrollY;
					const scrollingDown = currentScrollY > lastScrollY;
					const scrollingUp = currentScrollY < lastScrollY;

					// Update scrolled state for styling
					setIsScrolled(currentScrollY > 20);

					// Update visibility based on scroll behavior
					if (currentScrollY < 100) {
						setIsVisible(true);
					} else if (scrollingDown && currentScrollY > 150) {
						setIsVisible(false);
					} else if (scrollingUp) {
						setIsVisible(true);
					}

					setLastScrollY(currentScrollY);
					ticking = false;
				});
				ticking = true;
			}
		};

		window.addEventListener("scroll", handleScroll, { passive: true });
		return () => window.removeEventListener("scroll", handleScroll);
	}, [lastScrollY]);

	// Loading timeout
	useEffect(() => {
		const timer = setTimeout(() => setLoadingTimeout(true), 1000);
		return () => clearTimeout(timer);
	}, []);

	// Authentication state management
	useEffect(() => {
		if (logoutStore.logout) {
			setLocalStatus("unauthenticated");
		} else if (status === "authenticated" && data) {
			setLocalStatus("authenticated");
		} else if (status === "unauthenticated") {
			setLocalStatus("unauthenticated");
		} else if (status === "loading" && !loadingTimeout) {
			setLocalStatus("loading");
		} else if (loadingTimeout) {
			setLocalStatus(userEmail ? "authenticated" : "unauthenticated");
		}
	}, [status, data, userEmail, logoutStore.logout, loadingTimeout]);

	const renderAuthContent = () => {
		if (localStatus === "loading" && !loadingTimeout) {
			return (
				<Skeleton className="h-10 w-32 animate-pulse rounded-full bg-gray-800/60" />
			);
		}

		if (
			localStatus === "authenticated" ||
			(localStatus === "loading" && userEmail)
		) {
			return (
				<NavbarButton
					variant="secondary"
					className="bg-transparent p-0 transition-all duration-300 hover:bg-transparent"
					href="/dashboard"
				>
					<Button className="h-auto rounded-full border border-white/20 bg-white px-6 py-2.5 text-sm font-medium text-black shadow-lg transition-all duration-300 ease-out hover:scale-105 hover:bg-gray-50 hover:shadow-xl">
						Dashboard
					</Button>
				</NavbarButton>
			);
		}

		return <AuthButtons />;
	};

	return (
		<div
			className={`w-full transition-all duration-500 ease-out xl:container xl:mx-auto ${
				isScrolled
					? `fixed left-0 right-0 top-0 z-50 transform ${
							isVisible
								? "translate-y-0 opacity-100"
								: "-translate-y-full opacity-0"
						}`
					: "relative"
			} `}
		>
			{/* Glassmorphism Background */}
			<div
				className={`absolute inset-0 mx-1 mt-3 rounded-2xl border transition-all duration-500 ease-out ${
					isScrolled
						? "scale-100 border-white/20 bg-white/90 opacity-100 backdrop-blur-xl"
						: "scale-95 border-transparent bg-white opacity-0"
				}`}
				style={{
					backdropFilter: isScrolled ? "blur(20px) saturate(150%)" : "none",
					WebkitBackdropFilter: isScrolled
						? "blur(20px) saturate(150%)"
						: "none",
				}}
			/>

			<Navbar className="relative z-10 border-none bg-transparent">
				{/* Desktop Navigation */}
				<NavBody
					className={`transition-all duration-500 ease-out ${
						isScrolled ? "px-8 pb-3 pt-6" : "px-4 py-6 sm:px-6 lg:px-8"
					} `}
				>
					<div className="flex w-full items-center justify-between">
						<div className="transition-transform duration-300 hover:scale-105">
							<NavbarLogo />
						</div>
						<div className="flex items-center">{renderAuthContent()}</div>
					</div>
				</NavBody>

				{/* Mobile Navigation */}
				<MobileNav className="lg:hidden">
					<div
						className={`border-t transition-all duration-500 ease-out ${
							isScrolled
								? "border-white/20 bg-white/90 opacity-100 backdrop-blur-xl"
								: "border-none border-transparent bg-transparent"
						} `}
					>
						<MobileNavHeader className="px-4 py-4">
							<div className="transition-transform duration-300 hover:scale-105">
								<NavbarLogo />
							</div>

							<NavbarButton
								className="bg-transparent p-0 hover:bg-transparent"
								variant="secondary"
							>
								<Button
									variant={"secondary"}
									className="group relative px-4 py-2 text-sm font-medium text-arch-black shadow-none"
									onClick={() => openModal("login")}
								>
									<span className="relative bg-transparent">
										Sign In
										<span className="absolute bottom-0 left-0 block h-[1px] w-0 bg-black transition-all duration-300 group-hover:w-full"></span>
									</span>
								</Button>
							</NavbarButton>
						</MobileNavHeader>
					</div>
				</MobileNav>
			</Navbar>
		</div>
	);
};

export default TopNavigation;
