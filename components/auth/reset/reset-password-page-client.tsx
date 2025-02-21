"use client";

import { motion } from "framer-motion";
import { GalleryVerticalEnd } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
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
			<div className="flex min-h-screen flex-col overflow-hidden bg-background text-foreground md:flex-row">
				{/* <motion.div
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
				</motion.div> */}

				<motion.div
					key="login-image"
					className="relative hidden w-1/2 md:block"
					initial={{ x: "-100%" }}
					animate={{ x: "0%" }}
					exit={{ x: "-100%" }}
					transition={{ duration: 0.5 }}
				>
					<Image
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
					/>
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
								DevPulse
							</Link>
						</div>
						<ResetPasswordForm uid={userId} token={userToken} />
					</div>
				</motion.div>
			</div>
		</Suspense>
	);
};

export default ResetPasswordPageClient;
