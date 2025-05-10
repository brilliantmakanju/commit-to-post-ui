import { create } from "zustand";
import { persist } from "zustand/middleware";

type AuthView = "login" | "signup" | "check-email" | "verifying" | undefined;

interface AuthModalState {
	isOpen: boolean;
	view: AuthView;
}

interface AuthModalActions {
	openModal: (view: AuthView) => void;
	closeModal: () => void;
	switchView: (view: AuthView) => void;
}

const useAuthModalStore = create<AuthModalState & AuthModalActions>()(
	persist(
		set => ({
			isOpen: false,
			view: undefined,
			openModal: view => set({ isOpen: true, view }),
			closeModal: () => set({ isOpen: false, view: undefined }),
			switchView: view => set({ view }),
		}),
		{
			name: "auth-modal-storage", // localStorage key
		},
	),
);

export default useAuthModalStore;
