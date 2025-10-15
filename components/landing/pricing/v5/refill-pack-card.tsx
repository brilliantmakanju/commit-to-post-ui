/* eslint-disable import/no-unresolved */
"use client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";

import PaddleCheckout from "../v4/paddle-overlay";
import { RefillPackCardProps } from "./pricing-data";
import { calculateCostPerCredit } from "./utlis";

export function RefillPackCard({ pack }: RefillPackCardProps): JSX.Element {
	const hasBadge = pack.badge.length > 0;
	const hasProductId = pack.productId && pack.productId.length > 0;
	const costPerCredit = calculateCostPerCredit(pack.price, pack.credits);

	return (
		<Card
			className={`relative w-full ${hasBadge ? "border-gray-300 shadow-md hover:shadow-lg" : "border-gray-200 shadow-sm hover:shadow-md"} transition-shadow`}
		>
			{hasBadge && (
				<Badge
					className={`absolute right-5 top-5 ${pack.id === "growth" ? "bg-blue-600" : "bg-black"} text-white`}
				>
					{pack.badge}
				</Badge>
			)}

			<CardHeader className="space-y-3">
				<CardTitle className="text-xl text-gray-900">{pack.name}</CardTitle>
				<CardDescription className="text-sm text-gray-600">
					{pack.description}
				</CardDescription>
			</CardHeader>

			<CardContent className="space-y-6">
				<div className="space-y-2">
					<div className="text-5xl font-bold text-black">${pack.price}</div>
					<div className="text-sm font-medium text-gray-500">
						{pack.credits.toLocaleString()} credits • ${costPerCredit}/credit
					</div>
				</div>

				{hasProductId ? (
					<PaddleCheckout
						productId={pack.productId}
						credits={pack.credits}
						locale="en"
						theme="dark"
						displayMode="overlay"
						environment={
							process.env.NEXT_PUBLIC_PADDLE_ENVIRONMENT as
								| "sandbox"
								| "production"
						}
					>
						<Button
							disabled
							className="w-full bg-black text-white shadow-md hover:bg-gray-800"
						>
							Paid features temporarily unavailable
						</Button>
					</PaddleCheckout>
				) : (
					<Button
						disabled={true}
						className="w-full bg-black text-white shadow-md hover:bg-gray-800"
					>
						Coming Soon
					</Button>
				)}
			</CardContent>
		</Card>
	);
}
