import { ToneOption } from "./types";

type PlatformLimit =
	| number
	| { readonly default: number; readonly verified: number };

export const PLATFORM_LIMITS: Record<string, PlatformLimit> = {
	x: { default: 260, verified: 3000 },
	linkedin: 3000,
	discord: 2000,
} as const;

export const TONE_OPTIONS: ToneOption[] = [
	{
		id: "professional",
		label: "Professional",
		description: "Formal and business-like",
	},
	{ id: "casual", label: "Casual", description: "Relaxed and friendly" },
	{
		id: "excited",
		label: "Excited",
		description: "Enthusiastic and energetic",
	},
	{
		id: "informative",
		label: "Informative",
		description: "Educational and clear",
	},
	{ id: "humorous", label: "Humorous", description: "Light-hearted and fun" },
	{
		id: "inspirational",
		label: "Inspirational",
		description: "Motivating and uplifting",
	},
];
