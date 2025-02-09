import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserPreferences {
	// Define specific preference fields as needed
	[key: string]: any;
}

interface UserState {
	full_name: string;
	first_name: string;
	last_name: string;
	bio: string;
	email: string;
	preferences: UserPreferences; // Adjust type as necessary
	stripe_subscription_id: string;
	github_connected: boolean;
	google_connected: boolean;
	justUpdated: boolean;
}

interface UserActions {
	setUser: (user: Partial<UserState>) => void;
	clearUser: () => void;
	setJustUpdated: (value: boolean) => void;
}

const useUserStore = create<UserState & UserActions>()(
	persist(
		set => ({
			full_name: "",
			first_name: "",
			last_name: "",
			bio: "",
			email: "",
			preferences: {},
			stripe_subscription_id: "",
			github_connected: false,
			google_connected: false,
			justUpdated: false,
			setUser: user => {
				set(state => ({ ...state, ...user }));
			},
			setJustUpdated: value => {
				set({ justUpdated: value });
			},
			clearUser: () =>
				set({
					full_name: "",
					first_name: "",
					last_name: "",
					bio: "",
					email: "",
					preferences: {},
					stripe_subscription_id: "",
					github_connected: false,
					google_connected: false,
					justUpdated: false,
				}),
		}),
		{
			name: "user-storage", // unique name for localStorage key
		},
	),
);

export default useUserStore;
