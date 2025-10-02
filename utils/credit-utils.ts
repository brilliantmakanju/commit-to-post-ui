/**
 * Format large numbers for display with appropriate suffixes
 * Handles cases like 100000000000 credits gracefully
 */
export function formatCredits(
	credits: number,
	options: {
		precision?: number;
		showFullNumber?: boolean;
		compact?: boolean;
	} = {},
): string {
	const { precision = 1, showFullNumber = false, compact = true } = options;

	// Handle invalid numbers
	if (!Number.isFinite(credits) || credits < 0) {
		return "0";
	}

	// If showing full number or credits are small enough, show exact number
	if (showFullNumber || credits < 1000) {
		return credits.toLocaleString();
	}

	// For compact display, use suffixes
	if (compact) {
		const units = [
			{ value: 1_000_000_000_000, suffix: "T" }, // Trillion
			{ value: 1_000_000_000, suffix: "B" }, // Billion
			{ value: 1_000_000, suffix: "M" }, // Million
			{ value: 1_000, suffix: "K" }, // Thousand
		];

		for (const unit of units) {
			if (credits >= unit.value) {
				const formatted = (credits / unit.value).toFixed(precision);
				// Remove unnecessary decimal places
				const cleanFormatted = Number.parseFloat(formatted).toString();
				return `${cleanFormatted}${unit.suffix}`;
			}
		}
	}

	return credits.toLocaleString();
}

/**
 * Get appropriate display text for credit amounts
 */
export function getCreditDisplayText(
	credits: number,
	context: "badge" | "full" | "mobile" = "full",
): string {
	switch (context) {
		case "badge": {
			// Very compact for badges
			if (credits >= 1_000_000) {
				return formatCredits(credits, { precision: 0, compact: true });
			}
			return formatCredits(credits, { precision: 1, compact: true });
		}

		case "mobile": {
			// Compact for mobile screens
			return formatCredits(credits, { precision: 1, compact: true });
		}

		default: {
			// Full display with commas for desktop
			if (credits >= 1_000_000) {
				return formatCredits(credits, { precision: 1, compact: true });
			}
			return credits.toLocaleString();
		}
	}
}

/**
 * Check if user has sufficient credits with safety margins
 */
export function canAffordSafely(
	currentCredits: number,
	requiredCredits: number,
	safetyMargin: number = 0,
): boolean {
	// Handle edge cases
	if (!Number.isFinite(currentCredits) || !Number.isFinite(requiredCredits)) {
		return false;
	}

	if (currentCredits < 0 || requiredCredits < 0) {
		return false;
	}

	return currentCredits >= requiredCredits + safetyMargin;
}

/**
 * Get credit status information
 */
export function getCreditStatus(credits: number): {
	status: "high" | "medium" | "low" | "critical" | "empty";
	message: string;
	color: "green" | "yellow" | "red" | "gray";
} {
	if (credits <= 0) {
		return {
			status: "empty",
			message: "No credits remaining",
			color: "red",
		};
	}

	if (credits < 10) {
		return {
			status: "critical",
			message: "Very low credits",
			color: "red",
		};
	}

	if (credits < 100) {
		return {
			status: "low",
			message: "Low credits",
			color: "yellow",
		};
	}

	if (credits < 1000) {
		return {
			status: "medium",
			message: "Moderate credits",
			color: "yellow",
		};
	}

	return {
		status: "high",
		message: "Plenty of credits",
		color: "green",
	};
}

/**
 * Safely parse credit numbers from strings or unknown types
 */
export function parseCredits(value: unknown): number {
	if (typeof value === "number") {
		return Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
	}

	if (typeof value === "string") {
		const parsed = Number.parseFloat(value);
		return Number.isFinite(parsed) && parsed >= 0 ? Math.floor(parsed) : 0;
	}

	return 0;
}

/**
 * Create a debounced credit update function to prevent excessive API calls
 */
export function createDebouncedCreditUpdate(
	updateFunction: (credits: number) => void,
	delay: number = 500,
) {
	let timeoutId: NodeJS.Timeout | undefined;

	return (credits: number) => {
		if (timeoutId) {
			clearTimeout(timeoutId);
		}

		timeoutId = setTimeout(() => {
			updateFunction(credits);
			timeoutId = undefined;
		}, delay);
	};
}
