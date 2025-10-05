"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useRef } from "react";

import CheckEmailModal from "@/components/auth/modals/check-email";
import LoginForm from "@/components/auth/modals/login";
import SignupForm from "@/components/auth/modals/signup";
import MagicVerifyModal from "@/components/auth/modals/verification-modal";
import useAuthModalStore from "@/zustand/auth/use-auth-modal";

import { LogoOnly } from "../navigation/top_navigation/logo";

type ViewType = "login" | "signup" | "forgot" | "check-email" | "verifying";

const SubAuthModal = () => {
	const modalRef = useRef<HTMLDivElement>(null);
	const { isOpen, view, closeModal, openModal, isProcessing } =
		useAuthModalStore();

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			// Prevent closing modal when processing
			if (isProcessing) return;

			if (
				modalRef.current &&
				!modalRef.current.contains(event.target as Node)
			) {
				closeModal();
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			// Prevent closing modal when processing
			if (isProcessing) return;

			if (event.key === "Escape") {
				closeModal();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("keydown", handleKeyDown);
			// Prevent body scroll when modal is open
			document.body.style.overflow = "hidden";
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
			document.body.style.overflow = "unset";
		};
	}, [isOpen, closeModal, isProcessing]);

	const handleSetView = (newView: ViewType) => {
		// Prevent view changes when processing
		if (isProcessing) return;

		if (newView !== "forgot") {
			openModal(newView);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					className="fixed inset-0 z-30 flex items-center justify-center bg-black/40 backdrop-blur-sm"
					aria-labelledby="auth-modal-title"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					aria-modal="true"
					role="dialog"
				>
					<motion.div
						ref={modalRef}
						className={`relative z-30 w-full max-w-md rounded-lg ${
							view === "check-email" || view === "verifying"
								? "bg-none"
								: "bg-background p-6 shadow-xl"
						}`}
						initial={{ scale: 0.95, opacity: 0 }}
						animate={{ scale: 1, opacity: 1 }}
						exit={{ scale: 0.95, opacity: 0 }}
						transition={{ duration: 0.2 }}
					>
						{view === "check-email" ? (
							<CheckEmailModal />
						) : view === "verifying" ? (
							<MagicVerifyModal />
						) : (
							<>
								{view === "signup" ? (
									<SignupForm setView={handleSetView} />
								) : (
									<LoginForm setView={handleSetView} />
								)}
							</>
						)}
					</motion.div>
				</motion.div>
			)}
		</AnimatePresence>
	);
};

export default SubAuthModal;
