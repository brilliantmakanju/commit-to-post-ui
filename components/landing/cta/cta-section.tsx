'use client';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';

import CTAWaitlistForm from './cta-waitlistform';

const CTASection = () => {
	const [showWaitlist, setShowWaitlist] = useState(false);

	// eslint-disable-next-line unicorn/consistent-function-scoping
	const handleWaitlistSubmit = (email: string) => {
		console.log(`Email submitted: ${email}`);
		// Add your email submission logic here
	};

	return (
		<section className="relative w-full">
			<div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-yellow-50" />
			<div className="relative py-24 md:px-6">
				<Card className="mx-auto max-w-3xl space-y-8 rounded-xl bg-white/80 p-8 text-center shadow-2xl backdrop-blur-sm">
					<CardHeader>
						<CardTitle className="text-3xl font-semibold text-[#8B4513]">
							Start Reflct-ing on Your Journey Today
						</CardTitle>
					</CardHeader>
					<CardContent className="space-y-6">
						<p className="text-lg text-[#666666]">
							Join thousands of writers who have already discovered the power of
							digital journaling.
						</p>
						{/*<div className="flex items-center justify-center space-x-2">*/}
						{/*<span className="text-sm text-[#666666]">CTA</span>*/}
						{/*<Switch*/}
						{/*    checked={showWaitlist}*/}
						{/*    onCheckedChange={setShowWaitlist}*/}
						{/*/>*/}
						{/*<span className="text-sm text-[#666666]">Waitlist</span>*/}
						{/*</div>*/}
						{showWaitlist ? (
							<CTAWaitlistForm onSubmit={handleWaitlistSubmit} />
						) : (
							<Button className="h-auto bg-[#D35400] px-8 py-6 text-lg text-white shadow-lg transition-shadow hover:bg-[#A04000] hover:shadow-xl">
								Get Started for Free
								<span className="ml-2">→</span>
							</Button>
						)}
					</CardContent>
				</Card>
			</div>
		</section>
	);
};

export default CTASection;
