"use client";

import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";

// eslint-disable-next-line import/namespace,import/default,import/no-named-as-default,import/no-named-as-default-member
import ForgotPasswordForm from "@/components/auth/modals/forgotpassword";
// eslint-disable-next-line import/namespace,import/default,import/no-named-as-default,import/no-named-as-default-member
import LoginForm from "@/components/auth/modals/login";
// eslint-disable-next-line import/namespace,import/default,import/no-named-as-default,import/no-named-as-default-member
import SignupForm from "@/components/auth/modals/signup";

// import { useUser } from '@auth0/nextjs-auth0/client'

type ViewType = "login" | "signup" | "forgot";

const AuthPage = () => {
	const [view, setView] = useState<ViewType>("login");
	const searchParams = useSearchParams();
	const router = useRouter();
	// const { user, error, isLoading } = useUser()

	// useEffect(() => {
	//     if (user) {
	//         router.push('/dashboard')
	//     }
	// }, [user, router])

	useEffect(() => {
		const viewParameter = searchParams.get("view") as ViewType;
		if (
			viewParameter &&
			["login", "signup", "forgot"].includes(viewParameter)
		) {
			setView(viewParameter);
		}
	}, [searchParams]);

	const handleSetView = (newView: ViewType) => {
		setView(newView);
		globalThis.globalThis.window.history.pushState(
			undefined,
			"",
			`/auth?view=${newView}`,
		);
	};

	// if (isLoading) return <div>Loading...</div>
	// if (error) return <div>{error.message}</div>

	const slideVariants = {
		enterLeft: { x: "-100%", opacity: 0 },
		enterRight: { x: "100%", opacity: 0 },
		center: { x: "0%", opacity: 1 },
		exitLeft: { x: "-100%", opacity: 0 },
		exitRight: { x: "100%", opacity: 0 },
	};

	return (
		<Suspense fallback={<div>Loading</div>}>
			<div className="flex h-screen flex-col overflow-hidden bg-white text-[#4B5563] dark:bg-[#0A1930] dark:text-[#E5E7EB] md:flex-row">
				<AnimatePresence initial={false} mode="wait">
					{view === "signup" ? (
						<>
							<motion.div
								key="signup-form"
								variants={slideVariants}
								initial="enterLeft"
								animate="center"
								exit="exitLeft"
								transition={{ duration: 0.5 }}
								className="absolute bottom-0 left-0 top-0 z-10 flex w-full items-center justify-center bg-[#F0F4F8] py-[33em] dark:bg-[#1E3A8A] md:relative md:w-1/2"
							>
								<SignupForm setView={handleSetView} />
							</motion.div>
							<motion.div
								key="signup-image"
								className="relative hidden w-1/2 md:block"
								initial={{ x: "100%" }}
								animate={{ x: "0%" }}
								exit={{ x: "100%" }}
								transition={{ duration: 0.5 }}
							>
								<div className="absolute inset-0 bg-[#3B82F6] opacity-100 dark:bg-[#60A5FA]" />
								<div className="absolute left-1/2 top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 transform rounded-full bg-[#F97316]" />
								<Image
									src={"/Anime-Girl1.png"}
									alt={"signup-image"}
									fill
									className={"object-cover"}
								/>
							</motion.div>
						</>
					) : (
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
								className="absolute bottom-0 right-0 top-0 z-10 flex w-full items-center justify-center bg-[#F0F4F8] dark:bg-[#1E3A8A] md:relative md:w-1/2"
							>
								{view === "login" && <LoginForm setView={handleSetView} />}
								{view === "forgot" && (
									<ForgotPasswordForm setView={handleSetView} />
								)}
							</motion.div>
						</>
					)}
				</AnimatePresence>

				{/* Mobile background image */}
				<div className="fixed inset-0 z-0 md:hidden">
					<div className="absolute inset-0 bg-[#3B82F6] opacity-70 dark:bg-[#60A5FA]" />
				</div>
			</div>
		</Suspense>
	);
};

export default AuthPage;
