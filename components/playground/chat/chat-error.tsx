// Updated chat-container.tsx
"use client";

// Error state component
export const ChatError = ({
	error,
	onRetry,
}: {
	error: string;
	onRetry: () => void;
}) => (
	<div className="flex h-full items-center justify-center px-4">
		<div className="max-w-md text-center">
			<div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100 p-3">
				<svg
					className="h-8 w-8 text-red-600"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						strokeWidth={2}
						d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
					/>
				</svg>
			</div>
			<h3 className="mb-2 text-lg font-medium text-red-900">
				Failed to load chat history
			</h3>
			<p className="mb-4 text-sm text-red-600">{error}</p>
			<button
				onClick={onRetry}
				className="inline-flex items-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
			>
				Try Again
			</button>
		</div>
	</div>
);
