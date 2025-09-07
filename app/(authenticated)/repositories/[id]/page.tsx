import type { Metadata } from "next";
import { Suspense } from "react";

import ViewRepo from "@/components/repositories/view-repo";

import { metadata as baseMetadata } from "./metadata";

export const metadata: Metadata = {
	...baseMetadata,
};

export default function Page() {
	return (
		<Suspense>
			<ViewRepo />
		</Suspense>
	);
}
