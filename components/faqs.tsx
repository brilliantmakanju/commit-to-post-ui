export default function FAQs() {
	return (
		<section
			id="faq"
			className="shadow-fade relative mx-auto mb-1 w-full max-w-[1200px] gap-8 overflow-hidden rounded-xl border border-[#969DAD] border-opacity-15 bg-[#FFFFFF] px-1 py-0 pt-12 font-mono md:px-0 md:py-0 md:pt-12 lg:py-20 lg:pl-12"
		>
			<div className="mx-auto max-w-6xl px-6">
				<div className="grid gap-y-12 px-2 lg:[grid-template-columns:1fr_auto]">
					<div className="text-center lg:text-left">
						<h2 className="mb-4 text-3xl font-semibold text-[#1F2937] dark:text-white md:text-4xl">
							Your Questions, <br className="hidden lg:block" /> Answered.
						</h2>
						<p className="text-[#6B7280] dark:text-[#D1D5DB]">
							Everything you need to know about Push to Post.
						</p>
					</div>

					<div className="divide-y divide-dashed sm:mx-auto sm:max-w-lg lg:mx-0">
						{/* FAQ 1 */}
						<div className="pb-6">
							<h3 className="font-medium text-[#1F2937] dark:text-white">
								What is Push to Post?
							</h3>
							<p className="mt-4 text-[#6B7280] dark:text-[#D1D5DB]">
								Push to Post turns your GitHub activity into shareable social
								media content. It helps you stay active online by automatically
								generating posts from your commits, so you don’t have to write
								updates manually.
							</p>
						</div>

						{/* FAQ 2 */}
						<div className="py-6">
							<h3 className="font-medium text-[#1F2937] dark:text-white">
								How does it connect to my GitHub?
							</h3>
							<p className="mt-4 text-[#6B7280] dark:text-[#D1D5DB]">
								Once you connect your GitHub account, we automatically set up a
								webhook for your selected repositories. This lets us track
								commit activity and generate content on your behalf. GitHub
								currently requires broad permissions for this setup.
							</p>
						</div>

						{/* FAQ 3 */}
						<div className="py-6">
							<h3 className="font-medium text-[#1F2937] dark:text-white">
								Is my data secure?
							</h3>
							<p className="mt-4 text-[#6B7280] dark:text-[#D1D5DB]">
								Yes. We use strong encryption to keep your data private and
								secure. Your GitHub and LinkedIn details are never shared or
								exposed.
							</p>
						</div>

						{/* FAQ 4 */}
						<div className="py-6">
							<h3 className="font-medium text-[#1F2937] dark:text-white">
								Can I control how my posts look?
							</h3>
							<p className="mt-4 text-[#6B7280] dark:text-[#D1D5DB]">
								Yes. You can adjust the writing style, review the generated
								content, and make changes before publishing. It’s flexible and
								easy to use.
							</p>
						</div>

						{/* FAQ 5 */}
						<div className="py-6">
							<h3 className="font-medium text-[#1F2937] dark:text-white">
								Which platforms are supported?
							</h3>
							<p className="mt-4 text-[#6B7280] dark:text-[#D1D5DB]">
								Right now, we support posting to LinkedIn. More platforms like X
								(Twitter) and personal sites are planned in the future.
							</p>
						</div>

						{/* FAQ 6 */}
						<div className="py-6">
							<h3 className="font-medium text-[#1F2937] dark:text-white">
								Is there a free plan?
							</h3>
							<p className="mt-4 text-[#6B7280] dark:text-[#D1D5DB]">
								Yes. The Free plan includes up to 5 posts per month. Paid plans
								offer higher limits and extra features.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
