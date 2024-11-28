'use client';

import { Aperture, FileText, Play, Users, Zap } from 'lucide-react';
import React from 'react';

import { Heading } from '@/components/general/micro/typography';

import FeatureCard from './feature-card';
import FeatureGrid from './feature-grid';

const HeroFeaturesSection = () => {
	return (
		<section className="w-full px-2 py-12 sm:px-6 md:py-24 lg:py-32">
			<Heading as="h1" className="mb-12 text-center text-4xl font-bold">
				Features
			</Heading>
			<div className="flex flex-col space-y-2">
				{/* Feature Cards */}
				<div className="grid gap-3 md:grid-cols-2 lg:gap-2">
					<FeatureCard
						icon={<Aperture className="h-6 w-6 text-blue-400" />}
						badgeColor="bg-blue-500"
						subtitle="Easy Integration"
						title="Work smarter not harder"
						description="With Xora, tedious tasks are history. Automation and smart processes bring your productivity to new heights. It's like having an extra cup of coffee, but without the jitters.With Xora, tedious tasks are history. Automation and smart processes bring your productivity to new heights. It's like having an extra cup of coffee, but without the jitters."
						buttonLabel="Watch the demo"
						buttonIcon={<Play className="h-4 w-4" />}
					/>
					<FeatureCard
						icon={
							<div className="h-6 w-6 rounded-full border-4 border-blue-400" />
						}
						badgeColor="bg-blue-500"
						subtitle="Secure & Trustworthy"
						title="Sleep easy, we got your back"
						description="Your data security is our priority. With state-of-the-art encryption and robust privacy controls, Xora helps keep your information secure and locked up tighter than Fort Knox."
						buttonLabel="Read the docs"
						buttonIcon={<FileText className="h-4 w-4" />}
					/>
				</div>

				{/* Features Bar */}
				<FeatureGrid
					features={[
						{
							icon: <Aperture className="h-5 w-5 text-blue-400" />,
							title: 'AI Automated Video Editing',
						},
						{
							icon: <Users className="h-5 w-5 text-blue-400" />,
							title: 'Collaborate with Your Team',
						},
						{
							icon: <Zap className="h-5 w-5 text-blue-400" />,
							title: 'Ultra Fast Cloud-Engine',
						},
					]}
				/>
			</div>
		</section>
	);
};

export default HeroFeaturesSection;
