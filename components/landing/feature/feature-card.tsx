'use client';

import { Heading, Paragraph } from '@/components/general/micro/typography';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

interface FeatureCardProps {
	icon: React.ReactNode;
	badgeColor?: string;
	title: string;
	subtitle: string;
	description: string;
	buttonLabel: string;
	buttonIcon?: React.ReactNode;
	onButtonClick?: () => void;
}

const FeatureCard: React.FC<FeatureCardProps> = ({
	icon,
	badgeColor = 'bg-emerald-500',
	title,
	subtitle,
	description,
	buttonLabel,
	buttonIcon,
	onButtonClick,
}) => {
	return (
		<Card className="overflow-hidden border-[#1a2142] bg-gradient-to-br from-[#0b1224] to-[#131b38] text-white shadow-lg">
			<CardContent className="space-y-6 p-8">
				<div className="relative h-12 w-12">
					<div
						className={`absolute inset-0 ${badgeColor} rounded-full opacity-50 blur-lg`}
					/>
					<div className="relative flex h-12 w-12 items-center justify-center rounded-full border border-[#2a3152] bg-[#1a2142]">
						{icon}
					</div>
				</div>
				<div className="space-y-4">
					<Paragraph className="text-sm font-medium uppercase tracking-wider text-emerald-400">
						{subtitle}
					</Paragraph>
					<Heading as="h2" className="text-3xl font-bold">
						{title}
					</Heading>
					<Paragraph className="md:text-md leading-relaxed text-gray-400">
						{description}
					</Paragraph>
				</div>
				<Button
					onClick={onButtonClick}
					className="group transform gap-2 border-0 bg-emerald-600 text-white shadow-md transition-transform hover:scale-105 hover:bg-emerald-500"
					size="lg"
				>
					{buttonIcon}
					{buttonLabel}
				</Button>
			</CardContent>
		</Card>
	);
};

export default FeatureCard;
