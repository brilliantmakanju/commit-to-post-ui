import { Accordion } from "@/components/ui/accordion";

import faqItems from "./data/faqitems.json";
import FAQItem from "./faq-item";

const FAQSection = () => {
	return (
		<section id="q&a" className="container px-4 py-16 md:px-6">
			<h2 className="mb-10 text-center text-3xl font-semibold text-gray-900 dark:text-gray-100">
				Frequently Asked Questions
			</h2>
			<Accordion
				type="single"
				collapsible
				className="mx-auto max-w-3xl rounded-lg border border-gray-200 dark:border-gray-700"
			>
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
