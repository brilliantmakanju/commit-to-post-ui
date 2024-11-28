type HeroBannerTopProps = {
	// The icon to display in the banner, it defaults to null
	icon?: any | null;

	// The title text to be displayed in the banner
	title?: string;

	// The content text to be displayed alongside the title
	content?: string;

	// Custom styles for the title text
	titleStyles?: string;

	// Custom styles for the content text
	contentStyles?: string;

	// Custom styles for the container
	customStyles?: string;

	// Variant for different designs
	variant?: 'outline' | 'default'; // Can add more variants as needed
};

export interface HeroTimerData {
	heroTitle: string;
	heroDescription: string;
	launchTimeInSeconds: number;
}

export type FooterProps = {
	companyName?: string;
	tagline?: string;
	sections?: {
		title: string;
		links: { label: string; href: string }[];
	}[];
	legalLinks?: { label: string; href: string }[];
	copyright?: string;
};

export type AuthModalProps = {
	trigger: any;
};
