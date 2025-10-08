/* eslint-disable import/no-unresolved */
"use client";

import { useRouter } from "next/navigation";
import { FiArrowRight, FiCheck } from "react-icons/fi";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";

interface PurchaseSuccessModalProps {
	isOpen: boolean;
	onClose: () => void;
}

export default function PurchaseSuccessModal({
	isOpen,
	onClose,
}: PurchaseSuccessModalProps) {
	const router = useRouter();

	const handleGoToDashboard = () => {
		onClose();
		router.push("/dashboard");
	};

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="rounded-2xl border border-neutral-100 bg-white p-8 shadow-lg sm:max-w-sm">
				<DialogHeader className="space-y-4 text-center">
					<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-black text-white shadow-md">
						<FiCheck size={26} />
					</div>
					<DialogTitle className="text-center text-2xl font-semibold text-black">
						Purchase Complete
					</DialogTitle>
					<DialogDescription className="text-center text-sm text-neutral-500">
						You&apos;re all set. Time to get back to building something great.
					</DialogDescription>
				</DialogHeader>

				<div className="mt-10 flex flex-row-reverse gap-3">
					<Button
						onClick={handleGoToDashboard}
						className="flex w-full items-center justify-center gap-2 bg-black text-white transition-all hover:bg-neutral-800"
					>
						<span>Back to Work</span>
						<FiArrowRight size={18} />
					</Button>
					<Button
						onClick={onClose}
						variant="ghost"
						className="w-full text-neutral-600 transition-all hover:bg-neutral-100"
					>
						Close
					</Button>
				</div>
			</DialogContent>
		</Dialog>
	);
}
