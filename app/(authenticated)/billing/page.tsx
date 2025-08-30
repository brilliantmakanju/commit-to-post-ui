import type { Metadata } from "next";
import { Suspense } from "react";

// eslint-disable-next-line import/no-unresolved
import BillingSettings from "@/components/settings/billing-settings";

import { metadata as baseMetadata } from "./metadata";

export const metadata: Metadata = {
	...baseMetadata,
	title: "Settings",
};

export default function SettingsPage() {
	return (
		<Suspense>
			<BillingSettings />
		</Suspense>
	);
}
