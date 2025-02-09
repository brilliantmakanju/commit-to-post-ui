"use client";

import { motion } from "framer-motion";
import { Suspense, useEffect, useState } from "react";

import ResetPasswordForm from "@/components/auth/modals/resetpassword";

interface Props {
	uid: string;
	token: string;
}

const ResetPasswordPageClient = ({ uid, token }: Props) => {
	const [userId, setUserId] = useState(uid);
	const [userToken, setUserToken] = useState(token);

	const slideVariants = {
		enterLeft: { x: "-100%", opacity: 0 },
		enterRight: { x: "100%", opacity: 0 },
		center: { x: "0%", opacity: 1 },
		exitLeft: { x: "-100%", opacity: 0 },
		exitRight: { x: "100%", opacity: 0 },
	};

	useEffect(() => {
		setUserId(uid);
		setUserToken(token);
	}, [uid, token]);

	return (
		<Suspense fallback={<div>Loading...</div>}>
			<div className="flex h-screen flex-col overflow-hidden bg-white text-[#4B5563] dark:bg-[#0A1930] dark:text-[#E5E7EB] md:flex-row">
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
					className="absolute bottom-0 right-0 top-0 z-10 flex w-full items-center justify-center bg-[#F0F4F8] dark:bg-[#1E3A8A] md:relative md:w-1/2"
				>
					<ResetPasswordForm uid={userId} token={userToken} />
				</motion.div>

				{/* Mobile background image */}
				<div className="fixed inset-0 z-0 md:hidden">
					<div className="absolute inset-0 bg-[#3B82F6] opacity-70 dark:bg-[#60A5FA]" />
				</div>
			</div>
		</Suspense>
	);
};

export default ResetPasswordPageClient;
