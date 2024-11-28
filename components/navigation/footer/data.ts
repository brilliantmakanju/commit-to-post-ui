import { FooterProps } from '@/types';

export const footerData: FooterProps = {
	companyName: 'DevLock Inc',
	tagline: 'Building the future of web development, one component at a time.',
	sections: [
		{
			title: 'Product',
			links: [
				{ label: 'Features', href: '#' },
				{ label: 'Pricing', href: '#' },
				{ label: 'Docs', href: '#' },
			],
		},
		{
			title: 'Company',
			links: [
				{ label: 'About', href: '#' },
				{ label: 'Blog', href: '#' },
				{ label: 'Careers', href: '#' },
			],
		},
	],
	legalLinks: [
		{ label: 'Terms of Service', href: '#' },
		{ label: 'Privacy Policy', href: '#' },
	],
	copyright: '© 2024 Devlock Inc. All rights reserved.',
};
