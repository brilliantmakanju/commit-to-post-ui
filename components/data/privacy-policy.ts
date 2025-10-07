export interface PrivacySection {
	title: string;
	content: string[];
}

export const privacyData = {
	title: "Privacy Policy",
	lastUpdated: "October 06, 2025",
	introduction:
		"At Push to Draft, accessible at pushtodraft.app, we are committed to safeguarding your personal information. This Privacy Policy explains how we collect, use, and protect your data when you use our service. While we use Paddle for payment processing, Push to Draft operates as an independent service with its own systems and data practices.",
	sections: [
		{
			title: "1. Information We Collect",
			content: [
				"We collect the information you provide when you create an account, connect platforms like GitHub or LinkedIn, and use our services.",
				"This includes your name, email address, LinkedIn information, and any content or settings you configure.",
				"We also gather details about how you use our service, including generated content, preferences, and activity.",
				"When connecting GitHub, we require read and write access to your repositories. This is necessary due to GitHub's permission structure and allows us to set up webhook integrations on your behalf.",
				"We do not use your repository data to train any models or for unrelated purposes.",
			],
		},
		{
			title: "2. Types of Personal Data",
			content: [
				"Name and preferred name",
				"Email address and LinkedIn information",
				"Repository access and posting behavior",
				"Account settings and preferences",
				"Payment information managed securely by Paddle",
			],
		},
		{
			title: "3. Legal Basis for Processing",
			content: [
				"We process your information based on the following:",
				"To fulfill our agreement with you and deliver the service",
				"To pursue legitimate business interests like improving the platform",
				"To comply with legal obligations",
				"With your consent when required by law",
			],
		},
		{
			title: "4. GitHub, LinkedIn and Twitter/X Connections",
			content: [
				"To provide services, we ask for access to your LinkedIn, Twitter/X and GitHub accounts.",
				"For GitHub, our system connects directly and sets up required webhooks. This is done through your authorization and is needed to generate posts from your development activity.",
				"We only use this access to perform the tasks necessary for content generation and do not use your data for other purposes.",
			],
		},
		{
			title: "5. How Your Information Is Used",
			content: [
				"We use your information to operate and improve our services.",
				"This includes generating posts based on your GitHub activity, managing your account, and sending service notifications.",
				"We store only the output content generated for you and retain raw commit data to help with regenerations of post drafts.",
			],
		},
		{
			title: "6. Automated Processing",
			content: [
				"Our system analyzes your commit data to generate content automatically",
				"The generated content is stored in your account to allow you to edit, manage, and schedule it.",
			],
		},
		{
			title: "7. Data Retention",
			content: [
				"We keep your data as long as your account is active or required to provide services.",
				"We will only keep your personal information for as long as it is necessary for the purposes set out in this Privacy Policy, unless a longer retention period is required or permitted by law (such as tax, accounting, or other legal requirements).",
				"When we have no ongoing legitimate business need to process your personal information, we will either delete or anonymize such information, or, if this is not possible (for example, because your personal information has been stored in backup archives), then we will securely store your personal information and isolate it from any further processing until deletion is possible.",
				"You can request removal of your data by contacting us at brilliant@jolexhive.com.",
			],
		},
		{
			title: "8. Data Security",
			content: [
				"We take steps to secure your personal data through encryption, access control, and regular reviews.",
				"While we work hard to protect your information, we cannot guarantee complete security given the nature of the internet.",
			],
		},
		{
			title: "9. Sharing Information",
			content: [
				"We do not sell your data.",
				"We may share your information with service providers that help us run our platform (e.g., payment processors, hosting services).",
				"These providers are only allowed to use your information to perform specific services on our behalf.",
				"We may share or transfer your information in connection with, or during negotiations of, any merger, sale of company assets, financing, or acquisition of all or a portion of our business to another company.",
				"We may share your information with our affiliates, in which case we will require those affiliates to honor this Privacy Policy. Affiliates include our parent company and any subsidiaries, joint venture partners, or other companies that we control or that are under common control with us.",
			],
		},
		{
			title: "10. International Transfers",
			content: [
				"Our servers are located in the United States. Your data may be transferred to and stored in the United States.",
				"Regardless of your location, please be aware that your information may be transferred to, stored by, and processed by us in our facilities and in the facilities of the third parties with whom we may share your personal information.",
				"If you are a resident in the European Economic Area (EEA), United Kingdom (UK), or Switzerland, then these countries may not necessarily have data protection laws or other similar laws as comprehensive as those in your country. However, we will take all necessary measures to protect your personal information in accordance with this Privacy Policy and applicable law.",
			],
		},
		{
			title: "11. Your Privacy Rights",
			content: [
				"Depending on where you are located geographically, the applicable privacy law may mean you have certain rights regarding your personal information.",
				"You may have the right to access, correct, delete, or restrict your data.",
				"If we are relying on your consent to process your personal information, you have the right to withdraw your consent at any time.",
				"You can withdraw your consent or exercise your rights at any time by contacting us at brilliant@jolexhive.com.",
				"Upon your request to terminate your account, we will deactivate or delete your account and information from our active databases. However, we may retain some information in our files to prevent fraud, troubleshoot problems, assist with any investigations, enforce our legal terms and/or comply with applicable legal requirements.",
			],
		},
		{
			title: "12. Cookies and Tracking Technologies",
			content: [
				"We may use cookies and similar tracking technologies (like web beacons and pixels) to gather information when you interact with our Services.",
				"Some online tracking technologies help us maintain the security of our Services, prevent crashes, fix bugs, save your preferences, and assist with basic site functions.",
				"We also permit third parties and service providers to use online tracking technologies on our Services for analytics and advertising, including to help manage and display advertisements, to tailor advertisements to your interests, or to send abandoned shopping cart reminders (depending on your communication preferences).",
				"You can manage cookies through your browser settings. Some features may not work without them.",
			],
		},
		{
			title: "13. Children's Privacy",
			content: [
				"We do not knowingly collect, solicit data from, or market to children under 18 years of age, nor do we knowingly sell such personal information.",
				"By using the Services, you represent that you are at least 18 or that you are the parent or guardian of such a minor and consent to such minor dependent's use of the Services.",
				"If we learn that personal information from users less than 18 years of age has been collected, we will deactivate the account and take reasonable measures to promptly delete such data from our records.",
				"If you become aware of any data we may have collected from children under age 18, please contact us at brilliant@jolexhive.com.",
			],
		},
		{
			title: "14. California Users",
			content: [
				"If you are a California resident, you have rights under state law regarding your personal data.",
				"We do not sell your data. You can request deletion of your data by contacting us at brilliant@jolexhive.com.",
			],
		},
		{
			title: "15. Do-Not-Track Features",
			content: [
				"Most web browsers and some mobile operating systems and mobile applications include a Do-Not-Track ('DNT') feature or setting you can activate to signal your privacy preference not to have data about your online browsing activities monitored and collected.",
				"At this stage, no uniform technology standard for recognizing and implementing DNT signals has been finalized. As such, we do not currently respond to DNT browser signals or any other mechanism that automatically communicates your choice not to be tracked online.",
				"If a standard for online tracking is adopted that we must follow in the future, we will inform you about that practice in a revised version of this Privacy Policy.",
			],
		},
		{
			title: "16. Updates to This Policy",
			content: [
				"We may update this Privacy Policy from time to time. The updated version will be indicated by an updated 'Last Updated' date at the top of this Privacy Policy.",
				"If we make material changes to this Privacy Policy, we may notify you either by prominently posting a notice of such changes or by directly sending you a notification.",
				"We encourage you to review this Privacy Policy frequently to be informed of how we are protecting your information.",
			],
		},
		{
			title: "17. Ownership and Independence",
			content: [
				"Push to Draft remains a standalone service with its own technology, systems, and policies.",
				"Our use of third-party tools like Paddle does not grant them any rights to our platform or data beyond necessary functions.",
			],
		},
		{
			title: "18. Contact Us",
			content: [
				"If you have questions or comments about this Privacy Policy, please reach out to us at brilliant@jolexhive.com.",
				"Email: brilliant@jolexhive.com",
			],
		},
	],
};
