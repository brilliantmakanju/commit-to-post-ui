/* eslint-disable import/no-unresolved */
"use client";
import React, { useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";

import {
	checkSpinEligibility,
	claimSpinBonus,
	skipSpinBonus,
} from "@/server-actions/spin-bonus-action";
import useBonusStore from "@/zustand/use-bonus";
import useUserStore from "@/zustand/useuser-store";

import { CancelModal } from "./cancel";
import { CheckingEligibility } from "./eligibility";
import { InitialModal } from "./init";
import { ProcessingModal } from "./processing";
import { ResultModal } from "./result";

export default function CreditBonusParent() {
	const {
		nonce,
		errorMessage,
		loadingState,
		currentModal,
		currentStep,
		selectedCredits,

		setError,
		openModal,
		closeModal,
		clearError,
		setCredits,
		setSpinResult,
		setEligibility,
		setLoadingState,
		setCurrentStep,
		setIsProcessing,
	} = useBonusStore();

	const {
		spin_bonus_claimed,
		spin_bonus_skipped,
		skipSpinBonus: skipUserSpinBonus,
		claimSpinBonus: claimUserSpinBonus,
	} = useUserStore();

	// Check eligibility on mount
	useEffect(() => {
		const checkEligibility = async () => {
			if (spin_bonus_claimed || spin_bonus_skipped) {
				return;
			}

			setLoadingState("checking");

			const result = await checkSpinEligibility();

			if (result.success && result.eligible && result.nonce) {
				setEligibility(true, result.nonce);
				setLoadingState("eligible");
				openModal("initial");
			} else {
				setEligibility(false);
				setLoadingState("not-eligible");
			}
		};

		checkEligibility();
	}, [
		openModal,
		setEligibility,
		setLoadingState,
		skipUserSpinBonus,
		spin_bonus_claimed,
		spin_bonus_skipped,
		claimUserSpinBonus,
	]);
	const startProcessing = useCallback(async () => {
		if (!nonce) {
			setError("Invalid nonce. Please refresh and try again.");
			toast.error("Invalid nonce. Please refresh and try again.");
			return;
		}

		clearError();
		openModal("processing");
		setIsProcessing(true);

		const steps = [
			{ label: "Reading commits", duration: 800 },
			{ label: "Preparing AI", duration: 800 },
			{ label: "Generating bonus", duration: 800 },
		];

		try {
			for (const [index, step] of steps.entries()) {
				setCurrentStep(index);
				// Optionally show step toast
				toast(step.label, { duration: 500 });
				await new Promise(result => setTimeout(result, step.duration));
			}

			// Backend call
			const result = await claimSpinBonus(nonce);

			if (result.success && result.credits_won && result.new_balance) {
				setCredits(result.credits_won);
				setSpinResult(result.credits_won, result.new_balance);

				// Success toast
				toast.success(`You won ${result.credits_won} credits!`);

				openModal("result");
				claimUserSpinBonus(); // update user store
			} else {
				const message = result.message || "Failed to claim bonus.";
				setError(message);
				toast.error(message);
				openModal("initial");
			}
		} catch (error: any) {
			const message = error?.message || "An unexpected error occurred.";
			setError(message);
			toast.error(message);
			openModal("initial");
		} finally {
			setIsProcessing(false);
		}
	}, [
		nonce,
		clearError,
		openModal,
		setIsProcessing,
		setError,
		setCurrentStep,
		setCredits,
		setSpinResult,
		claimUserSpinBonus,
	]);

	const handleSkip = useCallback(async () => {
		toast.loading("Skipping bonus spin...");

		try {
			const result = await skipSpinBonus();

			if (result.success) {
				toast.success(result.message || "Bonus skipped!");
				skipUserSpinBonus();
				closeModal();
			} else {
				const message = result.message || "Failed to skip bonus.";
				setError(message);
				toast.error(message);
				openModal("initial");
			}
		} catch (error: any) {
			const message = error?.message || "An unexpected error occurred.";
			setError(message);
			toast.error(message);
			openModal("initial");
		}
	}, [openModal, skipUserSpinBonus, closeModal, setError]);

	const handleClose = useCallback(() => {
		closeModal();
		setIsProcessing(false); // make sure processing is reset
		clearError();
	}, [closeModal, setIsProcessing, clearError]);

	// Show loading screen
	if (loadingState === "checking") {
		return <CheckingEligibility open />;
	}

	// Show modals when eligible
	return (
		<>
			<InitialModal
				onClaim={startProcessing}
				errorMessage={errorMessage}
				onSkip={() => openModal("cancel")}
				isOpen={currentModal === "initial"}
			/>

			<CancelModal
				onSkip={handleSkip}
				onClaim={startProcessing}
				isOpen={currentModal === "cancel"}
			/>

			<ProcessingModal
				currentStep={currentStep}
				isOpen={currentModal === "processing"}
			/>

			<ResultModal
				onClose={handleClose}
				credits={selectedCredits}
				isOpen={currentModal === "result"}
			/>
		</>
	);
}
