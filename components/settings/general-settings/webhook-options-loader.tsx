/* eslint-disable import/no-unresolved */
"use client";

import { ChevronsUpDown, Loader2 } from "lucide-react";
import type React from "react";

import { Button } from "@/components/ui/button";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

const AISettingsLoader = () => (
	<Card className="w-full">
		<CardHeader className="space-y-1 border-b border-gray-200">
			<CardTitle className="text-2xl font-bold text-gray-900">
				AI Settings
			</CardTitle>
			<CardDescription className="text-gray-600">
				Loading settings...
			</CardDescription>
		</CardHeader>
		<CardContent className="space-y-6 pt-6">
			<div className="space-y-4">
				<div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
					<h3 className="mb-2 text-lg font-medium text-gray-900 sm:mb-0">
						Branch Name
					</h3>
					<div className="flex h-10 items-center space-x-2">
						<div className="flex w-full sm:w-auto">
							<Input
								value=""
								className="flex-grow rounded-r-none border-gray-300 bg-gray-50 text-gray-900"
								disabled
							/>
							<Button
								className="rounded-l-none bg-gray-900 text-gray-50 hover:bg-gray-800"
								disabled
							>
								<Loader2 className="h-4 w-4 animate-spin" />
							</Button>
						</div>
					</div>
				</div>
			</div>

			<div className="space-y-4">
				<h3 className="text-lg font-medium text-gray-900">AI Tone</h3>
				<div className="grid grid-cols-1 space-y-2 sm:space-x-4 md:grid-cols-3">
					<div className="flex-grow">
						<Button
							variant="outline"
							className="w-full justify-between border-gray-300 bg-gray-50 text-gray-900"
							disabled
						>
							<span className="flex items-center">
								<Loader2 className="mr-2 h-4 w-4 animate-spin" />
								Loading...
							</span>
							<ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
						</Button>
					</div>
					<div className="flex items-center space-x-2">
						<Switch
							id="hashtags"
							disabled
							className="data-[state=checked]:bg-gray-900"
						/>
						<Label htmlFor="hashtags" className="text-gray-900 opacity-50">
							Use Hashtags
						</Label>
					</div>
					<div className="flex items-center space-x-2">
						<Switch
							id="shuffle"
							disabled
							className="data-[state=checked]:bg-gray-900"
						/>
						<Label htmlFor="shuffle" className="text-gray-900 opacity-50">
							Shuffle All Tones
						</Label>
					</div>
				</div>
			</div>

			<div>
				<h3 className="mb-2 text-lg font-medium text-gray-900">
					Current Settings
				</h3>
				<pre className="overflow-x-auto rounded border border-gray-200 bg-gray-50 p-2 text-sm text-gray-900 opacity-50">
					Loading settings...
				</pre>
			</div>
		</CardContent>
	</Card>
);

export default AISettingsLoader;
