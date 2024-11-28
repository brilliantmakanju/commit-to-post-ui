'use client';

import { cn } from '@/lib/utils'; // Import utility for combining class names.

interface TypographyProps {
	children: React.ReactNode;
	className?: string;
}

export const Heading: React.FC<
	TypographyProps & { as?: 'h1' | 'h2' | 'h3' | 'h4' }
> = ({ children, as = 'h1', className }) => {
	const Component = as; // Dynamically decide the heading tag.
	return (
		<Component
			className={cn(
				'text-3xl font-bold tracking-tighter sm:text-5xl xl:text-6xl',
				className,
			)}
		>
			{children}
		</Component>
	);
};

export const Paragraph: React.FC<TypographyProps> = ({
	children,
	className,
}) => {
	return (
		<p
			className={cn(
				'max-w-[600px] text-muted-foreground md:text-xl',
				className,
			)}
		>
			{children}
		</p>
	);
};

export const Span: React.FC<TypographyProps> = ({ children, className }) => {
	return <span className={cn('text-emerald-500', className)}>{children}</span>;
};
