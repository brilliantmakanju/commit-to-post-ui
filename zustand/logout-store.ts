import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

interface LogoutState {
	logout: boolean;
	logoutTimestamp: number | undefined;
}

interface LogoutActions {
	setLogout: (logout: boolean) => void;
	clearLogout: () => void;
	checkLogoutState: () => boolean;
}

const useLogoutStore = create<LogoutState & LogoutActions>()(
	persist(
		(set, get) => ({
			logout: false,
			logoutTimestamp: undefined,

			setLogout: logout =>
				set({
					logout,
					// If setting to true, add timestamp
					logoutTimestamp: logout ? Date.now() : undefined,
				}),

			clearLogout: () =>
				set({
					logout: false,
					logoutTimestamp: undefined,
				}),

			// Helper to check if user is logged out
			checkLogoutState: () => {
				const state = get();
				return state.logout;
			},
		}),
		{
			name: "logout-storage",
			storage: createJSONStorage(() => localStorage),
			// Only persist these fields
			partialize: state => ({
				logout: state.logout,
				logoutTimestamp: state.logoutTimestamp,
			}),
		},
	),
);

export default useLogoutStore;
