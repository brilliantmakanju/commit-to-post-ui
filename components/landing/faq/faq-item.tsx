import {
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from '@/components/ui/accordion';

type FAQItemProps = {
	question: string;
	answer: string;
	value: string;
};

const FAQItem = ({ question, answer, value }: FAQItemProps) => {
	return (
		<AccordionItem key={value} value={value} className="mb-4">
			<AccordionTrigger className="px-4 py-3 text-[#8B4513] hover:text-[#D35400]">
				{question}
			</AccordionTrigger>
			<AccordionContent className="px-4 pb-3 text-[#666666]">
				{answer}
			</AccordionContent>
		</AccordionItem>
	);
};

export default FAQItem;
