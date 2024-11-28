import { Accordion } from '@/components/ui/accordion';

import faqItems from './data/faqitems.json';
import FAQItem from './faq-item';

const FAQSection = () => {
	return (
		<section className="container px-4 md:px-6">
			<h2 className="mb-12 text-center text-3xl font-semibold text-[#8B4513]">
				Frequently Asked Questions
			</h2>
			<Accordion type="single" collapsible className="mx-auto max-w-2xl">
				{faqItems.map((item, index) => (
					<FAQItem
						key={index}
						value={`item-${index}`}
						question={item.question}
						answer={item.answer}
					/>
				))}
			</Accordion>
		</section>
	);
};

export default FAQSection;
