import { Command } from 'lucide-react';
import Link from 'next/link';
import React from 'react';

import { Paragraph, Span } from '@/components/general/micro/typography';

import { footerData } from './data'; // Import footer data directly from data.ts

interface FooterProps {
	companyName?: string;
	tagline?: string;
	sections?: {
		title: string;
		links: { label: string; href: string }[];
	}[];
	legalLinks?: { label: string; href: string }[];
	copyright?: string;
}

const Footer: React.FC = () => {
	const {
		companyName = 'DevLock Inc',
		tagline = 'Building the future of web development, one component at a time.',
		sections = [],
		legalLinks = [],
		copyright = '',
	}: FooterProps = footerData; // Directly destructure footerData

	return (
		<footer className="mt-20 w-full border-t bg-background py-6 xl:container xl:mx-auto">
			<div className="px-4 md:px-6">
				<div className="grid gap-8 lg:grid-cols-2">
					{/* Branding and Tagline */}
					<div className="flex flex-col gap-4">
						<Link className="flex items-center" href="#">
							<Command className="h-6 w-6 text-emerald-500" />
							<span className="ml-2 font-bold">{companyName}</span>
						</Link>
						<Paragraph className="text-sm text-muted-foreground md:text-sm">
							{tagline}
						</Paragraph>
					</div>

					{/* Footer Sections */}
					<div className="grid grid-cols-2 gap-4">
						{sections.map((section, index) => (
							<div key={index}>
								<Span className="mb-2 text-sm font-semibold">
									{section.title}
								</Span>
								<ul className="space-y-2">
									{section.links.map((link, linkIndex) => (
										<li key={linkIndex}>
											<Link
												className="text-sm hover:underline"
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
				<div className="mt-8 flex flex-col items-center justify-between border-t pt-8 sm:flex-row">
					<Paragraph className="text-xs text-muted-foreground md:text-xs">
						{copyright}
					</Paragraph>
					<div className="mt-4 flex gap-4 sm:mt-0">
						{legalLinks.map((link, index) => (
							<Link
								key={index}
								className="text-xs hover:underline"
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
