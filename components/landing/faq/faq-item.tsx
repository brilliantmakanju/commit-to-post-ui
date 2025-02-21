import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";

type FAQItemProps = {
	question: string;
	answer: string;
	value: string;
};

const FAQItem = ({ question, answer, value }: FAQItemProps) => {
	return (
		<AccordionItem
			key={value}
			value={value}
			className="border-b border-gray-200 last:border-none dark:border-gray-700"
		>
			<AccordionTrigger className="px-4 py-3 text-gray-900 transition-colors duration-200 hover:text-emerald-500 dark:text-gray-100">
				{question}
			</AccordionTrigger>
			<AccordionContent className="px-4 pb-3 text-gray-600 dark:text-gray-400">
				{answer}
			</AccordionContent>
		</AccordionItem>
	);
};

export default FAQItem;
