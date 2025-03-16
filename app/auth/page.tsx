"use client";

import { AnimatePresence, motion } from "framer-motion";
import { GalleryVerticalEnd } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { toast } from "sonner";
import type { z } from "zod";

import LoginForm from "@/components/auth/modals/login";
import { LogoutModal } from "@/components/auth/modals/logout-modal";
import type { magicLinkSchemaToken } from "@/resolvers/auth-resolvers";
import { verifyAndLogin } from "@/server-actions/auth/magic-link";

type ViewType = "login" | "signup" | "forgot";

const submitMagicLink = async (
	values: z.infer<typeof magicLinkSchemaToken>,
) => {
	try {
		const apiRequest = await verifyAndLogin({
			token: values.token,
		});
		if (apiRequest?.message === "Invalid credentials.") {
			toast.error("Invalid credentials, please try again");
		} else if (apiRequest?.message === "Something went wrong.") {
			toast.error("Something went wrong. Please try again later.");
		} else {
			globalThis.window.location.reload();
			toast.success("Welcome back!");
		}
	} catch (error) {
		toast.error((error as Error).message);
	}
};

export default function AuthPage() {
	const [view, setView] = useState<ViewType>("login");
	const searchParams = useSearchParams();

	useEffect(() => {
		const getToken = searchParams.get("token");
		if (!getToken) return;

		submitMagicLink({ token: getToken });
	}, [searchParams]);

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
		globalThis.window.history.pushState(undefined, "", "/auth");
		// globalThis.window.history.pushState(undefined, "", `/auth?view=${newView}`);
	};

	const slideVariants = {
		enterLeft: { x: "-100%", opacity: 0 },
		enterRight: { x: "100%", opacity: 0 },
		center: { x: "0%", opacity: 1 },
		exitLeft: { x: "-100%", opacity: 0 },
		exitRight: { x: "100%", opacity: 0 },
	};

	return (
		<Suspense fallback={<LogoutModal showByDefault />}>
			<div className="flex min-h-screen flex-col overflow-hidden bg-background text-foreground md:flex-row">
				<AnimatePresence initial={false} mode="wait">
					{/* {view === "signup" ? (
						<>
							<motion.div
								key="signup-form"
								variants={slideVariants}
								initial="enterLeft"
								animate="center"
								exit="exitLeft"
								transition={{ duration: 0.5 }}
								className="absolute inset-0 z-10 flex items-center justify-center bg-muted md:relative md:w-1/2"
							>
								<div className="w-full max-w-[350px] p-4">
									<div className="mb-8 flex items-center justify-center gap-2 md:justify-start">
										<Link
											href="/"
											className="flex items-center gap-2 font-medium"
										>
											<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
												<GalleryVerticalEnd className="h-4 w-4" />
											</div>
											Push to Post
										</Link>
									</div>
									<SignupForm setView={handleSetView} />
								</div>
							</motion.div>
							<motion.div
								key="signup-image"
								className="relative hidden w-1/2 bg-[black] bg-opacity-90 md:block"
								initial={{ x: "100%" }}
								animate={{ x: "0%" }}
								exit={{ x: "100%" }}
								transition={{ duration: 0.5 }}
							>
								<Image
									src="/Anime-Girl1.png"
									alt="Cover"
									className="absolute inset-0 h-full w-full object-cover"
									width={1920}
									height={1080}
									priority
									quality={85}
									sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
									placeholder="blur"
									blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLUEwLi0tLTAtQFBGPzpQRT4tLS9gVkVMS1BJTTYyU15CTUVNTUz/2wBDARUXFx4aHR4eHUxCQU1MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEz/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
								/>
							</motion.div>
						</>
					) : ( */}
					{/* <> */}
					<motion.div
						key="login-image"
						className="relative hidden w-1/2 bg-[black] bg-opacity-90 md:block"
						initial={{ x: "-100%" }}
						animate={{ x: "0%" }}
						exit={{ x: "-100%" }}
						transition={{ duration: 0.5 }}
					>
						{/* <Image
									src="/Anime-Girl2.png"
									alt="Cover"
									className="absolute inset-0 h-full w-full object-cover"
									width={1920}
									height={1080}
									priority
									quality={85}
									sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
									placeholder="blur"
									blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDABQODxIPDRQSEBIXFRQdHx4eHRoaHSQtJSEkLUEwLi0tLTAtQFBGPzpQRT4tLS9gVkVMS1BJTTYyU15CTUVNTUz/2wBDARUXFx4aHR4eHUxCQU1MTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTExMTEz/wAARCAAIAAoDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAb/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
								/> */}
					</motion.div>
					<motion.div
						key="login-form"
						variants={slideVariants}
						initial="enterRight"
						animate="center"
						exit="exitRight"
						transition={{ duration: 0.5 }}
						className="absolute inset-0 z-10 flex items-center justify-center bg-muted md:relative md:w-1/2"
					>
						<div className="w-full max-w-[350px] p-4">
							<div className="mb-8 flex items-center justify-center gap-2 md:justify-start">
								<Link href="/" className="flex items-center gap-2 font-medium">
									<div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground">
										<GalleryVerticalEnd className="h-4 w-4" />
									</div>
									Push to Post
								</Link>
							</div>
							<LoginForm setView={handleSetView} />
							{/* {view === "login" ? (
									) : (
										<ForgotPasswordForm setView={handleSetView} />
									)} */}
						</div>
					</motion.div>
					{/* </>
					)} */}
				</AnimatePresence>
			</div>
		</Suspense>
	);
}
