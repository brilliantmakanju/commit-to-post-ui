// ============================================================================
// CONFETTI UTILS (enhanced version)
// ============================================================================

export const CODE_SYMBOLS = [
	"{",
	"}",
	"[",
	"]",
	"<",
	">",
	"/",
	"*",
	";",
	"=",
	"=>",
];

export const CONFETTI_SETTINGS = {
	duration: 3500,
	interval: 60,
	particlesPerBurst: 6,
	fallDurationMin: 1500,
	fallDurationMax: 2800,
};

/**
 * Creates a single falling code symbol confetti element with improved visuals
 */
export const createCodeConfetti = (container: HTMLDivElement): void => {
	if (!container) return;
	container.style.position = "relative";

	const element = document.createElement("div");
	const symbol = CODE_SYMBOLS[Math.floor(Math.random() * CODE_SYMBOLS.length)];
	element.textContent = symbol;

	// Random size + color palette for visual variety
	const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#6366f1"];
	const size = 18 + Math.random() * 10;

	Object.assign(element.style, {
		position: "absolute",
		fontSize: `${size}px`,
		fontWeight: "700",
		color: colors[Math.floor(Math.random() * colors.length)],
		left: `${Math.random() * 100}%`,
		top: "-10px",
		zIndex: "9999",
		pointerEvents: "none",
		fontFamily: "monospace",
		opacity: "0.9",
		transform: `rotate(${Math.random() * 360}deg)`,
	});

	container.append(element);

	const fallDuration =
		Math.random() *
			(CONFETTI_SETTINGS.fallDurationMax - CONFETTI_SETTINGS.fallDurationMin) +
		CONFETTI_SETTINGS.fallDurationMin;
	const horizontalShift = (Math.random() - 0.5) * 100;
	const startTime = Date.now();
	const containerHeight = container.offsetHeight;

	function animateConfetti() {
		const elapsed = Date.now() - startTime;
		const progress = elapsed / fallDuration;

		if (progress >= 1) {
			element.remove();
			return;
		}

		element.style.top = `${progress * containerHeight}px`;
		element.style.transform = `translateX(${horizontalShift * progress}px) rotate(${
			progress * 720
		}deg)`;
		element.style.opacity = String(1 - progress);

		requestAnimationFrame(animateConfetti);
	}

	animateConfetti();
};

/**
 * Triggers confetti bursts
 */
export const triggerCodeConfetti = (container: HTMLDivElement): void => {
	const endTime = Date.now() + CONFETTI_SETTINGS.duration;
	const interval = setInterval(() => {
		const timeRemaining = endTime - Date.now();

		if (timeRemaining <= 0) {
			clearInterval(interval);
			return;
		}

		for (let index = 0; index < CONFETTI_SETTINGS.particlesPerBurst; index++) {
			createCodeConfetti(container);
		}
	}, CONFETTI_SETTINGS.interval);
};
