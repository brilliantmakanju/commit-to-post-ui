"use client";

import { useEffect } from "react";

import { initPosthog } from "../analytics/instrumentation-client";

export default function PosthogProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	useEffect(() => {
		initPosthog();
	}, []);

	return <>{children}</>;
}
