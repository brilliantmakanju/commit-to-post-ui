"use client";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";

export default function StatsCard({
	title,
	value,
	icon,
	description,
}: {
	title: string;
	value: string;
	icon: React.ReactNode;
	description: string;
}) {
	return (
		<Card className="border-zinc-700/50 bg-zinc-800/50 p-1">
			<CardHeader className="flex flex-row items-center justify-between p-3">
				<CardTitle className="text-sm font-medium text-zinc-300">
					{title}
				</CardTitle>
				<span className="text-zinc-400">{icon}</span>
			</CardHeader>
			<CardContent className="p-3 pt-0">
				<div className="text-base font-medium text-zinc-100">{value}</div>
				<p className="mt-2 text-xs text-zinc-400">{description}</p>
			</CardContent>
		</Card>
	);
}
