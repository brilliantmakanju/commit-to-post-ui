"use client";
import React from "react";

import { Button } from "@/components/ui/button";
import { subscriptionsCreation } from "@/server-actions/auth/subscribe";

const subscribePlan = async () => {
	const response = await subscriptionsCreation();
	globalThis.window.open(response.data?.checkout_url);
};

const Page = () => {
	return (
		<>
			<h1>Dashboard Pages updated</h1>
			<Button variant={"secondary"} onClick={() => subscribePlan()}>
				Subscribe
			</Button>
		</>
	);
};

export default Page;
