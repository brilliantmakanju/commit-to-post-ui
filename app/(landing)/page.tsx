"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import CtaSection from "@/components/call-to-action";
import FAQs from "@/components/faqs";
import BentoGridFeature from "@/components/landing/feature/bento-grid-features";
import HeroSection from "@/components/landing/micro/hero-section";
import { WorkflowDemo } from "@/components/landing/micro/workflow-usage";
import { clearCookies } from "@/lib/cookies/create-cookies";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import useLogoutStore from "@/lib/zustand/logout-store";
import { signOut } from "@/server-actions/auth/signout";

export default function Home() {
	const router = useRouter();
	const logoutStore = useLogoutStore();

	useEffect(() => {
		const getCookies = async () => {
			try {
				logoutStore.setLogout(false);

				const paid = await getDecryptedCookie("payment_success");

				if (paid?.paid) {
					await clearCookies();
					await signOut();
					router.replace("/auth");
				}
			} catch {
				return;
			}
		};

		getCookies();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router]); // ✅ Removed getCookies from dependencies

	return (
		<div className="container mx-auto grid items-center justify-items-center gap-[10rem] font-[family-name:var(--font-geist-sans)]">
			<HeroSection />
			<WorkflowDemo />
			<BentoGridFeature />
			<CtaSection />
			<FAQs />
		</div>
	);
}
