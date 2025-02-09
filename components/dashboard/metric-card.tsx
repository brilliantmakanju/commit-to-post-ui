import React from "react";

import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

interface MetricCardProps {
	title: string;
	value: number | string;
	subtitle: string;
	icon: React.ReactNode;
	progress?: number;
	details?: React.ReactNode;
}

const MetricCard: React.FC<MetricCardProps> = ({
	title,
	value,
	subtitle,
	icon,
	progress,
	details,
}) => (
	<Card className="bg-white">
		<CardContent className="p-6">
			<div className="mb-4 flex items-start justify-between">
				<div className="rounded-lg bg-gray-100 p-2">{icon}</div>
			</div>
			<div className="space-y-1">
				<h3 className="font-medium text-gray-900">{title}</h3>
				<div className="text-4xl font-bold text-gray-900">{value}</div>
				<p className="text-sm text-gray-500">{subtitle}</p>
			</div>
			{progress !== undefined && <Progress value={progress} className="mt-4" />}
			{details}
		</CardContent>
	</Card>
);

export default MetricCard;
