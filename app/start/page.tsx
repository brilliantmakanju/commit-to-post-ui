/* eslint-disable import/no-unresolved */
"use client";
import React from "react";
import { FaCode, FaGithub, FaShareAlt } from "react-icons/fa";
import { toast } from "sonner";

import { LogoutModal } from "@/components/auth/modals/logout-modal";
import { OnboardingFlow } from "@/components/onboarding/v2/onboarding-flow";
import ConnectGithub from "@/components/onboarding/v2/screens/connect-github";
import ConnectRepoOnboarding from "@/components/onboarding/v2/screens/connect-repo";
import SocialConnectionInterface from "@/components/onboarding/v2/screens/connect-socials";
import { onboardingComplete } from "@/server-actions/onboarding/update-profile";
import { OnboardingConfig, Step } from "@/types/onboarding";
import useLogoutStore from "@/zustand/logout-store";

const handleComplete = async () => {
	try {
		const apiRequest = await onboardingComplete();

		if (apiRequest.success == true) {
			toast.success(apiRequest.message);
			globalThis.location.replace("/dashboard");
		} else {
			toast.error(apiRequest.message);
		}
	} catch {
		toast.error("Unexpected error occurred during onboarding completion");
	}
};

const OnboardingPage: React.FC = () => {
	const logoutStore = useLogoutStore();
	const shouldLogout = logoutStore.logout;

	const onboardingConfig: OnboardingConfig = {
		steps: [
			{
				id: 1,
				title: "Connect GitHub",
				subtitle: "Link your GitHub account to access your repos",
				content: "GitHub Connection",
				optional: false, // Mandatory
				icon: <FaGithub className="h-6 w-6" />,
			},
			{
				id: 2,
				title: "Connect Socials",
				subtitle: "Link at least one social to share your commits",
				content: "Social Connections",
				optional: false, // One social mandatory, others skippable
				icon: <FaShareAlt className="h-6 w-6" />,
			},
			{
				id: 3,
				title: "Pick a Repository",
				subtitle: "Select a repo and toggle socials to share commits",
				content: "Repository Setup",
				optional: false, // Mandatory
				icon: <FaCode className="h-6 w-6" />,
			},
			// {
			// 	id: 4,
			// 	title: "Setup Complete",
			// 	subtitle: "You're ready to push commits to your socials",
			// 	content: "Launch Setup",
			// 	optional: false, // Mandatory confirmation
			// 	icon: <FaRocket className="h-6 w-6" />,
			// },
		],
		showProgress: true, // Keep progress bar for clarity
		allowSkipOptional: true, // Allow skipping additional socials in step 2
		allowBackNavigation: true, // Keep your back link (e.g., to workspace selection)
	};

	// Show logout modal when logging out
	if (shouldLogout) {
		return <LogoutModal showByDefault={shouldLogout} />;
	}

	const handleStepContent = (step: Step) => {
		switch (step.id) {
			case 1: {
				return <ConnectGithub />;
			}
			case 2: {
				return <SocialConnectionInterface />;
			}
			case 3: {
				return <ConnectRepoOnboarding />;
			}
			default: {
				return;
			}
		}
	};

	return (
		<OnboardingFlow
			config={onboardingConfig}
			onComplete={handleComplete}
			onStepContent={handleStepContent}
		/>
	);
};

export default OnboardingPage;
