"use client";

import React from "react";
import { FiX } from "react-icons/fi";

// eslint-disable-next-line import/no-unresolved
import { cn } from "@/lib/utils";

interface SlideInPanelProps {
	isOpen: boolean;
	onClose: () => void;
	title?: string;
	widthClassName?: string;
	children: React.ReactNode;
}

export const SlideInPanel: React.FC<SlideInPanelProps> = ({
	isOpen,
	onClose,
	widthClassName = "w-full sm:w-80",
	title,
	children,
}) => {
	return (
		<div
			className={cn(
				"fixed inset-0 z-50 flex transition-colors duration-200",
				isOpen
					? "bg-black/50 ease-out"
					: "pointer-events-none bg-transparent ease-in",
			)}
			onClick={event_ => {
				if (event_.target === event_.currentTarget) onClose();
			}}
		>
			<div
				className={cn(
					"absolute inset-y-0 left-0 transform border-r border-zinc-800/50 bg-zinc-900 shadow-2xl transition-transform duration-200",
					isOpen ? "translate-x-0 ease-out" : "-translate-x-full ease-in",
					"w-full sm:w-80",
					widthClassName,
				)}
			>
				{title && (
					<div className="flex items-center justify-between border-b border-zinc-800/50 p-4">
						<h3 className="text-base font-medium text-zinc-100 sm:text-lg">
							{title}
						</h3>
						<button
							onClick={onClose}
							className="flex h-9 w-9 items-center justify-center rounded-full text-zinc-400 transition-colors hover:bg-zinc-800/50 hover:text-zinc-100"
							aria-label="Close panel"
						>
							<FiX className="h-5 w-5" />
						</button>
					</div>
				)}
				<div className="flex h-[calc(100%-56px)] flex-col overflow-y-auto">
					{children}
				</div>
			</div>
		</div>
	);
};
