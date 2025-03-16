import Link from "next/link";

import { AnimatedAIIcon } from "@/components/wrappers/loaders/all-icons";

import { footerData } from "./data";

export default function Footer() {
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
					className="size-6"
					xmlns="http://www.w3.org/2000/svg"
					width="1em"
					height="1em"
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
					className="size-6"
					xmlns="http://www.w3.org/2000/svg"
					width="1em"
					height="1em"
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
					className="size-6"
					xmlns="http://www.w3.org/2000/svg"
					width="1em"
					height="1em"
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
					className="size-6"
					xmlns="http://www.w3.org/2000/svg"
					width="1em"
					height="1em"
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
					className="size-6"
					xmlns="http://www.w3.org/2000/svg"
					width="1em"
					height="1em"
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

	return (
		<footer className="py-16 md:py-32">
			<div className="mx-auto max-w-5xl px-6">
				<Link href="/" aria-label="go home" className="mx-auto block size-fit">
					<AnimatedAIIcon color={"#111827"} size={54} />
				</Link>

				<div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
					{navLinks.map((link, index) => (
						<Link
							key={index}
							href={link.href}
							className="block text-muted-foreground duration-150 hover:text-primary"
						>
							<span>{link.title}</span>
						</Link>
					))}
				</div>

				<div className="my-8 flex flex-wrap justify-center gap-6 text-sm">
					{socialLinks.map((link, index) => (
						<Link
							key={index}
							href={link.href}
							target="_blank"
							rel="noopener noreferrer"
							aria-label={link.name}
							className="block text-muted-foreground hover:text-primary"
						>
							{link.icon}
						</Link>
					))}
				</div>

				<span className="block text-center text-sm text-muted-foreground">
					© {new Date().getFullYear()} {companyName}, All rights reserved
				</span>

				{legalLinks.length > 0 && (
					<div className="mt-4 flex justify-center gap-4 text-xs">
						{legalLinks.map((link, index) => (
							<Link
								key={index}
								className="text-muted-foreground hover:text-primary"
								href={link.href}
							>
								{link.label}
							</Link>
						))}
					</div>
				)}
			</div>
		</footer>
	);
}
