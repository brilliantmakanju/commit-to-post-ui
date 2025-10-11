// types/next-auth.d.ts
import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
	interface User {
		// ===== CORE USER FIELDS =====
		first_name: string;
		last_name: string;
		email: string;
		profile?: string;
		bio?: string | null;
		preferences: Record<string, unknown>;
		is_active: boolean;

		// ===== AUTHENTICATION & CONNECTIONS =====
		github_connected: boolean;
		google_connected: boolean;
		type: string;

		// ===== SUBSCRIPTION & BILLING FIELDS =====
		plan: string;
		subscription_status: string;
		subscription_start_date?: string;
		subscription_end_date?: string;
		billing_interval?: string;

		// ===== PAYMENT PROVIDER INTEGRATION =====
		paddle_subscription_id?: string;
		stripe_subscription_id?: string;
		paddle_customer_id?: string;

		// ===== PENDING PLAN CHANGES =====
		pending_plan_change?: string;
		pending_plan_effective_date?: string;
		pending_plan_change_type?: string;

		// ===== PAYMENT & GRACE PERIOD =====
		payment_grace_period_end?: string;

		// ===== BILLING INFORMATION =====
		billing_type?: string;
		payment_provider?: string;
		credits_balance: number;
		lifetime_credits_purchased: number;

		// ===== SUBSCRIPTION HELPER FLAGS =====
		has_active_subscription: boolean;
		is_in_grace_period: boolean;

		// ===== BONUS FLAGS =====
		signup_bonus_claimed: boolean;
		spin_bonus_claimed: boolean;
		spin_bonus_skipped: boolean;
		can_use_spin_bonus: boolean;

		// ===== AUTH TOKENS =====
		access: string;
		refresh: string;
		new_user: boolean;
	}

	interface Session {
		// ===== AUTH TOKENS =====
		access?: string;
		refresh?: string;
		accessToken?: string;
		refreshToken?: string;

		// ===== SESSION METADATA =====
		id: string;
		expires: string;
		tokenExpiry?: number;

		// ===== USER DATA =====
		user: User & {
			id?: string;
		};
	}
}

declare module "next-auth/jwt" {
	interface JWT {
		// ===== JWT METADATA =====
		id?: string;
		role?: string;

		// ===== AUTH TOKENS =====
		accessToken?: string;
		refreshToken?: string;

		// ===== TOKEN EXPIRY =====
		tokenExpiry?: number;

		// ===== USER DATA =====
		user?: User & {
			id?: string;
		};
	}
}
