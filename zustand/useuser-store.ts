// zustand/useuser-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserPreferences {
	// Define specific preference fields as needed
	[key: string]: any;
}

interface CreditInfo {
	balance: number;
	lifetimeCredits: number;
	billingType: string;
	lastUpdated: string | undefined;
}

interface UserState {
	// Core user fields
	plan: string;
	last_name: string;
	full_name: string;
	first_name: string;
	profile: string | undefined;
	justUpdated: boolean;
	hasHydratedUser: boolean;
	github_connected: boolean;
	google_connected: boolean;
	preferences: UserPreferences;
	bio: string | undefined;
	email: string | undefined;

	// Subscription & billing fields
	paddle_subscription_id: string | undefined;
	stripe_subscription_id: string | undefined;

	// Enhanced credit management
	credits: number;
	creditInfo: CreditInfo;
}

interface UserActions {
	clearUser: () => void;
	setJustUpdated: (value: boolean) => void;
	setUser: (user: Partial<UserState>) => void;

	// Specific update methods for frequently changed fields
	updateProfile: (profile: string | undefined) => void;
	updateCredits: (credits: number) => void;
	updatePlan: (plan: string) => void;
	updateBio: (bio: string) => void;
	updatePreferences: (preferences: UserPreferences) => void;
	updateName: (firstName: string, lastName: string) => void;
	updateSubscriptionIds: (
		paddleId: string | undefined,
		stripeId: string | undefined,
	) => void;
	updateConnections: (github?: boolean, google?: boolean) => void;

	// Enhanced credit management
	updateCreditInfo: (creditInfo: Partial<CreditInfo>) => void;
	addCredits: (amount: number, description?: string) => void;
	deductCredits: (amount: number, description?: string) => void;
	setFullCreditInfo: (info: CreditInfo) => void;

	// Utility methods
	hasCredits: (amount?: number) => boolean;
	canAfford: (amount: number) => boolean;
	getBalance: () => number;
	toggleConnection: (type: "github" | "google") => void;

	// Quick actions for optimistic updates
	optimisticDeduct: (amount: number) => void;
	optimisticAdd: (amount: number) => void;
	revertOptimisticUpdate: (amount: number, wasDeduction: boolean) => void;
}

const useUserStore = create<UserState & UserActions>()(
	persist(
		(set, get) => ({
			// Core defaults
			bio: "",
			plan: "",
			email: "",
			profile: undefined,
			full_name: "",
			last_name: "",
			first_name: "",
			preferences: {},
			justUpdated: false,
			hasHydratedUser: false,
			github_connected: false,
			google_connected: false,

			// Subscription & billing defaults
			paddle_subscription_id: undefined,
			stripe_subscription_id: undefined,
			credits: 0,

			// Enhanced credit info
			creditInfo: {
				balance: 0,
				lifetimeCredits: 0,
				billingType: "credits",
				lastUpdated: undefined,
			},

			setUser: user => {
				set(state => ({ ...state, ...user }));
			},

			setJustUpdated: value => {
				set({ justUpdated: value });
			},

			// Specific update methods for frequently changed fields
			updateProfile: profile => {
				set(state => ({ ...state, profile, justUpdated: true }));
			},

			updateCredits: credits => {
				set(state => ({
					...state,
					credits,
					creditInfo: {
						...state.creditInfo,
						balance: credits,
						lastUpdated: new Date().toISOString(),
					},
					justUpdated: true,
				}));
			},

			updatePlan: plan => {
				set(state => ({ ...state, plan, justUpdated: true }));
			},

			updateBio: bio => {
				set(state => ({ ...state, bio, justUpdated: true }));
			},

			updatePreferences: preferences => {
				set(state => ({ ...state, preferences, justUpdated: true }));
			},

			updateName: (firstName, lastName) => {
				set(state => ({
					...state,
					first_name: firstName,
					last_name: lastName,
					full_name: `${firstName} ${lastName}`.trim(),
					justUpdated: true,
				}));
			},

			updateSubscriptionIds: (paddleId, stripeId) => {
				set(state => ({
					...state,
					paddle_subscription_id: paddleId,
					stripe_subscription_id: stripeId,
					justUpdated: true,
				}));
			},

			updateConnections: (github, google) => {
				set(state => ({
					...state,
					...(github !== undefined && { github_connected: github }),
					...(google !== undefined && { google_connected: google }),
					justUpdated: true,
				}));
			},

			// Enhanced credit management methods
			updateCreditInfo: creditInfo => {
				set(state => ({
					...state,
					creditInfo: {
						...state.creditInfo,
						...creditInfo,
						lastUpdated: new Date().toISOString(),
					},
					// Keep credits in sync with creditInfo.balance
					credits: creditInfo.balance ?? state.credits,
					justUpdated: true,
				}));
			},

			setFullCreditInfo: info => {
				set(state => ({
					...state,
					creditInfo: info,
					credits: info.balance,
					justUpdated: true,
				}));
			},

			addCredits: (amount, description) => {
				set(state => {
					const newBalance = state.credits + amount;
					return {
						...state,
						credits: newBalance,
						creditInfo: {
							...state.creditInfo,
							balance: newBalance,
							lastUpdated: new Date().toISOString(),
						},
						justUpdated: true,
					};
				});
			},

			deductCredits: (amount, description) => {
				set(state => {
					const newBalance = Math.max(0, state.credits - amount);
					return {
						...state,
						credits: newBalance,
						creditInfo: {
							...state.creditInfo,
							balance: newBalance,
							lastUpdated: new Date().toISOString(),
						},
						justUpdated: true,
					};
				});
			},

			// Utility methods
			hasCredits: (amount = 1) => {
				return get().credits >= amount;
			},

			canAfford: amount => {
				return get().credits >= amount;
			},

			getBalance: () => {
				return get().credits;
			},

			toggleConnection: type => {
				set(state => ({
					...state,
					[`${type}_connected`]: !state[`${type}_connected` as keyof UserState],
					justUpdated: true,
				}));
			},

			// Optimistic update methods for immediate UI feedback
			optimisticDeduct: amount => {
				const state = get();
				if (state.credits >= amount) {
					set(state => ({
						...state,
						credits: state.credits - amount,
						creditInfo: {
							...state.creditInfo,
							balance: state.credits - amount,
						},
					}));
				}
			},

			optimisticAdd: amount => {
				set(state => ({
					...state,
					credits: state.credits + amount,
					creditInfo: {
						...state.creditInfo,
						balance: state.credits + amount,
					},
				}));
			},

			revertOptimisticUpdate: (amount, wasDeduction) => {
				if (wasDeduction) {
					get().optimisticAdd(amount);
				} else {
					get().optimisticDeduct(amount);
				}
			},

			clearUser: () =>
				set({
					// Clear core fields
					bio: "",
					plan: "",
					email: "",
					profile: undefined,
					full_name: "",
					last_name: "",
					first_name: "",
					preferences: {},
					justUpdated: false,
					hasHydratedUser: false,
					github_connected: false,
					google_connected: false,

					// Clear subscription & billing fields
					paddle_subscription_id: undefined,
					stripe_subscription_id: undefined,
					credits: 0,

					// Clear credit info
					creditInfo: {
						balance: 0,
						lifetimeCredits: 0,
						billingType: "credits",
						lastUpdated: undefined,
					},
				}),
		}),
		{
			name: "user-storage", // unique name for localStorage key
		},
	),
);

export default useUserStore;
