import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserPreferences {
	// Define specific preference fields as needed
	[key: string]: any;
}

interface UserState {
	// Existing fields
	plan: string;
	last_name: string;
	full_name: string;
	first_name: string;
	justUpdated: boolean;
	hasHydratedUser: boolean;
	github_connected: boolean;
	google_connected: boolean;
	subscription_status: string;
	preferences: UserPreferences;
	stripe_subscription_id: string;
	bio: string | undefined | undefined;
	email: string | undefined | undefined;
	subscription_end_date: Date | undefined;

	// NEW FIELDS FOR ENHANCED SUBSCRIPTION MANAGEMENT
	payment_retry_count: number;
	billing_interval: string | undefined;
	current_price_id: string | undefined;
	pending_plan_change: string | undefined;
	last_successful_payment: Date | undefined;
	subscription_start_date: Date | undefined;
	paddle_subscription_id: string | undefined;
	payment_grace_period_end: Date | undefined;
	pending_plan_effective_date: Date | undefined;

	// HELPER FLAGS
	is_in_grace_period: boolean;
	has_active_subscription: boolean;
	current_billing_type: string | undefined;
}

interface UserActions {
	clearUser: () => void;
	setJustUpdated: (value: boolean) => void;
	setUser: (user: Partial<UserState>) => void;
}

const useUserStore = create<UserState & UserActions>()(
	persist(
		set => ({
			// Existing defaults
			bio: "",
			plan: "",
			email: "",
			full_name: "",
			last_name: "",
			first_name: "",
			preferences: {},
			justUpdated: false,
			hasHydratedUser: false,
			github_connected: false,
			google_connected: false,
			subscription_status: "",
			stripe_subscription_id: "",
			subscription_end_date: undefined,

			// NEW FIELD DEFAULTS
			payment_retry_count: 0,
			is_in_grace_period: false,
			current_price_id: undefined,
			billing_interval: undefined,
			has_active_subscription: false,
			pending_plan_change: undefined,
			current_billing_type: undefined,
			paddle_subscription_id: undefined,
			subscription_start_date: undefined,
			last_successful_payment: undefined,
			payment_grace_period_end: undefined,
			pending_plan_effective_date: undefined,

			setUser: user => {
				set(state => ({ ...state, ...user }));
			},
			setJustUpdated: value => {
				set({ justUpdated: value });
			},
			clearUser: () =>
				set({
					// Clear existing fields
					bio: "",
					plan: "",
					email: "",
					full_name: "",
					last_name: "",
					first_name: "",
					preferences: {},
					justUpdated: false,
					hasHydratedUser: false,
					github_connected: false,
					google_connected: false,
					subscription_status: "",
					stripe_subscription_id: "",
					subscription_end_date: undefined,

					// Clear new fields
					payment_retry_count: 0,
					is_in_grace_period: false,
					billing_interval: undefined,
					current_price_id: undefined,
					pending_plan_change: undefined,
					has_active_subscription: false,
					current_billing_type: undefined,
					paddle_subscription_id: undefined,
					subscription_start_date: undefined,
					last_successful_payment: undefined,
					payment_grace_period_end: undefined,
					pending_plan_effective_date: undefined,
				}),
		}),
		{
			name: "user-storage", // unique name for localStorage key
		},
	),
);

export default useUserStore;
