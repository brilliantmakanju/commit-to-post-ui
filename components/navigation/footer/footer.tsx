import { Command } from "lucide-react";
import Link from "next/link";
import React from "react";

import { Paragraph, Span } from "@/components/general/micro/typography";
import { AnimatedAIIcon } from "@/components/wrappers/loaders/all-icons";

import { footerData } from "./data";

const Footer: React.FC = () => {
	const {
		companyName = "DevLock Inc",
		tagline = "Building the future of web development, one component at a time.",
		sections = [],
		legalLinks = [],
		copyright = "",
	} = footerData;

	return (
		<footer className="mt-20 w-full border-t border-gray-200 bg-background py-10 dark:border-gray-700">
			<div className="container px-4 md:px-6">
				<div className="grid gap-12 lg:grid-cols-2">
					{/* Branding and Tagline */}
					<div className="flex flex-col gap-4">
						<Link className="flex items-center" href="/">
							<AnimatedAIIcon color={"#111827"} size={36} />

							<span className="ml-2 font-bold text-gray-900 dark:text-gray-100">
								{companyName}
							</span>
						</Link>
						<Paragraph className="text-sm text-gray-600 dark:text-gray-400">
							{tagline}
						</Paragraph>
					</div>

					{/* Footer Sections */}
					<div className="flex flex-row-reverse items-start justify-between gap-6">
						{sections.map((section, index) => (
							<div key={index}>
								<Span className="mb-3 text-sm font-semibold text-gray-900 dark:text-gray-100">
									{section.title}
								</Span>
								<ul className="space-y-2">
									{section.links.map((link, linkIndex) => (
										<li key={linkIndex}>
											<Link
												className="text-sm text-gray-600 transition-colors hover:text-emerald-500 dark:text-gray-400"
												href={link.href}
											>
												{link.label}
											</Link>
										</li>
									))}
								</ul>
							</div>
						))}
					</div>
				</div>

				{/* Legal Links and Copyright */}
				<div className="mt-10 flex flex-col items-center justify-between border-t border-gray-200 pt-6 dark:border-gray-700 sm:flex-row">
					<Paragraph className="text-xs text-gray-500 dark:text-gray-400">
						{copyright}
					</Paragraph>
					<div className="mt-4 flex gap-4 sm:mt-0">
						{legalLinks.map((link, index) => (
							<Link
								key={index}
								className="text-xs text-gray-600 transition-colors hover:text-emerald-500 dark:text-gray-400"
								href={link.href}
							>
								{link.label}
							</Link>
						))}
					</div>
				</div>
			</div>
		</footer>
	);
};

export default Footer;
