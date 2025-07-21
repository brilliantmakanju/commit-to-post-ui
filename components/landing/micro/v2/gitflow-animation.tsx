import { AnimatePresence, motion } from "framer-motion";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import {
	branches,
	commitMessages,
	getPostsForCommit,
	getRandomItem,
	repos,
} from "../../data";
import { AnimatedArrows } from "./animated-arrows";
import { CardStack } from "./card-stack";
import { Terminal } from "./terminal";

interface TerminalLine {
	id: string;
	type: "prompt" | "command" | "output" | "progress";
	content: string;
	isTyping?: boolean;
	onComplete?: () => void;
}

type FlowState =
	| "empty"
	| "commit"
	| "push"
	| "pushing"
	| "arrows"
	| "cards"
	| "closing";

export const GitFlowAnimation: React.FC = React.memo(() => {
	const [flowState, setFlowState] = useState<FlowState>("empty");
	const [lines, setLines] = useState<TerminalLine[]>([]);
	const [currentRepo, setCurrentRepo] = useState("");
	const [currentCommit, setCurrentCommit] = useState("");
	const [currentBranch, setCurrentBranch] = useState("");
	const [currentPosts, setCurrentPosts] = useState({
		linkedin: "",
		slack: "",
		discord: "",
	});

	// Use refs to store timer IDs for cleanup
	const timersRef = useRef<Set<NodeJS.Timeout>>(new Set());

	// Cleanup function for timers
	const clearAllTimers = useCallback(() => {
		timersRef.current.forEach(timer => clearTimeout(timer));
		timersRef.current.clear();
	}, []);

	// Helper to create managed timeouts
	const createManagedTimeout = useCallback(
		(callback: () => void, delay: number) => {
			const timer = setTimeout(() => {
				timersRef.current.delete(timer);
				callback();
			}, delay);
			timersRef.current.add(timer);
			return timer;
		},
		[],
	);

	const initializeFlow = useCallback(() => {
		setLines([]);
		setCurrentPosts({
			linkedin: "",
			slack: "",
			discord: "",
		});
		setCurrentRepo("");
		setCurrentBranch("");
		setCurrentCommit("");
		setFlowState("empty");

		const repo = getRandomItem(repos);
		const commit = getRandomItem(commitMessages);
		const branch = getRandomItem(branches);
		const posts = getPostsForCommit(commit);

		setCurrentRepo(repo);
		setCurrentPosts(posts);
		setFlowState("commit");
		setCurrentBranch(branch);
		setCurrentCommit(commit);
	}, []);

	// Memoize commit line to prevent recreation
	const commitLine = useMemo(
		() => ({
			id: "commit-line",
			type: "prompt" as const,
			content: `git commit -m "${currentCommit}"`,
			isTyping: true,
			onComplete: () => {
				createManagedTimeout(() => {
					setLines(previous => [
						...previous,
						{
							id: "commit-output",
							type: "output" as const,
							content: "[main 7c4f2e1] " + currentCommit,
						},
						{
							id: "commit-files",
							type: "output" as const,
							content: " 3 files changed, 47 insertions(+), 12 deletions(-)",
						},
					]);
					createManagedTimeout(() => setFlowState("push"), 1500);
				}, 500);
			},
		}),
		[currentCommit, createManagedTimeout],
	);

	// Memoize push line to prevent recreation
	const pushLine = useMemo(
		() => ({
			id: "push-line",
			type: "prompt" as const,
			content: `git push origin ${currentBranch}`,
			isTyping: true,
			onComplete: () => {
				createManagedTimeout(() => setFlowState("pushing"), 800);
			},
		}),
		[currentBranch, createManagedTimeout],
	);

	// Memoize push progress lines
	const pushLines = useMemo(
		() => [
			"Enumerating objects: 15, done.",
			"Counting objects: 100% (15/15), done.",
			"Delta compression using up to 8 threads",
			"Compressing objects: 100% (8/8), done.",
			"Writing objects: 100% (9/9), 1.2 KiB | 1.2 MiB/s, done.",
			`To github.com:user/${currentRepo}.git`,
			`   a1b2c3d..7c4f2e1  ${currentBranch} -> ${currentBranch}`,
		],
		[currentRepo, currentBranch],
	);

	// Optimized card cycle complete handler
	const handleCardCycleComplete = useCallback(() => {
		setLines([]);
		setCurrentPosts({
			linkedin: "",
			slack: "",
			discord: "",
		});
		setFlowState("closing");
		createManagedTimeout(() => {
			createManagedTimeout(initializeFlow, 100);
		}, 100);
	}, [createManagedTimeout, initializeFlow]);

	// Initial flow effect
	useEffect(() => {
		const timer = createManagedTimeout(initializeFlow, 1000);
		return () => clearTimeout(timer);
	}, [createManagedTimeout, initializeFlow]);

	// Commit flow effect
	useEffect(() => {
		if (flowState === "commit") {
			setLines([commitLine]);
		}
	}, [flowState, commitLine]);

	// Push flow effect
	useEffect(() => {
		if (flowState === "push") {
			setLines(previous => [...previous, pushLine]);
		}
	}, [flowState, pushLine]);

	// Pushing flow effect - optimized to use batch updates
	useEffect(() => {
		if (flowState === "pushing") {
			let currentLineIndex = 0;

			const addLine = () => {
				if (currentLineIndex < pushLines.length) {
					const line = {
						id: `push-progress-${currentLineIndex}`,
						type: "progress" as const,
						content: pushLines[currentLineIndex],
					};

					setLines(previous => [...previous, line]);
					currentLineIndex++;
					createManagedTimeout(addLine, 400);
				} else {
					createManagedTimeout(() => setFlowState("arrows"), 1000);
				}
			};

			createManagedTimeout(addLine, 300);
		}
	}, [flowState, pushLines, createManagedTimeout]);

	// Arrows flow effect
	useEffect(() => {
		if (flowState === "arrows") {
			createManagedTimeout(() => setFlowState("cards"), 1000);
		}
	}, [flowState, createManagedTimeout]);

	// Cleanup effect
	useEffect(() => {
		return clearAllTimers;
	}, [clearAllTimers]);

	// Memoize terminal props
	const terminalProps = useMemo(
		() => ({
			lines,
			flowState,
			repoName: currentRepo || "loading",
		}),
		[lines, flowState, currentRepo],
	);

	// Memoize animated arrows visibility
	const arrowsVisible = flowState === "arrows" || flowState === "cards";

	// Memoize card stack props
	const cardStackProps = useMemo(
		() => ({
			isVisible: true,
			posts: currentPosts,
			onCycleComplete: handleCardCycleComplete,
		}),
		[currentPosts, handleCardCycleComplete],
	);

	return (
		<div className="flex h-full w-full flex-col items-center justify-center">
			{/* Terminal Section */}
			<div className="flex w-full flex-col gap-3">
				<Terminal {...terminalProps} />
				<AnimatedArrows isVisible={arrowsVisible} />
				<AnimatePresence>
					{flowState === "cards" && <CardStack {...cardStackProps} />}
				</AnimatePresence>
			</div>
		</div>
	);
});

GitFlowAnimation.displayName = "GitFlowAnimation";
