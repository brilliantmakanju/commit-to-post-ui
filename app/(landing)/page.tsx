"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

import FAQSection from "@/components/landing/faq/faq-section";
import BenefitCards from "@/components/landing/feature/benefit-cards";
import HeroSection from "@/components/landing/micro/hero-section";
import Pricing from "@/components/landing/pricing/pricing-alt";
import { clearCookies, deleteCookie } from "@/lib/cookies/create-cookies";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import useLogoutStore from "@/lib/zustand/logout-store";
import useOrganizationStore from "@/lib/zustand/useorganization-store";
import useUserStore from "@/lib/zustand/useuser-store";
import { signOut } from "@/server-actions/auth/signout";

export default function Home() {
	const router = useRouter();
	const userStore = useUserStore();
	const logoutStore = useLogoutStore();
	const organizationStore = useOrganizationStore();

	useEffect(() => {
		const getCookies = async () => {
			try {
				logoutStore.setLogout(false);

				const paid = await getDecryptedCookie("payment_success");

				if (paid?.paid) {
					logoutStore.setLogout(true); // Prevent redundant updates
					await clearCookies();
					userStore.clearUser();
					organizationStore.clearOrganization();
					await signOut();
					await deleteCookie("payment_success");
					logoutStore.setLogout(false);
					router.replace("/auth"); // Use replace to avoid history stacking
				}
			} catch (error) {
				console.error("Error fetching cookies:", error);
			}
		};

		getCookies();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [router]); // ✅ Removed getCookies from dependencies

	return (
		<div className="container mx-auto grid items-center justify-items-center gap-[10rem] font-[family-name:var(--font-geist-sans)] md:mt-20">
			<HeroSection />
			<BenefitCards />
			<Pricing />
			<FAQSection />
		</div>
	);
}
