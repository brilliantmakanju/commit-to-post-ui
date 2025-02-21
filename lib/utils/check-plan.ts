"use server";
interface User {
	plan: string;
	subscription_status: string;
	subscription_end_date: Date | undefined;
}

export default async function hasAccess(user: User): Promise<boolean> {
	const today = new Date();
	const subscriptionEndDate = user.subscription_end_date
		? new Date(user.subscription_end_date)
		: undefined;

	// const subscriptionEndDate = new Date(
	// 	user.subscription_end_date as unknown as string,
	// );

	// Ensure the plan is "pro" and the status is either "active" or "canceled"
	if (
		user.plan === "pro" &&
		(user.subscription_status === "active" ||
			user.subscription_status === "canceled")
	) {
		// If there's no subscription end date, assume access is granted
		if (!subscriptionEndDate) return true;

		// If there's a subscription end date, ensure it's in the future
		if (subscriptionEndDate > today) return true;
	}

	return false;
}
