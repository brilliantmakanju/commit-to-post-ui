import { motion } from "framer-motion";
import React, {
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";

import { TypeWriter } from "./type-writer";

type FlowState =
	| "push"
	| "empty"
	| "cards"
	| "commit"
	| "arrows"
	| "pushing"
	| "closing";

interface TerminalLine {
	id: string;
	content: string;
	isTyping?: boolean;
	onComplete?: () => void;
	type: "prompt" | "command" | "output" | "progress";
}

interface TerminalProps {
	repoName: string;
	flowState: FlowState;
	lines: TerminalLine[];
}

// Ubuntu terminal styling with classic colors
const UBUNTU_COLORS = {
	text: "#FFFFFF",
	error: "#EF2929", // Ubuntu red
	border: "#4A154B",
	prompt: "#8AE234", // Ubuntu green
	output: "#D3D7CF", // Light gray
	accent: "#729FCF", // Ubuntu blue
	headerBg: "#2D0922",
	progress: "#FCE94F", // Ubuntu yellow
	background: "#300A24", // Ubuntu's classic purple-black
};

// Memoized line component with Ubuntu styling
const TerminalLineComponent = React.memo<{
	line: TerminalLine;
	index: number;
	repoName: string;
	isMinimized: boolean;
}>(({ line, index, repoName }) => {
	const lineVariants = {
		hidden: { opacity: 0 },
		visible: { opacity: 1 },
	};

	return (
		<motion.div
			initial="hidden"
			animate="visible"
			variants={lineVariants}
			className="mb-1 leading-relaxed"
			transition={{ delay: index * 0.05 }}
		>
			{line.type === "prompt" && (
				<div className="items-center">
					<span
						className="mr-2 font-medium"
						style={{ color: UBUNTU_COLORS.prompt }}
					>
						user@{repoName}:~$
					</span>
					{line.isTyping ? (
						<TypeWriter
							speed={16}
							text={line.content}
							onComplete={line.onComplete}
							className="font-mono text-white"
						/>
					) : (
						<span className="font-mono text-white">{line.content}</span>
					)}
				</div>
			)}

			{line.type === "output" && (
				<div className="font-mono" style={{ color: UBUNTU_COLORS.output }}>
					{line.content}
				</div>
			)}

			{line.type === "progress" && (
				<div
					className="font-mono font-medium"
					style={{ color: UBUNTU_COLORS.progress }}
				>
					{line.content}
				</div>
			)}
		</motion.div>
	);
});

TerminalLineComponent.displayName = "TerminalLineComponent";

export const Terminal: React.FC<TerminalProps> = ({
	lines,
	repoName,
	flowState,
}) => {
	const contentRef = useRef<HTMLDivElement>(null);
	const [isMinimized, setIsMinimized] = useState(false);

	const handleMinimize = useCallback(() => {
		const lastLine = lines.at(-1);
		if (lastLine?.onComplete) {
			lastLine.onComplete();
		}
		setIsMinimized(true);
	}, [lines]);

	useEffect(() => {
		if (flowState === "closing" || flowState === "empty") {
			setIsMinimized(false);
			return;
		}
		if (lines.length === 0 || isMinimized) return;

		const lastLine = lines.at(-1);

		if (
			lastLine?.type === "progress" &&
			!lastLine.isTyping &&
			flowState === "pushing"
		) {
			const timeout = setTimeout(handleMinimize, 800);
			return () => clearTimeout(timeout);
		}
	}, [lines, isMinimized, flowState, handleMinimize]);

	useEffect(() => {
		if (contentRef.current) {
			contentRef.current.scrollTop = contentRef.current.scrollHeight;
		}
	}, [lines.length]);

	const containerVariants = {
		initial: {
			y: "10%",
			top: "54%",
			opacity: 0,
			scale: 0.95,
			width: "100%",
			position: "absolute" as const,
		},
		center: {
			scale: 1,
			y: "-42%",
			top: "70%",
			opacity: 1,
			width: "100%",
			position: "absolute" as const,
			transition: { duration: 0.3, ease: "easeOut" },
		},
		minimized: {
			scale: 1,
			top: "54%",
			y: "-230%",
			opacity: 1,
			width: "100%",
			position: "absolute" as const,
			transition: { duration: 0.4, ease: "easeInOut" },
		},
	};

	// Determine animation state based on flowState and isMinimized
	const getAnimationState = () => {
		if (flowState === "empty" || flowState === "closing") {
			return "center";
		}
		return isMinimized ? "minimized" : "center";
	};

	return (
		<motion.div
			initial="initial"
			className="w-full"
			variants={containerVariants}
			animate={getAnimationState()}
		>
			{/* Ubuntu Terminal Header */}
			<div
				className={`flex items-center gap-2 rounded-t-lg border-2 shadow-2xl transition-all duration-200 ${
					isMinimized ? "px-3 py-2" : "px-4 py-3"
				}`}
				style={{
					backgroundColor: UBUNTU_COLORS.headerBg,
					borderColor: UBUNTU_COLORS.border,
				}}
			>
				<div className="flex h-8 w-full items-center justify-between">
					<div className="flex items-center gap-2">
						{/* Ubuntu window controls */}
						<div
							className={`cursor-pointer rounded-full transition-all duration-200 ${
								isMinimized ? "h-3 w-3" : "h-3 w-3"
							}`}
							style={{ backgroundColor: "#EF2929" }}
						/>
						<div
							className={`cursor-pointer rounded-full transition-all duration-200 ${
								isMinimized ? "h-3 w-3" : "h-3 w-3"
							}`}
							style={{ backgroundColor: "#FCE94F" }}
						/>
						<div
							className={`cursor-pointer rounded-full transition-all duration-200 ${
								isMinimized ? "h-3 w-3" : "h-3 w-3"
							}`}
							style={{ backgroundColor: "#8AE234" }}
						/>
					</div>
					<div
						className={`font-mono font-medium transition-all duration-200 ${
							isMinimized ? "text-xs" : "text-sm"
						}`}
						style={{ color: UBUNTU_COLORS.text }}
					>
						{repoName}@ubuntu: ~
					</div>
				</div>
			</div>

			{/* Ubuntu Terminal Content */}
			<div
				ref={contentRef}
				className={`rounded-b-lg border-x-2 border-b-2 font-mono shadow-2xl transition-all duration-200 ${
					isMinimized ? "max-h-[60px] p-3 text-xs" : "p-4 text-sm"
				} scrollbar-hide w-full overflow-y-auto`}
				style={{
					color: UBUNTU_COLORS.text,
					borderColor: UBUNTU_COLORS.border,
					backgroundColor: UBUNTU_COLORS.background,
				}}
			>
				{lines.map((line, index) => (
					<TerminalLineComponent
						line={line}
						key={line.id}
						index={index}
						repoName={repoName}
						isMinimized={isMinimized}
					/>
				))}
			</div>
		</motion.div>
	);
};
