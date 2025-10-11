"use client";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import SubAuthPage from "@/components/auth/sub-modal";
import { BentoGridSection } from "@/components/landing/micro/v3/bento-grid";
import CTASection from "@/components/landing/micro/v3/cta-sec";
import VideoDemo from "@/components/landing/micro/v3/demo-video";
import FAQSection from "@/components/landing/micro/v3/faq-v3";
import FooterSection from "@/components/landing/micro/v3/footer-v3";
import HeroSection from "@/components/landing/micro/v3/hero-section";
import PricingSection from "@/components/landing/micro/v3/pricing-section";
import PurchaseSuccessModal from "@/components/landing/pricing/payment-success";
import { usePurchaseSuccess } from "@/hooks/plans/payment-success";
import { clearCookies } from "@/lib/cookies/create-cookies";
import { getDecryptedCookie } from "@/lib/cookies/getcookies";
import { signOut } from "@/server-actions/auth/signout";
import useAuthModalStore from "@/zustand/auth/use-auth-modal";
import useLogoutStore from "@/zustand/logout-store";
export default function Home() {
	const router = useRouter();
	const logoutStore = useLogoutStore();
	const searchParams = useSearchParams();
	const { isOpen, openModal } = useAuthModalStore();
	// Handle purchase success
	const { isModalOpen, closeModal } = usePurchaseSuccess();

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
		<>
			<div className="container mx-auto grid items-center justify-items-center gap-[10rem] font-sans">
				{/* Purchase Success Modal */}
				<PurchaseSuccessModal isOpen={isModalOpen} onClose={closeModal} />
				{isOpen && <SubAuthPage />}
				<HeroSection />
				<VideoDemo />
				<BentoGridSection />
				<PricingSection tables={false} />
				<FAQSection />
				<CTASection />
				<FooterSection />
			</div>
		</>
	);
}
