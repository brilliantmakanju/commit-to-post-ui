"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";
import { FaClock, FaCode, FaHandshake, FaRocket } from "react-icons/fa";

import SubAuthPage from "@/components/auth/sub-modal";
import CtaSection from "@/components/call-to-action";
import FAQs from "@/components/faqs";
import BentoGridFeature from "@/components/landing/feature/bento-grid-features";
import { FeaturesSectionDemo } from "@/components/landing/feature/v2/features";
import HeroSection from "@/components/landing/micro/hero-section";
import { WorkflowDemo } from "@/components/landing/micro/workflow-usage";
import { BentoGrid, BentoGridItem } from "@/components/ui/bento-grids";
import { clearCookies } from "@/lib/cookies/create-cookies";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import { cn } from "@/lib/utils";
import { signOut } from "@/server-actions/auth/signout";
import useAuthModalStore from "@/zustand/auth/use-auth-modal";
import useLogoutStore from "@/zustand/logout-store";

const items = [
	{
		title: "Fast Out of the Gate",
		description:
			"No bloated tools or complex setups. Just plug in your GitHub repo and start creating visibility instantly.",
		header: (
			<div className="h-full w-full rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500" />
		),
		className: "md:col-span-2",
		icon: <FaRocket className="h-4 w-4 text-neutral-500" />,
	},
	{
		title: "Made for Developers",
		description:
			"Built with devs in mind. Native GitHub integration, smart commit parsing, and no fluff.",
		header: (
			<div className="h-full w-full rounded-xl bg-gradient-to-br from-gray-800 to-gray-600" />
		),
		className: "md:col-span-1",
		icon: <FaCode className="h-4 w-4 text-neutral-500" />,
	},
	{
		title: "Grows With You",
		description:
			"Whether you're solo building in public or part of a team, it scales with your workflow.",
		header: (
			<div className="h-full w-full rounded-xl bg-gradient-to-br from-green-500 to-lime-400" />
		),
		className: "md:col-span-1",
		icon: <FaHandshake className="h-4 w-4 text-neutral-500" />,
	},
	{
		title: "Always on Time",
		description:
			"Auto-posting means your updates go live while you keep shipping. Never miss a beat again.",
		header: (
			<div className="h-full w-full rounded-xl bg-gradient-to-br from-yellow-400 to-orange-500" />
		),
		className: "md:col-span-2",
		icon: <FaClock className="h-4 w-4 text-neutral-500" />,
	},
];

export default function Home() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const logoutStore = useLogoutStore();
	const { isOpen, openModal } = useAuthModalStore();

	useEffect(() => {
		const getToken = searchParams.get("token");
		if (!getToken) return;

		openModal("verifying");
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [searchParams]);

	useEffect(() => {
		const getCookies = async () => {
			try {
				logoutStore.setLogout(false);
				const paid = await getDecryptedCookie("payment_success");
				if (paid?.paid) {
					await clearCookies();
					await signOut();
					router.replace("/");
				}
			} catch {
				return;
			}
		};
		getCookies();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router, searchParams]);

	return (
		<div className="container mx-auto grid items-center justify-items-center gap-[10rem] font-[family-name:var(--font-geist-sans)]">
			{isOpen && <SubAuthPage />}
			<HeroSection />
			{/* <WorkflowDemo /> */}
			<FeaturesSectionDemo />
			<CtaSection />
			<FAQs />
		</div>
	);
}
