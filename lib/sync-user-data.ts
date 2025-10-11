// Enhanced sync function with complete field mapping
// This ensures all fields from auth.ts and useuser-store.ts are properly synced

// Helper function to parse dates safely
const parseDate = (
	dateString: string | undefined | undefined,
): string | undefined => {
	if (!dateString) return undefined;
	try {
		const date = new Date(dateString);
		return Number.isNaN(date.getTime()) ? undefined : date.toISOString();
	} catch {
		return undefined;
	}
};

// Helper to validate boolean fields
const validateBoolean = (value: unknown): boolean => {
	if (typeof value === "boolean") return value;
	if (typeof value === "string") return value.toLowerCase() === "true";
	return false;
};

// Helper to validate numeric fields
const validateNumber = (value: unknown, defaultValue = 0): number => {
	if (value === undefined || value === undefined) return defaultValue;
	const number_ = Number(value);
	return Number.isNaN(number_) ? defaultValue : Math.max(0, number_);
};

export const syncUserData = (userData: any) => {
	return {
		// ===== CORE USER FIELDS =====
		first_name: userData.first_name || "",
		last_name: userData.last_name || "",
		full_name:
			`${userData.first_name || ""} ${userData.last_name || ""}`.trim(),
		email: userData.email || "",
		profile: userData.profile || undefined,
		bio: userData.bio || "",
		preferences: userData.preferences || {},
		hasHydratedUser: true,

		// User type (magic, credentials, oauth)
		type: userData.type || "magic",

		// ===== AUTHENTICATION & CONNECTIONS =====
		github_connected: validateBoolean(userData.github_connected),
		google_connected: validateBoolean(userData.google_connected),

		// ===== SUBSCRIPTION & BILLING FIELDS =====
		plan: userData.plan || "basic",
		subscription_status: userData.subscription_status || "inactive",

		// Subscription dates
		subscription_start_date: parseDate(userData.subscription_start_date),
		subscription_end_date: parseDate(userData.subscription_end_date),

		// Billing details
		billing_interval: userData.billing_interval || undefined,
		billing_type: userData.billing_type || undefined,

		// Payment provider IDs
		paddle_subscription_id: userData.paddle_subscription_id || undefined,
		stripe_subscription_id: userData.stripe_subscription_id || undefined,
		paddle_customer_id: userData.paddle_customer_id || undefined,
		payment_provider: userData.payment_provider || undefined,

		// ===== PENDING PLAN CHANGES =====
		pending_plan_change: userData.pending_plan_change || undefined,
		pending_plan_change_type: userData.pending_plan_change_type || undefined,
		pending_plan_effective_date: parseDate(
			userData.pending_plan_effective_date,
		),

		// ===== PAYMENT & GRACE PERIOD =====
		payment_grace_period_end: parseDate(userData.payment_grace_period_end),
		last_successful_payment: parseDate(userData.last_successful_payment),
		payment_retry_count: validateNumber(userData.payment_retry_count, 0),

		// ===== SUBSCRIPTION HELPER FLAGS =====
		has_active_subscription: validateBoolean(userData.has_active_subscription),
		is_in_grace_period: validateBoolean(userData.is_in_grace_period),

		// ===== CREDIT MANAGEMENT =====
		credits_balance: validateNumber(
			userData.credits_balance || userData.credits,
			0,
		),
		lifetime_credits_purchased: validateNumber(
			userData.lifetime_credits_purchased,
			0,
		),

		// ===== BONUS FLAGS =====
		signup_bonus_claimed: validateBoolean(userData.signup_bonus_claimed),
		spin_bonus_claimed: validateBoolean(userData.spin_bonus_claimed),
		spin_bonus_skipped: validateBoolean(userData.spin_bonus_skipped),
		can_use_spin_bonus: validateBoolean(userData.can_use_spin_bonus),

		// ===== ADDITIONAL FLAGS =====
		is_active: userData.is_active !== false, // Default to true unless explicitly false
		new_user: validateBoolean(userData.new_user),
	};
};

// ============================================================================
// CLEANUP UTILITIES
// ============================================================================

/**
 * Clears all user-related data from storage
 * Should be called on logout
 */
export const clearUserData = () => {
	// Clear Zustand persisted state
	if (typeof globalThis !== "undefined") {
		localStorage.removeItem("user-storage");
		sessionStorage.clear();
	}
};

/**
 * Validates if user data is complete and valid
 */
export const validateUserData = (userData: any): boolean => {
	const requiredFields = ["email", "first_name", "last_name"];
	return requiredFields.every(
		field => userData[field] && String(userData[field]).trim().length > 0,
	);
};

/**
 * Sanitizes user data before storing
 * Removes any potentially harmful or unnecessary fields
 */
export const sanitizeUserData = (userData: any) => {
	const sanitized = { ...userData };

	// Remove sensitive fields that shouldn't be stored client-side
	delete sanitized.access;
	delete sanitized.refresh;
	delete sanitized.password;

	// Remove internal flags that are server-only
	delete sanitized.created_at;
	delete sanitized.updated_at;
	delete sanitized.last_login;

	return sanitized;
};

/**
 * Checks if subscription is active and valid
 */
export const isSubscriptionValid = (userData: any): boolean => {
	if (!userData.has_active_subscription) return false;
	if (userData.subscription_status !== "active") return false;

	// Check if subscription end date is in the future
	if (userData.subscription_end_date) {
		const endDate = new Date(userData.subscription_end_date);
		if (endDate < new Date()) return false;
	}

	return true;
};

/**
 * Gets subscription display info
 */
export const getSubscriptionInfo = (userData: any) => {
	return {
		isActive: isSubscriptionValid(userData),
		plan: userData.plan || "basic",
		status: userData.subscription_status || "inactive",
		interval: userData.billing_interval,
		provider: userData.payment_provider,
		endDate: userData.subscription_end_date,
		inGracePeriod: userData.is_in_grace_period || false,
		hasPendingChange: !!userData.pending_plan_change,
		pendingPlan: userData.pending_plan_change,
	};
};

/**
 * Gets credit balance info
 */
export const getCreditInfo = (userData: any) => {
	const balance = validateNumber(
		userData.credits_balance || userData.credits,
		0,
	);
	const lifetime = validateNumber(userData.lifetime_credits_purchased, 0);

	return {
		current: balance,
		lifetime: lifetime,
		hasCredits: balance > 0,
		isLowBalance: balance < 5,
		shouldShowUpgrade: balance < 5 && userData.plan === "basic",
	};
};

/**
 * Checks if user can perform credit-based actions
 */
export const canPerformAction = (
	userData: any,
	creditCost: number,
): boolean => {
	const creditInfo = getCreditInfo(userData);
	const subscriptionInfo = getSubscriptionInfo(userData);

	// Active subscribers can perform actions
	if (subscriptionInfo.isActive) return true;

	// Free users need enough credits
	return creditInfo.current >= creditCost;
};

/**
 * Gets days until subscription ends
 */
export const getDaysUntilExpiry = (userData: any): number | undefined => {
	if (!userData.subscription_end_date) return undefined;

	const endDate = new Date(userData.subscription_end_date);
	const now = new Date();
	const diffMs = endDate.getTime() - now.getTime();
	const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

	return Math.max(0, diffDays);
};

/**
 * Checks if user should see renewal reminder
 */
export const shouldShowRenewalReminder = (userData: any): boolean => {
	const daysUntilExpiry = getDaysUntilExpiry(userData);
	if (daysUntilExpiry === undefined || daysUntilExpiry === undefined)
		return false;

	// Show reminder if less than 7 days until expiry
	return daysUntilExpiry <= 7 && daysUntilExpiry > 0;
};

/**
 * Formats user's full name
 */
export const getFullName = (userData: any): string => {
	const firstName = userData.first_name || "";
	const lastName = userData.last_name || "";
	return `${firstName} ${lastName}`.trim() || "User";
};

/**
 * Gets user's initials for avatar
 */
export const getUserInitials = (userData: any): string => {
	const firstName = userData.first_name || "";
	const lastName = userData.last_name || "";

	if (!firstName && !lastName) return "U";

	return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
};

/**
 * Checks if user has completed onboarding
 */
export const hasCompletedOnboarding = (userData: any): boolean => {
	return !userData.new_user && validateUserData(userData);
};

/**
 * Gets connected account types
 */
export const getConnectedAccounts = (userData: any): string[] => {
	const accounts: string[] = [];

	if (userData.github_connected) accounts.push("github");
	if (userData.google_connected) accounts.push("google");

	return accounts;
};

/**
 * Checks if user can claim bonuses
 */
export const getAvailableBonuses = (userData: any) => {
	return {
		signupBonus: {
			available: !userData.signup_bonus_claimed,
			claimed: userData.signup_bonus_claimed || false,
		},
		spinBonus: {
			available:
				userData.can_use_spin_bonus &&
				!userData.spin_bonus_claimed &&
				!userData.spin_bonus_skipped,
			claimed: userData.spin_bonus_claimed || false,
			skipped: userData.spin_bonus_skipped || false,
		},
	};
};

/**
 * Deep comparison to check if user data has changed
 */
export const hasUserDataChanged = (oldData: any, newData: any): boolean => {
	if (!oldData || !newData) return true;

	// List of fields to compare for changes
	const fieldsToCompare = [
		"email",
		"first_name",
		"last_name",
		"profile",
		"bio",
		"plan",
		"subscription_status",
		"credits_balance",
		"has_active_subscription",
		"subscription_end_date",
	];

	return fieldsToCompare.some(field => oldData[field] !== newData[field]);
};

/**
 * Merges partial user updates with existing data
 */
export const mergeUserData = (existingData: any, updates: any) => {
	return {
		...existingData,
		...updates,
		// Always update timestamps
		lastUpdated: new Date().toISOString(),
		// Recalculate derived fields
		full_name:
			`${updates.first_name || existingData.first_name || ""} ${updates.last_name || existingData.last_name || ""}`.trim(),
	};
};
