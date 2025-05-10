"use client";

import { AnimatePresence, motion } from "framer-motion";
import { GalleryVerticalEnd } from "lucide-react";
import { useEffect, useRef } from "react";

import LoginForm from "@/components/auth/modals/login";
import SignupForm from "@/components/auth/modals/signup";
import useAuthModalStore from "@/lib/zustand/auth/use-auth-modal";

import CheckEmailModal from "./modals/check-email";
import MagicVerifyModal from "./modals/verification-modal";

type ViewType = "login" | "signup" | "forgot" | "check-email" | "verifying";

const SubAuthModal = () => {
	const { isOpen, view, closeModal, openModal } = useAuthModalStore();
	const modalRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			if (
				modalRef.current &&
				!modalRef.current.contains(event.target as Node)
			) {
				closeModal();
			}
		};

		const handleKeyDown = (event: KeyboardEvent) => {
			if (event.key === "Escape") {
				closeModal();
			}
		};

		if (isOpen) {
			document.addEventListener("mousedown", handleClickOutside);
			document.addEventListener("keydown", handleKeyDown);
		}

		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [isOpen, closeModal]);

	const handleSetView = (newView: ViewType) => {
		if (newView !== "forgot") {
			openModal(newView);
		}
	};

	return (
		<AnimatePresence>
			{isOpen && (
				<motion.div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
					initial={{ opacity: 0 }}
					animate={{ opacity: 1 }}
					exit={{ opacity: 0 }}
					aria-modal="true"
					role="dialog"
				>
					<motion.div
						ref={modalRef}
						className={`relative z-50 w-full max-w-md rounded-lg ${view === "check-email" || view === "verifying" ? "bg-none" : "bg-background p-6 shadow-xl"}`}
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
								<div className="mb-6 flex items-center justify-center gap-2 text-lg font-medium text-primary">
									<h4 className="flex items-center gap-2">
										<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
											<GalleryVerticalEnd className="h-4 w-4" />
										</div>
										Push to Post
									</h4>
								</div>

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
