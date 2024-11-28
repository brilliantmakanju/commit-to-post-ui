import { ReactNode } from 'react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const FeatureCard = ({
	icon,
	title,
	description,
}: {
	icon: ReactNode;
	title: string;
	description: string;
}) => {
	return (
		<Card className="border-none bg-white shadow-lg transition-shadow hover:shadow-xl">
			<CardHeader>
				<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50">
					{icon}
				</div>
				<CardTitle className="text-xl text-[#8B4513]">{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<p className="text-[#666666]">{description}</p>
			</CardContent>
		</Card>
	);
};

export default FeatureCard;
