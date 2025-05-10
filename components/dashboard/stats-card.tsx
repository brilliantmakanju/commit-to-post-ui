"use client";

import type React from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function StatsCard({
	title,
	value,
	icon,
	description,
}: {
	title: string;
	value: string | number;
	icon: React.ReactNode;
	description: string;
}) {
	return (
		<Card className="flex h-full flex-col overflow-hidden border border-[#232323] bg-[#121212] transition-all hover:border-[#2A2A2A] hover:shadow-md">
			<CardHeader className="flex flex-row items-center justify-between pb-2">
				<CardTitle className="text-sm font-medium text-zinc-300">
					{title}
				</CardTitle>
				<div className="flex h-8 w-8 items-center justify-center rounded-md border border-[#232323] bg-[#1A1A1A] text-[#4F46E5]">
					{icon}
				</div>
			</CardHeader>
			<CardContent className="flex flex-1 flex-col justify-between">
				<div className="font-mono text-2xl font-bold text-white">{value}</div>
				<p className="mt-2 text-xs text-zinc-500">{description}</p>
			</CardContent>
		</Card>
	);
}
