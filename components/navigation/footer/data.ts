import { FooterProps } from "@/types";

export const footerData: FooterProps = {
	companyName: "Push to Post",
	tagline: "Building the future of web development, one component at a time.",
	sections: [
		{
			title: "Product",
			links: [
				{ label: "Features", href: "#" },
				{ label: "Pricing", href: "#" },
			],
		},
		{
			title: "Company",
			links: [
				{ label: "About", href: "#" },
				{ label: "Blog", href: "#" },
			],
		},
	],
	legalLinks: [
		{ label: "Terms of Service", href: "#" },
		{ label: "Privacy Policy", href: "#" },
	],
	copyright: "© 2024 Push to Post. All rights reserved.",
};
