import type { Metadata } from "next";
import { Suspense } from "react";

import DashboardMain from "@/components/dashboard/dashboard-main";

import { metadata as baseMetadata } from "./metadata";

export const metadata: Metadata = {
	...baseMetadata,
};

export default function DashboardPage() {
	return (
		<Suspense>
			<DashboardMain />
		</Suspense>
	);
}
