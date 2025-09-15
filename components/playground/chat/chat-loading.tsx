"use client";

// eslint-disable-next-line import/no-unresolved
import { AnimatedAIIcon } from "@/components/wrappers/loaders/all-icons";

export const ChatLoadingScreen = () => {
	return (
		<div className="mx-auto max-w-4xl space-y-4 px-3 py-6 md:space-y-6">
			{/* Typing indicator for AI response */}
			{/* <div className="mb-4 flex justify-start">
				<div className="max-w-[80%]">
					<div className="rounded-lg bg-gray-100 px-4 py-3 shadow-sm">
						<div className="flex items-center space-x-1">
							<div className="flex space-x-1">
								<div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
								<div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
								<div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
							</div>
							<span className="ml-2 text-xs text-gray-500">
								AI is thinking...
							</span>
						</div>
					</div>
				</div>
			</div> */}

			{/* Recent conversation skeleton */}
			<div className="space-y-4 opacity-40">
				{/* User message skeleton */}
				<div className="mb-4 flex justify-end">
					<div className="w-[300px]">
						<div className="rounded-lg bg-gray-900 px-4 py-3">
							<div className="space-y-2">
								<div className="h-4 w-48 animate-pulse rounded bg-gray-700"></div>
								<div className="h-4 w-32 animate-pulse rounded bg-gray-700"></div>
							</div>
							<div className="mt-3 flex items-center justify-between border-t border-gray-700 pt-2">
								<div className="flex items-center gap-2">
									<div className="h-3 w-3 animate-pulse rounded bg-gray-600"></div>
									<div className="h-3 w-16 animate-pulse rounded bg-gray-600"></div>
								</div>
								<div className="h-3 w-12 animate-pulse rounded bg-gray-600"></div>
							</div>
						</div>
					</div>
				</div>

				{/* AI response with image skeleton */}
				{/* <div className="mb-4 flex justify-start">
					<div className="max-w-[80%]">
						<div className="space-y-3">
							<div className="rounded-lg bg-gray-50 p-3 shadow-sm">
								<div className="space-y-3"> */}
				{/* Image placeholder */}
				{/* <div className="relative">
										<div className="h-64 w-80 animate-pulse rounded-lg bg-gray-200"></div>
									</div> */}
				{/* Action buttons skeleton */}
				{/* <div className="flex items-center justify-between border-t border-gray-200 pt-3">
										<div className="flex items-center gap-1">
											<div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
											<div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
											<div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
										</div>
										<div className="flex items-center gap-1">
											<div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
											<div className="h-8 w-8 animate-pulse rounded-full bg-gray-200"></div>
										</div>
									</div>
								</div>
							</div>
							<div className="h-3 w-16 animate-pulse rounded bg-gray-300"></div>
						</div>
					</div>
				</div> */}

				{/* Text response skeleton */}
				{/* <div className="mb-4 flex justify-start">
					<div className="max-w-[80%]">
						<div className="rounded-lg bg-gray-100 px-4 py-3 shadow-sm">
							<div className="space-y-2">
								<div className="h-4 w-full animate-pulse rounded bg-gray-300"></div>
								<div className="h-4 w-3/4 animate-pulse rounded bg-gray-300"></div>
								<div className="h-4 w-1/2 animate-pulse rounded bg-gray-300"></div>
							</div>
							<div className="mt-2 h-3 w-16 animate-pulse rounded bg-gray-300"></div>
						</div>
					</div>
				</div> */}

				{/* Social card skeleton */}
				<div className="mb-4 flex justify-start">
					<div className="w-[300px]">
						<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
							<div className="flex items-start space-x-3">
								<div className="h-10 w-10 animate-pulse rounded-full bg-gray-300"></div>
								<div className="flex-1 space-y-2">
									<div className="flex items-center space-x-2">
										<div className="h-4 w-20 animate-pulse rounded bg-gray-300"></div>
										<div className="h-4 w-16 animate-pulse rounded bg-gray-300"></div>
									</div>
									<div className="space-y-1">
										<div className="h-4 w-full animate-pulse rounded bg-gray-300"></div>
										<div className="h-4 w-2/3 animate-pulse rounded bg-gray-300"></div>
									</div>
									<div className="flex items-center justify-between pt-2">
										<div className="flex space-x-4">
											<div className="h-4 w-8 animate-pulse rounded bg-gray-300"></div>
											<div className="h-4 w-8 animate-pulse rounded bg-gray-300"></div>
											<div className="h-4 w-8 animate-pulse rounded bg-gray-300"></div>
										</div>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* Progress indicator */}
			{/* <div className="flex justify-center">
				<div className="flex items-center space-x-2 text-sm text-gray-500">
					<div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600"></div>
					<span>Generating response...</span>
				</div>
			</div> */}
		</div>
	);
};

// Alternative minimal loading component
export const ChatLoadingMinimal = () => {
	return (
		<div className="mx-auto flex h-full max-w-4xl items-center justify-center px-3 py-8">
			<div className="flex justify-start">
				<div className="w-auto">
					<div className="rounded-lg">
						<div className="flex animate-bounce items-center space-x-2 rounded-[13px] bg-[#27272f]">
							<AnimatedAIIcon size={60} color="black" />
							{/* <div className="flex space-x-1">
								<div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]"></div>
								<div className="h-2 w-2 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]"></div>
								<div className="h-2 w-2 animate-bounce rounded-full bg-gray-400"></div>
							</div>
							<span className="text-sm text-gray-600">Thinking...</span> */}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

// Loading component for specific content types
export const ChatContentLoading = ({
	type,
}: {
	type: "image" | "post" | "text";
}) => {
	const getLoadingContent = () => {
		switch (type) {
			case "image": {
				return (
					<div className="rounded-lg bg-gray-50 p-3 shadow-sm">
						<div className="space-y-3">
							<div className="h-64 w-80 animate-pulse rounded-lg bg-gray-200"></div>
							<div className="flex items-center justify-between border-t border-gray-200 pt-3">
								<div className="flex space-x-1">
									{Array.from({ length: 3 }).map((_, index) => (
										<div
											key={index}
											className="h-8 w-8 animate-pulse rounded-full bg-gray-200"
										></div>
									))}
								</div>
								<div className="flex space-x-1">
									{Array.from({ length: 2 }).map((_, index) => (
										<div
											key={index}
											className="h-8 w-8 animate-pulse rounded-full bg-gray-200"
										></div>
									))}
								</div>
							</div>
						</div>
					</div>
				);
			}

			case "post": {
				return (
					<div className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
						<div className="flex items-start space-x-3">
							<div className="h-10 w-10 animate-pulse rounded-full bg-gray-300"></div>
							<div className="flex-1 space-y-2">
								<div className="flex items-center space-x-2">
									<div className="h-4 w-20 animate-pulse rounded bg-gray-300"></div>
									<div className="h-4 w-16 animate-pulse rounded bg-gray-300"></div>
								</div>
								<div className="space-y-1">
									<div className="h-4 w-full animate-pulse rounded bg-gray-300"></div>
									<div className="h-4 w-3/4 animate-pulse rounded bg-gray-300"></div>
								</div>
							</div>
						</div>
					</div>
				);
			}

			default: {
				return (
					<div className="rounded-lg bg-gray-100 px-4 py-3 shadow-sm">
						<div className="space-y-2">
							<div className="h-4 w-full animate-pulse rounded bg-gray-300"></div>
							<div className="h-4 w-2/3 animate-pulse rounded bg-gray-300"></div>
						</div>
					</div>
				);
			}
		}
	};

	return (
		<div className="mb-4 flex justify-start">
			<div className="max-w-[80%]">
				<div className="mb-2 flex items-center space-x-2">
					<div className="flex space-x-1">
						<div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.3s]"></div>
						<div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400 [animation-delay:-0.15s]"></div>
						<div className="h-1.5 w-1.5 animate-bounce rounded-full bg-blue-400"></div>
					</div>
					<span className="text-xs text-gray-500">
						Generating{" "}
						{type === "image" ? "image" : type === "post" ? "post" : "response"}
						...
					</span>
				</div>
				{getLoadingContent()}
			</div>
		</div>
	);
};
