// zustand/useuser-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UserPreferences {
	// Define specific preference fields as needed
	[key: string]: any;
}

interface CreditInfo {
	balance: number;
	billingType: string;
	lifetimeCredits: number;
	lastUpdated: string | undefined;
}

interface UserState {
	// ===== CORE USER FIELDS =====
	first_name: string;
	last_name: string;
	full_name: string;
	justUpdated: boolean;
	bio: string | undefined;
	hasHydratedUser: boolean;
	email: string | undefined;
	profile: string | undefined;
	preferences: UserPreferences;

	// ===== AUTHENTICATION & CONNECTIONS =====
	github_connected: boolean;
	google_connected: boolean;

	// ===== SUBSCRIPTION & BILLING FIELDS =====
	plan: string;
	subscription_status: string;
	payment_retry_count: number;
	billing_interval: string | undefined;
	current_price_id: string | undefined;
	pending_plan_change: string | undefined;
	subscription_end_date: string | undefined;
	paddle_subscription_id: string | undefined;
	last_successful_payment: string | undefined;
	subscription_start_date: string | undefined;
	payment_grace_period_end: string | undefined;
	pending_plan_effective_date: string | undefined;
	stripe_subscription_id: string | undefined; // Legacy/backward compat (holds paddle_customer_id)

	// ===== SUBSCRIPTION HELPER FLAGS =====
	is_in_grace_period: boolean;
	has_active_subscription: boolean;
	current_billing_type: string | undefined;

	// ===== CREDIT MANAGEMENT =====
	credits: number;
	creditInfo: CreditInfo;

	// ===== BONUS FLAGS =====
	spin_bonus_claimed: boolean;
	spin_bonus_skipped: boolean;
	signup_bonus_claimed: boolean;
}

interface UserActions {
	clearUser: () => void;
	setJustUpdated: (value: boolean) => void;
	setUser: (user: Partial<UserState>) => void;

	// ===== SPECIFIC UPDATE METHODS =====
	updateBio: (bio: string) => void;
	updatePlan: (plan: string) => void;
	updateCredits: (credits: number) => void;
	updateProfile: (profile: string | undefined) => void;
	updatePreferences: (preferences: UserPreferences) => void;
	updateName: (firstName: string, lastName: string) => void;
	updateConnections: (github?: boolean, google?: boolean) => void;
	updateSubscriptionIds: (
		paddleId: string | undefined,
		stripeId: string | undefined,
	) => void;

	// ===== SUBSCRIPTION MANAGEMENT =====
	updateSubscriptionStatus: (status: string) => void;
	setPendingPlanChange: (plan?: string, effectiveDate?: string) => void;
	updateSubscriptionDates: (
		startDate?: string,
		endDate?: string,
		effectiveDate?: string,
	) => void;
	updateBillingInfo: (
		interval?: string,
		priceId?: string,
		billingType?: string,
	) => void;
	updatePaymentInfo: (
		lastPayment?: string,
		graceEnd?: string,
		retryCount?: number,
	) => void;

	// ===== ENHANCED CREDIT MANAGEMENT =====
	setFullCreditInfo: (info: CreditInfo) => void;
	addCredits: (amount: number, description?: string) => void;
	updateCreditInfo: (creditInfo: Partial<CreditInfo>) => void;
	deductCredits: (amount: number, description?: string) => void;

	// ===== BONUS MANAGEMENT =====
	skipSpinBonus: () => void;
	claimSpinBonus: () => void;
	claimSignupBonus: () => void;

	// ===== UTILITY METHODS =====
	getBalance: () => number;
	isSubscriptionActive: () => boolean;
	canAfford: (amount: number) => boolean;
	hasCredits: (amount?: number) => boolean;
	toggleConnection: (type: "github" | "google") => void;

	// ===== OPTIMISTIC UPDATE METHODS =====
	optimisticAdd: (amount: number) => void;
	optimisticDeduct: (amount: number) => void;
	revertOptimisticUpdate: (amount: number, wasDeduction: boolean) => void;
}

const useUserStore = create<UserState & UserActions>()(
	persist(
		(set, get) => ({
			// ===== CORE USER DEFAULTS =====
			first_name: "",
			last_name: "",
			full_name: "",
			email: "",
			profile: undefined,
			bio: "",
			preferences: {},
			justUpdated: false,
			hasHydratedUser: false,

			// ===== AUTHENTICATION & CONNECTIONS DEFAULTS =====
			github_connected: false,
			google_connected: false,

			// ===== SUBSCRIPTION & BILLING DEFAULTS =====
			plan: "",
			subscription_status: "inactive",
			subscription_start_date: undefined,
			subscription_end_date: undefined,
			paddle_subscription_id: undefined,
			stripe_subscription_id: undefined,
			billing_interval: undefined,
			current_price_id: undefined,
			pending_plan_change: undefined,
			pending_plan_effective_date: undefined,
			payment_grace_period_end: undefined,
			last_successful_payment: undefined,
			payment_retry_count: 0,

			// ===== SUBSCRIPTION HELPER FLAGS DEFAULTS =====
			has_active_subscription: false,
			is_in_grace_period: false,
			current_billing_type: undefined,

			// ===== CREDIT MANAGEMENT DEFAULTS =====
			credits: 0,
			creditInfo: {
				balance: 0,
				lifetimeCredits: 0,
				billingType: "credits",
				lastUpdated: undefined,
			},

			// ===== BONUS FLAGS DEFAULTS =====
			signup_bonus_claimed: false,
			spin_bonus_claimed: false,
			spin_bonus_skipped: false,

			// ===== CORE SETTERS =====
			setUser: user => {
				set(state => ({ ...state, ...user }));
			},

			setJustUpdated: value => {
				set({ justUpdated: value });
			},

			// ===== SPECIFIC UPDATE METHODS =====
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

			// ===== SUBSCRIPTION MANAGEMENT METHODS =====
			updateSubscriptionStatus: status => {
				set(state => ({
					...state,
					subscription_status: status,
					has_active_subscription: status === "active",
					justUpdated: true,
				}));
			},

			updateSubscriptionDates: (startDate, endDate, effectiveDate) => {
				set(state => ({
					...state,
					...(startDate !== undefined && {
						subscription_start_date: startDate,
					}),
					...(endDate !== undefined && { subscription_end_date: endDate }),
					...(effectiveDate !== undefined && {
						pending_plan_effective_date: effectiveDate,
					}),
					justUpdated: true,
				}));
			},

			updateBillingInfo: (interval, priceId, billingType) => {
				set(state => ({
					...state,
					...(interval !== undefined && { billing_interval: interval }),
					...(priceId !== undefined && { current_price_id: priceId }),
					...(billingType !== undefined && {
						current_billing_type: billingType,
					}),
					justUpdated: true,
				}));
			},

			updatePaymentInfo: (lastPayment, graceEnd, retryCount) => {
				set(state => ({
					...state,
					...(lastPayment !== undefined && {
						last_successful_payment: lastPayment,
					}),
					...(graceEnd !== undefined && { payment_grace_period_end: graceEnd }),
					...(retryCount !== undefined && { payment_retry_count: retryCount }),
					is_in_grace_period: graceEnd
						? new Date(graceEnd) > new Date()
						: state.is_in_grace_period,
					justUpdated: true,
				}));
			},

			setPendingPlanChange: (plan, effectiveDate) => {
				set(state => ({
					...state,
					pending_plan_change: plan,
					pending_plan_effective_date: effectiveDate,
					justUpdated: true,
				}));
			},

			// ===== ENHANCED CREDIT MANAGEMENT METHODS =====
			updateCreditInfo: creditInfo => {
				set(state => ({
					...state,
					creditInfo: {
						...state.creditInfo,
						...creditInfo,
						lastUpdated: new Date().toISOString(),
					},
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

			// ===== BONUS MANAGEMENT METHODS =====
			claimSignupBonus: () => {
				set(state => ({
					...state,
					signup_bonus_claimed: true,
					justUpdated: true,
				}));
			},

			claimSpinBonus: () => {
				set(state => ({
					...state,
					spin_bonus_claimed: true,
					justUpdated: true,
				}));
			},

			skipSpinBonus: () => {
				set(state => ({
					...state,
					spin_bonus_skipped: true,
					justUpdated: true,
				}));
			},

			// ===== UTILITY METHODS =====
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

			isSubscriptionActive: () => {
				const state = get();
				return (
					state.has_active_subscription ||
					state.subscription_status === "active"
				);
			},

			// ===== OPTIMISTIC UPDATE METHODS =====
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

			// ===== CLEAR USER METHOD =====
			clearUser: () =>
				set({
					// Core fields
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

					// Authentication & connections
					github_connected: false,
					google_connected: false,

					// Subscription & billing fields
					subscription_status: "inactive",
					subscription_start_date: undefined,
					subscription_end_date: undefined,
					paddle_subscription_id: undefined,
					stripe_subscription_id: undefined,
					billing_interval: undefined,
					current_price_id: undefined,
					pending_plan_change: undefined,
					pending_plan_effective_date: undefined,
					payment_grace_period_end: undefined,
					last_successful_payment: undefined,
					payment_retry_count: 0,

					// Subscription helper flags
					has_active_subscription: false,
					is_in_grace_period: false,
					current_billing_type: undefined,

					// Credit management
					credits: 0,
					creditInfo: {
						balance: 0,
						lifetimeCredits: 0,
						billingType: "credits",
						lastUpdated: undefined,
					},

					// Bonus flags
					signup_bonus_claimed: false,
					spin_bonus_claimed: false,
					spin_bonus_skipped: false,
				}),
		}),
		{
			name: "user-storage", // unique name for localStorage key
		},
	),
);

export default useUserStore;
