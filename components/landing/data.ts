import { Clock, Code, MessageCircle, Puzzle } from "lucide-react";

// interface Benefit {
// 	id: number;
// 	icon: any;
// 	title: string;
// 	description: string;
// 	modalContent: {
// 		title: string;
// 		description: string;
// 		features: string[];
// 	};
// 	gradient: string;
// }

export const benefits = [
	{
		id: 1,
		icon: Puzzle,
		title: "Effortless Integration",
		description: "Get started in minutes with our simple setup process.",
		features: [
			"Connect your GitHub account",
			"Select your repo and branch to monitor",
			"Sync your social platforms and let the AI do the rest!",
		],
	},
	{
		id: 2,
		icon: Clock,
		title: "Automated Updates",
		description:
			"Let AI handle your social media updates directly from Git commits.",
		features: [
			"Seamlessly integrates with GitHub",
			"Posts updates to your selected platforms",
		],
	},
	{
		id: 3,
		icon: MessageCircle,
		title: "Streamlined Social Posting",
		description:
			"Connect once and let the AI handle your social media presence.",
		features: [
			"Schedule posts for optimal visibility",
			"Automatically format posts for each platform",
		],
	},
	{
		id: 4,
		icon: Code,
		title: "Developer-Friendly Workflow",
		description:
			"Seamlessly integrates into your existing development process.",
		features: [
			"Specify branches to track for updates",
			"Define the project scope for tailored messaging",
		],
	},
];
