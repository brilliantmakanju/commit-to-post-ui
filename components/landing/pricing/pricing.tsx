import { Check } from 'lucide-react';
import React from 'react';

import { Heading, Span } from '@/components/general/micro/typography';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
	Card,
	CardContent,
	CardFooter,
	CardHeader,
	CardTitle,
} from '@/components/ui/card';

import { pricingData } from './data'; // Importing directly here

const Pricing = () => {
	const { title, plans } = pricingData; // Destructure the data for easy use

	return (
		<div className="w-full py-12">
			<Heading as="h1" className="mb-12 text-center text-4xl font-bold">
				{title}
			</Heading>
			<div className="flex w-full flex-col items-center justify-center gap-12 px-4 md:grid md:grid-cols-3 md:gap-6 md:px-3">
				{plans.map(plan => (
					<Card
						key={plan.name}
						className={`relative flex w-full flex-col ${
							plan.popular
								? 'z-10 scale-105 bg-slate-900 text-white shadow-lg'
								: 'bg-white'
						}`}
					>
						{plan.popular ? (
							<Badge className="absolute -top-4 left-1/2 flex w-[210px] -translate-x-1/2 items-center justify-center rounded-[10px] border-0 bg-[#66cc33] text-[23px] text-black hover:bg-[#66cc33]">
								{plan.badge}
								<span className="ml-1">★</span>
							</Badge>
						) : (
							<Badge
								variant="secondary"
								className="absolute -top-3 left-4 rounded-[10px] border-0 bg-slate-900 px-4 text-[13px] text-white hover:bg-slate-900"
							>
								{plan.badge}
							</Badge>
						)}
						<CardHeader>
							<CardTitle className="mt-4 whitespace-pre-line text-[1.75rem] font-bold leading-tight">
								{plan.name}
							</CardTitle>
						</CardHeader>
						<CardContent className="flex-1">
							<div className="relative h-full space-y-4">
								<ul className="space-y-2">
									{plan.features.map(feature => (
										<li key={feature} className="flex items-center gap-2">
											<Check className={`h-5 w-5 text-[#66cc33]`} />
											<span className="text-sm">{feature}</span>
										</li>
									))}
								</ul>
							</div>
						</CardContent>
						<CardFooter className="flex flex-col items-start justify-center gap-4">
							<div className="mt-8">
								<Span className="mb-2 text-lg font-medium">Price</Span>
								<div className="flex items-end justify-center">
									<span className="text-5xl font-bold">$</span>
									<span className="text-5xl font-bold">{plan.price}</span>
									<span className="ml-1 text-base">/ month</span>
								</div>
							</div>
							<Button
								className={`w-full ${
									plan.popular
										? 'bg-[#66cc33] text-white hover:bg-[#55bb22]'
										: 'bg-slate-900 text-white hover:bg-slate-800'
								}`}
							>
								{plan.buttonText}
							</Button>
						</CardFooter>
					</Card>
				))}
			</div>
		</div>
	);
};

export default Pricing;
