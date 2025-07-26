"use client";

import {
	ExternalLink,
	Maximize,
	Pause,
	Play,
	Volume2,
	VolumeX,
} from "lucide-react";
import type React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import { Heading, Paragraph, Span } from "../general/micro/typography";
import { Button } from "../ui/button";
import { Input } from "../ui/input";

// YouTube Player API types
interface YTPlayer {
	playVideo(): void;
	pauseVideo(): void;
	seekTo(seconds: number, allowSeekAhead?: boolean): void;
	setVolume(volume: number): void;
	getVolume(): number;
	mute(): void;
	unMute(): void;
	isMuted(): boolean;
	getCurrentTime(): number;
	getDuration(): number;
	getPlayerState(): number;
}

declare global {
	interface Window {
		YT: {
			Player: new (elementId: string | HTMLElement, config: any) => YTPlayer;
			PlayerState: {
				UNSTARTED: number;
				ENDED: number;
				PLAYING: number;
				PAUSED: number;
				BUFFERING: number;
				CUED: number;
			};
			ready: (callback: () => void) => void;
		};
		onYouTubeIframeAPIReady: () => void;
	}
}

export default function VideoPlayer() {
	const [isPlaying, setIsPlaying] = useState(false);
	const [isMuted, setIsMuted] = useState(false);
	const [volume, setVolume] = useState([50]);
	const [progress, setProgress] = useState([0]);
	const [duration, setDuration] = useState(0);
	const [currentTime, setCurrentTime] = useState(0);
	const [showControls, setShowControls] = useState(true);
	const [isVideoReady, setIsVideoReady] = useState(false);
	const [hoverTime, setHoverTime] = useState<number | undefined>();
	const [hoverPosition, setHoverPosition] = useState<number>(0);
	const [isBuffering, setIsBuffering] = useState(false);
	const [apiLoaded, setApiLoaded] = useState(false);

	const containerRef = useRef<HTMLDivElement>(undefined);
	const playerRef = useRef<YTPlayer | undefined>(undefined);
	const progressRef = useRef<HTMLDivElement>(undefined);
	const controlsTimeoutRef = useRef<NodeJS.Timeout>();
	const updateIntervalRef = useRef<NodeJS.Timeout>();
	const playerContainerRef = useRef<HTMLDivElement>(undefined);

	const videoId = "WXsnbXjd3dU";
	const videoUrl = "https://youtu.be/WXsnbXjd3dU";

	// Load YouTube API with better error handling
	useEffect(() => {
		if (typeof globalThis === "undefined") return;

		const loadAPI = () => {
			// Check if API is already loaded
			if ((globalThis as any).YT && (globalThis as any).YT.Player) {
				setApiLoaded(true);
				return;
			}

			// Prevent multiple script loads
			if (document.querySelector('script[src*="youtube.com/iframe_api"]')) {
				return;
			}

			const script = document.createElement("script");
			script.src = "https://www.youtube.com/iframe_api";
			script.async = true;
			// eslint-disable-next-line unicorn/prefer-add-event-listener
			script.onerror = () => {
				console.error("Failed to load YouTube API");
				// Fallback - try again after delay
				setTimeout(loadAPI, 2000);
			};

			// Set up the callback
			(globalThis as any).onYouTubeIframeAPIReady = () => {
				setApiLoaded(true);
			};

			document.head.append(script);
		};

		loadAPI();

		return () => {
			if (updateIntervalRef.current) {
				clearInterval(updateIntervalRef.current);
			}
			if (controlsTimeoutRef.current) {
				clearTimeout(controlsTimeoutRef.current);
			}
		};
	}, []);

	const stopUpdateInterval = useCallback(() => {
		if (updateIntervalRef.current) {
			clearInterval(updateIntervalRef.current);
			updateIntervalRef.current = undefined;
		}
	}, []);

	const updateVideoInfo = useCallback(() => {
		if (!playerRef.current) return;

		try {
			const current = playerRef.current.getCurrentTime();
			const total = playerRef.current.getDuration();
			const vol = playerRef.current.getVolume();
			const muted = playerRef.current.isMuted();

			if (typeof current === "number" && !Number.isNaN(current)) {
				setCurrentTime(current);
			}

			if (typeof total === "number" && !Number.isNaN(total) && total > 0) {
				setDuration(total);
				if (typeof current === "number" && !Number.isNaN(current)) {
					const progressPercent = Math.min((current / total) * 100, 100);
					setProgress([progressPercent]);
				}
			}

			if (typeof vol === "number" && !Number.isNaN(vol)) {
				setVolume([vol]);
			}

			if (typeof muted === "boolean") {
				setIsMuted(muted);
			}
		} catch (error) {
			console.warn("Error updating video info:", error);
		}
	}, []);

	const startUpdateInterval = useCallback(() => {
		stopUpdateInterval();
		updateIntervalRef.current = setInterval(() => {
			updateVideoInfo();
		}, 100);
	}, [stopUpdateInterval, updateVideoInfo]);

	const onPlayerReady = useCallback(
		(event: any) => {
			console.log("Player ready!");
			setIsVideoReady(true);
			updateVideoInfo();
			startUpdateInterval();
		},
		[startUpdateInterval, updateVideoInfo],
	);

	const onPlayerStateChange = useCallback(
		(event: any) => {
			if (!(globalThis as any).YT) return;

			const state = event.data;
			console.log("State change:", state);

			switch (state) {
				case (globalThis as any).YT.PlayerState.UNSTARTED: {
					setIsBuffering(false);
					break;
				}
				case (globalThis as any).YT.PlayerState.ENDED: {
					setIsPlaying(false);
					setProgress([100]);
					stopUpdateInterval();
					break;
				}
				case (globalThis as any).YT.PlayerState.PLAYING: {
					setIsPlaying(true);
					setIsBuffering(false);
					startUpdateInterval();
					break;
				}
				case (globalThis as any).YT.PlayerState.PAUSED: {
					setIsPlaying(false);
					setIsBuffering(false);
					stopUpdateInterval();
					break;
				}
				case (globalThis as any).YT.PlayerState.BUFFERING: {
					setIsBuffering(true);
					break;
				}
				case (globalThis as any).YT.PlayerState.CUED: {
					setIsBuffering(false);
					updateVideoInfo();
					break;
				}
			}
		},
		[startUpdateInterval, stopUpdateInterval, updateVideoInfo],
	);

	const onPlayerError = useCallback((event: any) => {
		console.error("YouTube Player Error:", event.data);
		setIsVideoReady(false);
	}, []);

	const initializePlayer = useCallback(() => {
		if (
			!playerContainerRef.current ||
			!(globalThis as any).YT ||
			playerRef.current
		)
			return;

		try {
			// Clear the container
			playerContainerRef.current.innerHTML = "";

			// Create a div for the player
			const playerDiv = document.createElement("div");
			playerDiv.id =
				"youtube-player-" + Math.random().toString(36).slice(2, 11);
			playerContainerRef.current.append(playerDiv);

			playerRef.current = new (globalThis as any).YT.Player(playerDiv, {
				videoId: videoId,
				width: "100%",
				height: "100%",
				playerVars: {
					fs: 0,
					rel: 0,
					showinfo: 0,
					controls: 0,
					playsinline: 1,
					enablejsapi: 1,
					iv_load_policy: 3,
					modestbranding: 1,
					cc_load_policy: 0,
					origin: globalThis.location.origin,
					widget_referrer: globalThis.location.origin,
				},
				events: {
					onReady: onPlayerReady,
					onError: onPlayerError,
					onStateChange: onPlayerStateChange,
				},
			});
		} catch (error) {
			console.error("Error initializing YouTube player:", error);
			// Retry after delay
			setTimeout(() => {
				playerRef.current = undefined;
				initializePlayer();
			}, 1000);
		}
	}, [onPlayerError, onPlayerReady, onPlayerStateChange]);

	// Initialize player when API is loaded
	useEffect(() => {
		if (apiLoaded && playerContainerRef.current && !playerRef.current) {
			initializePlayer();
		}
	}, [apiLoaded, initializePlayer]);

	// Safe player control functions
	const safePlayerCall = useCallback(
		(function_: () => void, errorMessage: string) => {
			if (!playerRef.current) {
				console.warn("Player not ready");
				return;
			}

			try {
				function_();
			} catch (error) {
				console.error(errorMessage, error);
			}
		},
		[],
	);

	const togglePlay = useCallback(() => {
		safePlayerCall(() => {
			if (isPlaying) {
				playerRef.current!.pauseVideo();
			} else {
				playerRef.current!.playVideo();
			}
		}, "Error toggling play");
	}, [isPlaying, safePlayerCall]);

	const toggleMute = useCallback(() => {
		safePlayerCall(() => {
			if (isMuted) {
				playerRef.current!.unMute();
			} else {
				playerRef.current!.mute();
			}
		}, "Error toggling mute");
	}, [isMuted, safePlayerCall]);

	const handleVolumeChange = useCallback(
		(value: number[]) => {
			setVolume(value);
			safePlayerCall(() => {
				playerRef.current!.setVolume(value[0]);
			}, "Error setting volume");
			setIsMuted(value[0] === 0);
		},
		[safePlayerCall],
	);

	const handleProgressChange = useCallback(
		(value: number[]) => {
			if (duration === 0) return;

			const seekTime = (value[0] / 100) * duration;
			setProgress(value);
			setCurrentTime(seekTime);

			safePlayerCall(() => {
				playerRef.current!.seekTo(seekTime, true);
			}, "Error seeking");
		},
		[duration, safePlayerCall],
	);

	const handleProgressHover = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			if (progressRef.current && duration > 0) {
				const rect = progressRef.current.getBoundingClientRect();
				const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
				const percentage = (x / rect.width) * 100;
				const time = (percentage / 100) * duration;

				setHoverTime(time);
				setHoverPosition(x);
			}
		},
		[duration],
	);

	const handleProgressClick = useCallback(
		(event: React.MouseEvent<HTMLDivElement>) => {
			if (progressRef.current && duration > 0) {
				const rect = progressRef.current.getBoundingClientRect();
				const x = Math.max(0, Math.min(event.clientX - rect.left, rect.width));
				const percentage = (x / rect.width) * 100;
				handleProgressChange([percentage]);
			}
		},
		[duration, handleProgressChange],
	);

	const toggleFullscreen = useCallback(() => {
		if (!document.fullscreenElement && containerRef.current) {
			containerRef.current.requestFullscreen().catch(console.error);
		} else if (document.fullscreenElement) {
			document.exitFullscreen().catch(console.error);
		}
	}, []);

	const openOnYouTube = useCallback(() => {
		window.open(videoUrl, "_blank", "noopener,noreferrer");
	}, [videoUrl]);

	const formatTime = useCallback((seconds: number) => {
		if (!seconds || Number.isNaN(seconds) || seconds < 0) return "0:00";

		const totalSeconds = Math.floor(seconds);
		const hours = Math.floor(totalSeconds / 3600);
		const mins = Math.floor((totalSeconds % 3600) / 60);
		const secs = totalSeconds % 60;

		if (hours > 0) {
			return `${hours}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
		}
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	}, []);

	const handleMouseMove = useCallback(() => {
		setShowControls(true);
		if (controlsTimeoutRef.current) {
			clearTimeout(controlsTimeoutRef.current);
		}
		if (isPlaying) {
			controlsTimeoutRef.current = setTimeout(() => {
				setShowControls(false);
			}, 3000);
		}
	}, [isPlaying]);

	const handleMouseLeave = useCallback(() => {
		if (isPlaying) {
			setShowControls(false);
		}
		setHoverTime(undefined);
	}, [isPlaying]);

	const progressPercent =
		duration > 0 ? Math.min((currentTime / duration) * 100, 100) : 0;

	return (
		<section className="container mx-auto flex w-full flex-col items-center justify-center gap-4 px-4 sm:gap-6 sm:px-6 md:gap-8">
			{/* <div className="flex w-full flex-col items-center justify-center gap-1 text-center sm:gap-2">
				<Heading
					as="h3"
					className="text-2xl font-semibold text-gray-900 sm:text-3xl md:text-4xl"
				>
					{" "}
					See It In Action
				</Heading>
				<Paragraph className="max-w-2xl text-base leading-relaxed text-gray-600 sm:text-lg">
					Create content as you build. Every commit triggers an AI-crafted post
					that&#39;s engaging, accurate, and designed to{" "}
					<Span className="font-medium text-green-500">
						boost your visibility
					</Span>
					.
				</Paragraph>
			</div> */}
			<div className="flex w-full flex-col items-center justify-center gap-1 text-center sm:gap-2">
				<Paragraph
					className={
						"mb-1 flex w-auto items-center justify-center rounded-full bg-gray-900 px-4 py-2 text-center text-xs uppercase tracking-wider text-zinc-100 dark:text-zinc-400 sm:mb-2 md:text-sm"
					}
				>
					<span className="mr-3 h-2 w-2 rounded-full bg-gray-100" />
					Live Preview
				</Paragraph>
				<Heading
					as="h3"
					className={"text-md md:text-md font-bold text-gray-900"}
				>
					Turn commits into instant posts
				</Heading>
			</div>

			<div
				ref={containerRef as any}
				className="relative aspect-video w-full max-w-6xl overflow-hidden rounded-xl bg-black shadow-2xl ring-1 ring-white/10"
				onMouseMove={handleMouseMove}
				onMouseLeave={handleMouseLeave}
			>
				{/* YouTube Player Container */}
				<div ref={playerContainerRef as any} className="h-full w-full" />

				{/* Loading State */}
				{(!apiLoaded || !isVideoReady) && (
					<div className="absolute inset-0 z-30 flex items-center justify-center bg-black">
						<div className="flex flex-col items-center gap-4">
							<div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-white"></div>
							<div className="text-lg text-white/70">
								{apiLoaded
									? "Initializing player..."
									: "Loading YouTube API..."}
							</div>
						</div>
					</div>
				)}

				{/* Buffering Indicator */}
				{isBuffering && isVideoReady && (
					<div className="absolute left-4 top-4 z-20">
						<div className="flex items-center gap-2 rounded-full bg-black/50 px-3 py-2 backdrop-blur-sm">
							<div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></div>
							<span className="text-sm text-white/80">Buffering...</span>
						</div>
					</div>
				)}

				{/* Pause Overlay */}
				{!isPlaying && isVideoReady && !isBuffering && (
					<div
						className="backdrop-blur-xs absolute inset-0 z-20 flex cursor-pointer items-center justify-center bg-black/60"
						onClick={togglePlay}
					>
						<Button
							onClick={event_ => {
								event_.stopPropagation();
								togglePlay();
							}}
							className="flex h-24 w-24 items-center justify-center rounded-full border-2 border-white/20 bg-black/40 backdrop-blur-sm transition-all duration-300 hover:scale-110 hover:border-white/30 hover:bg-white/10"
						>
							<Play className="h-12 w-12 fill-white text-white" />
						</Button>
					</div>
				)}

				{/* Custom Controls */}
				<div
					className={`absolute inset-0 transition-all duration-300 ${
						showControls ? "opacity-100" : "pointer-events-none opacity-0"
					}`}
				>
					{/* Top Controls */}
					<div className="absolute right-4 top-4 z-10">
						<Button
							onClick={openOnYouTube}
							className="flex items-center gap-2 rounded-full border border-white/20 bg-black/50 px-4 py-2 text-white backdrop-blur-sm transition-all duration-200 hover:border-white/40 hover:bg-black/70"
						>
							<ExternalLink className="h-4 w-4" />
							<span className="text-sm font-medium">Watch on YouTube</span>
						</Button>
					</div>

					{/* Bottom Controls */}
					<div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/95 via-black/80 to-transparent p-6">
						{/* Progress Bar */}
						<div className="relative mb-6">
							<div
								ref={progressRef as any}
								className="group relative h-2 cursor-pointer rounded-full bg-white/20 transition-all duration-200 hover:h-3"
								onMouseMove={handleProgressHover}
								onMouseLeave={() => setHoverTime(undefined)}
								onClick={handleProgressClick}
							>
								{/* Progress Fill */}
								<div
									className="absolute left-0 top-0 h-full rounded-full bg-gradient-to-r from-red-500 to-red-600 transition-all duration-150"
									style={{ width: `${progressPercent}%` }}
								/>

								{/* Progress Handle */}
								<div
									className="absolute top-1/2 h-4 w-4 rounded-full bg-red-500 opacity-0 shadow-lg ring-2 ring-red-500/50 transition-all duration-200 group-hover:opacity-100"
									style={{
										left: `${progressPercent}%`,
										transform: "translateX(-50%) translateY(-50%)",
									}}
								/>

								{/* Time Preview Tooltip */}
								{hoverTime !== undefined && (
									<div
										className="pointer-events-none absolute bottom-8 rounded-lg border border-white/20 bg-black/90 px-3 py-2 text-xs text-white backdrop-blur-sm"
										style={{
											left: `${hoverPosition}px`,
											transform: "translateX(-50%)",
										}}
									>
										{formatTime(hoverTime)}
									</div>
								)}
							</div>

							{/* Time Display */}
							<div className="mt-3 flex items-center justify-between text-xs text-white/70">
								<span className="font-mono">{formatTime(currentTime)}</span>
								<span className="font-mono">{formatTime(duration)}</span>
							</div>
						</div>

						{/* Control Buttons */}
						<div className="flex items-center justify-between text-white">
							<div className="flex items-center gap-4">
								{/* Play/Pause Button */}
								<Button
									onClick={togglePlay}
									disabled={!isVideoReady}
									className="group flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
								>
									{isPlaying ? (
										<Pause className="h-6 w-6 fill-white transition-transform group-hover:scale-110" />
									) : (
										<Play className="ml-0.5 h-6 w-6 fill-white transition-transform group-hover:scale-110" />
									)}
								</Button>

								{/* Volume Controls */}
								<div className="flex items-center gap-3">
									<Button
										onClick={toggleMute}
										disabled={!isVideoReady}
										className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
									>
										{isMuted ? (
											<VolumeX className="h-5 w-5" />
										) : (
											<Volume2 className="h-5 w-5" />
										)}
									</Button>

									<div className="group relative h-1 w-24 cursor-pointer rounded-full bg-white/20">
										<div
											className="absolute left-0 top-0 h-full rounded-full bg-white"
											style={{ width: `${volume[0]}%` }}
										/>
										<Input
											type="range"
											min="0"
											max="100"
											value={volume[0]}
											disabled={!isVideoReady}
											onChange={event_ =>
												handleVolumeChange([
													Number.parseInt(event_.target.value),
												])
											}
											className="absolute inset-0 h-full w-full cursor-pointer opacity-0 disabled:cursor-not-allowed"
										/>
										<div
											className="absolute top-1/2 h-3 w-3 rounded-full bg-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100"
											style={{
												left: `${volume[0]}%`,
												transform: "translateX(-50%) translateY(-50%)",
											}}
										/>
									</div>
								</div>

								{/* Time and Progress Info */}
								<div className="flex items-center gap-3">
									<div className="flex items-center gap-2 text-sm">
										<div className="rounded-full bg-black/40 px-3 py-1 font-mono backdrop-blur-sm">
											{formatTime(currentTime)}
										</div>
										<span className="text-white/40">/</span>
										<div className="font-mono text-white/70">
											{formatTime(duration)}
										</div>
									</div>

									<div className="rounded-full bg-black/30 px-2 py-1 text-xs text-white/50 backdrop-blur-sm">
										{progressPercent.toFixed(1)}%
									</div>
								</div>
							</div>

							{/* Fullscreen Button */}
							<Button
								onClick={toggleFullscreen}
								className="flex h-10 w-10 items-center justify-center rounded-full transition-all duration-200 hover:bg-white/10"
							>
								<Maximize className="h-5 w-5" />
							</Button>
						</div>
					</div>
				</div>
			</div>
		</section>
	);
}
