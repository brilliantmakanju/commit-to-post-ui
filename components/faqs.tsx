import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "./ui/accordion";

export default function FAQs() {
	const faqData = [
		{
			q: "What is Push to Post?",
			a: "Push to Post turns your GitHub activity into shareable social media content. It helps you stay active online by automatically generating posts from your commits.",
		},
		{
			q: "Is my data secure?",
			a: "Yes. We use strong encryption and never share or expose your GitHub or social media credentials.",
		},
		{
			q: "Which platforms are supported?",
			a: "Currently LinkedIn, Twitter, and Discord. More like custom blogs are on the way.",
		},
		{
			q: "Can I edit the posts?",
			a: "Yes. Every post is fully editable. Tweak the message, tone, or hashtags before publishing.",
		},
		{
			q: "Do I need perfect commit messages?",
			a: "Nope. We clean them up, fix grammar, and turn them into readable, polished updates.",
		},
		{
			q: "Is there a Free plan?",
			a: "Yes. The Basic plan includes 5 posts per month. Paid plans unlock higher limits and more control.",
		},
	];

	return (
		<section className="w-full border-t border-gray-100 px-4 py-16 sm:px-6 sm:py-20 lg:py-24">
			<div className="mx-auto max-w-6xl">
				<div className="grid grid-cols-1 gap-12 lg:grid-cols-12 lg:gap-16">
					{/* Header Section */}
					<div className="text-center lg:col-span-4 lg:text-left">
						<h2 className="mb-4 text-3xl font-bold leading-tight tracking-tight text-gray-900 sm:mb-6 sm:text-4xl lg:text-5xl">
							Your Questions,
							<br className="hidden lg:block" />
							<span className="text-gray-600">Answered.</span>
						</h2>
						<p className="text-base leading-relaxed text-gray-600 sm:text-lg">
							Everything you need to know about Push to Post.
						</p>
					</div>

					{/* FAQ Accordion */}
					<div className="lg:col-span-8">
						<Accordion type="single" collapsible className="space-y-0">
							{faqData.map((item, index) => (
								<AccordionItem
									key={index}
									value={`item-${index}`}
									className="border-b border-gray-100 last:border-b-0"
								>
									<AccordionTrigger className="py-6 text-left text-base font-medium leading-relaxed text-gray-900 transition-colors duration-200 hover:text-gray-700 hover:no-underline sm:text-lg">
										{item.q}
									</AccordionTrigger>
									<AccordionContent className="pb-6 text-sm leading-relaxed text-gray-600 sm:text-base">
										{item.a}
									</AccordionContent>
								</AccordionItem>
							))}
						</Accordion>
					</div>
				</div>
			</div>
		</section>
	);
}
