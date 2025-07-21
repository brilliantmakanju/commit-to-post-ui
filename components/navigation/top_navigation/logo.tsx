"use client";
import Link from "next/link";

import { AnimatedAIIcon } from "@/components/wrappers/loaders/all-icons";

const Logo = () => {
	return (
		<Link
			href="/"
			className="relative z-20 mr-4 flex items-center space-x-2 px-2 py-1 text-sm font-normal text-black transition-opacity duration-200 hover:opacity-80"
		>
			<AnimatedAIIcon color={"currentColor"} size={36} />
			<span className="flex gap-1 font-mono text-lg font-bold tracking-tight">
				<span className="text-black dark:text-white">Push</span>
				<span className="text-gray-500 dark:text-gray-400">to</span>
				<span className="text-black dark:text-white">Post</span>
			</span>
		</Link>
	);
};

export default Logo;
