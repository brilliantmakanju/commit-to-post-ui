"use client";

import { ArrowRight } from "lucide-react";
import React from "react";

import {
	Span,
	// eslint-disable-next-line import/no-unresolved
} from "@/components/general/micro/typography";
// eslint-disable-next-line import/no-unresolved
import { benefits } from "@/components/landing/data";

const BenefitCards: React.FC = () => {
	return (
		<section
			id="features"
			className="w-full bg-gray-50 dark:bg-gray-900 lg:pt-32"
		>
			<div className="container mx-auto px-4">
				<h2 className="mb-12 text-center text-4xl font-semibold text-gray-800 dark:text-gray-200">
					Supercharge Your Project Updates
				</h2>
				<div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 md:grid-cols-3 md:grid-rows-3">
					<div className="md:col-span-2 md:row-span-1">
						<BenefitCard benefit={benefits[0]} />
					</div>
					<div className="md:col-span-1 md:row-span-2">
						<BenefitCard benefit={benefits[1]} />
					</div>
					<div className="md:col-span-1 md:row-span-2">
						<BenefitCard benefit={benefits[2]} />
					</div>
					<div className="hidden items-center justify-center md:col-span-1 md:col-start-2 md:row-span-1 md:row-start-2 md:flex">
						<div className="text-center">
							<div className="mb-3 rounded-2xl bg-gray-100 p-4 dark:bg-gray-800">
								<Span className="bg-gradient-to-r from-gray-700 to-gray-500 bg-clip-text text-transparent">
									Introducing
								</Span>
							</div>
							<h3 className="mb-2 bg-gradient-to-r from-gray-700 to-gray-500 bg-clip-text text-3xl font-semibold text-transparent">
								Push to Post
							</h3>
							<p className="max-w-[200px] text-center text-sm text-gray-600 dark:text-gray-400">
								Your AI-powered social media automation for developers
							</p>
						</div>
					</div>
					<div className="md:col-span-2 md:row-span-1">
						<BenefitCard benefit={benefits[3]} />
					</div>
				</div>
			</div>
		</section>
	);
};

const BenefitCard: React.FC<{ benefit: (typeof benefits)[0] }> = ({
	benefit,
}) => {
	return (
		<div className="flex h-full w-full flex-col overflow-hidden rounded-xl bg-white shadow-md transition-transform duration-300 hover:-translate-y-1 hover:shadow-lg dark:bg-gray-800">
			<div className="flex h-full flex-col p-6">
				<div className="mb-4 flex items-center">
					<div className="mr-4 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-700">
						<benefit.icon className="h-6 w-6 text-gray-600 dark:text-gray-300" />
					</div>
					<h3 className="text-lg font-medium text-gray-900 dark:text-white">
						{benefit.title}
					</h3>
				</div>
				<p className="mb-6 text-sm text-gray-600 dark:text-gray-300">
					{benefit.description}
				</p>
				<ul className="mt-auto space-y-2">
					{benefit.features.map((feature, index) => (
						<li
							key={index}
							className="flex items-start text-sm text-gray-700 dark:text-gray-200"
						>
							<ArrowRight className="mr-2 mt-1 h-4 w-4 flex-shrink-0 text-gray-500 dark:text-gray-400" />
							<span>{feature}</span>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
};

export default BenefitCards;
