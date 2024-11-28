'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface HeroButtonsProps {
	layout?: 'col' | 'row' | 'input';
	primaryLabel?: string;
	secondaryLabel?: string;
	onPrimaryClick?: () => void;
	onSecondaryClick?: () => void;
	onEmailSubmit?: (email: string) => void;
}

const HeroButtons: React.FC<HeroButtonsProps> = ({
	layout = 'col',
	primaryLabel = 'Get Started',
	secondaryLabel = 'View Demo',
	onPrimaryClick,
	onSecondaryClick,
	onEmailSubmit,
}) => {
	const handleEmailSubmit = (event_: React.FormEvent<HTMLFormElement>) => {
		event_.preventDefault();
		const email = (
			event_.currentTarget.elements.namedItem('email') as HTMLInputElement
		)?.value;
		if (onEmailSubmit && email) {
			onEmailSubmit(email);
		}
	};

	if (layout === 'input') {
		return (
			<div className="mx-auto w-full max-w-sm">
				<form onSubmit={handleEmailSubmit} className="flex space-x-2">
					<Input
						type="email"
						name="email"
						placeholder="Enter your email"
						required
					/>
					<Button
						type="submit"
						className="bg-emerald-500 text-white hover:bg-emerald-600"
					>
						{primaryLabel}
					</Button>
				</form>
			</div>
		);
	}

	return (
		<div
			className={`flex ${
				layout === 'col' ? 'flex-col' : 'flex-row'
			} justify-center gap-4`}
		>
			<Button
				className="bg-emerald-500 hover:bg-emerald-600"
				onClick={onPrimaryClick}
			>
				{primaryLabel}
			</Button>
			<Button variant="outline" onClick={onSecondaryClick}>
				{secondaryLabel}
			</Button>
		</div>
	);
};

export default HeroButtons;
