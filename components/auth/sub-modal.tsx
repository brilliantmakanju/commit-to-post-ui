"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

import LoginForm from "@/components/auth/modals/login";

type ViewType = "login" | "signup" | "forgot";

interface FormProps {
	setView: (view: ViewType) => void;
}

const SubAuthPage = () => {
	const [view, setView] = useState<ViewType>("login");
	const router = useRouter();

	const handleSetView = (newView: ViewType) => {
		setView(newView);
		globalThis.window.history.pushState(undefined, "", "/auth");
		// globalThis.window.history.pushState(undefined, "", `/auth?view=${newView}`);
		if (newView === "forgot" || newView === "signup") {
			const modalOverlay = globalThis.document.querySelector(
				'[data-state="open"]',
			) as HTMLElement;
			if (modalOverlay) {
				modalOverlay.click(); // This simulates the click on the modal overlay
			}
			router.push("/auth");
			// router.push(`/auth?view=${newView}`);
		}
	};

	const slideVariants = {
		enterLeft: { x: "-100%", opacity: 0 },
		enterRight: { x: "100%", opacity: 0 },
		center: { x: "0%", opacity: 1 },
		exitLeft: { x: "-100%", opacity: 0 },
		exitRight: { x: "100%", opacity: 0 },
	};

	return (
		<div className="flex h-[600px] w-full flex-col bg-white text-[#4B5563] dark:bg-[#0A1930] dark:text-[#E5E7EB] md:flex-row">
			<AnimatePresence initial={false} mode="wait">
				<>
					<motion.div
						key="login-image"
						className="relative hidden w-1/2 md:block"
						initial={{ x: "-100%" }}
						animate={{ x: "0%" }}
						exit={{ x: "-100%" }}
						transition={{ duration: 0.5 }}
					>
						<div className="absolute inset-0 bg-[#3B82F6] opacity-100 dark:bg-[#60A5FA]" />
						<div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-[#F97316]" />
					</motion.div>
					<motion.div
						key="login-form"
						variants={slideVariants}
						initial="enterRight"
						animate="center"
						exit="exitRight"
						transition={{ duration: 0.5 }}
						className="relative flex w-full items-center justify-center bg-[#F0F4F8] dark:bg-[#1E3A8A] md:w-1/2"
					>
						{view === "login" && <LoginForm setView={handleSetView} />}
					</motion.div>
				</>
			</AnimatePresence>
		</div>
	);
};

export default SubAuthPage;
