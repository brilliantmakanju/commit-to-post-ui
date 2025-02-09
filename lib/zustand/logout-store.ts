import { create } from "zustand";
import { persist } from "zustand/middleware";

interface LogoutState {
	logout: boolean;
}

interface LogoutActions {
	setLogout: (logout: boolean) => void;
	clearLogout: () => void;
}

const useLogoutStore = create<LogoutState & LogoutActions>()(
	persist(
		set => ({
			logout: false,
			setLogout: logout => set({ logout }),
			clearLogout: () => set({ logout: false }),
		}),
		{
			name: "logout-storage", // unique name for localStorage key
		},
	),
);

export default useLogoutStore;
