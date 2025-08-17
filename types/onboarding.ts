export interface Step {
	id: number;
	title: string;
	subtitle: string;
	content: string;
	optional: boolean;
	icon: React.ReactNode;
	completed?: boolean;
}

export interface OnboardingConfig {
	steps: Step[];
	allowBackNavigation?: boolean;
	allowSkipOptional?: boolean;
	showProgress?: boolean;
}

export interface SocialAccount {
	id: string;
	name: string;
	icon: string;
	color: string;
	description: string;
	isConnected?: boolean;
	connectedEmail?: string;
}

export interface OnboardingStep {
	id: number;
	title: string;
	isActive: boolean;
	description: string;
	isCompleted: boolean;
}

export interface ConnectionProps {
	accounts: SocialAccount[];
	onConnectAnother: () => void;
	onConnect: (accountId: string) => void;
	onRevoke: (accountId: string) => void;
}
