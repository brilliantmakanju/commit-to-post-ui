"use client";
import {
	eachDayOfInterval,
	endOfMonth,
	format,
	getDay,
	isSameMonth,
	startOfMonth,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

// eslint-disable-next-line import/no-unresolved
import { Skeleton } from "@/components/ui/skeleton";
import { TooltipProvider } from "@/components/ui/tooltip";
import useRetrieveHeatmapData from "@/hooks/core/charts";

// Dark mode optimized colors for Push to Post
const getContributionColor = (count: number) => {
	if (count === 0) return "bg-zinc-900/50 border border-zinc-800/30";
	if (count <= 2) return "bg-emerald-900/70 border border-emerald-800/40";
	if (count <= 5) return "bg-emerald-700/80 border border-emerald-600/50";
	if (count <= 10) return "bg-emerald-500/90 border border-emerald-400/60";
	if (count <= 15) return "bg-emerald-400/95 border border-emerald-300/70";
	return "bg-emerald-300 border border-emerald-200/80";
};

const getIntensityLabel = (count: number) => {
	if (count === 0) return "No contributions";
	if (count <= 2) return "Low activity";
	if (count <= 5) return "Moderate activity";
	if (count <= 10) return "High activity";
	if (count <= 15) return "Very high activity";
	return "Exceptional activity";
};

export const ActivityHeatmap = () => {
	const { heatmapData: data, isHeatmapLoading } = useRetrieveHeatmapData();

	const scrollContainerRef = useRef<HTMLDivElement>(null);
	const heatmapContainerRef = useRef<HTMLDivElement>(null);
	const currentMonthRef = useRef<HTMLDivElement | null>(null);

	const hoverTimeout = useRef<NodeJS.Timeout | null>(null);
	const [hoveredDay, setHoveredDay] = useState<string | null>();

	const [canScrollLeft, setCanScrollLeft] = useState(false);
	const [canScrollRight, setCanScrollRight] = useState(false);
	const [activeTooltip, setActiveTooltip] = useState<{
		dayString: string;
		count: number;
		date: Date;
		position: "top" | "bottom";
		x: number;
		y: number;
	} | null>();

	// Memoize months calculation
	const months = useMemo(() => {
		const currentYear = new Date().getFullYear();
		return Array.from(
			{ length: 12 },
			(_, index) => new Date(currentYear, index, 1),
		);
	}, []);

	const currentMonthNode = useCallback((node: HTMLDivElement | null) => {
		if (node !== null) {
			currentMonthRef.current = node;
		}
	}, []);

	const checkScrollButtons = useCallback(() => {
		if (!scrollContainerRef.current) return;

		const container = scrollContainerRef.current;
		const scrollLeft = container.scrollLeft;
		const maxScroll = container.scrollWidth - container.clientWidth;

		setCanScrollLeft(scrollLeft > 5); // Small threshold to account for rounding
		setCanScrollRight(scrollLeft < maxScroll - 5); // Small threshold to account for rounding
	}, []);

	const scrollToMonth = useCallback((direction: "left" | "right") => {
		if (!scrollContainerRef.current) return;

		const container = scrollContainerRef.current;
		const scrollAmount = 200; // Smooth scroll amount

		container.scrollBy({
			left: direction === "left" ? -scrollAmount : scrollAmount,
			behavior: "smooth",
		});
	}, []);

	const handleDayMouseEnter = (
		event: React.MouseEvent,
		day: Date,
		count: number,
	) => {
		if (!heatmapContainerRef.current) return;

		const containerRect = heatmapContainerRef.current.getBoundingClientRect();
		const targetRect = (event.target as HTMLElement).getBoundingClientRect();

		const x = targetRect.left - containerRect.left + targetRect.width / 2;
		const y = targetRect.top - containerRect.top + targetRect.height / 2;
		const position = y < containerRect.height / 2 ? "bottom" : "top";

		const dayString = format(day, "yyyy-MM-dd");
		setHoveredDay(dayString);

		// Add delay before showing
		hoverTimeout.current = setTimeout(() => {
			setActiveTooltip({ dayString, count, date: day, position, x, y });
		}, 100); // ~100ms delay feels good
	};

	// Clear tooltip when leaving the heatmap container
	const handleDayMouseLeave = () => {
		if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
		setHoveredDay(undefined);
		setActiveTooltip(undefined);
	};

	useEffect(() => {
		if (
			currentMonthRef.current &&
			scrollContainerRef.current &&
			!isHeatmapLoading
		) {
			const container = scrollContainerRef.current;
			const target = currentMonthRef.current;

			// Wait for layout to settle
			setTimeout(() => {
				const containerWidth = container.offsetWidth;
				const targetLeft = target.offsetLeft;
				const targetWidth = target.offsetWidth;

				const initialScroll = targetLeft - containerWidth / 2 + targetWidth / 2;
				container.scrollTo({
					left: initialScroll,
					behavior: "smooth",
				});

				// Check scroll buttons after positioning
				setTimeout(checkScrollButtons, 500);
			}, 100);
		}
	}, [checkScrollButtons, isHeatmapLoading, data]);

	useEffect(() => {
		const container = scrollContainerRef.current;
		if (!container) return;

		const handleScroll = () => {
			checkScrollButtons();
		};

		container.addEventListener("scroll", handleScroll);
		// Also check on resize
		window.addEventListener("resize", handleScroll);

		return () => {
			container.removeEventListener("scroll", handleScroll);
			window.removeEventListener("resize", handleScroll);
		};
	}, [checkScrollButtons]);

	if (isHeatmapLoading) {
		return <ActivityHeatmapSkeleton />;
	}

	if (!data || Object.keys(data).length === 0) {
		return (
			<div className="flex h-[162px] flex-col items-center justify-center rounded-xl border border-zinc-800/20 bg-zinc-900/30 p-6 backdrop-blur-sm">
				<div className="mb-4 rounded-full bg-zinc-800/40 p-3">
					<svg
						className="h-6 w-6 text-zinc-400"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth={2}
							d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
						/>
					</svg>
				</div>
				<p className="mb-2 font-medium text-zinc-300">
					No activity to display yet
				</p>
				<p className="max-w-xs text-center text-sm text-zinc-500">
					Start pushing commits to see your contribution activity visualized
					here
				</p>
			</div>
		);
	}

	return (
		<TooltipProvider>
			<div className="flex h-[174px] flex-col gap-4">
				{/* Header with navigation and legend */}
				<div className="flex items-end md:-mt-[50px] md:flex-col md:justify-end">
					<div className="flex items-center justify-between gap-2">
						<button
							disabled={!canScrollLeft}
							onClick={() => scrollToMonth("left")}
							className="rounded-md p-1.5 transition-all duration-200 hover:bg-zinc-800/50 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<ChevronLeft className="h-4 w-4 text-zinc-400" />
						</button>
						<button
							onClick={() => scrollToMonth("right")}
							disabled={!canScrollRight}
							className="rounded-md p-1.5 transition-all duration-200 hover:bg-zinc-800/50 disabled:cursor-not-allowed disabled:opacity-50"
						>
							<ChevronRight className="h-4 w-4 text-zinc-400" />
						</button>
					</div>

					<div className="flex items-center gap-4 text-xs text-zinc-400">
						<div className="flex items-center gap-1">
							<div className="h-3 w-3 rounded-sm border border-zinc-800/30 bg-zinc-900/50"></div>
							<div className="h-3 w-3 rounded-sm border border-emerald-800/40 bg-emerald-900/70"></div>
							<div className="h-3 w-3 rounded-sm border border-emerald-600/50 bg-emerald-700/80"></div>
							<div className="h-3 w-3 rounded-sm border border-emerald-400/60 bg-emerald-500/90"></div>
							<div className="h-3 w-3 rounded-sm border border-emerald-300/70 bg-emerald-400/95"></div>
							<div className="h-3 w-3 rounded-sm border border-emerald-200/80 bg-emerald-300"></div>
						</div>
					</div>
				</div>

				{/* Heatmap grid */}
				<div className="relative">
					<div
						ref={heatmapContainerRef}
						className="relative mt-2 rounded-lg border border-zinc-800/20 bg-zinc-900/10 p-4 pb-2"
					>
						{/* Horizontal divider line */}
						<div className="absolute left-0 right-0 top-1/2 z-10 h-px -translate-y-1/2 bg-transparent">
							<div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-zinc-800 px-2">
								{/* <div className="h-[4px] w-[4px] rounded-full bg-zinc-600"></div> */}
							</div>
						</div>

						<div
							ref={scrollContainerRef}
							className="scrollbar-hide flex gap-4 overflow-x-auto scroll-smooth pb-2"
							style={{
								scrollbarWidth: "none",
								msOverflowStyle: "none",
								WebkitOverflowScrolling: "touch",
							}}
						>
							<div className="flex space-x-[-12px]">
								{months.map(month => {
									const daysInMonth = eachDayOfInterval({
										start: startOfMonth(month),
										end: endOfMonth(month),
									});
									const isCurrent = isSameMonth(new Date(), month);
									const firstDayOfMonth = getDay(startOfMonth(month));

									return (
										<div
											key={format(month, "yyyy-MM")}
											className="flex w-full flex-col gap-1"
											ref={isCurrent ? currentMonthNode : undefined}
										>
											<h3 className="select-none text-center text-sm font-medium text-zinc-300">
												{format(month, "MMM")}
											</h3>
											<div className="grid grid-flow-col grid-rows-7 gap-1">
												{/* Empty cells for days before month starts */}
												{Array.from({ length: firstDayOfMonth }).map(
													(_, index) => (
														<div key={`empty-${index}`} className="h-3 w-3" />
													),
												)}

												{/* Actual days */}
												{daysInMonth.map(day => {
													const dayString = format(day, "yyyy-MM-dd");
													const count = data[dayString] || 0;
													const contributionText =
														count === 1 ? "contribution" : "contributions";

													return (
														<div
															key={dayString}
															className={`h-3 w-3 rounded-sm ${getContributionColor(count)} group relative cursor-pointer transition-all duration-150 hover:z-10 hover:scale-110 hover:ring-2 hover:ring-emerald-400/40`}
															role="button"
															tabIndex={0}
															aria-label={`${count} ${contributionText} on ${format(day, "MMMM d, yyyy")}`}
															onMouseEnter={event_ =>
																handleDayMouseEnter(event_, day, count)
															}
															onMouseLeave={handleDayMouseLeave}
														/>
													);
												})}
											</div>
										</div>
									);
								})}
							</div>
						</div>

						{/* Custom tooltip */}
						{activeTooltip && (
							<div
								className={`pointer-events-none absolute z-50 -translate-x-1/2 transform ${
									activeTooltip.position === "top" ? "bottom-4" : "top-4"
								} whitespace-nowrap rounded-lg border border-zinc-800/30 bg-zinc-900/95 px-4 py-3 text-sm shadow-xl backdrop-blur-sm`}
								style={{
									left: `${Math.min(
										Math.max(activeTooltip.x, 100),
										heatmapContainerRef.current?.offsetWidth
											? heatmapContainerRef.current.offsetWidth - 100
											: activeTooltip.x,
									)}px`,
								}}
							>
								<div className="mb-1 font-medium text-zinc-200">
									{format(activeTooltip.date, "MMMM d, yyyy")}
								</div>
								<div className="text-zinc-300">
									<span className="font-semibold text-emerald-400">
										{activeTooltip.count}
									</span>{" "}
									{activeTooltip.count === 1 ? "contribution" : "contributions"}
								</div>
								<div className="mt-1 text-xs text-zinc-500">
									{getIntensityLabel(activeTooltip.count)}
								</div>

								{/* Tooltip arrow */}
								<div
									className={`absolute left-1/2 -translate-x-1/2 ${
										activeTooltip.position === "top"
											? "bottom-full border-4 border-transparent border-b-zinc-900/95"
											: "top-full border-4 border-transparent border-t-zinc-900/95"
									}`}
								></div>
							</div>
						)}
					</div>
				</div>
			</div>
		</TooltipProvider>
	);
};

export const ActivityHeatmapSkeleton = () => {
	return (
		<div className="scrollbar-hide flex h-[162px] flex-col gap-4">
			{/* Header skeleton */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-2">
					<Skeleton className="h-7 w-7 rounded-md bg-zinc-800/40" />
					<Skeleton className="h-7 w-7 rounded-md bg-zinc-800/40" />
				</div>
				<div className="flex items-center gap-4">
					<Skeleton className="h-4 w-4 rounded bg-zinc-800/40" />
					<Skeleton className="h-4 w-12 bg-zinc-800/40" />
					<div className="flex items-center gap-1">
						{Array.from({ length: 6 }).map((_, index) => (
							<Skeleton
								key={index}
								className="h-3 w-3 rounded-sm bg-zinc-800/40"
							/>
						))}
					</div>
					<Skeleton className="h-4 w-12 bg-zinc-800/40" />
				</div>
			</div>

			{/* Heatmap skeleton */}
			<div className="scrollbar-hide flex gap-4 overflow-x-auto pb-2">
				<div className="flex gap-4 px-2">
					{Array.from({ length: 12 }).map((_, monthIndex) => (
						<div key={monthIndex} className="flex min-w-fit flex-col gap-2">
							<Skeleton className="mx-auto h-5 w-8 bg-zinc-800/40" />
							<div className="grid grid-flow-col grid-rows-7 gap-1">
								{Array.from({ length: 35 }).map((_, dayIndex) => (
									<Skeleton
										key={dayIndex}
										className="h-3 w-3 animate-pulse rounded-sm bg-zinc-800/40"
										style={{
											animationDelay: `${(monthIndex * 35 + dayIndex) * 10}ms`,
											animationDuration: "1.5s",
										}}
									/>
								))}
							</div>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
