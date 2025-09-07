import type { Metadata } from "next";
import { Suspense } from "react";

import NotificationsPage from "@/components/notifcations/notification-main";

import { metadata as baseMetadata } from "./metadata";

export const metadata: Metadata = {
	...baseMetadata,
};

export default function Page() {
	return (
		<Suspense>
			<NotificationsPage />
		</Suspense>
	);
}
