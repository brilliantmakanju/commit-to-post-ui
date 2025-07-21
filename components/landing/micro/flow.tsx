"use client";
import Image from "next/image";
import React from "react";
import { FaDiscord, FaLinkedinIn, FaSlack } from "react-icons/fa";

import { Badge } from "@/components/ui/badge";

const Flow = () => {
	return (
		<div className="flex h-full flex-col items-center justify-center gap-2">
			<div className="relative z-[1] w-full max-w-[500px] overflow-hidden rounded-lg border bg-background p-4 shadow-xl">
				<div className="space-y-4">
					<div className="flex items-center gap-2">
						<div className="h-3 w-3 rounded-full bg-red-500" />
						<div className="h-3 w-3 rounded-full bg-yellow-500" />
						<div className="h-3 w-3 rounded-full bg-green-500" />
						<div className="ml-2 text-xs text-muted-foreground">Terminal</div>
					</div>
					<div className="space-y-2 font-mono text-sm">
						<div className="text-muted-foreground">
							$ git commit -m &#34;Add user authentication flow&#34;
						</div>
						<div className="text-muted-foreground">$ git push origin main</div>
						<div className="text-green-500">
							[main 3a7c2d1] Add user authentication flow
						</div>
					</div>
				</div>
			</div>

			<div className="relative h-[190px] w-full">
				<Image
					src={"/arrow_pointing.svg"}
					width={999}
					height={999}
					alt="arrow_pointing"
					className="absolute top-[5px] h-[180px] rotate-[-30deg]"
				/>

				<Image
					src={"/arrow_pointing.svg"}
					width={999}
					height={999}
					alt="arrow_pointing"
					className="absolute right-[-190px] top-[5px] h-[180px] rotate-[-34deg]"
				/>

				<Image
					src={"/arrow_pointing.svg"}
					width={999}
					height={999}
					alt="arrow_pointing"
					className="absolute left-[-190px] top-[5px] h-[180px] rotate-[-30deg]"
				/>
			</div>

			<div className="flex w-full items-center justify-between space-y-4">
				<div className="flex flex-col items-center gap-2">
					<div className="flex h-[86px] w-[86px] items-center justify-center rounded-lg border bg-zinc-800 shadow-sm">
						<FaLinkedinIn className="h-8 w-8 text-white" />
					</div>
					<p className="text-sm font-medium text-muted-foreground">LinkedIn</p>
				</div>

				<div className="flex flex-col items-center gap-2">
					<div className="flex h-[86px] w-[86px] items-center justify-center rounded-lg border bg-zinc-800 shadow-sm">
						<FaSlack className="h-8 w-8 text-white" />
					</div>
					<p className="text-sm font-medium text-muted-foreground">Slack</p>
				</div>

				<div className="flex flex-col items-center gap-2">
					<div className="flex h-[86px] w-[86px] items-center justify-center rounded-lg border bg-zinc-800 shadow-sm">
						<FaDiscord className="h-8 w-8 text-white" />
					</div>
					<p className="text-sm font-medium text-muted-foreground">LinkedIn</p>
				</div>
			</div>
		</div>
	);
};

export default Flow;
