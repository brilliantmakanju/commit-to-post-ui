import { create } from "zustand";
import { persist } from "zustand/middleware";

type ModalType = "initial" | "cancel" | "processing" | "result" | "closed";
type LoadingState = "idle" | "checking" | "eligible" | "not-eligible" | "error";

interface BonusState {
	// modal controls
	currentModal: ModalType;
	isOpen: boolean;

	// processing state
	isProcessing: boolean;
	currentStep: number;
	loadingState: LoadingState;

	// eligibility
	eligible: boolean;
	nonce: string | undefined;
	claimed: boolean;
	skipped: boolean;

	// credits
	selectedCredits: number;
	creditsWon: number | undefined;
	newBalance: number | undefined;

	// error handling
	errorMessage: string | undefined;
}

interface BonusActions {
	// modal actions
	openModal: (modal: ModalType) => void;
	closeModal: () => void;

	// state updates
	setLoadingState: (state: LoadingState) => void;
	setCredits: (credits: number) => void;
	setCurrentStep: (step: number) => void;
	setIsProcessing: (processing: boolean) => void;
	setBonusState: (partial: Partial<BonusState>) => void;

	// eligibility
	setEligibility: (eligible: boolean, nonce?: string | undefined) => void;
	setNonce: (nonce: string | undefined) => void;

	// result handling
	setSpinResult: (creditsWon: number, newBalance: number) => void;
	setError: (message: string) => void;
	clearError: () => void;

	// flags
	markClaimed: () => void;
	markSkipped: () => void;

	// utility
	reset: () => void;
	clear: () => void;
}

const useBonusStore = create<BonusState & BonusActions>()(
	persist(
		set => ({
			// defaults
			currentModal: "initial",
			isOpen: false,
			isProcessing: false,
			currentStep: 0,
			loadingState: "idle",
			selectedCredits: 0,

			// eligibility
			eligible: false,
			nonce: undefined,
			claimed: false,
			skipped: false,

			// credits
			creditsWon: undefined,
			newBalance: undefined,

			// error
			errorMessage: undefined,

			// modal actions
			openModal: modal =>
				set({
					currentModal: modal,
					isOpen: true,
				}),

			closeModal: () =>
				set({
					currentModal: "closed",
					isOpen: false,
				}),

			// state updates
			setLoadingState: state =>
				set({
					loadingState: state,
				}),

			setCredits: credits =>
				set({
					selectedCredits: credits,
				}),

			setCurrentStep: step =>
				set({
					currentStep: step,
				}),

			setIsProcessing: processing =>
				set({
					isProcessing: processing,
				}),

			setBonusState: partial => set(state => ({ ...state, ...partial })),

			// eligibility
			setEligibility: (eligible, nonce?) =>
				set({
					eligible,
					nonce,
				}),

			setNonce: nonce =>
				set({
					nonce,
				}),

			// result handling
			setSpinResult: (creditsWon, newBalance) =>
				set({
					creditsWon,
					newBalance,
					claimed: true,
				}),

			setError: message =>
				set({
					errorMessage: message,
					loadingState: "error",
				}),

			clearError: () =>
				set({
					errorMessage: undefined,
				}),

			// flags
			markClaimed: () =>
				set({
					claimed: true,
				}),

			markSkipped: () =>
				set({
					skipped: true,
				}),

			// utility
			reset: () =>
				set({
					currentModal: "initial",
					isOpen: false,
					isProcessing: false,
					currentStep: 0,
					loadingState: "idle",
					selectedCredits: 0,
					creditsWon: undefined,
					newBalance: undefined,
					errorMessage: undefined,
				}),

			clear: () =>
				set({
					currentModal: "closed",
					isOpen: false,
					isProcessing: false,
					currentStep: 0,
					loadingState: "idle",
					selectedCredits: 0,
					eligible: false,
					nonce: undefined,
					claimed: false,
					skipped: false,
					creditsWon: undefined,
					newBalance: undefined,
					errorMessage: undefined,
				}),
		}),
		{
			name: "bonus-storage",
		},
	),
);

export default useBonusStore;
