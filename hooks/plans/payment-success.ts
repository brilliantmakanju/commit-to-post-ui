/* eslint-disable import/no-unresolved */
// hooks/use-purchase-success.ts
"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

import { decryptPurchaseToken } from "@/lib/cookies/create-cookies";

export function usePurchaseSuccess() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);

	useEffect(() => {
		const handlePurchaseSuccess = async () => {
			// Prevent duplicate processing
			if (isProcessing) return;

			const purchaseToken = searchParams.get("purchase");

			if (!purchaseToken) return;

			setIsProcessing(true);

			try {
				// Decrypt the purchase token using server action
				const decryptedData = await decryptPurchaseToken(purchaseToken);

				if (!decryptedData) {
					toast.error("Invalid purchase data. Please contact support.");
					// Clean URL
					router.replace("/");
					return;
				}

				const { credits } = decryptedData;

				// Validate decrypted data
				if (credits === undefined) {
					toast.error("Incomplete purchase data. Please contact support.");
					router.replace("/");
					return;
				}

				// Show success modal
				setIsModalOpen(true);

				// Clean URL (remove purchase token) - delay to ensure modal shows
				setTimeout(() => {
					router.replace("/", { scroll: false });
				}, 500);
			} catch {
				toast.error("Error processing your purchase. Please contact support.");
				router.replace("/");
			} finally {
				setIsProcessing(false);
			}
		};

		handlePurchaseSuccess();
	}, [searchParams, router, isProcessing]);

	const closeModal = () => {
		setIsModalOpen(false);
	};

	return {
		isModalOpen,
		closeModal,
	};
}
