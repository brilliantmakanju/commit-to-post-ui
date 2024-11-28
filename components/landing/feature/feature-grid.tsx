'use client';

import React from 'react';

import { Card, CardContent } from '@/components/ui/card';

interface FeatureGridProps {
	features: {
		icon: React.ReactNode;
		title: string;
	}[];
}

const FeatureGrid: React.FC<FeatureGridProps> = ({ features }) => {
	return (
		<Card className="mt-6 border-[#1a2142] bg-[#0e1631]/80 text-white lg:mt-12">
			<CardContent className="p-6">
				<div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
					{features.map((feature, index) => (
						<div
							key={index}
							className="flex flex-col items-center space-y-2 p-2 text-center"
						>
							<div className="relative h-10 w-10">
								<div className="absolute inset-0 rounded-full bg-blue-500 opacity-20 blur-lg" />
								<div className="relative flex h-10 w-10 items-center justify-center rounded-full border border-[#2a3152] bg-[#1a2142]">
									{feature.icon}
								</div>
							</div>
							<p className="text-xs font-medium uppercase tracking-wider text-gray-400">
								{feature.title}
							</p>
						</div>
					))}
				</div>
			</CardContent>
		</Card>
	);
};

export default FeatureGrid;
