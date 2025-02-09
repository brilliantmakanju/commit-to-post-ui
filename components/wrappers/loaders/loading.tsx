"use client";

import { motion } from "framer-motion";

export default function Loading() {
	return (
		<div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
			<div className="flex flex-col items-center gap-6">
				<motion.div
					className="flex gap-2"
					initial={{ opacity: 0, scale: 0.5 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ duration: 0.5 }}
				>
					{Array.from({ length: 3 }).map((_, index) => (
						<motion.div
							key={index}
							className="h-4 w-4 rounded-full bg-primary"
							animate={{
								y: [-10, 0, -10],
								backgroundColor: ["#3b82f6", "#60a5fa", "#3b82f6"],
							}}
							transition={{
								duration: 1,
								repeat: Infinity,
								delay: index * 0.2,
								ease: "easeInOut",
							}}
						/>
					))}
				</motion.div>

				<motion.h2
					className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-xl font-semibold text-transparent"
					initial={{ opacity: 0, y: 20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.5, delay: 0.3 }}
				>
					Loading
					<motion.span
						initial={{ opacity: 0 }}
						animate={{ opacity: [0, 1, 0] }}
						transition={{ duration: 1.5, repeat: Infinity }}
					>
						...
					</motion.span>
				</motion.h2>
			</div>
		</div>
	);
}
