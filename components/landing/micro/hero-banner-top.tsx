'use client';
import React from 'react';

// eslint-disable-next-line import/named
import { HeroBannerTopProps } from '@/types';

const HeroBannerTop = ({
	icon: Icon,
	title = 'New Feature',
	content = 'AI-powered analytics now available!',
	titleStyles = '',
	contentStyles = '',
	customStyles = '',
	variant = 'default', // Default variant is 'default'
}: HeroBannerTopProps) => {
	return (
		<>
			{/* Default Variant */}
			{variant === 'default' && (
				<div
					className={`inline-flex items-center rounded-full border border-transparent bg-emerald-500 px-2.5 py-0.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-emerald-500/80 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${customStyles}`}
				>
					{/* Render icon if provided */}
					{Icon && <Icon className="mr-1 h-3 w-3" />}

					{/* Title with optional custom styles */}
					<span className={`text-white ${titleStyles}`}>{title}</span>

					{/* Content with optional custom styles */}
					<span className={`ml-1 text-emerald-200 ${contentStyles}`}>
						{content}
					</span>
				</div>
			)}

			{/* Outline Variant */}
			{variant === 'outline' && (
				<div
					className={`inline-flex items-center rounded-full border border-transparent bg-emerald-500/10 py-0.5 pl-2.5 pr-[1.5px] text-xs font-semibold text-emerald-600 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 dark:text-emerald-400 ${customStyles}`}
				>
					{/* Render icon if provided */}
					{Icon && <Icon className="mr-1 h-3 w-3" />}

					{/* Title with optional custom styles */}
					<span className={` ${titleStyles}`}>{title}</span>

					{/* Content with optional custom styles */}
					<span
						className={`ml-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] text-white ${contentStyles}`}
					>
						{content}
					</span>
				</div>
			)}
		</>
	);
};

export default HeroBannerTop;
