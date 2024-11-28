'use client';

import { Heading, Paragraph } from '@/components/general/micro/typography';
import { heroTimerData } from '@/components/landing/waitlist/data'; // Configurable JSON data
import { EmailSignupForm } from '@/components/landing/waitlist/email-signup';
import CountdownTimer from '@/components/landing/waitlist/timer/countdown-timer';
import { TimeDisplayCard } from '@/components/landing/waitlist/timer/timedisplay-card';

const HeroTimerSection: React.FC = () => {
	return (
		<section className="grid w-full grid-cols-1 overflow-hidden bg-emerald-500 py-[40px] text-white sm:w-full sm:grid-cols-6 sm:gap-[80px] sm:py-0 sm:pl-5 lg:rounded-r-[20px] lg:rounded-tl-[20px]">
			{/* Left Column */}
			<div className="col-span-3 flex flex-col items-start justify-center space-y-4 px-3">
				<Heading
					as="h2"
					className="text-4xl font-bold tracking-tighter md:text-5xl"
				>
					{heroTimerData.heroTitle}
				</Heading>
				{/*<CountdownTimer />*/}
				<Paragraph className="text-md/relaxed text-[white] sm:text-sm/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
					{heroTimerData.heroDescription}
				</Paragraph>
				<EmailSignupForm />
			</div>

			{/* Right Column - Full Height */}
			<div className="relative col-span-3 h-full w-full sm:h-[30em]">
				<TimeDisplayCard />
			</div>
		</section>
	);
};

export default HeroTimerSection;
