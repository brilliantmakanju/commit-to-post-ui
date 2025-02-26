"use client";

import { motion } from "framer-motion";
import Link from "next/link";

import { AnimatedAIIcon } from "../wrappers/loaders/all-icons";

const TopNavigation = ({ children }: { children: React.ReactNode }) => {
	return (
		<motion.header
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 0.2 }}
			className="sticky -top-3 left-0 right-0 z-50 mb-5 border-b border-[#E5E7EB]/5 bg-[#1A1C20]/80 backdrop-blur-sm md:hidden"
		>
			<div className="mx-auto flex h-14 items-center justify-between px-5 py-4">
				{/* Left Section: Logo + Nav Links */}
				<div className="flex items-center gap-6">{children}</div>

				{/* Right Section: Logo */}
				<Link href="/" className="flex items-center">
					<AnimatedAIIcon color="#E5E7EB" size={42} />
				</Link>
			</div>
		</motion.header>
	);
};

export default TopNavigation;
