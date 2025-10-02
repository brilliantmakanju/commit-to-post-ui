"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";

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
					<div className="relative mr-3 flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-gray-50 to-gray-100 transition-all duration-300 dark:from-gray-800 dark:to-gray-900">
						<Image
							width={28}
							height={28}
							src="/logo.png"
							alt="PushToPost Logo"
							className="h-full w-full scale-110 object-contain transition-transform duration-300"
							priority
						/>
					</div>
				</Link>
			</div>
		</motion.header>
	);
};

export default TopNavigation;
