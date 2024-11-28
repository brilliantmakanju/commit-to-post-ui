// 'use client';
//
// import { AnimatePresence, motion } from 'framer-motion';
// import {
// 	ArrowLeft,
// 	ArrowRight,
// 	BarChart3,
// 	Check,
// 	CornerDownRight,
// 	FileText,
// 	Lock,
// 	Quote,
// 	Sparkles,
// 	Star,
// } from 'lucide-react';
// import Image from 'next/image';
// import React, { useState } from 'react';
//
// import {
// 	Accordion,
// 	AccordionContent,
// 	AccordionItem,
// 	AccordionTrigger,
// } from '@/components/ui/accordion';
// import { Badge } from '@/components/ui/badge';
// import { Button } from '@/components/ui/button';
// import {
// 	Card,
// 	CardContent,
// 	CardDescription,
// 	CardFooter,
// 	CardHeader,
// 	CardTitle,
// } from '@/components/ui/card';
// import { Input } from '@/components/ui/input';
// import { Switch } from '@/components/ui/switch';
//
// interface Testimonial {
// 	id: number;
// 	name: string;
// 	role: string;
// 	company: string;
// 	image: string;
// 	companyLogo: string;
// 	content: string;
// 	rating: number;
// }
//
// export const Component = () => {
// 	const [activeIndex, setActiveIndex] = useState(0);
// 	const [direction, setDirection] = useState(0);
//
// 	const testimonials: Testimonial[] = [
// 		{
// 			id: 1,
// 			name: 'Sarah Johnson',
// 			role: 'CTO',
// 			company: 'TechCorp',
// 			image: '/Anime-Girl1.png',
// 			companyLogo: '/Anime-Girl2.png',
// 			content:
// 				'AICodePro has revolutionized our hiring process. The AI-powered assessments have helped us identify top talent faster than ever before, while significantly reducing our time-to-hire.',
// 			rating: 5,
// 		},
// 		{
// 			id: 2,
// 			name: 'Michael Chen',
// 			role: 'Engineering Manager',
// 			company: 'InnovateLabs',
// 			image: '/Anime-Girl4.png',
// 			companyLogo: '/Anime-Girl1.png',
// 			content:
// 				"The automated code analysis and detailed insights have been invaluable. We've seen a 40% reduction in our technical assessment time while maintaining the highest standards.",
// 			rating: 5,
// 		},
// 		{
// 			id: 3,
// 			name: 'Emily Rodriguez',
// 			role: 'Head of Talent',
// 			company: 'FutureScale',
// 			image: '/Anime-Girl2.png',
// 			companyLogo: '/Anime-Girl3.png',
// 			content:
// 				'What sets AICodePro apart is its ability to generate truly relevant coding challenges. The platform understands our needs and creates tests that actually reflect real-world scenarios.',
// 			rating: 5,
// 		},
// 		{
// 			id: 4,
// 			name: 'James Wilson',
// 			role: 'VP of Engineering',
// 			company: 'CodeBridge',
// 			image: '/Anime-Girl3.png',
// 			companyLogo: '/Anime-Girl2.png',
// 			content:
// 				"AICodePro's real-time analytics has transformed how we evaluate candidates. It's like having an extra team member who never gets tired.",
// 			rating: 5,
// 		},
// 		{
// 			id: 5,
// 			name: 'Olivia Martinez',
// 			role: 'Tech Lead',
// 			company: 'DevInnovators',
// 			image: '/Anime-Girl4.png',
// 			companyLogo: '/Anime-Girl1.png',
// 			content:
// 				'We’ve onboarded 25% faster since integrating AICodePro into our recruitment flow. It’s intuitive and highly effective.',
// 			rating: 5,
// 		},
// 		{
// 			id: 6,
// 			name: 'William Carter',
// 			role: 'Senior Recruiter',
// 			company: 'TalentWorks',
// 			image: '/Anime-Girl1.png',
// 			companyLogo: '/Anime-Girl3.png',
// 			content:
// 				'The data-driven insights provided by AICodePro have been invaluable in ensuring we make the best hiring decisions every time.',
// 			rating: 5,
// 		},
// 		{
// 			id: 7,
// 			name: 'Isabella Clark',
// 			role: 'Product Manager',
// 			company: 'FutureScale',
// 			image: '/Anime-Girl2.png',
// 			companyLogo: '/Anime-Girl2.png',
// 			content:
// 				'What used to take weeks now takes days. AICodePro is a game-changer for product development hiring.',
// 			rating: 5,
// 		},
// 		{
// 			id: 8,
// 			name: 'Benjamin Lee',
// 			role: 'Hiring Manager',
// 			company: 'InnovateLabs',
// 			image: '/Anime-Girl3.png',
// 			companyLogo: '/Anime-Girl4.png',
// 			content:
// 				'The ease of use and the speed of the platform have saved us countless hours. Highly recommended for scaling teams.',
// 			rating: 5,
// 		},
// 		{
// 			id: 9,
// 			name: 'Sophia Nguyen',
// 			role: 'HR Director',
// 			company: 'ScaleX',
// 			image: '/Anime-Girl4.png',
// 			companyLogo: '/Anime-Girl1.png',
// 			content:
// 				'We love how AICodePro customizes challenges for each role. It feels like the system understands our industry perfectly.',
// 			rating: 5,
// 		},
// 	];
//
// 	const nextTestimonial = () => {
// 		setDirection(1);
// 		setActiveIndex(previous => (previous + 1) % testimonials.length);
// 	};
//
// 	const previousTestimonial = () => {
// 		setDirection(-1);
// 		setActiveIndex(
// 			previous => (previous - 1 + testimonials.length) % testimonials.length,
// 		);
// 	};
//
// 	const variants = {
// 		enter: (direction: number) => {
// 			return {
// 				x: direction > 0 ? '100%' : '-100%',
// 				opacity: 0,
// 			};
// 		},
// 		center: {
// 			x: 0,
// 			opacity: 1,
// 		},
// 		exit: (direction: number) => {
// 			return {
// 				x: direction < 0 ? '100%' : '-100%',
// 				opacity: 0,
// 			};
// 		},
// 	};
//
// 	return (
// 		<section className="w-[100vh] px-3 py-24 dark:from-gray-900 dark:to-gray-800">
// 			<div className="">
// 				<div className="mb-12 flex flex-col items-center">
// 					<div className="mb-6 inline-block rounded-full bg-indigo-100 px-4 py-1.5 text-sm font-semibold text-indigo-600 dark:bg-indigo-900/40 dark:text-indigo-300">
// 						Testimonials
// 					</div>
// 					<h2 className="mb-4 text-center text-4xl font-bold text-gray-900 dark:text-white">
// 						What Our Awesome Customers Say
// 					</h2>
// 					<p className="max-w-2xl text-center text-lg text-gray-600 dark:text-gray-300">
// 						Join thousands of satisfied customers who have transformed their
// 						hiring process with AICodePro
// 					</p>
// 				</div>
//
// 				<div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-12 md:grid-cols-6">
// 					<motion.div
// 						className="relative aspect-square overflow-hidden rounded-2xl md:col-span-3 md:h-full"
// 						key={activeIndex}
// 						initial={{ opacity: 0 }}
// 						animate={{ opacity: 1 }}
// 						exit={{ opacity: 0 }}
// 						transition={{ duration: 0.5 }}
// 					>
// 						<Image
// 							src={testimonials[activeIndex].image}
// 							alt={testimonials[activeIndex].name}
// 							fill
// 							className="object-cover"
// 						/>
// 						<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
// 							<div className="flex -space-x-2">
// 								{testimonials.map((t, index) => (
// 									<div
// 										key={t.id}
// 										className="h-10 w-10 overflow-hidden rounded-full border-2 border-white"
// 									>
// 										<Image
// 											src={t.image}
// 											alt={`Trusted client ${index + 1}`}
// 											width={40}
// 											height={40}
// 											className="h-full w-full object-cover"
// 										/>
// 									</div>
// 								))}
// 								<div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-indigo-600 text-sm text-white">
// 									+50
// 								</div>
// 							</div>
// 							<p className="mt-2 text-sm text-white">
// 								Trusted by industry leaders
// 							</p>
// 						</div>
// 					</motion.div>
//
// 					<div className="relative h-[500px] w-[100%] overflow-hidden md:col-span-3 md:h-full md:w-full md:overflow-hidden">
// 						<AnimatePresence initial={false} custom={direction}>
// 							<motion.div
// 								key={activeIndex}
// 								custom={direction}
// 								variants={variants}
// 								initial="enter"
// 								animate="center"
// 								exit="exit"
// 								transition={{
// 									x: { type: 'spring', stiffness: 300, damping: 30 },
// 									opacity: { duration: 0.2 },
// 								}}
// 								className="absolute w-full"
// 							>
// 								<Card className="h-full overflow-hidden border-0 bg-indigo-50 pb-[26px] backdrop-blur-xl dark:bg-indigo-900/20">
// 									<CardContent className="p-8">
// 										<Quote className="mb-6 h-12 w-12 text-indigo-600" />
// 										<p className="mb-6 text-xl text-gray-700 dark:text-gray-200">
// 											{testimonials[activeIndex].content}
// 										</p>
// 										<div className="mb-4 flex items-center gap-4">
// 											{[...new Array(testimonials[activeIndex].rating)].map(
// 												(_, index) => (
// 													<Star
// 														key={index}
// 														className="h-5 w-5 fill-yellow-400 text-yellow-400"
// 													/>
// 												),
// 											)}
// 										</div>
// 										<div className="flex items-center gap-4">
// 											<div>
// 												<p className="font-semibold text-gray-900 dark:text-white">
// 													{testimonials[activeIndex].name}
// 												</p>
// 												<p className="text-sm text-gray-600 dark:text-gray-300">
// 													{testimonials[activeIndex].role} at{' '}
// 													{testimonials[activeIndex].company}
// 												</p>
// 											</div>
// 										</div>
// 									</CardContent>
// 								</Card>
// 							</motion.div>
// 						</AnimatePresence>
//
// 						<div className="absolute right-[10px] top-[10px] flex justify-end gap-2">
// 							<Button
// 								variant="outline"
// 								size="icon"
// 								onClick={previousTestimonial}
// 								className="rounded-full transition-all duration-300 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900 dark:hover:text-indigo-400"
// 							>
// 								<ArrowLeft className="h-4 w-4" />
// 							</Button>
// 							<Button
// 								variant="outline"
// 								size="icon"
// 								onClick={nextTestimonial}
// 								className="rounded-full transition-all duration-300 hover:bg-indigo-100 hover:text-indigo-600 dark:hover:bg-indigo-900 dark:hover:text-indigo-400"
// 							>
// 								<ArrowRight className="h-4 w-4" />
// 							</Button>
// 						</div>
// 					</div>
// 				</div>
// 			</div>
// 		</section>
// 	);
// };
//
// const PricingThreeTiers = () => {
// 	const tiers = [
// 		{
// 			name: 'Starter',
// 			price: '$29',
// 			description: 'Perfect for small teams',
// 			features: [
// 				'Up to 5 users',
// 				'5 AI-generated tests per month',
// 				'Basic analytics',
// 			],
// 		},
// 		{
// 			name: 'Pro',
// 			price: '$99',
// 			description: 'Best for growing companies',
// 			features: [
// 				'Up to 20 users',
// 				'Unlimited AI-generated tests',
// 				'Advanced analytics',
// 				'Priority support',
// 			],
// 		},
// 		{
// 			name: 'Enterprise',
// 			price: 'Custom',
// 			description: 'For large organizations',
// 			features: [
// 				'Unlimited users',
// 				'Unlimited AI-generated tests',
// 				'Custom integrations',
// 				'Dedicated account manager',
// 			],
// 		},
// 	];
//
// 	return (
// 		<div className="py-24 sm:py-32">
// 			<div className="mx-auto max-w-7xl px-6 lg:px-8">
// 				<div className="mx-auto max-w-4xl text-center">
// 					<h2 className="text-base font-semibold leading-7 text-indigo-600">
// 						Pricing
// 					</h2>
// 					<p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
// 						Choose the right plan for your team
// 					</p>
// 				</div>
// 				<div className="mt-16 flex flex-wrap justify-center gap-8">
// 					{tiers.map((tier, index) => (
// 						<Card
// 							key={tier.name}
// 							className={`w-full max-w-sm transition-all duration-300 ${
// 								index === 1
// 									? 'z-10 scale-105 bg-indigo-50 shadow-xl backdrop-blur-lg dark:bg-indigo-900/20'
// 									: 'bg-white dark:bg-gray-800'
// 							} group relative overflow-hidden hover:shadow-lg`}
// 						>
// 							<div className="absolute inset-0 origin-left scale-x-0 transform bg-gradient-to-r from-indigo-500 to-purple-500 transition-transform duration-300 group-hover:scale-x-100" />
// 							<CardHeader className="relative z-10">
// 								<CardTitle
// 									className={`text-2xl font-bold ${index === 1 ? 'text-indigo-600' : ''}`}
// 								>
// 									{tier.name}
// 								</CardTitle>
// 								<CardDescription>{tier.description}</CardDescription>
// 							</CardHeader>
// 							<CardContent className="relative z-10">
// 								<p
// 									className={`mb-4 text-4xl font-bold ${index === 1 ? 'text-indigo-600' : ''}`}
// 								>
// 									{tier.price}
// 								</p>
// 								<ul className="space-y-2">
// 									{tier.features.map(feature => (
// 										<li key={feature} className="flex items-center">
// 											<Check
// 												className={`mr-2 h-5 w-5 ${index === 1 ? 'text-indigo-600' : 'text-indigo-500'}`}
// 											/>
// 											{feature}
// 										</li>
// 									))}
// 								</ul>
// 							</CardContent>
// 							<CardFooter className="relative z-10">
// 								<Button
// 									className={`w-full ${index === 1 ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
// 								>
// 									Get Started
// 								</Button>
// 							</CardFooter>
// 						</Card>
// 					))}
// 				</div>
// 			</div>
// 		</div>
// 	);
// };
//
// const PricingTwoTiers = () => {
// 	const tiers = [
// 		{
// 			name: 'Basic',
// 			price: '$49',
// 			description: 'Everything you need to get started',
// 			features: [
// 				'Up to 10 users',
// 				'10 AI-generated tests per month',
// 				'Basic analytics',
// 				'Email support',
// 			],
// 		},
// 		{
// 			name: 'Premium',
// 			price: '$149',
// 			description: 'For teams that need more',
// 			features: [
// 				'Unlimited users',
// 				'Unlimited AI-generated tests',
// 				'Advanced analytics',
// 				'Priority support',
// 				'Custom integrations',
// 			],
// 		},
// 	];
//
// 	return (
// 		<div className="py-24 sm:py-32">
// 			<div className="mx-auto max-w-7xl px-6 lg:px-8">
// 				<div className="mx-auto max-w-4xl text-center">
// 					<h2 className="text-base font-semibold leading-7 text-indigo-600">
// 						Pricing
// 					</h2>
// 					<p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
// 						Simple, transparent pricing
// 					</p>
// 				</div>
// 				<div className="mt-16 flex flex-wrap justify-center gap-8">
// 					{tiers.map((tier, index) => (
// 						<Card
// 							key={tier.name}
// 							className={`w-full max-w-md transition-all duration-300 ${
// 								index === 0
// 									? 'z-10 scale-105 bg-indigo-50 shadow-xl backdrop-blur-lg dark:bg-indigo-900/20'
// 									: 'bg-white dark:bg-gray-800'
// 							} group relative overflow-hidden hover:shadow-lg`}
// 						>
// 							<div className="absolute inset-0 origin-left scale-x-0 transform bg-gradient-to-r from-indigo-500 to-purple-500 transition-transform duration-300 group-hover:scale-x-100" />
// 							<CardHeader className="relative z-10">
// 								<CardTitle
// 									className={`text-3xl font-bold ${index === 0 ? 'text-indigo-600' : ''}`}
// 								>
// 									{tier.name}
// 								</CardTitle>
// 								<CardDescription>{tier.description}</CardDescription>
// 							</CardHeader>
// 							<CardContent className="relative z-10">
// 								<p
// 									className={`mb-6 text-5xl font-bold ${index === 0 ? 'text-indigo-600' : ''}`}
// 								>
// 									{tier.price}
// 								</p>
// 								<ul className="space-y-3">
// 									{tier.features.map(feature => (
// 										<li key={feature} className="flex items-center">
// 											<Check
// 												className={`mr-3 h-6 w-6 ${index === 0 ? 'text-indigo-600' : 'text-indigo-500'}`}
// 											/>
// 											{feature}
// 										</li>
// 									))}
// 								</ul>
// 							</CardContent>
// 							<CardFooter className="relative z-10">
// 								<Button
// 									className={`w-full py-6 text-lg ${index === 0 ? 'bg-indigo-600 hover:bg-indigo-700' : ''}`}
// 								>
// 									Choose {tier.name}
// 								</Button>
// 							</CardFooter>
// 						</Card>
// 					))}
// 				</div>
// 			</div>
// 		</div>
// 	);
// };
//
// const HowItWorksCircular = () => {
// 	const steps = [
// 		{
// 			title: 'Define Criteria',
// 			description: 'Set your test requirements and difficulty level.',
// 		},
// 		{
// 			title: 'AI Generation',
// 			description:
// 				'Our AI creates custom coding challenges based on your criteria.',
// 		},
// 		{
// 			title: 'Candidate Testing',
// 			description: 'Send tests to candidates and track their progress.',
// 		},
// 		{
// 			title: 'Automated Analysis',
// 			description: 'AI evaluates submissions and provides detailed insights.',
// 		},
// 	];
//
// 	return (
// 		<div className="bg-gray-50 py-24 dark:bg-gray-900 sm:py-32">
// 			<div className="mx-auto max-w-7xl px-6 lg:px-8">
// 				<div className="mx-auto max-w-4xl text-center">
// 					<h2 className="text-base font-semibold leading-7 text-indigo-600">
// 						Process
// 					</h2>
// 					<p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
// 						How It Works
// 					</p>
// 				</div>
// 				<div className="relative mt-16">
// 					<div className="absolute inset-0 flex items-center justify-center">
// 						<div className="h-64 w-64 rounded-full border-4 border-indigo-500" />
// 					</div>
// 					<div className="relative z-10">
// 						{steps.map((step, index) => (
// 							<div
// 								key={step.title}
// 								className={`mb-16 flex items-center ${index % 2 === 0 ? 'justify-start' : 'justify-end'}`}
// 							>
// 								<Card className="w-64 bg-white dark:bg-gray-800">
// 									<CardHeader>
// 										<CardTitle className="text-lg font-semibold">
// 											{step.title}
// 										</CardTitle>
// 									</CardHeader>
// 									<CardContent>
// 										<p className="text-sm text-gray-600 dark:text-gray-300">
// 											{step.description}
// 										</p>
// 									</CardContent>
// 								</Card>
// 								{index < steps.length - 1 && (
// 									<CornerDownRight className="absolute left-1/2 top-full h-12 w-12 -translate-x-1/2 rotate-45 transform text-indigo-500" />
// 								)}
// 							</div>
// 						))}
// 					</div>
// 				</div>
// 			</div>
// 		</div>
// 	);
// };
//
// const HowItWorksInline = () => {
// 	const steps = [
// 		{
// 			title: 'Define Criteria',
// 			description: 'Set your test requirements and difficulty level.',
// 		},
// 		{
// 			title: 'AI Generation',
// 			description:
// 				'Our AI creates custom coding challenges based on your criteria.',
// 		},
// 		{
// 			title: 'Candidate Testing',
// 			description: 'Send tests to candidates and track their progress.',
// 		},
// 		{
// 			title: 'Automated Analysis',
// 			description: 'AI evaluates submissions and provides detailed insights.',
// 		},
// 	];
//
// 	return (
// 		<div className="bg-white py-24 dark:bg-gray-900 sm:py-32">
// 			<div className="mx-auto max-w-7xl px-6 lg:px-8">
// 				<div className="mx-auto mb-16 max-w-4xl text-center">
// 					<h2 className="text-base font-semibold leading-7 text-indigo-600">
// 						Process
// 					</h2>
// 					<p className="mt-2 text-4xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-5xl">
// 						How It Works
// 					</p>
// 				</div>
// 				<div className="flex flex-col items-start justify-between space-y-8 md:flex-row md:items-center md:space-x-4 md:space-y-0">
// 					{steps.map((step, index) => (
// 						<React.Fragment key={step.title}>
// 							<Card className="w-full bg-white dark:bg-gray-800 md:w-64">
// 								<CardHeader>
// 									<CardTitle className="text-lg font-semibold">
// 										{step.title}
// 									</CardTitle>
// 								</CardHeader>
// 								<CardContent>
// 									<p className="text-sm text-gray-600 dark:text-gray-300">
// 										{step.description}
// 									</p>
// 								</CardContent>
// 							</Card>
// 							{index < steps.length - 1 && (
// 								<CornerDownRight className="hidden h-8 w-8 rotate-[-45deg] transform text-indigo-500 md:block" />
// 							)}
// 						</React.Fragment>
// 					))}
// 				</div>
// 			</div>
// 		</div>
// 	);
// };
//
// function NewPricing() {
// 	const plans = [
// 		{
// 			name: 'Starter Digital Marketing',
// 			badge: 'Basic',
// 			price: '499',
// 			features: [
// 				'Social media management (2 platforms)',
// 				'Basic SEO optimization',
// 				'Monthly performance reports',
// 				'Email support',
// 			],
// 			buttonText: 'Get Started',
// 			buttonVariant: 'default' as const,
// 		},
// 		{
// 			name: 'Growth Digital Marketing',
// 			badge: 'Most Popular',
// 			price: '999',
// 			features: [
// 				'Social media management (3 platforms)',
// 				'Advanced SEO optimization',
// 				'Bi-weekly performance reports',
// 				'Content creation (2 blog posts per month)',
// 			],
// 			buttonText: 'Upgrade Now',
// 			buttonVariant: 'success' as const,
// 			popular: true,
// 		},
// 		{
// 			name: 'Pro Digital Marketing',
// 			badge: 'Premium',
// 			price: '1,999',
// 			features: [
// 				'Social media management (4 platforms)',
// 				'Comprehensive SEO optimization',
// 				'Weekly performance reports',
// 				'Content creation (4 blog posts per month)',
// 				'Paid advertising management',
// 			],
// 			buttonText: 'Choose Plan',
// 			buttonVariant: 'default' as const,
// 		},
// 	];
//
// 	return (
// 		<div className="w-full py-12">
// 			<h1 className="mb-12 text-center text-4xl font-bold">
// 				DIGITAL MARKETING PACKAGES
// 			</h1>
// 			<div className="flex w-full flex-col items-center justify-center gap-12 px-4 md:grid md:grid-cols-3 md:gap-6 md:px-3">
// 				{plans.map((plan, index) => (
// 					<Card
// 						key={plan.name}
// 						className={`relative flex w-full flex-col ${
// 							plan.popular
// 								? 'z-10 scale-105 bg-slate-900 text-white shadow-lg'
// 								: 'bg-white'
// 						}`}
// 					>
// 						{plan.popular && (
// 							<Badge className="absolute -top-4 left-1/2 flex w-[210px] -translate-x-1/2 items-center justify-center rounded-[10px] border-0 bg-[#66cc33] text-[23px] text-black hover:bg-[#66cc33]">
// 								{plan.badge}
// 								<span className="ml-1">★</span>
// 							</Badge>
// 						)}
// 						{!plan.popular && (
// 							<Badge
// 								variant="secondary"
// 								className="absolute -top-3 left-4 rounded-[10px] border-0 bg-slate-900 px-4 text-[13px] text-white hover:bg-slate-900"
// 							>
// 								{plan.badge}
// 							</Badge>
// 						)}
// 						<CardHeader>
// 							<CardTitle className="mt-4 whitespace-pre-line text-[1.75rem] font-bold leading-tight">
// 								{plan.name}
// 							</CardTitle>
// 						</CardHeader>
// 						<CardContent className="flex-1">
// 							<div className="relative h-full space-y-4">
// 								<div className="space-y-2">
// 									<ul className="space-y-2">
// 										{plan.features.map(feature => (
// 											<li key={feature} className="flex items-center gap-2">
// 												<Check
// 													className={`h-5 w-5 ${plan.popular ? 'text-[#66cc33]' : 'text-[#66cc33]'}`}
// 												/>
// 												<span className="text-sm">{feature}</span>
// 											</li>
// 										))}
// 									</ul>
// 								</div>
// 							</div>
// 						</CardContent>
// 						<CardFooter
// 							className={'flex flex-col items-start justify-center gap-4'}
// 						>
// 							<div className="mt-8">
// 								<h3 className="mb-2 text-lg font-medium">Price</h3>
// 								<div className="flex items-end justify-center">
// 									<span className="text-5xl font-bold">$</span>
// 									<span className="text-5xl font-bold">{plan.price}</span>
// 									<span className="ml-1 text-base">/ month</span>
// 								</div>
// 							</div>
//
// 							<Button
// 								className={`w-full ${
// 									plan.popular
// 										? 'bg-[#66cc33] text-white hover:bg-[#55bb22]'
// 										: 'bg-slate-900 text-white hover:bg-slate-800'
// 								}`}
// 							>
// 								{plan.buttonText}
// 							</Button>
// 						</CardFooter>
// 					</Card>
// 				))}
// 			</div>
// 		</div>
// 	);
// }
//
// export function NewNewPricing() {
// 	const plans = [
// 		{
// 			badge: 'Basic',
// 			name: 'Starter Digital\nMarketing',
// 			services: [
// 				'Social media management\n(2 platforms)',
// 				'Basic SEO optimization',
// 				'Monthly performance reports',
// 				'Email support',
// 			],
// 			price: '499',
// 			buttonText: 'Get Started',
// 		},
// 		{
// 			badge: 'Most Popular',
// 			name: 'Growth Digital\nMarketing',
// 			services: [
// 				'Social media management\n(3 platforms)',
// 				'Advanced SEO optimization',
// 				'Bi-weekly performance reports',
// 				'Content creation (2 blog posts\nper month)',
// 			],
// 			price: '999',
// 			buttonText: 'Upgrade Now',
// 			popular: true,
// 		},
// 		{
// 			badge: 'Premium',
// 			name: 'Pro Digital\nMarketing',
// 			services: [
// 				'Social media management\n(4 platforms)',
// 				'Comprehensive SEO optimization',
// 				'Weekly performance reports',
// 				'Content creation (4 blog posts per\nmonth)',
// 				'Paid advertising management',
// 			],
// 			price: '1,999',
// 			buttonText: 'Choose Plan',
// 		},
// 	];
//
// 	return (
// 		<div className="mx-auto w-full max-w-7xl px-4 py-16">
// 			<h1 className="mb-16 text-center text-[2rem] font-bold tracking-tight">
// 				DIGITAL MARKETING PACKAGES
// 			</h1>
//
// 			<div className="grid grid-cols-1 items-stretch gap-6 md:grid-cols-3">
// 				{plans.map((plan, index) => (
// 					<div
// 						key={index}
// 						className={`relative rounded-[20px] border border-gray-200 ${
// 							plan.popular
// 								? 'scale-105 transform bg-[#0f172a] text-white shadow-xl'
// 								: 'bg-white'
// 						}`}
// 					>
// 						<div
// 							className={`absolute ${
// 								plan.badge === 'Most Popular'
// 									? 'left-1/2 -translate-x-1/2 px-4'
// 									: 'left-6 px-3'
// 							} -top-3 rounded-full py-1 text-sm font-medium ${
// 								plan.badge === 'Most Popular'
// 									? 'bg-[#66cc33] text-white'
// 									: 'bg-[#0f172a] text-white'
// 							}`}
// 						>
// 							{plan.badge}
// 							{plan.badge === 'Most Popular' && <span className="ml-1">★</span>}
// 						</div>
//
// 						<div className="p-6 pb-8">
// 							<h2 className="mt-4 whitespace-pre-line text-[1.75rem] font-bold leading-tight">
// 								{plan.name}
// 							</h2>
//
// 							<div className="mt-8">
// 								<h3 className="mb-4 text-lg font-medium">Services</h3>
// 								<ul className="space-y-4">
// 									{plan.services.map((service, index_) => (
// 										<li key={index_} className="flex items-start gap-3">
// 											<Check className="mt-0.5 h-5 w-5 flex-shrink-0 text-[#66cc33]" />
// 											<span className="whitespace-pre-line text-[0.9375rem] leading-tight">
// 												{service}
// 											</span>
// 										</li>
// 									))}
// 								</ul>
// 							</div>
//
// 							<div className="mt-8">
// 								<h3 className="mb-2 text-lg font-medium">Price</h3>
// 								<div className="flex items-baseline">
// 									<span className="align-top text-2xl">$</span>
// 									<span className="text-5xl font-bold">{plan.price}</span>
// 									<span className="ml-1 text-base">/ month</span>
// 								</div>
// 							</div>
//
// 							<button
// 								className={`bottom absolute mt-8 w-full rounded-xl py-4 font-medium text-white ${
// 									plan.popular
// 										? 'bg-[#66cc33] hover:bg-[#5bb82e]'
// 										: 'bg-[#0f172a] hover:bg-[#1a2847]'
// 								}`}
// 							>
// 								{plan.buttonText}
// 							</button>
// 						</div>
// 					</div>
// 				))}
// 			</div>
// 		</div>
// 	);
// }
//
// export function Others() {
// 	const [showWaitlist, setShowWaitlist] = useState(false);
// 	return (
// 		<div className="w-full space-y-24 py-12">
// 			{/* Key Features Section */}
// 			<section className="container px-4 md:px-6">
// 				<div className="grid grid-cols-1 gap-6 md:grid-cols-3">
// 					{[
// 						{
// 							icon: <FileText className="h-8 w-8 text-[#D35400]" />,
// 							title: 'Rich Text Editor',
// 							description:
// 								'Express yourself with a powerful editor supporting markdown, formatting, and more.',
// 						},
// 						{
// 							icon: <Sparkles className="h-8 w-8 text-[#D35400]" />,
// 							title: 'Daily Inspiration',
// 							description:
// 								'Get inspired with daily prompts and mood-based imagery to spark your creativity.',
// 						},
// 						{
// 							icon: <Lock className="h-8 w-8 text-[#D35400]" />,
// 							title: 'Secure & Private',
// 							description:
// 								'Your thoughts are safe with enterprise-grade security and privacy features.',
// 						},
// 					].map((feature, index) => (
// 						<Card
// 							key={index}
// 							className="border-none bg-white shadow-lg transition-shadow hover:shadow-xl"
// 						>
// 							<CardHeader>
// 								<div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50">
// 									{feature.icon}
// 								</div>
// 								<CardTitle className="text-xl text-[#8B4513]">
// 									{feature.title}
// 								</CardTitle>
// 							</CardHeader>
// 							<CardContent>
// 								<p className="text-[#666666]">{feature.description}</p>
// 							</CardContent>
// 						</Card>
// 					))}
// 				</div>
// 			</section>
//
// 			{/* Major Features Section */}
// 			<section className="container px-4 md:px-6">
// 				<div className="space-y-12">
// 					<div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
// 						<div className="space-y-6">
// 							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50">
// 								<FileText className="h-8 w-8 text-[#D35400]" />
// 							</div>
// 							<h2 className="text-2xl font-semibold text-[#8B4513]">
// 								Rich Text Editor
// 							</h2>
// 							<div className="space-y-4">
// 								<p className="text-[#666666]">
// 									Express yourself fully with our powerful editor featuring:
// 								</p>
// 								<ul className="space-y-2">
// 									<li className="flex items-center gap-2 text-[#666666]">
// 										<div className="h-1.5 w-1.5 rounded-full bg-[#D35400]" />
// 										Format text with ease
// 									</li>
// 									<li className="flex items-center gap-2 text-[#666666]">
// 										<div className="h-1.5 w-1.5 rounded-full bg-[#D35400]" />
// 										Embed links
// 									</li>
// 								</ul>
// 							</div>
// 						</div>
// 						<div className="aspect-video rounded-lg bg-gray-100 shadow-lg" />
// 					</div>
//
// 					<div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
// 						<div className="order-2 aspect-video rounded-lg bg-gray-100 shadow-lg md:order-1" />
// 						<div className="order-1 space-y-6 md:order-2">
// 							<div className="flex h-12 w-12 items-center justify-center rounded-lg bg-orange-50">
// 								<BarChart3 className="h-8 w-8 text-[#D35400]" />
// 							</div>
// 							<h2 className="text-2xl font-semibold text-[#8B4513]">
// 								Mood Analytics
// 							</h2>
// 							<div className="space-y-4">
// 								<p className="text-[#666666]">
// 									Track your emotional journey with powerful analytics:
// 								</p>
// 								<ul className="space-y-2">
// 									<li className="flex items-center gap-2 text-[#666666]">
// 										<div className="h-1.5 w-1.5 rounded-full bg-[#D35400]" />
// 										Visual mood trends
// 									</li>
// 									<li className="flex items-center gap-2 text-[#666666]">
// 										<div className="h-1.5 w-1.5 rounded-full bg-[#D35400]" />
// 										Pattern recognition
// 									</li>
// 								</ul>
// 							</div>
// 						</div>
// 					</div>
// 				</div>
// 			</section>
//
// 			{/* Call to Action Section */}
// 			<section className="relative">
// 				<div className="absolute inset-0 bg-gradient-to-r from-orange-50 to-yellow-50" />
// 				<div className="container relative px-4 py-24 md:px-6">
// 					<Card className="mx-auto max-w-3xl space-y-8 rounded-xl bg-white/80 p-8 text-center shadow-2xl backdrop-blur-sm">
// 						<CardHeader>
// 							<CardTitle className="text-3xl font-semibold text-[#8B4513]">
// 								Start Reflct-ing on Your Journey Today
// 							</CardTitle>
// 						</CardHeader>
// 						<CardContent className="space-y-6">
// 							<p className="text-lg text-[#666666]">
// 								Join thousands of writers who have already discovered the power
// 								of digital journaling.
// 							</p>
// 							<div className="flex items-center justify-center space-x-2">
// 								<span className="text-sm text-[#666666]">CTA</span>
// 								<Switch
// 									checked={showWaitlist}
// 									onCheckedChange={setShowWaitlist}
// 								/>
// 								<span className="text-sm text-[#666666]">Waitlist</span>
// 							</div>
// 							{showWaitlist ? (
// 								<form
// 									onSubmit={e => e.preventDefault()}
// 									className="mx-auto flex max-w-md gap-2"
// 								>
// 									<Input
// 										type="email"
// 										placeholder="Enter your email"
// 										className="flex-1 border-[#D35400] bg-white focus:ring-2 focus:ring-[#D35400]"
// 									/>
// 									<Button
// 										type="submit"
// 										className="bg-[#8B4513] text-white shadow-lg transition-shadow hover:bg-[#6B3E0F] hover:shadow-xl"
// 									>
// 										Join Waitlist
// 									</Button>
// 								</form>
// 							) : (
// 								<Button className="h-auto bg-[#D35400] px-8 py-6 text-lg text-white shadow-lg transition-shadow hover:bg-[#A04000] hover:shadow-xl">
// 									Get Started for Free
// 									<span className="ml-2">→</span>
// 								</Button>
// 							)}
// 						</CardContent>
// 					</Card>
// 				</div>
// 			</section>
//
// 			{/* FAQ Section */}
// 			<section className="container px-4 md:px-6">
// 				<h2 className="mb-12 text-center text-3xl font-semibold text-[#8B4513]">
// 					Frequently Asked Questions
// 				</h2>
// 				<Accordion type="single" collapsible className="mx-auto max-w-2xl">
// 					{[
// 						{
// 							question: 'Is my journal data secure?',
// 							answer:
// 								'Yes, we use enterprise-grade encryption to protect your journal entries.',
// 						},
// 						{
// 							question: 'Can I organize my journal entries?',
// 							answer:
// 								'Yes, you can use tags, categories, and custom organization systems.',
// 						},
// 						{
// 							question: 'How does the mood tracking work?',
// 							answer:
// 								'Each entry can be tagged with a mood, and our analytics tool creates visual representations of your emotional journey over time.',
// 						},
// 						{
// 							question: 'Is there a mobile app?',
// 							answer:
// 								'Yes, we have iOS and Android apps available for journaling on the go.',
// 						},
// 					].map((item, index) => (
// 						<AccordionItem
// 							key={index}
// 							value={`item-${index}`}
// 							className="mb-4 rounded-lg border shadow-md"
// 						>
// 							<AccordionTrigger className="px-4 py-3 text-[#8B4513] hover:text-[#D35400]">
// 								{item.question}
// 							</AccordionTrigger>
// 							<AccordionContent className="px-4 pb-3 text-[#666666]">
// 								{item.answer}
// 							</AccordionContent>
// 						</AccordionItem>
// 					))}
// 				</Accordion>
// 			</section>
// 		</div>
// 	);
// }
//
// const PricingAndHowItWorks = () => {
// 	return (
// 		<div>
// 			{/*<PricingThreeTiers />*/}
// 			<NewPricing />
// 			{/*<NewNewPricing />*/}
// 			{/*<PricingTwoTiers />*/}
// 			{/*<HowItWorksCircular />*/}
// 			{/*<HowItWorksInline />*/}
// 			{/*<Component />*/}
// 		</div>
// 	);
// };
//
// export default PricingAndHowItWorks;
import React from 'react';

const Test = () => {
	return <div>Test</div>;
};

export default Test;
