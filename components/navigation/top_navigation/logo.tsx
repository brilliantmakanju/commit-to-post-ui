"use client";
import Image from "next/image";
import Link from "next/link";

const Logo = () => {
	return (
		<Link
			href="/"
			className="group relative z-20 flex items-center transition-all duration-300 hover:scale-105"
		>
			{/* Logo container with better spacing */}
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

			{/* Brand name with improved typography */}
			<div className="flex flex-col">
				<span className="flex items-center gap-0.5 font-mono text-lg font-bold leading-tight tracking-tight">
					<span className="text-gray-900 dark:text-white">Push</span>
					<span className="text-gray-400 dark:text-gray-500">to</span>
					<span className="text-gray-900 dark:text-white">Post</span>
				</span>
			</div>
		</Link>
	);
};

// Alternative: Logo only version
export const LogoOnly = () => {
	return (
		<Link
			href="/"
			className="group relative z-20 flex items-center justify-center transition-all duration-300 hover:scale-110"
		>
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
	);
};

// Alternative: Compact horizontal version
export const LogoCompact = () => {
	return (
		<Link
			href="/"
			className="group relative z-20 flex items-center space-x-2 rounded-lg px-3 py-2 transition-all duration-300 hover:bg-gray-50 dark:hover:bg-gray-800/50"
		>
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

			<span className="font-mono text-base font-semibold text-gray-900 dark:text-white">
				P2P
			</span>
		</Link>
	);
};

// Alternative: Text-focused version
export const LogoTextFocus = () => {
	return (
		<Link
			href="/"
			className="group relative z-20 flex items-center space-x-3 transition-all duration-300"
		>
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

			<span className="font-mono text-xl font-bold tracking-tight">
				<span className="text-gray-900 dark:text-white">Push</span>
				<span className="text-blue-600 dark:text-blue-400">to</span>
				<span className="text-gray-900 dark:text-white">Post</span>
			</span>
		</Link>
	);
};

export default Logo;
