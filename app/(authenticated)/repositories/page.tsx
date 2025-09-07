import type { Metadata } from "next";
import { Suspense } from "react";

import RepositoriesPage from "@/components/repositories/repo-list";

import { metadata as baseMetadata } from "./metadata";

export const metadata: Metadata = {
	...baseMetadata,
};

export default function Page() {
	return (
		<Suspense>
			<RepositoriesPage />
		</Suspense>
	);
}
