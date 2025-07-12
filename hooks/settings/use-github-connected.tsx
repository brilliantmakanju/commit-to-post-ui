"use client";
import { useSession } from "next-auth/react";

// eslint-disable-next-line import/no-unresolved
import useUserStore from "@/zustand/useuser-store";

export const useGithubConnectedStatus = () => {
	const { data: session } = useSession();
	const { github_connected, hasHydratedUser } = useUserStore();

	if (hasHydratedUser === false && session?.user) {
		return session.user.github_connected;
	}

	return github_connected;
};
