export default function FAQs() {
	return (
		<section className="shadow-fade relative mx-auto mb-1 w-full max-w-[1200px] gap-8 overflow-hidden rounded-xl border border-[#969DAD] bg-[#FFFFFF] px-1 py-0 pt-12 font-sans md:px-0 md:py-0 md:pt-12 lg:py-20 lg:pl-12">
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
								Push to Post is an AI-powered tool that transforms your GitHub
								commits into engaging social media posts, keeping your
								professional presence active without extra effort.
							</p>
						</div>

						{/* FAQ 2 */}
						<div className="py-6">
							<h3 className="font-medium text-[#1F2937] dark:text-white">
								Is my data secure?
							</h3>
							<p className="mt-4 text-[#6B7280] dark:text-[#D1D5DB]">
								Absolutely! We use enterprise-grade encryption to protect your
								data. Your GitHub and LinkedIn credentials remain private and
								secure.
							</p>
						</div>

						{/* FAQ 3 */}
						<div className="py-6">
							<h3 className="font-medium text-[#1F2937] dark:text-white">
								Can I customize the posts?
							</h3>
							<p className="my-4 text-[#6B7280] dark:text-[#D1D5DB]">
								Yes! You can choose from multiple tones, edit AI-generated
								content, and even schedule posts for later.
							</p>
						</div>

						{/* FAQ 4 */}
						<div className="py-6">
							<h3 className="font-medium text-[#1F2937] dark:text-white">
								What platforms are supported?
							</h3>
							<p className="mt-4 text-[#6B7280] dark:text-[#D1D5DB]">
								Currently, Push to Post integrates with LinkedIn, with future
								support for Twitter, GitHub Pages, and more.
							</p>
						</div>

						{/* FAQ 5 */}
						<div className="py-6">
							<h3 className="font-medium text-[#1F2937] dark:text-white">
								Is there a free plan?
							</h3>
							<p className="mt-4 text-[#6B7280] dark:text-[#D1D5DB]">
								Yes! Our Free plan lets you generate up to 5 posts per month.
								For unlimited posts and extra features, upgrade to Pro.
							</p>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
