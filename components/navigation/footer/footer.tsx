import Image from "next/image";
import Link from "next/link";

import { footerData } from "./data";

// Extract data from footerData
const {
	companyName = "Tailus UI",
	sections = [],
	legalLinks = [],
} = footerData;

// Flatten all section links into a single array for the top navigation
const navLinks = sections
	.flatMap(section =>
		section.links.map(link => ({
			title: link.label,
			href: link.href,
		})),
	)
	.slice(0, 6); // Limit to 6 links like the original

// Social media icons - only Twitter, LinkedIn, GitHub, YouTube, and Product Hunt
const socialLinks = [
	{
		name: "X/Twitter",
		href: "https://x.com/Jolex_Dev",
		icon: (
			<svg
				className="size-5"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
			>
				<path
					fill="currentColor"
					d="M10.488 14.651L15.25 21h7l-7.858-10.478L20.93 3h-2.65l-5.117 5.886L8.75 3h-7l7.51 10.015L2.32 21h2.65zM16.25 19L5.75 5h2l10.5 14z"
				></path>
			</svg>
		),
	},
	{
		name: "LinkedIn",
		href: "https://www.linkedin.com/in/brilliantmakanju/",
		icon: (
			<svg
				className="size-5"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
			>
				<path
					fill="currentColor"
					d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93zM6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37z"
				></path>
			</svg>
		),
	},
	{
		name: "GitHub",
		href: "https://github.com/brilliantmakanju",
		icon: (
			<svg
				className="size-5"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
			>
				<path
					fill="currentColor"
					d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33c.85 0 1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2z"
				></path>
			</svg>
		),
	},
	{
		name: "YouTube",
		href: "https://www.youtube.com/@NeighborhoodCoder",
		icon: (
			<svg
				className="size-5"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
			>
				<path
					fill="currentColor"
					d="M21.543 6.498C22 8.28 22 12 22 12s0 3.72-.457 5.502c-.254.985-.997 1.76-1.938 2.022C17.896 20 12 20 12 20s-5.893 0-7.605-.476c-.945-.266-1.687-1.04-1.938-2.022C2 15.72 2 12 2 12s0-3.72.457-5.502c.254-.985.997-1.76 1.938-2.022C6.107 4 12 4 12 4s5.896 0 7.605.476c.945.266 1.687 1.04 1.938 2.022zM10 15.5l6-3.5l-6-3.5v7z"
				></path>
			</svg>
		),
	},
	{
		name: "Product Hunt",
		href: "https://www.producthunt.com/posts/push-to-post",
		icon: (
			<svg
				className="size-5"
				xmlns="http://www.w3.org/2000/svg"
				viewBox="0 0 24 24"
			>
				<path
					fill="currentColor"
					d="M13.604 8.4h-3.77V12h3.77c.995 0 1.8-.805 1.8-1.8s-.805-1.8-1.8-1.8ZM12 0C5.372 0 0 5.372 0 12s5.372 12 12 12s12-5.372 12-12S18.628 0 12 0Zm1.604 15.898h-3.77V18H7.202V6h6.402c2.298 0 4.199 1.901 4.199 4.2c0 2.298-1.901 4.198-4.199 4.198Z"
				></path>
			</svg>
		),
	},
];

export default function Footer() {
	return (
		<footer className="relative mx-auto mb-6 w-full max-w-[1200px] overflow-hidden rounded-xl border border-[#E2E8F0] bg-white bg-opacity-50 px-6 py-12 font-mono backdrop-blur-sm md:mb-8 lg:mb-10">
			{/* Code-like decorative elements */}
			<div className="absolute -left-2 top-0 text-2xl text-gray-100 opacity-50">
				{"{"}
			</div>
			<div className="absolute -right-2 bottom-0 text-2xl text-gray-100 opacity-50">
				{"}"}
			</div>

			<div className="relative z-10">
				{/* Header with logo and social links */}
				<div className="mb-10 flex flex-col items-center justify-between gap-8 border-b border-gray-100 pb-8 sm:flex-row">
					<Link
						href="/"
						aria-label="go home"
						className="group relative transition-all duration-300"
					>
						<div className="absolute -inset-2 rounded-lg bg-gradient-to-r from-violet-100 to-cyan-100 opacity-0 blur-xl transition-all duration-300 group-hover:opacity-70"></div>
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

					<div className="flex items-center gap-4">
						{socialLinks.map((link, index) => (
							<Link
								key={index}
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								aria-label={link.name}
								className="group relative rounded-md p-2 text-gray-600 transition-all duration-200 hover:text-gray-900"
							>
								<div className="absolute inset-0 rounded-md bg-gray-100 opacity-0 transition-opacity duration-200 group-hover:opacity-100"></div>
								<div className="relative">{link.icon}</div>
							</Link>
						))}
					</div>
				</div>

				{/* Main content */}
				<div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
					{/* Company info */}
					<div className="lg:col-span-1">
						<h3 className="mb-3 font-mono text-sm font-semibold text-gray-900">
							<span className="text-violet-600">const</span>{" "}
							<span className="text-emerald-600">company</span> = {"{"}
						</h3>
						<p className="mb-1 pl-4 text-sm text-gray-600">
							<span className="text-amber-600">name:</span> &ldquo;{companyName}
							&ldquo;,
						</p>
						<p className="mb-1 pl-4 text-sm text-gray-600">
							<span className="text-amber-600">founded:</span> 2025,
						</p>
						<p className="mb-1 pl-4 text-sm text-gray-600">
							<span className="text-amber-600">focus:</span> &ldquo;Developer
							Tools&ldquo;
						</p>
						<p className="text-sm text-gray-900">{"}"};</p>
					</div>

					{/* Navigation links in code-like format */}
					<div className="lg:col-span-2">
						<h3 className="mb-3 font-mono text-sm font-semibold text-gray-900">
							<span className="text-violet-600">const</span>{" "}
							<span className="text-emerald-600">navigation</span> = [
						</h3>
						<div className="grid grid-cols-2 gap-x-8 gap-y-2 pl-4 sm:grid-cols-3">
							{navLinks.map((link, index) => (
								<Link
									key={index}
									href={link.href}
									className="group flex items-center text-sm text-gray-600 transition-colors duration-200 hover:text-gray-900"
								>
									<span className="mr-1 text-amber-600">{"{"}</span>
									<span className="relative">
										{link.title}
										<span className="absolute -bottom-0.5 left-0 h-0.5 w-0 bg-gray-900 transition-all duration-200 group-hover:w-full"></span>
									</span>
									<span className="ml-1 text-amber-600">{"}"}</span>
									{index < navLinks.length - 1 && (
										<span className="text-gray-400">,</span>
									)}
								</Link>
							))}
						</div>
						<p className="mt-1 text-sm text-gray-900">];</p>
					</div>

					{/* Newsletter or contact */}
					<div className="lg:col-span-1">
						<h3 className="mb-3 font-mono text-sm font-semibold text-gray-900">
							<span className="text-violet-600">function</span>{" "}
							<span className="text-emerald-600">connect</span>() {"{"}
						</h3>
						<p className="mb-4 pl-4 text-sm text-gray-600">
							Stay updated with our latest tools and resources for developers.
						</p>
						<div className="pl-4">
							<Link
								href="mailto:brilliant@jolexhive.com"
								className="inline-flex items-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-gray-800"
							>
								<span className="mr-2">Contact Us</span>
								<svg
									className="h-4 w-4"
									fill="none"
									viewBox="0 0 24 24"
									stroke="currentColor"
								>
									<path
										strokeLinecap="round"
										strokeLinejoin="round"
										strokeWidth={2}
										d="M14 5l7 7m0 0l-7 7m7-7H3"
									/>
								</svg>
							</Link>
						</div>
						<p className="mt-3 text-sm text-gray-900">{"}"};</p>
					</div>
				</div>

				{/* Footer */}
				<div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-6 text-xs text-gray-500 sm:flex-row">
					<p>
						© {new Date().getFullYear()} {companyName}. All rights reserved.
					</p>

					{legalLinks.length > 0 && (
						<div className="flex flex-wrap gap-x-6 gap-y-2">
							{legalLinks.map((link, index) => (
								<Link
									key={index}
									className="transition-colors duration-200 hover:text-gray-900"
									href={link.href}
								>
									{link.label}
								</Link>
							))}
						</div>
					)}
				</div>
			</div>
		</footer>
	);
}
