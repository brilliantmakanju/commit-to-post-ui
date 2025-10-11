// zustand/useuser-store.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

interface UserPreferences {
	[key: string]: unknown;
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
	type: string;
	github_connected: boolean;
	google_connected: boolean;

	// ===== SUBSCRIPTION & BILLING FIELDS =====
	plan: string;
	subscription_status: string | undefined;
	billing_interval: string | undefined;
	paddle_customer_id: string | undefined;
	subscription_end_date: string | undefined;
	paddle_subscription_id: string | undefined;
	stripe_subscription_id: string | undefined;
	subscription_start_date: string | undefined;

	// ===== PENDING PLAN CHANGES =====
	pending_plan_change: string | undefined;
	pending_plan_change_type: string | undefined;
	pending_plan_effective_date: string | undefined;

	// ===== PAYMENT & GRACE PERIOD =====
	payment_grace_period_end: string | undefined;

	// ===== BILLING INFORMATION =====
	credits_balance: number;
	billing_type: string | undefined;
	lifetime_credits_purchased: number;
	payment_provider: string | undefined;

	// ===== SUBSCRIPTION HELPER FLAGS =====
	is_in_grace_period: boolean;
	has_active_subscription: boolean;

	// ===== BONUS FLAGS =====
	spin_bonus_claimed: boolean;
	spin_bonus_skipped: boolean;
	can_use_spin_bonus: boolean;
	signup_bonus_claimed: boolean;

	// ===== SUBSCRIPTION DATES (NEW FIELDS) =====
	days_until_renewal: number | undefined;
	billing_updated_at: string | undefined;
	last_updated: string | undefined;
}

interface UserActions {
	clearUser: () => void;
	setJustUpdated: (value: boolean) => void;
	setUser: (user: Partial<UserState>) => void;

	// ===== SPECIFIC UPDATE METHODS =====
	updateBio: (bio: string) => void;
	updatePlan: (plan: string) => void;
	updateProfile: (profile: string | undefined) => void;
	updatePreferences: (preferences: UserPreferences) => void;
	updateName: (firstName: string, lastName: string) => void;
	updateConnections: (github?: boolean, google?: boolean) => void;

	// ===== SUBSCRIPTION MANAGEMENT =====
	updateSubscriptionStatus: (status: string) => void;
	updateSubscriptionDates: (
		startDate?: string,
		endDate?: string,
		daysUntilRenewal?: number,
	) => void;
	setPendingPlanChange: (
		plan?: string,
		effectiveDate?: string,
		changeType?: string,
	) => void;
	updateBillingInfo: (
		interval?: string,
		billingType?: string,
		provider?: string,
	) => void;
	updatePaymentIds: (
		paddleId?: string,
		stripeId?: string,
		paddleCustomerId?: string,
	) => void;
	updateGracePeriod: (endDate?: string) => void;

	// ===== CREDIT MANAGEMENT =====
	updateCredits: (balance: number, lifetime?: number) => void;
	addCredits: (amount: number) => void;
	deductCredits: (amount: number) => void;

	// ===== BONUS MANAGEMENT =====
	skipSpinBonus: () => void;
	claimSpinBonus: () => void;
	claimSignupBonus: () => void;

	// ===== UTILITY METHODS =====
	getBalance: () => number;
	isSubscriptionActive: () => boolean;
	canAfford: (amount: number) => boolean;
	hasCredits: (amount?: number) => boolean;
	isInGracePeriod: () => boolean;
	getPlanInfo: () => {
		plan: string;
		status: string | undefined;
		interval: string | undefined;
		isActive: boolean;
		isPending: boolean;
	};
	toggleConnection: (type: "github" | "google") => void;

	// ===== OPTIMISTIC UPDATE METHODS =====
	optimisticAdd: (amount: number) => void;
	optimisticDeduct: (amount: number) => void;
	revertOptimisticUpdate: (amount: number, wasDeduction: boolean) => void;
}

type UserStore = UserState & UserActions;

// ============================================================================
// STORE CREATION
// ============================================================================

const useUserStore = create<UserStore>()(
	persist(
		(set, get) => ({
			// ===== CORE USER DEFAULTS =====
			first_name: "",
			last_name: "",
			full_name: "",
			email: undefined,
			profile: undefined,
			bio: undefined,
			preferences: {},
			justUpdated: false,
			hasHydratedUser: false,
			type: "magic",

			// ===== AUTHENTICATION & CONNECTIONS DEFAULTS =====
			github_connected: false,
			google_connected: false,

			// ===== SUBSCRIPTION & BILLING DEFAULTS =====
			plan: "basic",
			subscription_status: undefined,
			subscription_start_date: undefined,
			subscription_end_date: undefined,
			billing_interval: undefined,
			paddle_subscription_id: undefined,
			stripe_subscription_id: undefined,
			paddle_customer_id: undefined,

			// ===== PENDING PLAN CHANGES DEFAULTS =====
			pending_plan_change: undefined,
			pending_plan_effective_date: undefined,
			pending_plan_change_type: undefined,

			// ===== PAYMENT & GRACE PERIOD DEFAULTS =====
			payment_grace_period_end: undefined,

			// ===== BILLING INFORMATION DEFAULTS =====
			billing_type: undefined,
			payment_provider: undefined,
			credits_balance: 0,
			lifetime_credits_purchased: 0,

			// ===== SUBSCRIPTION HELPER FLAGS DEFAULTS =====
			has_active_subscription: false,
			is_in_grace_period: false,

			// ===== BONUS FLAGS DEFAULTS =====
			signup_bonus_claimed: false,
			spin_bonus_claimed: false,
			spin_bonus_skipped: false,
			can_use_spin_bonus: false,

			// ===== SUBSCRIPTION DATES DEFAULTS =====
			days_until_renewal: undefined,
			billing_updated_at: undefined,
			last_updated: undefined,

			// ===== CORE SETTERS =====
			setUser: (user: Partial<UserState>) => {
				set(state => ({
					...state,
					...user,
					justUpdated: true,
				}));
			},

			setJustUpdated: (value: boolean) => {
				set({ justUpdated: value });
			},

			// ===== SPECIFIC UPDATE METHODS =====
			updateProfile: (profile: string | undefined) => {
				set(state => ({
					...state,
					profile,
					justUpdated: true,
				}));
			},

			updatePlan: (plan: string) => {
				set(state => ({
					...state,
					plan,
					justUpdated: true,
				}));
			},

			updateBio: (bio: string) => {
				set(state => ({
					...state,
					bio,
					justUpdated: true,
				}));
			},

			updatePreferences: (preferences: UserPreferences) => {
				set(state => ({
					...state,
					preferences,
					justUpdated: true,
				}));
			},

			updateName: (firstName: string, lastName: string) => {
				set(state => ({
					...state,
					first_name: firstName,
					last_name: lastName,
					full_name: `${firstName} ${lastName}`.trim(),
					justUpdated: true,
				}));
			},

			updateConnections: (github?: boolean, google?: boolean) => {
				set(state => ({
					...state,
					...(github !== undefined && { github_connected: github }),
					...(google !== undefined && { google_connected: google }),
					justUpdated: true,
				}));
			},

			// ===== SUBSCRIPTION MANAGEMENT METHODS =====
			updateSubscriptionStatus: (status: string) => {
				set(state => ({
					...state,
					subscription_status: status,
					has_active_subscription: status === "active",
					justUpdated: true,
				}));
			},

			updateSubscriptionDates: (
				startDate?: string,
				endDate?: string,
				daysUntilRenewal?: number,
			) => {
				set(state => ({
					...state,
					...(startDate !== undefined && {
						subscription_start_date: startDate,
					}),
					...(endDate !== undefined && {
						subscription_end_date: endDate,
					}),
					...(daysUntilRenewal !== undefined && {
						days_until_renewal: daysUntilRenewal,
					}),
					justUpdated: true,
				}));
			},

			setPendingPlanChange: (
				plan?: string,
				effectiveDate?: string,
				changeType?: string,
			) => {
				set(state => ({
					...state,
					pending_plan_change: plan,
					pending_plan_effective_date: effectiveDate,
					pending_plan_change_type: changeType,
					justUpdated: true,
				}));
			},

			updateBillingInfo: (
				interval?: string,
				billingType?: string,
				provider?: string,
			) => {
				set(state => ({
					...state,
					...(interval !== undefined && { billing_interval: interval }),
					...(billingType !== undefined && { billing_type: billingType }),
					...(provider !== undefined && { payment_provider: provider }),
					justUpdated: true,
				}));
			},

			updatePaymentIds: (
				paddleId?: string,
				stripeId?: string,
				paddleCustomerId?: string,
			) => {
				set(state => ({
					...state,
					...(paddleId !== undefined && {
						paddle_subscription_id: paddleId,
					}),
					...(stripeId !== undefined && {
						stripe_subscription_id: stripeId,
					}),
					...(paddleCustomerId !== undefined && {
						paddle_customer_id: paddleCustomerId,
					}),
					justUpdated: true,
				}));
			},

			updateGracePeriod: (endDate?: string) => {
				set(state => ({
					...state,
					payment_grace_period_end: endDate,
					is_in_grace_period: endDate ? new Date(endDate) > new Date() : false,
					justUpdated: true,
				}));
			},

			// ===== CREDIT MANAGEMENT METHODS =====
			updateCredits: (balance: number, lifetime?: number) => {
				set(state => ({
					...state,
					credits_balance: Math.max(0, balance),
					...(lifetime !== undefined && {
						lifetime_credits_purchased: lifetime,
					}),
					justUpdated: true,
				}));
			},

			addCredits: (amount: number) => {
				set(state => ({
					...state,
					credits_balance: Math.max(0, state.credits_balance + amount),
					justUpdated: true,
				}));
			},

			deductCredits: (amount: number) => {
				set(state => ({
					...state,
					credits_balance: Math.max(0, state.credits_balance - amount),
					justUpdated: true,
				}));
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
					can_use_spin_bonus: false,
					justUpdated: true,
				}));
			},

			skipSpinBonus: () => {
				set(state => ({
					...state,
					spin_bonus_skipped: true,
					can_use_spin_bonus: false,
					justUpdated: true,
				}));
			},

			// ===== UTILITY METHODS =====
			hasCredits: (amount = 1) => {
				return get().credits_balance >= amount;
			},

			canAfford: (amount: number) => {
				return get().credits_balance >= amount;
			},

			getBalance: () => {
				return get().credits_balance;
			},

			isInGracePeriod: () => {
				const state = get();
				if (!state.payment_grace_period_end) return false;
				return new Date(state.payment_grace_period_end) > new Date();
			},

			getPlanInfo: () => {
				const state = get();
				return {
					plan: state.plan,
					status: state.subscription_status,
					interval: state.billing_interval,
					isActive: state.has_active_subscription,
					isPending: !!state.pending_plan_change,
				};
			},

			toggleConnection: (type: "github" | "google") => {
				set(state => {
					const key = `${type}_connected` as const;
					return {
						...state,
						[key]: !state[key],
						justUpdated: true,
					};
				});
			},

			isSubscriptionActive: () => {
				const state = get();
				return (
					state.has_active_subscription &&
					state.subscription_status === "active"
				);
			},

			// ===== OPTIMISTIC UPDATE METHODS =====
			optimisticDeduct: (amount: number) => {
				const state = get();
				if (state.credits_balance >= amount) {
					set(s => ({
						...s,
						credits_balance: s.credits_balance - amount,
					}));
				}
			},

			optimisticAdd: (amount: number) => {
				set(state => ({
					...state,
					credits_balance: state.credits_balance + amount,
				}));
			},

			revertOptimisticUpdate: (amount: number, wasDeduction: boolean) => {
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
					first_name: "",
					last_name: "",
					full_name: "",
					email: undefined,
					profile: undefined,
					bio: undefined,
					preferences: {},
					justUpdated: false,
					hasHydratedUser: false,
					type: "magic",

					// Authentication & connections
					github_connected: false,
					google_connected: false,

					// Subscription & billing
					plan: "basic",
					subscription_status: undefined,
					subscription_start_date: undefined,
					subscription_end_date: undefined,
					billing_interval: undefined,
					paddle_subscription_id: undefined,
					stripe_subscription_id: undefined,
					paddle_customer_id: undefined,

					// Pending plan changes
					pending_plan_change: undefined,
					pending_plan_effective_date: undefined,
					pending_plan_change_type: undefined,

					// Payment & grace period
					payment_grace_period_end: undefined,

					// Billing information
					billing_type: undefined,
					payment_provider: undefined,
					credits_balance: 0,
					lifetime_credits_purchased: 0,

					// Subscription helper flags
					has_active_subscription: false,
					is_in_grace_period: false,

					// Bonus flags
					signup_bonus_claimed: false,
					spin_bonus_claimed: false,
					spin_bonus_skipped: false,
					can_use_spin_bonus: false,

					// Subscription dates
					days_until_renewal: undefined,
					billing_updated_at: undefined,
					last_updated: undefined,
				}),
		}),
		{
			name: "user-storage",
		},
	),
);

// ============================================================================
// HELPER FUNCTIONS (EXPORTED FOR USE OUTSIDE STORE)
// ============================================================================

/**
 * Checks if a subscription is active and not in grace period
 */
export const isActiveSubscriber = (store: UserState): boolean => {
	return (
		store.has_active_subscription &&
		store.subscription_status === "active" &&
		!store.is_in_grace_period
	);
};

/**
 * Gets days remaining until subscription ends
 */
export const getDaysUntilEnd = (store: UserState): number | undefined => {
	if (!store.subscription_end_date) return undefined;

	const endDate = new Date(store.subscription_end_date);
	const now = new Date();
	const diffMs = endDate.getTime() - now.getTime();
	const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

	return Math.max(0, diffDays);
};

/**
 * Gets days remaining in grace period
 */
export const getDaysInGracePeriod = (store: UserState): number | undefined => {
	if (!store.payment_grace_period_end) return undefined;

	const graceEnd = new Date(store.payment_grace_period_end);
	const now = new Date();

	if (graceEnd <= now) return 0;

	const diffMs = graceEnd.getTime() - now.getTime();
	const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

	return diffDays;
};

/**
 * Determines if user should see upgrade prompt
 */
export const shouldShowUpgradePrompt = (store: UserState): boolean => {
	return (
		!store.has_active_subscription &&
		store.plan === "basic" &&
		store.credits_balance < 5
	);
};

/**
 * Gets all connected accounts
 */
export const getConnectedAccounts = (
	store: UserState,
): ("github" | "google")[] => {
	const accounts: ("github" | "google")[] = [];
	if (store.github_connected) accounts.push("github");
	if (store.google_connected) accounts.push("google");
	return accounts;
};

/**
 * Validates user has required fields to use the app
 */
export const isUserComplete = (store: UserState): boolean => {
	return !!(store.email && store.first_name && store.last_name);
};

/**
 * Gets user's full subscription/billing summary
 */
export const getBillingStatus = (store: UserState) => {
	return {
		hasSub: store.has_active_subscription,
		plan: store.plan,
		status: store.subscription_status,
		billingType: store.billing_type,
		provider: store.payment_provider,
		interval: store.billing_interval,
		inGracePeriod: store.is_in_grace_period,
		graceEndDate: store.payment_grace_period_end,
		subscriptionEndDate: store.subscription_end_date,
		subscriptionStartDate: store.subscription_start_date,
		pendingChange: store.pending_plan_change,
		pendingChangeDate: store.pending_plan_effective_date,
		pendingChangeType: store.pending_plan_change_type,
		daysUntilRenewal: store.days_until_renewal,
		creditsBalance: store.credits_balance,
		lastUpdated: store.last_updated,
	};
};

export default useUserStore;
