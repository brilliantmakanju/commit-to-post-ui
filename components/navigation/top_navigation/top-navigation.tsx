"use client";

import Link from "next/link";
import { useSession } from "next-auth/react";
import React, { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import useAuthModalStore from "@/zustand/auth/use-auth-modal";
import useLogoutStore from "@/zustand/logout-store";
import useUserStore from "@/zustand/useuser-store";

import Logo from "./logo";

// ============================================
// BUTTON COMPONENT (using shadcn/ui Button)
// ============================================
interface CustomButtonProps
	extends React.ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "outline";
	href?: string;
	children: React.ReactNode;
	onClick?: (event_: React.MouseEvent<HTMLButtonElement>) => void;
}

export function CustomButton({
	variant = "primary",
	children,
	className = "",
	href,
	onClick,
	...props
}: CustomButtonProps) {
	const baseStyles =
		"px-8 py-3.5 text-sm font-semibold rounded-full transition-colors shadow-sm";
	const variants = {
		primary: "bg-black text-white hover:bg-gray-800",
		secondary:
			"bg-white text-black font-medium border-2 border-gray-200 hover:bg-gray-50",
		outline:
			"px-2 sm:px-3 md:px-[14px] py-1 sm:py-[6px] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.08)] rounded-full border border-gray-200 hover:bg-gray-50 text-black text-xs md:text-[13px] font-medium",
	};

	const buttonContent = (
		<Button
			className={cn(baseStyles, variants[variant], className)}
			onClick={onClick}
			{...props}
		>
			{children}
		</Button>
	);

	if (href) {
		return <Link href={href}>{buttonContent}</Link>;
	}

	return buttonContent;
}

// ============================================
// NAVIGATION COMPONENT
// ============================================
interface NavigationProps {
	className?: string;
}

const handleScroll = (
	event_: React.MouseEvent<HTMLAnchorElement>,
	id: string,
) => {
	event_.preventDefault();
	document.querySelector(`#${id}`)?.scrollIntoView({
		behavior: "smooth",
		block: "start",
	});
};

export default function TopNavigation({ className }: NavigationProps) {
	const [isScrolled, setIsScrolled] = useState(false);
	const [isVisible, setIsVisible] = useState(true);
	const [lastScrollY, setLastScrollY] = useState(0);

	// Auth state management
	const userStore = useUserStore();
	const logoutStore = useLogoutStore();
	const { data, status } = useSession();
	const [localStatus, setLocalStatus] = useState<
		"loading" | "authenticated" | "unauthenticated"
	>("loading");
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

	// Scroll behavior
	useEffect(() => {
		let ticking = false;

		const handleScrollEvent = () => {
			if (!ticking) {
				requestAnimationFrame(() => {
					const currentScrollY = window.scrollY;
					const scrollingDown = currentScrollY > lastScrollY;
					const scrollingUp = currentScrollY < lastScrollY;

					setIsScrolled(currentScrollY > 20);

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

		window.addEventListener("scroll", handleScrollEvent, { passive: true });
		return () => window.removeEventListener("scroll", handleScrollEvent);
	}, [lastScrollY]);

	// Handle login button click
	const handleLoginClick = (event_: React.MouseEvent<HTMLButtonElement>) => {
		event_.preventDefault();
		openModal("login");
	};

	// Render auth buttons based on status
	const renderAuthButtons = () => {
		if (localStatus === "loading") {
			return (
				<div className="flex h-6 items-center justify-center sm:h-7 md:h-8">
					<div className="h-4 w-16 animate-pulse rounded-full bg-gray-200"></div>
				</div>
			);
		}

		if (localStatus === "authenticated") {
			return (
				<div className="-mt-3 flex h-6 items-start justify-start gap-2 sm:h-7 sm:gap-3 md:-mr-2 md:-mt-1 md:h-8">
					<CustomButton
						variant="outline"
						href="/dashboard"
						className="w-[90px]"
					>
						Dashboard
					</CustomButton>
				</div>
			);
		}

		// Unauthenticated state
		return (
			<div className="-mr-2 -mt-1 flex h-4 items-start justify-start gap-2 sm:h-7 sm:gap-3 md:h-8">
				<CustomButton
					variant="outline"
					className="w-[90px]"
					onClick={handleLoginClick}
				>
					Log in
				</CustomButton>
			</div>
		);
	};

	return (
		<div
			className={cn(
				"z-10 w-full transition-all duration-500 ease-out",
				isScrolled
					? `fixed left-0 right-0 top-0 transform ${
							isVisible
								? "translate-y-0 opacity-100"
								: "-translate-y-full opacity-0"
						}`
					: "relative",
				className,
			)}
		>
			{/* Glassmorphism Background */}
			<div
				className={cn(
					"absolute inset-0 rounded-2xl border transition-all duration-500 ease-out",
					isScrolled
						? "scale-100 border-white/20 bg-white/90 opacity-100 backdrop-blur-xl"
						: "scale-95 border-transparent bg-white opacity-0",
				)}
				style={{
					backdropFilter: isScrolled ? "blur(20px) saturate(150%)" : "none",
					WebkitBackdropFilter: isScrolled
						? "blur(20px) saturate(150%)"
						: "none",
				}}
			/>

			<div className="relative flex h-14 w-full items-center justify-center px-6 sm:h-14 sm:px-8 md:h-16 md:px-12 lg:h-[84px] lg:px-0">
				<div className="absolute left-0 top-6 h-0 w-full border-t border-gray-200 shadow-[0px_1px_0px_white] sm:top-7 md:top-8 lg:top-[42px]"></div>

				<div className="relative flex h-12 w-full max-w-[calc(100%-6px)] items-center justify-between overflow-hidden rounded-full border border-gray-200 bg-white px-3 py-1.5 pr-2 shadow-[0px_0px_0px_2px_rgba(0,0,0,0.04)] backdrop-blur-sm sm:h-11 sm:max-w-[calc(100%-48px)] sm:px-4 sm:py-2 sm:pr-3 md:h-12 md:max-w-[calc(100%-24px)] md:px-4 lg:w-[70rem]">
					<div className="flex items-center justify-center">
						<Logo />
						<div className="hidden flex-row items-start justify-start gap-2 pl-3 sm:flex sm:gap-3 sm:pl-4 md:flex md:gap-4 md:pl-5 lg:gap-4 lg:pl-5">
							<Link
								href="#pricing"
								onClick={event_ => handleScroll(event_, "pricing")}
								className="flex cursor-pointer items-center justify-start transition-colors hover:text-black"
							>
								<div className="flex flex-col justify-center font-sans text-xs font-medium leading-[14px] text-gray-600 md:text-[13px]">
									Pricing
								</div>
							</Link>
							<Link
								href="#faq"
								onClick={event_ => handleScroll(event_, "faq")}
								className="flex cursor-pointer items-center justify-start transition-colors hover:text-black"
							>
								<div className="flex flex-col justify-center font-sans text-xs font-medium leading-[14px] text-gray-600 md:text-[13px]">
									FAQ
								</div>
							</Link>
						</div>
					</div>
					{renderAuthButtons()}
				</div>
			</div>
		</div>
	);
}
