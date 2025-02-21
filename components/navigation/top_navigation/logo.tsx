"use client";
import Link from "next/link";

import { AnimatedAIIcon } from "@/components/wrappers/loaders/all-icons";

const Logo = () => {
	return (
		<Link href="/" className="text-xl font-bold text-gray-800">
			<AnimatedAIIcon color={"#111827"} size={54} />
		</Link>
	);
};

export default Logo;
