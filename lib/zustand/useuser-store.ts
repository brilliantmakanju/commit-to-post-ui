import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserPreferences {
	// Define specific preference fields as needed
	[key: string]: any;
}

interface UserState {
	bio: string;
	plan: string;
	email: string;
	last_name: string;
	full_name: string;
	first_name: string;
	justUpdated: boolean;
	github_connected: boolean;
	google_connected: boolean;
	subscription_status: string;
	preferences: UserPreferences;
	stripe_subscription_id: string;
	subscription_end_date: Date | undefined;
}

interface UserActions {
	setUser: (user: Partial<UserState>) => void;
	clearUser: () => void;
	setJustUpdated: (value: boolean) => void;
}

const useUserStore = create<UserState & UserActions>()(
	persist(
		set => ({
			bio: "",
			plan: "",
			email: "",
			full_name: "",
			last_name: "",
			first_name: "",
			preferences: {},
			justUpdated: false,
			github_connected: false,
			google_connected: false,
			subscription_status: "",
			stripe_subscription_id: "",
			subscription_end_date: undefined,
			setUser: user => {
				set(state => ({ ...state, ...user }));
			},
			setJustUpdated: value => {
				set({ justUpdated: value });
			},
			clearUser: () =>
				set({
					bio: "",
					plan: "",
					email: "",
					full_name: "",
					last_name: "",
					first_name: "",
					preferences: {},
					justUpdated: false,
					github_connected: false,
					google_connected: false,
					subscription_status: "",
					stripe_subscription_id: "",
					subscription_end_date: undefined,
				}),
		}),
		{
			name: "user-storage", // unique name for localStorage key
		},
	),
);

export default useUserStore;
