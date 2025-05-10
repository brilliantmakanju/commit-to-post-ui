"use client";
import React from "react";

const Flow = () => {
	return (
		<div className="flex items-center justify-center">
			<div className="relative w-full max-w-[500px] overflow-hidden rounded-lg border bg-background p-4 shadow-xl">
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
						<div className="text-green-500">
							[main 3a7c2d1] Add user authentication flow
						</div>
						<div className="text-green-500">✓ Analyzing commit...</div>
						<div className="text-green-500">✓ Generating content...</div>
						<div className="text-green-500">✓ Post created for LinkedIn!</div>
						<div className="mt-4 rounded-md border p-3">
							<div className="text-xs text-muted-foreground">
								LinkedIn Post Preview:
							</div>
							<p className="mt-2">
								Just shipped a secure authentication system for our platform! 🔐
								<br />
								<br />• Email magic links for passwordless login
								<br />• Session management with JWT
								<br />• Rate limiting to prevent abuse
								<br />
								<br />
								Small commits, big impact. #WebDev #Security
							</p>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Flow;
