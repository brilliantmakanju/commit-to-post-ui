export interface FooterLink {
	label: string;
	href: string;
}

export interface FooterSection {
	title: string;
	links: FooterLink[];
}

export interface FooterData {
	companyName: string;
	tagline: string;
	sections: FooterSection[];
	legalLinks: FooterLink[];
	copyright: string;
}

export const footerData: FooterData = {
	companyName: "Push to Post",
	tagline: "Transform your Git commits into engaging posts with AI.",
	sections: [
		{
			title: "Product",
			links: [
				{ label: "Features", href: "#features" },
				{ label: "Pricing", href: "#pricing" },
				{ label: "Integrations", href: "/integrations" },
				// { label: "Changelog", href: "/changelog" },
			],
		},
		//   {
		// 	title: "Resources",
		// 	links: [
		// 	  { label: "Documentation", href: "/docs" },
		// 	  { label: "API", href: "/api" },
		// 	  { label: "Blog", href: "/blog" },
		// 	  { label: "Guides", href: "/guides" },
		// 	],
		//   },
		//   {
		// 	title: "Company",
		// 	links: [
		// 	  { label: "About", href: "/about" },
		// 	  { label: "Contact", href: "/contact" },
		// 	  { label: "Careers", href: "/careers" },
		// 	],
		//   },
	],
	legalLinks: [
		{ label: "Privacy Policy", href: "/privacy" },
		{ label: "Terms of Service", href: "/terms" },
		{ label: "Refund Policy", href: "/refund-policy" },

		// { label: "Cookie Policy", href: "/cookies" },
	],
	copyright: "© 2025 Push to Post. All rights reserved.",
};
