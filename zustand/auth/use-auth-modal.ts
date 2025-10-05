// ============================================
// 1. UPDATED AUTH STORE (zustand/auth/use-auth-modal.ts)
// ============================================
import { create } from "zustand";
import { persist } from "zustand/middleware";

import { AuthView } from "@/types";

interface AuthModalState {
	isOpen: boolean;
	view: AuthView;
	isProcessing: boolean; // NEW: Track if API call is in progress
}

interface AuthModalActions {
	openModal: (view: AuthView) => void;
	closeModal: () => void;
	switchView: (view: AuthView) => void;
	setProcessing: (processing: boolean) => void;
}

const useAuthModalStore = create<AuthModalState & AuthModalActions>()(
	persist(
		set => ({
			isOpen: false,
			view: undefined,
			isProcessing: false,
			openModal: view => set({ isOpen: true, view }),
			closeModal: () =>
				set({ isOpen: false, view: undefined, isProcessing: false }),
			switchView: view => set({ view }),
			setProcessing: processing => set({ isProcessing: processing }),
		}),
		{
			name: "auth-modal-storage", // localStorage key
		},
	),
);

export default useAuthModalStore;
