export const getDynamicGreeting = (
	name?: string,
	mode: "default" | "developer" = "default",
): string => {
	const hour = new Date().getHours();

	const fallbackNames = ["dev", "hacker", "friend", "builder", "you", "champ"];

	const greetings = {
		default: {
			morning: [
				"Good morning",
				"Rise and grind",
				"Top of the morning",
				"Hope you got your coffee",
				"Let's build something today",
			],
			afternoon: [
				"Good afternoon",
				"Hope you're making progress",
				"Keep it moving",
				"Still building?",
				"How's your day going?",
			],
			evening: [
				"Good evening",
				"Burning the late-night oil?",
				"Still shipping at this hour?",
				"Evening, builder",
				"Night shift mode on?",
			],
		},

		developer: {
			morning: [
				"Hello world",
				"0 bugs so far... nice",
				"Your coffee's compiling ☕",
				"Rise and debug",
				"Morning, code warrior",
			],
			afternoon: [
				"Commit. Push. Repeat.",
				"Afternoon deploys? Risky.",
				"TypeScript won’t type itself",
				"Keep hacking",
				"Feature freeze? Never heard of it.",
			],
			evening: [
				"Still coding? Respect.",
				"Midnight deploy gang 🔥",
				"Commit messages getting weirder?",
				"Let’s break prod",
				"You = night coder 🦉",
			],
		},
	};

	let timeOfDay: "morning" | "afternoon" | "evening";

	if (hour < 12) timeOfDay = "morning";
	else if (hour < 18) timeOfDay = "afternoon";
	else timeOfDay = "evening";

	const selectedMode = greetings[mode];
	const greetingPool = selectedMode[timeOfDay];
	const randomGreeting =
		greetingPool[Math.floor(Math.random() * greetingPool.length)];

	const fallback =
		fallbackNames[Math.floor(Math.random() * fallbackNames.length)];

	return `${randomGreeting}, ${name?.trim() || fallback}`;
};
