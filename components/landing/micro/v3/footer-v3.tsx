"use client";

import Link from "next/link";
import { memo, useMemo } from "react";

// ============================================
// TYPES
// ============================================
interface SocialLink {
	href: string;
	label: string;
	icon: JSX.Element;
}

interface LegalLink {
	href: string;
	label: string;
}

// ============================================
// MEMOIZED SOCIAL ICON COMPONENT
// ============================================
interface SocialIconProps {
	link: SocialLink;
}

const SocialIcon = memo(({ link }: SocialIconProps) => (
	<a
		href={link.href}
		target="_blank"
		rel="noopener noreferrer"
		className="text-gray-400 transition-colors hover:text-black"
		aria-label={link.label}
	>
		{link.icon}
	</a>
));

SocialIcon.displayName = "SocialIcon";

// ============================================
// MEMOIZED LEGAL LINK COMPONENT
// ============================================
interface LegalLinkProps {
	link: LegalLink;
}

const LegalLinkComponent = memo(({ link }: LegalLinkProps) => (
	<Link
		href={link.href}
		className="text-xs font-normal text-gray-500 transition-colors hover:text-black"
	>
		{link.label}
	</Link>
));

LegalLinkComponent.displayName = "LegalLinkComponent";

// ============================================
// MAIN FOOTER COMPONENT
// ============================================
export default function FooterSection() {
	// Memoize social links with SVG icons
	const socialLinks = useMemo<SocialLink[]>(
		() => [
			{
				href: "https://twitter.com/yourusername",
				label: "Twitter",
				icon: (
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
					>
						<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
					</svg>
				),
			},
			{
				href: "https://linkedin.com/in/yourusername",
				label: "LinkedIn",
				icon: (
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
					>
						<path d="M20.5 2h-17A1.5 1.5 0 002 3.5v17A1.5 1.5 0 003.5 22h17a1.5 1.5 0 001.5-1.5v-17A1.5 1.5 0 0020.5 2zM8 19H5v-9h3zM6.5 8.25A1.75 1.75 0 118.3 6.5a1.78 1.78 0 01-1.8 1.75zM19 19h-3v-4.74c0-1.42-.6-1.93-1.38-1.93A1.74 1.74 0 0013 14.19a.66.66 0 000 .14V19h-3v-9h2.9v1.3a3.11 3.11 0 012.7-1.4c1.55 0 3.36.86 3.36 3.66z" />
					</svg>
				),
			},
			{
				href: "https://github.com/yourusername",
				label: "GitHub",
				icon: (
					<svg
						width="18"
						height="18"
						viewBox="0 0 24 24"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
					>
						<path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.300 24 12c0-6.627-5.374-12-12-12z" />
					</svg>
				),
			},
			{
				href: "https://youtube.com/@yourusername",
				label: "YouTube",
				icon: (
					<svg
						width="20"
						height="20"
						viewBox="0 0 24 24"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg"
						aria-hidden="true"
					>
						<path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
					</svg>
				),
			},
		],
		[],
	);

	// Memoize legal links
	const legalLinks = useMemo<LegalLink[]>(
		() => [
			{ href: "/terms", label: "Terms of service" },
			{ href: "/privacy", label: "Privacy Policy" },
			{ href: "/refund", label: "Refund Policy" },
		],
		[],
	);

	const currentYear = useMemo(() => new Date().getFullYear(), []);

	return (
		<footer className="-mb-[100px] flex w-full flex-col items-start justify-start border-t border-gray-200 bg-white px-6 py-12 md:px-16 lg:px-24">
			<div className="mx-auto w-full max-w-7xl">
				{/* Main Footer Content */}
				<div className="flex flex-col items-start justify-start gap-10 pb-10">
					{/* Brand */}
					<div className="flex flex-col gap-2">
						<h2 className="font-sans text-xl font-bold leading-tight text-black">
							Push to Draft
						</h2>
						<p className="max-w-md font-sans text-sm font-normal leading-relaxed text-gray-600">
							Turn commits into posts. Built for developers.
						</p>
					</div>

					{/* Social & Legal - Single Row */}
					<div className="flex w-full flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
						{/* Social Icons */}
						<nav
							className="flex items-center gap-4"
							aria-label="Social media links"
						>
							{socialLinks.map(link => (
								<SocialIcon key={link.label} link={link} />
							))}
						</nav>

						{/* Legal Links */}
						<nav className="flex items-center gap-6" aria-label="Legal links">
							{legalLinks.map(link => (
								<LegalLinkComponent key={link.label} link={link} />
							))}
						</nav>
					</div>
				</div>

				{/* Bottom Bar */}
				<div className="flex flex-col items-start justify-between gap-3 border-t border-gray-100 pt-8 sm:flex-row sm:items-center">
					<p className="font-sans text-xs font-normal leading-5 text-gray-500">
						© {currentYear} Push to Draft. All rights reserved.
					</p>
					<p className="font-sans text-xs font-normal leading-5 text-gray-500">
						Built by{" "}
						<a
							target="_blank"
							rel="noopener noreferrer"
							href="https://twitter.com/"
							className="font-medium text-black transition-colors hover:underline"
						>
							Brilliant
						</a>
					</p>
				</div>
			</div>
		</footer>
	);
}
