"use client";

import { MenuIcon } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import React, { useState } from "react";
import { Fa500Px } from "react-icons/fa";

import { cn } from "@/lib/utils";

import Logo from "../navigation/top_navigation/logo";

// Type definitions
interface NavbarProps {
	children: React.ReactNode;
	className?: string;
}

interface NavBodyProps {
	children: React.ReactNode;
	className?: string;
	visible?: boolean;
}

interface NavItemsProps {
	items: Array<{
		name: string;
		link: string;
	}>;
	className?: string;
	onItemClick?: () => void;
}

interface MobileNavProps {
	children: React.ReactNode;
	className?: string;
	visible?: boolean;
}

interface MobileNavHeaderProps {
	children: React.ReactNode;
	className?: string;
}

interface MobileNavMenuProps {
	children: React.ReactNode;
	className?: string;
	isOpen: boolean;
	onClose: () => void;
}

interface MobileNavToggleProps {
	isOpen: boolean;
	onClick: () => void;
}

interface NavbarButtonProps {
	href?: string;
	as?: React.ElementType;
	children: React.ReactNode;
	className?: string;
	variant?: "primary" | "secondary" | "dark" | "gradient";
}

// Main Navbar Container
export const Navbar: React.FC<NavbarProps> = ({ children, className }) => {
	return (
		<div
			className={cn(
				"w-full rounded-b-xl border-b border-gray-100 bg-white",
				className,
			)}
		>
			{children}
		</div>
	);
};

// Desktop Navigation Body
export const NavBody: React.FC<NavBodyProps> = ({
	children,
	className,
	visible,
}) => {
	return (
		<div
			className={cn(
				"hidden w-full items-center justify-between px-6 py-4 lg:flex",
				className,
			)}
		>
			{children}
		</div>
	);
};

// Navigation Items
export const NavItems: React.FC<NavItemsProps> = ({
	items,
	className,
	onItemClick,
}) => {
	// eslint-disable-next-line unicorn/no-null
	const [hovered, setHovered] = useState<number | null>(null);

	return (
		<div
			// eslint-disable-next-line unicorn/no-null
			onMouseLeave={() => setHovered(null)}
			className={cn("flex items-center space-x-8", className)}
		>
			{items.map((item, index) => (
				<a
					key={`link-${index}`}
					href={item.link}
					onClick={onItemClick}
					onMouseEnter={() => setHovered(index)}
					className="relative px-3 py-2 text-sm font-medium text-gray-700 transition-colors duration-200 hover:text-gray-900"
				>
					{hovered === index && (
						<motion.div
							layoutId="hovered"
							className="absolute inset-0 rounded-md bg-gray-50"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							exit={{ opacity: 0 }}
						/>
					)}
					<span className="relative z-10">{item.name}</span>
				</a>
			))}
		</div>
	);
};

// Mobile Navigation
export const MobileNav: React.FC<MobileNavProps> = ({
	children,
	className,
	visible,
}) => {
	return (
		<div
			className={cn(
				"w-full border-b border-gray-100 bg-white lg:hidden",
				className,
			)}
		>
			{children}
		</div>
	);
};

// Mobile Navigation Header
export const MobileNavHeader: React.FC<MobileNavHeaderProps> = ({
	children,
	className,
}) => {
	return (
		<div
			className={cn(
				"flex w-full items-center justify-between px-4 py-4",
				className,
			)}
		>
			{children}
		</div>
	);
};

// Mobile Navigation Menu
export const MobileNavMenu: React.FC<MobileNavMenuProps> = ({
	children,
	className,
	isOpen,
	onClose,
}) => {
	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					initial={{ opacity: 0, height: 0 }}
					animate={{ opacity: 1, height: "auto" }}
					exit={{ opacity: 0, height: 0 }}
					className={cn(
						"space-y-4 border-t border-gray-100 bg-white px-4 py-6",
						className,
					)}
				>
					{children}
				</motion.div>
			)}
		</AnimatePresence>
	);
};

// Mobile Navigation Toggle
export const MobileNavToggle: React.FC<MobileNavToggleProps> = ({
	isOpen,
	onClick,
}) => {
	return (
		<button
			onClick={onClick}
			className="p-2 text-gray-700 transition-colors duration-200 hover:text-gray-900"
			aria-label={isOpen ? "Close menu" : "Open menu"}
		>
			{isOpen ? (
				<MenuIcon className="h-5 w-5" />
			) : (
				<Fa500Px className="h-5 w-5" />
			)}
		</button>
	);
};

// Navbar Logo
export const NavbarLogo: React.FC = () => {
	return <Logo />;
};

// Navbar Button
export const NavbarButton: React.FC<
	NavbarButtonProps &
		React.ComponentPropsWithoutRef<"a"> &
		React.ComponentPropsWithoutRef<"button">
> = ({
	href,
	as: Component = "a",
	children,
	className,
	variant = "primary",
	...props
}) => {
	const baseStyles =
		"inline-flex items-center justify-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2";

	const variantStyles = {
		primary: "bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500",
		secondary:
			"bg-gray-100 text-gray-700 hover:bg-gray-200 focus:ring-gray-500",
		dark: "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-700",
		gradient:
			"bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-500",
	};

	return (
		<Component
			href={href}
			className={cn(baseStyles, variantStyles[variant], className)}
			{...props}
		>
			{children}
		</Component>
	);
};
