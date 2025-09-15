import { formatDistanceToNowStrict, isValid, parseISO } from "date-fns";

export function getTimeAgo(timestamp?: string) {
	let d: Date;

	if (timestamp) {
		const parsed = parseISO(timestamp);
		if (isValid(parsed)) {
			d = parsed;
		} else {
			const fallback = new Date(timestamp);
			d = isValid(fallback) ? fallback : new Date();
		}
	} else {
		d = new Date();
	}

	let diff = formatDistanceToNowStrict(d);

	// Force "1 minute ago" minimum
	if (diff.includes("second")) {
		diff = "1 minute";
	}

	return `${diff} ago`;
}
