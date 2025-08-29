"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { useCallback, useEffect, useRef } from "react";

import SubAuthPage from "@/components/auth/sub-modal";
import CtaSection from "@/components/call-to-action";
import FAQs from "@/components/faqs";
import VideoPlayer from "@/components/landing/demo";
import { FeaturesSectionDemo } from "@/components/landing/feature/v2/features";
import HeroSection from "@/components/landing/micro/hero-section";
import { WorkflowDemo } from "@/components/landing/micro/workflow-usage";
import PricingTable from "@/components/landing/pricing";
import PlanSelector from "@/components/landing/pricing/v4/payment-selector";
import { syncUserData } from "@/components/wrappers/loaders/authenticated-layout";
import { clearCookies } from "@/lib/cookies/create-cookies";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import { signOut } from "@/server-actions/auth/signout";
import useAuthModalStore from "@/zustand/auth/use-auth-modal";
import useLogoutStore from "@/zustand/logout-store";
import usePlanSelectorStore from "@/zustand/use-plan-selector-store";
import useUserStore from "@/zustand/useuser-store";

export default function Home() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const logoutStore = useLogoutStore();
	const { isOpen, openModal } = useAuthModalStore();

	const hasSyncedRef = useRef(false);
	const { data: session, status } = useSession();
	const { setUser, hasHydratedUser } = useUserStore();

	const {
		isOpen: selector,
		close,
		type,
		currentPlanId,
		currentInterval,
	} = usePlanSelectorStore();

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

	// Memoized sync function to prevent recreations
	const syncUserStoreData = useCallback(
		(userData: any) => {
			if (hasSyncedRef.current) return; // Prevent multiple syncs

			try {
				const syncedData = syncUserData(userData);
				setUser(syncedData);
				hasSyncedRef.current = true;
			} catch {}
		},
		[setUser],
	);

	// Single effect to handle user store synchronization
	useEffect(() => {
		if (
			status === "authenticated" &&
			session?.user &&
			!hasHydratedUser &&
			!hasSyncedRef.current
		) {
			syncUserStoreData(session.user);
		}
	}, [status, session?.user, hasHydratedUser, syncUserStoreData]);

	return (
		<>
			<div className="container mx-auto grid items-center justify-items-center gap-[10rem] font-[family-name:var(--font-geist-sans)]">
				{isOpen && <SubAuthPage />}
				<HeroSection />
				<WorkflowDemo />
				<FeaturesSectionDemo />
				<VideoPlayer />
				<CtaSection />
				<PricingTable />
				<FAQs />
			</div>
			<PlanSelector
				open={selector}
				type={type || "upgrade"}
				currentPlanId={currentPlanId || ""}
				onOpenChange={open => {
					if (!open) close();
				}}
				currentInterval={currentInterval}
			/>
		</>
	);
}
