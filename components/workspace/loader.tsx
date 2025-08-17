"use client";
import React from "react";

const WorkspaceSkeletonLoader = () => {
	return (
		<div className="w-full">
			{/* Header skeleton */}
			<div className="mb-8">
				<div className="h-6 w-80 animate-pulse rounded bg-gray-200"></div>
			</div>

			{/* Workspace items skeleton */}
			<div className="w-full overflow-hidden rounded-xl border-2 border-gray-200">
				{[1, 2, 3].map(index => (
					<div
						key={index}
						className={`flex w-full items-center justify-between px-8 py-4 ${
							index === 3 ? "" : "border-b border-gray-200"
						}`}
					>
						<div className="flex items-center space-x-8">
							{/* Avatar skeleton */}
							<div className="h-16 w-16 animate-pulse rounded-xl bg-gray-200"></div>

							{/* Content skeleton */}
							<div className="flex flex-col space-y-3">
								<div className="h-6 w-48 animate-pulse rounded bg-gray-200"></div>
								<div className="h-4 w-72 animate-pulse rounded bg-gray-200"></div>
							</div>
						</div>

						{/* Button skeleton */}
						<div className="h-10 w-20 animate-pulse rounded bg-gray-200"></div>
					</div>
				))}
			</div>

			{/* Show more button skeleton */}
			<div className="mt-3 flex justify-center">
				<div className="h-8 w-32 animate-pulse rounded bg-gray-200"></div>
			</div>
		</div>
	);
};

export default WorkspaceSkeletonLoader;
