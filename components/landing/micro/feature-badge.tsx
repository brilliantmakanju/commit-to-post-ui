'use client';

import { cn } from '@/lib/utils';

interface FeatureBadgeProps {
	title: string;
	description: string;
	badgeStyles?: string;
	titleStyles?: string;
	descriptionStyles?: string;
}

const FeatureBadge: React.FC<FeatureBadgeProps> = ({
	title,
	description,
	badgeStyles = '',
	titleStyles = '',
	descriptionStyles = '',
}) => {
	return (
		<div
			className={cn(
				'inline-flex items-center rounded-full border border-transparent bg-emerald-500 px-2.5 py-0.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-emerald-500/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
				badgeStyles,
			)}
		>
			<span className={cn('text-white', titleStyles)}>{title}</span>
			<span className={cn('ml-1 text-emerald-200', descriptionStyles)}>
				{description}
			</span>
		</div>
	);
};

export default FeatureBadge;
