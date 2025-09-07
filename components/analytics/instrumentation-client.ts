"use client";

// eslint-disable-next-line import/no-named-as-default
import posthog from "posthog-js";

let initialized = false;

export function initPosthog() {
	if (typeof globalThis === "undefined") return;
	if (initialized) return;

	posthog.init(process.env.NEXT_PUBLIC_POSTHOG_KEY as string, {
		api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST,
		persistence: "localStorage",
	});

	initialized = true;
}

// If you want to use posthog elsewhere:
export function capture(event: string, properties?: Record<string, any>) {
	posthog.capture(event, properties);
}

export function identify(id: string, traits?: Record<string, any>) {
	posthog.identify(id, traits);
}
